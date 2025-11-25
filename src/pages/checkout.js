// freshmart-frontend/src/pages/checkout.js
import React, { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import useTranslation from "next-translate/useTranslation";
import {
  IoReturnUpBackOutline,
  IoArrowForward,
  IoBagHandle,
  IoWalletSharp,
} from "react-icons/io5";

import Layout from "@layout/Layout";
import Label from "@component/form/Label";
import Error from "@component/form/Error";
import CartItem from "@component/cart/CartItem";
import InputArea from "@component/form/InputArea";
import useGetSetting from "@hooks/useGetSetting";
import InputShipping from "@component/form/InputShipping";
import InputPayment from "@component/form/InputPayment";
import useCheckoutSubmit from "@hooks/useCheckoutSubmit";
import useUtilsFunction from "@hooks/useUtilsFunction";

const Checkout = () => {
  const [mpesaPhone, setMpesaPhone] = useState("");

  const {
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
    discountAmount,
    shippingCost,
    total,
    isEmpty,
    items,
    cartTotal,
    currency,
    isCheckoutSubmit,
  } = useCheckoutSubmit(mpesaPhone);

  const { t } = useTranslation();
  const { storeCustomizationSetting } = useGetSetting();
  const { showingTranslateValue } = useUtilsFunction();

  const paymentMethod = watch("paymentMethod");

  const isMpesaSelected = paymentMethod === "Mpesa";
  const isCardSelected = paymentMethod === "Card";

  useEffect(() => {
    if (!isMpesaSelected && mpesaPhone) setMpesaPhone("");
  }, [isMpesaSelected, mpesaPhone]);

  useEffect(() => {
    if (paymentMethod === "Card") setShowCard(true);
    if (paymentMethod === "Mpesa" || paymentMethod === "Cash") setShowCard(false);
  }, [paymentMethod, setShowCard]);

  const disableSubmit = useMemo(() => {
    const needsMpesaPhone = isMpesaSelected && !String(mpesaPhone || "").trim();
    const needsStripe = isCardSelected && !stripe;

    return (
      isEmpty ||
      isCheckoutSubmit ||
      !paymentMethod ||
      needsStripe ||
      needsMpesaPhone
    );
  }, [isEmpty, isCheckoutSubmit, paymentMethod, isCardSelected, stripe, isMpesaSelected, mpesaPhone]);

  const paymentMethodReg = register("paymentMethod", { required: true });

  return (
    <Layout title="Checkout" description="this is checkout page">
      <div className="mx-auto max-w-screen-2xl px-3 sm:px-10">
        <div className="py-10 lg:py-12 px-0 2xl:max-w-screen-2xl w-full xl:max-w-screen-xl flex flex-col md:flex-row lg:flex-row">
          <div className="md:w-full lg:w-3/5 flex h-full flex-col order-2 sm:order-1 lg:order-1">
            <div className="mt-5 md:mt-0 md:col-span-2">
              <form onSubmit={handleSubmit(submitHandler)}>
                <div className="form-group">
                  <h2 className="font-semibold font-serif text-base text-gray-700 pb-3">
                    01.{" "}
                    {showingTranslateValue(
                      storeCustomizationSetting?.checkout?.personal_details
                    )}
                  </h2>

                  <div className="grid grid-cols-6 gap-6">
                    <div className="col-span-6 sm:col-span-3">
                      <InputArea
                        register={register}
                        label={showingTranslateValue(
                          storeCustomizationSetting?.checkout?.first_name
                        )}
                        name="firstName"
                        type="text"
                        placeholder="John"
                      />
                      <Error errorName={errors.firstName} />
                    </div>

                    <div className="col-span-6 sm:col-span-3">
                      <InputArea
                        register={register}
                        label={showingTranslateValue(
                          storeCustomizationSetting?.checkout?.last_name
                        )}
                        name="lastName"
                        type="text"
                        placeholder="Doe"
                      />
                      <Error errorName={errors.lastName} />
                    </div>

                    <div className="col-span-6 sm:col-span-3">
                      <InputArea
                        register={register}
                        label={showingTranslateValue(
                          storeCustomizationSetting?.checkout?.email_address
                        )}
                        name="email"
                        type="email"
                        placeholder="youremail@gmail.com"
                      />
                      <Error errorName={errors.email} />
                    </div>

                    <div className="col-span-6 sm:col-span-3">
                      <InputArea
                        register={register}
                        label={showingTranslateValue(
                          storeCustomizationSetting?.checkout?.checkout_phone
                        )}
                        name="contact"
                        type="tel"
                        placeholder="+254799322688"
                      />
                      <Error errorName={errors.contact} />
                    </div>
                  </div>
                </div>

                <div className="form-group mt-12">
                  <h2 className="font-semibold font-serif text-base text-gray-700 pb-3">
                    02.{" "}
                    {showingTranslateValue(
                      storeCustomizationSetting?.checkout?.shipping_details
                    )}
                  </h2>

                  <div className="grid grid-cols-6 gap-6 mb-8">
                    <div className="col-span-6">
                      <InputArea
                        register={register}
                        label={showingTranslateValue(
                          storeCustomizationSetting?.checkout?.street_address
                        )}
                        name="address"
                        type="text"
                        placeholder="Stall No. 14, Ground Floor, City Market"
                      />
                      <Error errorName={errors.address} />
                    </div>

                    <div className="col-span-6 sm:col-span-6 lg:col-span-2">
                      <InputArea
                        register={register}
                        label={showingTranslateValue(
                          storeCustomizationSetting?.checkout?.city
                        )}
                        name="city"
                        type="text"
                        placeholder="Nairobi"
                      />
                      <Error errorName={errors.city} />
                    </div>

                    <div className="col-span-6 sm:col-span-3 lg:col-span-2">
                      <InputArea
                        register={register}
                        label={showingTranslateValue(
                          storeCustomizationSetting?.checkout?.country
                        )}
                        name="country"
                        type="text"
                        placeholder="Kiambu"
                      />
                      <Error errorName={errors.country} />
                    </div>

                    <div className="col-span-6 sm:col-span-3 lg:col-span-2">
                      <InputArea
                        register={register}
                        label={showingTranslateValue(
                          storeCustomizationSetting?.checkout?.zip_code
                        )}
                        name="zipCode"
                        type="text"
                        placeholder="2345"
                      />
                      <Error errorName={errors.zipCode} />
                    </div>
                  </div>

                  <Label
                    label={showingTranslateValue(
                      storeCustomizationSetting?.checkout?.shipping_cost
                    )}
                  />

                  <div className="grid grid-cols-6 gap-6">
                    <div className="col-span-6 sm:col-span-3">
                      <InputShipping
                        currency={currency}
                        handleShippingCost={handleShippingCost}
                        register={register}
                        value="Delivery"
                        time="Today"
                        cost={260}
                      />
                      <Error errorName={errors.shippingOption} />
                    </div>

                    <div className="col-span-6 sm:col-span-3">
                      <InputShipping
                        currency={currency}
                        handleShippingCost={handleShippingCost}
                        register={register}
                        value="Pickup"
                        time="1 Day"
                        cost={20}
                      />
                      <Error errorName={errors.shippingOption} />
                    </div>
                  </div>
                </div>

                <div className="form-group mt-12">
                  <h2 className="font-semibold font-serif text-base text-gray-700 pb-3">
                    03.{" "}
                    {showingTranslateValue(
                      storeCustomizationSetting?.checkout?.payment_method
                    )}
                  </h2>
                </div>

                <div className="grid grid-cols-6 gap-6">
                  <div className="col-span-6 sm:col-span-3">
                    <InputPayment
                      setShowCard={setShowCard}
                      register={register}
                      name={t("common:cashOnDelivery")}
                      value="Cash"
                      Icon={IoWalletSharp}
                    />
                    <Error errorName={errors.paymentMethod} />
                  </div>

                  <div className="col-span-6 sm:col-span-3">
                    <div className="px-3 py-4 card border border-gray-200 bg-white rounded-md">
                      <label className="cursor-pointer label">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <span className="text-xl mr-3 text-gray-400">
                              <IoWalletSharp />
                            </span>
                            <h6 className="font-serif font-medium text-sm text-gray-600">
                              M-Pesa
                            </h6>
                          </div>

                          <input
                            {...paymentMethodReg}
                            type="radio"
                            name="paymentMethod"
                            value="Mpesa"
                            className="form-radio outline-none focus:ring-0 text-emerald-500"
                            onChange={(e) => {
                              paymentMethodReg.onChange(e);
                              setShowCard(false);
                            }}
                          />
                        </div>
                      </label>
                    </div>

                    {isMpesaSelected ? (
                      <div className="mt-2">
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                          M-Pesa phone number
                        </label>
                        <input
                          type="tel"
                          placeholder="07XXXXXXXX or 2547XXXXXXXX"
                          value={mpesaPhone}
                          onChange={(e) => setMpesaPhone(e.target.value)}
                          disabled={isCheckoutSubmit}
                          className={`block w-full px-3 py-2 bg-white border rounded-md shadow-sm focus:outline-none sm:text-sm ${
                            isMpesaSelected && !String(mpesaPhone || "").trim()
                              ? "border-red-300 focus:border-red-400"
                              : "border-gray-300 focus:border-emerald-500"
                          }`}
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          You will receive the STK prompt on this number
                        </p>
                      </div>
                    ) : null}

                    <Error errorName={errors.paymentMethod} />
                  </div>
                </div>

                <div className="grid grid-cols-6 gap-4 lg:gap-6 mt-10">
                  <div className="col-span-6 sm:col-span-3">
                    <Link
                      href="/"
                      className="bg-indigo-50 border border-indigo-100 rounded py-3 text-center text-sm font-medium text-gray-700 hover:text-gray-800 hover:border-gray-300 transition-all flex justify-center font-serif w-full"
                    >
                      <span className="text-xl mr-2">
                        <IoReturnUpBackOutline />
                      </span>
                      {showingTranslateValue(
                        storeCustomizationSetting?.checkout?.continue_button
                      )}
                    </Link>
                  </div>

                  <div className="col-span-6 sm:col-span-3">
                    <button
                      type="submit"
                      disabled={disableSubmit}
                      className={`border transition-all rounded py-3 text-center text-sm font-serif font-medium flex justify-center w-full ${
                        disableSubmit
                          ? "bg-gray-200 border-gray-200 text-gray-500 cursor-not-allowed"
                          : "bg-emerald-500 hover:bg-emerald-600 border-emerald-500 text-white"
                      }`}
                    >
                      {isCheckoutSubmit ? (
                        <span className="flex justify-center text-center">
                          <img
                            src="/loader/spinner.gif"
                            alt="Loading"
                            width={20}
                            height={10}
                          />
                          <span className="ml-2">{t("common:processing")}</span>
                        </span>
                      ) : (
                        <span className="flex justify-center text-center">
                          {showingTranslateValue(
                            storeCustomizationSetting?.checkout?.confirm_button
                          )}
                          <span className="text-xl ml-2">
                            <IoArrowForward />
                          </span>
                        </span>
                      )}
                    </button>

                    {isMpesaSelected && !String(mpesaPhone || "").trim() ? (
                      <p className="mt-2 text-xs text-red-500">
                        Please enter your M-Pesa phone number to continue.
                      </p>
                    ) : null}

                    {isCardSelected && !stripe ? (
                      <p className="mt-2 text-xs text-red-500">
                        Card payments are not ready yet. Please select Cash or M-Pesa.
                      </p>
                    ) : null}

                    {error ? (
                      <p className="mt-2 text-xs text-red-500">{error}</p>
                    ) : null}
                  </div>
                </div>
              </form>
            </div>
          </div>

          <div className="md:w-full lg:w-2/5 lg:ml-10 xl:ml-14 md:ml-6 flex flex-col h-full md:sticky lg:sticky top-28 md:order-2 lg:order-2">
            <div className="border p-5 lg:px-8 lg:py-8 rounded-lg bg-white order-1 sm:order-2">
              <h2 className="font-semibold font-serif text-lg pb-4">
                {showingTranslateValue(
                  storeCustomizationSetting?.checkout?.order_summary
                )}
              </h2>

              <div className="overflow-y-scroll flex-grow scrollbar-hide w-full max-h-64 bg-gray-50 block">
                {items.map((item) => (
                  <CartItem key={item.id} item={item} currency={currency} />
                ))}

                {isEmpty ? (
                  <div className="text-center py-10">
                    <span className="flex justify-center my-auto text-gray-500 font-semibold text-4xl">
                      <IoBagHandle />
                    </span>
                    <h2 className="font-medium font-serif text-sm pt-2 text-gray-600">
                      No Item Added Yet!
                    </h2>
                  </div>
                ) : null}
              </div>

              <div className="flex items-center mt-4 py-4 lg:py-4 text-sm w-full font-semibold text-heading last:border-b-0 last:text-base last:pb-0">
                <form className="w-full">
                  {couponInfo?.couponCode ? (
                    <span className="bg-emerald-50 px-4 py-3 leading-tight w-full rounded-md flex justify-between">
                      <p className="text-emerald-600">Coupon Applied</p>
                      <span className="text-red-500 text-right">
                        {couponInfo.couponCode}
                      </span>
                    </span>
                  ) : (
                    <div className="flex flex-col sm:flex-row items-start justify-end">
                      <input
                        ref={couponRef}
                        type="text"
                        placeholder={t("common:couponCode")}
                        className="form-input py-2 px-3 md:px-4 w-full appearance-none transition ease-in-out border text-input text-sm rounded-md h-12 duration-200 bg-white border-gray-200 focus:ring-0 focus:outline-none focus:border-emerald-500 placeholder-gray-500 placeholder-opacity-75"
                      />
                      <button
                        onClick={handleCouponCode}
                        className="leading-4 inline-flex items-center cursor-pointer transition ease-in-out duration-300 font-semibold text-center justify-center border border-gray-200 rounded-md focus-visible:outline-none focus:outline-none px-5 md:px-6 lg:px-8 py-3 mt-3 sm:mt-0 sm:ml-3 hover:text-white hover:bg-emerald-500 h-12 text-sm w-full sm:w-auto"
                      >
                        {showingTranslateValue(
                          storeCustomizationSetting?.checkout?.apply_button
                        )}
                      </button>
                    </div>
                  )}
                </form>
              </div>

              <div className="flex items-center py-2 text-sm w-full font-semibold text-gray-500 last:border-b-0 last:text-base last:pb-0">
                {showingTranslateValue(
                  storeCustomizationSetting?.checkout?.sub_total
                )}
                <span className="ml-auto flex-shrink-0 text-gray-800 font-bold">
                  {currency}
                  {Number(cartTotal || 0).toFixed(2)}
                </span>
              </div>

              <div className="flex items-center py-2 text-sm w-full font-semibold text-gray-500 last:border-b-0 last:text-base last:pb-0">
                {showingTranslateValue(
                  storeCustomizationSetting?.checkout?.shipping_cost
                )}
                <span className="ml-auto flex-shrink-0 text-gray-800 font-bold">
                  {currency}
                  {Number(shippingCost || 0).toFixed(2)}
                </span>
              </div>

              <div className="flex items-center py-2 text-sm w-full font-semibold text-gray-500 last:border-b-0 last:text-base last:pb-0">
                {showingTranslateValue(
                  storeCustomizationSetting?.checkout?.discount
                )}
                <span className="ml-auto flex-shrink-0 font-bold text-orange-400">
                  {currency}
                  {Number(discountAmount || 0).toFixed(2)}
                </span>
              </div>

              <div className="border-t mt-4">
                <div className="flex items-center font-bold font-serif justify-between pt-5 text-sm uppercase">
                  {showingTranslateValue(
                    storeCustomizationSetting?.checkout?.total_cost
                  )}
                  <span className="font-serif font-extrabold text-lg">
                    {currency}
                    {Number(total || 0).toFixed(2)}
                  </span>
                </div>
              </div>

              {isMpesaSelected ? (
                <p className="mt-4 text-xs text-gray-500">
                  Tip: Use 07XXXXXXXX or 2547XXXXXXXX for best results
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default dynamic(() => Promise.resolve(Checkout), { ssr: false });
