//freshmart-frontend/src/layout/navbar/Navbar.js
import { useContext, useEffect, useMemo, useState } from "react";
import Cookies from "js-cookie";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useCart } from "react-use-cart";
import { IoSearchOutline } from "react-icons/io5";
import { FiShoppingCart, FiUser, FiBell } from "react-icons/fi";
import useTranslation from "next-translate/useTranslation";

//internal import
import NavbarPromo from "@layout/navbar/NavbarPromo";
import { UserContext } from "@context/UserContext";
import LoginModal from "@component/modal/LoginModal";
import CartDrawer from "@component/drawer/CartDrawer";
import { SidebarContext } from "@context/SidebarContext";
import useGetSetting from "@hooks/useGetSetting";

const Navbar = () => {
  const { t } = useTranslation();
  const [imageUrl, setImageUrl] = useState("");
  const [searchText, setSearchText] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const { toggleCartDrawer } = useContext(SidebarContext);
  const { totalItems } = useCart();
  const router = useRouter();

  const { storeCustomizationSetting } = useGetSetting();

  const {
    state: { userInfo },
  } = useContext(UserContext);

  const logoSrc = useMemo(
    () =>
      storeCustomizationSetting?.navbar?.header_logo || "/logo/Freshmart_round.PNG",
    [storeCustomizationSetting]
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    const q = searchText.trim();

    if (q) {
      router.push(`/search?query=${encodeURIComponent(q)}`, null, { scroll: false });
      setSearchText("");
      return;
    }

    router.push(`/`, null, { scroll: false });
    setSearchText("");
  };

  useEffect(() => {
    if (Cookies.get("userInfo")) {
      const user = JSON.parse(Cookies.get("userInfo"));
      setImageUrl(user?.image || "");
    }
  }, []);

  const ProfileButton = () => {
    if (imageUrl || userInfo?.image) {
      return (
        <Link
          href="/user/dashboard"
          aria-label="Open your dashboard"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-white/70 bg-white/10 p-0.5 shadow-sm cursor-pointer transition hover:border-white hover:bg-white/20 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-600"
        >
          <Image
            width={32}
            height={32}
            src={imageUrl || userInfo?.image}
            alt="user"
            className="rounded-full"
          />
        </Link>
      );
    }

    if (userInfo?.name) {
      return (
        <Link
          href="/user/dashboard"
          aria-label="Open your dashboard"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-white/70 bg-white/10 text-white text-sm font-bold cursor-pointer transition hover:border-white hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-600"
        >
          {userInfo?.name?.[0]?.toUpperCase()}
        </Link>
      );
    }

    return (
      <button
        type="button"
        aria-label="Open login"
        onClick={() => setModalOpen(true)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-white/40 bg-white/10 text-white shadow-sm transition hover:border-white/70 hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-600"
      >
        <FiUser className="h-5 w-5 drop-shadow" />
      </button>
    );
  };

  return (
    <>
      <CartDrawer />
      {modalOpen && <LoginModal modalOpen={modalOpen} setModalOpen={setModalOpen} />}

      <header className="sticky top-0 z-20 bg-emerald-600">
        <div className="max-w-screen-2xl mx-auto px-3 sm:px-6 lg:px-10">
          <div className="h-16 flex items-center gap-3">
            <Link href="/" className="hidden lg:inline-flex items-center shrink-0">
              <Image
                width={120}
                height={40}
                src={logoSrc}
                alt="logo"
                className="h-10 w-auto"
                priority
              />
            </Link>

            <div className="flex-1">
              <form
                onSubmit={handleSubmit}
                className="relative w-full max-w-3xl mx-auto"
              >
                <input
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="w-full h-11 rounded-lg bg-white/95 pl-4 pr-12 text-sm text-gray-900 shadow-sm ring-1 ring-black/5 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white/70"
                  placeholder={t(`common:search-placeholder`)}
                />
                <button
                  aria-label="Search"
                  type="submit"
                  className="absolute right-1 top-1 inline-flex h-9 w-9 items-center justify-center rounded-md text-gray-500 transition hover:bg-emerald-50 hover:text-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200"
                >
                  <IoSearchOutline className="text-xl" />
                </button>
              </form>
            </div>

            <div className="hidden lg:flex items-center gap-3 shrink-0">
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-white/25 bg-white/10 text-white transition hover:bg-white/20 hover:border-white/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-600"
                aria-label="Notifications"
              >
                <FiBell className="h-5 w-5 drop-shadow" />
              </button>

              <button
                type="button"
                onClick={toggleCartDrawer}
                aria-label="Open cart"
                className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-white/25 bg-white/10 text-white transition hover:bg-white/20 hover:border-white/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-600"
              >
                <FiShoppingCart className="h-5 w-5 drop-shadow" />
                <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 text-[11px] font-bold leading-5 text-white bg-red-500 rounded-full shadow">
                  {totalItems}
                </span>
              </button>

              <ProfileButton />
            </div>
          </div>
        </div>

        <NavbarPromo />
      </header>
    </>
  );
};

export default dynamic(() => Promise.resolve(Navbar), { ssr: false });
