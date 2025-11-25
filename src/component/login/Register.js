//freshmart-frontend/src/component/login/Register.js
import { FiLock, FiMail, FiUser } from "react-icons/fi";

//internal import
import Error from "@component/form/Error";
import InputArea from "@component/form/InputArea";
import useLoginSubmit from "@hooks/useLoginSubmit";

const Register = ({ setShowResetPassword, setModalOpen }) => {
  const { handleSubmit, submitHandler, register, errors, loading } =
    useLoginSubmit(setModalOpen);

  return (
    <div className="w-full">
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-bold font-serif text-gray-900">
          Signing Up
        </h2>
        <p className="text-sm sm:text-base text-gray-500 mt-2">
          Create an account with email
        </p>
      </div>

      <form
        onSubmit={handleSubmit(submitHandler)}
        className="mt-6 sm:mt-8 flex flex-col"
      >
        <div className="grid grid-cols-1 gap-4 sm:gap-5">
          <div className="form-group">
            <InputArea
              register={register}
              label="Name"
              name="name"
              type="text"
              placeholder="Full Name"
              Icon={FiUser}
            />
            <Error errorName={errors.name} />
          </div>

          <div className="form-group">
            <InputArea
              register={register}
              label="Email"
              name="email"
              type="email"
              placeholder="Email"
              Icon={FiMail}
            />
            <Error errorName={errors.email} />
          </div>

          <div className="form-group">
            <InputArea
              register={register}
              label="Password"
              name="password"
              type="password"
              placeholder="Password"
              Icon={FiLock}
            />
            <Error errorName={errors.password} />
          </div>

          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={() => setShowResetPassword(true)}
              className="text-sm font-medium text-emerald-700 hover:text-emerald-800 underline underline-offset-4 hover:no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded"
            >
              Forgot password?
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
                Register
              </button>
            )}
          </div>

          <p className="text-xs sm:text-sm text-gray-500 text-center pt-2">
            By continuing, you agree to Freshmart’s terms and privacy policy.
          </p>
        </div>
      </form>
    </div>
  );
};

export default Register;
