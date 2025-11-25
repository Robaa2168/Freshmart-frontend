// freshmart-frontend/src/hooks/useCheckoutSubmit.js
import Cookies from "js-cookie";
import dayjs from "dayjs";
import requests from "../services/httpServices";
import { useRouter } from "next/router";
import { useContext, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useCart } from "react-use-cart";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";

import useAsync from "@hooks/useAsync";
import { UserContext } from "@context/UserContext";
import OrderServices from "@services/OrderServices";
import CouponServices from "@services/CouponServices";
import { notifyError, notifySuccess } from "@utils/toast";
import SettingServices from "@services/SettingServices";

const useCheckoutSubmit = (mpesaPhone) => {
  const {
    state: { userInfo, shippingAddress },
    dispatch,
  } = useContext(UserContext);

  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);
  const [couponInfo, setCouponInfo] = useState({});
  const [minimumAmount, setMinimumAmount] = useState(0);
  const [showCard, setShowCard] = useState(false);
  const [shippingCost, setShippingCost] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [isCheckoutSubmit, setIsCheckoutSubmit] = useState(false);
  const [isCouponApplied, setIsCouponApplied] = useState(false);

  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();
  const couponRef = useRef("");
  const { isEmpty, emptyCart, items, cartTotal } = useCart();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm();

  const selectedPaymentMethod = watch("paymentMethod");

  const { data } = useAsync(CouponServices.getAllCoupons);
  const { data: globalSetting } = useAsync(SettingServices.getGlobalSetting);
  const currency = globalSetting?.default_currency || "$";

  useEffect(() => {
    if (Cookies.get("couponInfo")) {
      const coupon = JSON.parse(Cookies.get("couponInfo"));
      setCouponInfo(coupon);
      setDiscountPercentage(coupon.discountType);
      setMinimumAmount(Number(coupon.minimumAmount || 0));
    }
  }, [isCouponApplied]);

  useEffect(() => {
    const min = Number(minimumAmount || 0);
    const disc = Number(discountAmount || 0);
    const tot = Number(total || 0);

    if (min - disc > tot || isEmpty) {
      setDiscountPercentage(0);
      Cookies.remove("couponInfo");
    }
  }, [minimumAmount, total, discountAmount, isEmpty]);

  useEffect(() => {
    const discountProductTotal = (items || []).reduce(
      (preValue, currentValue) => preValue + Number(currentValue?.itemTotal || 0),
      0
    );

    const subTotal = Number(cartTotal || 0) + Number(shippingCost || 0);

    const computedDiscount =
      discountPercentage?.type === "fixed"
        ? Number(discountPercentage?.value || 0)
        : discountProductTotal * (Number(discountPercentage?.value || 0) / 100);

    const discountAmountTotal = computedDiscount || 0;
    const totalValue = subTotal - discountAmountTotal;

    setDiscountAmount(discountAmountTotal);
    setTotal(Number.isFinite(totalValue) ? totalValue : 0);
  }, [cartTotal, shippingCost, discountPercentage, items]);

  useEffect(() => {
    if (!userInfo) router.push("/");

    setValue("firstName", shippingAddress?.firstName || "");
    setValue("lastName", shippingAddress?.lastName || "");
    setValue("address", shippingAddress?.address || "");
    setValue("contact", shippingAddress?.contact || "");
    setValue("email", shippingAddress?.email || "");
    setValue("city", shippingAddress?.city || "");
    setValue("country", shippingAddress?.country || "");
    setValue("zipCode", shippingAddress?.zipCode || "");
  }, []);

  useEffect(() => {
    if (selectedPaymentMethod !== "Card") setShowCard(false);
  }, [selectedPaymentMethod]);

  const generateUniqueIdentifier = () => {
    const min = 10000000;
    const max = 99999999;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  const finalizeOrderSuccess = async (orderId) => {
    router.push(`/order/${orderId}`);
    Cookies.remove("couponInfo");
    sessionStorage.removeItem("products");
    emptyCart();
  };

  const initiateMpesaPayment = async (orderInfo, phone) => {
    if (!phone) throw new Error("Please enter your Mpesa phone number.");

    const response = await requests.post("/order/mpesa-pay", {
      phone,
      amount: orderInfo.total,
      paymentIdentifier: orderInfo.paymentIdentifier,
      initiatorPhoneNumber: orderInfo.user_info.contact,
    });

    if (!response?.success) {
      throw new Error(response?.data?.ResponseDescription || "Mpesa payment initiation failed.");
    }

    notifySuccess(`Mpesa payment initiated: ${response?.data?.ResponseDescription || "Success"}`);

    const created = await OrderServices.addOrder(orderInfo);
    await finalizeOrderSuccess(created?._id);

    notifySuccess(
      "Your order has been placed. We will send a confirmation email once the payment is processed."
    );
  };

  const submitHandler = async (data) => {
    dispatch({ type: "SAVE_SHIPPING_ADDRESS", payload: data });
    Cookies.set("shippingAddress", JSON.stringify(data));
    setIsCheckoutSubmit(true);
    setError("");

    try {
      const userInfoPayload = {
        name: `${data.firstName} ${data.lastName}`,
        contact: data.contact,
        email: data.email,
        address: data.address,
        country: data.country,
        city: data.city,
        zipCode: data.zipCode,
      };

      const orderInfo = {
        user_info: userInfoPayload,
        shippingOption: data.shippingOption,
        paymentMethod: data.paymentMethod,
        status: "Pending",
        cart: items,
        subTotal: Number(cartTotal || 0),
        shippingCost: Number(shippingCost || 0),
        discount: Number(discountAmount || 0),
        total: Number(total || 0),
        paymentIdentifier: generateUniqueIdentifier(),
      };

      if (data.paymentMethod === "Card") {
        if (!stripe || !elements) throw new Error("Stripe is not ready. Please try again.");

        const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
          type: "card",
          card: elements.getElement(CardElement),
        });

        if (stripeError || !paymentMethod) throw new Error(stripeError?.message || "Card error");

        const orderData = { ...orderInfo, cardInfo: paymentMethod };
        await handlePaymentWithStripe(orderData);
        return;
      }

      if (data.paymentMethod === "Mpesa") {
        await initiateMpesaPayment(orderInfo, mpesaPhone);
        return;
      }

      if (data.paymentMethod === "Cash") {
        const created = await OrderServices.addOrder(orderInfo);
        await finalizeOrderSuccess(created?._id);
        notifySuccess("Your order is confirmed.");
        return;
      }

      throw new Error("Please select a payment method.");
    } catch (err) {
      notifyError(err?.message || "Checkout failed");
    } finally {
      setIsCheckoutSubmit(false);
    }
  };

  const handlePaymentWithStripe = async (order) => {
    if (!stripe || !elements) throw new Error("Stripe is not ready. Please try again.");

    const intentRes = await OrderServices.createPaymentIntent(order);

    const confirmRes = await stripe.confirmCardPayment(intentRes.client_secret, {
      payment_method: { card: elements.getElement(CardElement) },
    });

    if (confirmRes?.error) throw new Error(confirmRes.error.message || "Card payment failed");

    const orderData = { ...order, cardInfo: intentRes };

    const created = await OrderServices.addOrder(orderData);
    await finalizeOrderSuccess(created?._id);

    notifySuccess("Your order is confirmed.");
  };

  const handleShippingCost = (value) => {
    setShippingCost(value);
  };

  const handleCouponCode = (e) => {
    e.preventDefault();

    const code = couponRef.current?.value?.trim();
    if (!code) {
      notifyError("Please input a coupon code.");
      return;
    }

    const result = (data || []).filter((coupon) => coupon.couponCode === code);

    if (result.length < 1) {
      notifyError("Please input a valid coupon.");
      return;
    }

    if (dayjs().isAfter(dayjs(result[0]?.endTime))) {
      notifyError("This coupon is not valid.");
      return;
    }

    if (Number(total || 0) < Number(result[0]?.minimumAmount || 0)) {
      notifyError(`Minimum ${result[0].minimumAmount} USD required to apply this coupon.`);
      return;
    }

    notifySuccess(`Coupon applied: ${result[0].couponCode}`);
    setIsCouponApplied(true);
    setMinimumAmount(Number(result[0]?.minimumAmount || 0));
    setDiscountPercentage(result[0].discountType);
    dispatch({ type: "SAVE_COUPON", payload: result[0] });
    Cookies.set("couponInfo", JSON.stringify(result[0]));
  };

  return {
    handleSubmit,
    submitHandler,
    handleShippingCost,
    register,
    watch,
    errors,
    showCard,
    setShowCard,
    error,
    stripe,
    couponInfo,
    couponRef,
    handleCouponCode,
    discountPercentage,
    discountAmount,
    shippingCost,
    total,
    isEmpty,
    items,
    cartTotal,
    currency,
    isCheckoutSubmit,
    isCouponApplied,
    selectedPaymentMethod,
  };
};

export default useCheckoutSubmit;
