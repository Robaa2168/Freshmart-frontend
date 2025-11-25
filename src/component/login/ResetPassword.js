//freshmart-frontend/src/component/login/ResetPassword.js
import Link from "next/link";
import React from "react";
import { FiMail } from "react-icons/fi";

//internal import
import Error from "@component/form/Error";
import InputArea from "@component/form/InputArea";
import useLoginSubmit from "@hooks/useLoginSubmit";

const ResetPassword = ({ setShowResetPassword, setModalOpen }) => {
  const { handleSubmit, submitHandler, register, errors, loading } =
    useLoginSubmit(setModalOpen);

  return (
    <div className="w-full">
      <div className="text-center">
        <Link
          href="/"
          className="inline-flex justify-center text-2xl sm:text-3xl font-bold font-serif text-gray-900 hover:text-emerald-700 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded"
        >
          Forgot Password
        </Link>
        <p className="text-sm sm:text-base text-gray-500 mt-2">
          Enter your email and we’ll send you a reset link.
        </p>
      </div>

      <form onSubmit={handleSubmit(submitHandler)} className="mt-6 sm:mt-8">
        <div className="grid grid-cols-1 gap-4 sm:gap-5">
          <div className="form-group">
            <InputArea
              register={register}
              label="Email"
              name="verifyEmail"
              type="email"
              placeholder="Your registered email"
              Icon={FiMail}
            />
            <Error errorName={errors.verifyEmail} />
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowResetPassword(false)}
              className="text-sm font-medium text-emerald-700 hover:text-emerald-800 underline underline-offset-4 hover:no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded"
            >
              Back to login
            </button>

            <button
              type="button"
              onClick={() => setShowResetPassword(true)}
              className="text-sm text-gray-500 hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded"
            >
              Need help?
            </button>
          </div>

          <div className="pt-1">
            {loading ? (
              <button
                disabled
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-emerald-600 text-white py-3 text-sm font-semibold shadow-sm opacity-90 cursor-not-allowed"
              >
                <img
                  src="/loader/spinner.gif"
                  alt="Loading"
                  width={18}
                  height={18}
                />
                <span className="font-serif font-light">Processing</span>
              </button>
            ) : (
              <button
                disabled={loading}
                type="submit"
                className="w-full text-center py-3 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 shadow-sm font-semibold"
              >
                Recover password
              </button>
            )}
          </div>

          <p className="text-xs sm:text-sm text-gray-500 text-center pt-2">
            If the email exists, you’ll receive a reset link shortly.
          </p>
        </div>
      </form>
    </div>
  );
};

export default ResetPassword;
