// freshmart-frontend/src/hooks/useCheckoutSubmit.js
import Cookies from "js-cookie";
import dayjs from "dayjs";
import requests from "../services/httpServices";
import { useRouter } from "next/router";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useCart } from "react-use-cart";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";

// internal import
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
  const [total, setTotal] = useState("");
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
    formState: { errors },
  } = useForm();

  const { data } = useAsync(CouponServices.getAllCoupons);
  const { data: globalSetting } = useAsync(SettingServices.getGlobalSetting);
  const currency = globalSetting?.default_currency || "$";

  useEffect(() => {
    if (Cookies.get("couponInfo")) {
      const coupon = JSON.parse(Cookies.get("couponInfo"));
      setCouponInfo(coupon);
      setDiscountPercentage(coupon.discountType);
      setMinimumAmount(coupon.minimumAmount);
    }
  }, [isCouponApplied]);

  useEffect(() => {
    if (minimumAmount - discountAmount > total || isEmpty) {
      setDiscountPercentage(0);
      Cookies.remove("couponInfo");
    }
  }, [minimumAmount, total, discountAmount, isEmpty]);

  useEffect(() => {
    const discountProductTotal = items?.reduce(
      (preValue, currentValue) => preValue + (currentValue?.itemTotal || 0),
      0
    );

    const subTotal = parseFloat(cartTotal + Number(shippingCost)).toFixed(2);

    const computedDiscount =
      discountPercentage?.type === "fixed"
        ? discountPercentage?.value
        : discountProductTotal * (discountPercentage?.value / 100);

    const discountAmountTotal = computedDiscount ? computedDiscount : 0;
    const totalValue = Number(subTotal) - discountAmountTotal;

    setDiscountAmount(discountAmountTotal);
    setTotal(totalValue);
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

  const generateUniqueIdentifier = () => {
    const min = 10000000;
    const max = 99999999;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  const initiateMpesaPayment = async (orderInfo, phone) => {
    try {
      const response = await requests.post("/order/mpesa-pay", {
        phone,
        amount: orderInfo.total,
        paymentIdentifier: orderInfo.paymentIdentifier,
        initiatorPhoneNumber: orderInfo.user_info.contact,
      });

      if (response?.success) {
        notifySuccess(
          `M-Pesa payment initiated successfully: ${response?.data?.ResponseDescription}`
        );

        OrderServices.addOrder(orderInfo)
          .then((res) => {
            router.push(`/order/${res._id}`);
            notifySuccess(
              "Your order has been placed. We will send a confirmation email once the payment is processed."
            );
            Cookies.remove("couponInfo");
            sessionStorage.removeItem("products");
            emptyCart();
            setIsCheckoutSubmit(false);
          })
          .catch((err) => {
            notifyError(err?.message || "Failed to place order");
            setIsCheckoutSubmit(false);
          });
      } else {
        notifyError(
          `Failed to initiate M-Pesa payment: ${
            response?.data?.ResponseDescription || "Unknown error"
          }`
        );
        setIsCheckoutSubmit(false);
      }
    } catch (err) {
      notifyError("Error initiating M-Pesa payment: " + (err?.message || ""));
      setIsCheckoutSubmit(false);
    }
  };

  const submitHandler = async (data) => {
    dispatch({ type: "SAVE_SHIPPING_ADDRESS", payload: data });
    Cookies.set("shippingAddress", JSON.stringify(data));
    setIsCheckoutSubmit(true);
    setError("");

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
      subTotal: cartTotal,
      shippingCost,
      discount: discountAmount,
      total,
      paymentIdentifier: generateUniqueIdentifier(),
    };

    if (data.paymentMethod === "Card") {
      if (!stripe || !elements) {
        setIsCheckoutSubmit(false);
        return;
      }

      const { error: stripeError, paymentMethod } =
        await stripe.createPaymentMethod({
          type: "card",
          card: elements.getElement(CardElement),
        });

      if (stripeError && !paymentMethod) {
        setError(stripeError.message);
        setIsCheckoutSubmit(false);
        return;
      }

      setError("");
      const orderData = { ...orderInfo, cardInfo: paymentMethod };
      handlePaymentWithStripe(orderData);
      return;
    }

    if (data.paymentMethod === "Mpesa") {
      await initiateMpesaPayment(orderInfo, mpesaPhone);
      return;
    }

    if (data.paymentMethod === "Cash") {
      OrderServices.addOrder(orderInfo)
        .then((res) => {
          router.push(`/order/${res._id}`);
          notifySuccess("Your Order Confirmed!");
          Cookies.remove("couponInfo");
          sessionStorage.removeItem("products");
          emptyCart();
          setIsCheckoutSubmit(false);
        })
        .catch((err) => {
          notifyError(err?.message || "Failed to place order");
          setIsCheckoutSubmit(false);
        });
    }
  };

  const handlePaymentWithStripe = async (order) => {
    try {
      OrderServices.createPaymentIntent(order)
        .then((res) => {
          stripe.confirmCardPayment(res.client_secret, {
            payment_method: { card: elements.getElement(CardElement) },
          });

          const orderData = { ...order, cardInfo: res };
          OrderServices.addOrder(orderData)
            .then((r) => {
              router.push(`/order/${r._id}`);
              notifySuccess("Your Order Confirmed!");
              Cookies.remove("couponInfo");
              emptyCart();
              sessionStorage.removeItem("products");
              setIsCheckoutSubmit(false);
            })
            .catch((err) => {
              notifyError(err ? err?.response?.data?.message : err?.message);
              setIsCheckoutSubmit(false);
            });
        })
        .catch((err) => {
          notifyError(err ? err?.response?.data?.message : err?.message);
          setIsCheckoutSubmit(false);
        });
    } catch (err) {
      notifyError(err ? err?.response?.data?.message : err?.message);
      setIsCheckoutSubmit(false);
    }
  };

  const handleShippingCost = (value) => {
    setShippingCost(value);
  };

  const handleCouponCode = (e) => {
    e.preventDefault();

    if (!couponRef.current.value) {
      notifyError("Please Input a Coupon Code!");
      return;
    }

    const result = (data || []).filter(
      (coupon) => coupon.couponCode === couponRef.current.value
    );

    if (result.length < 1) {
      notifyError("Please Input a Valid Coupon!");
      return;
    }

    if (dayjs().isAfter(dayjs(result[0]?.endTime))) {
      notifyError("This coupon is not valid!");
      return;
    }

    if (total < result[0]?.minimumAmount) {
      notifyError(
        `Minimum ${result[0].minimumAmount} USD required for Apply this coupon!`
      );
      return;
    }

    notifySuccess(
      `Your Coupon ${result[0].couponCode} is Applied on ${result[0].productType}!`
    );
    setIsCouponApplied(true);
    setMinimumAmount(result[0]?.minimumAmount);
    setDiscountPercentage(result[0].discountType);
    dispatch({ type: "SAVE_COUPON", payload: result[0] });
    Cookies.set("couponInfo", JSON.stringify(result[0]));
  };

  return {
    handleSubmit,
    submitHandler,
    handleShippingCost,
    register,
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
  };
};

export default useCheckoutSubmit;
