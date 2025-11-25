import Image from "next/image";
import { useRouter } from "next/router";
import React, { useContext, useRef } from "react";
import { IoChevronBackOutline, IoChevronForward } from "react-icons/io5";

import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

//internal import
import useAsync from "@hooks/useAsync";
import { SidebarContext } from "@context/SidebarContext";
import CategoryServices from "@services/CategoryServices";
import useUtilsFunction from "@hooks/useUtilsFunction";

const CategoryCarousel = () => {
  const router = useRouter();

  const prevRef = useRef(null);
  const nextRef = useRef(null);

  const { showingTranslateValue } = useUtilsFunction();
  const { isLoading, setIsLoading } = useContext(SidebarContext);
  const { data, error } = useAsync(() => CategoryServices.getShowingCategory());

  const handleCategoryClick = (id, category) => {
    const category_name = showingTranslateValue(category)
      ?.toLowerCase()
      .replace(/[^A-Z0-9]+/gi, "-");

    router.push(`/search?category=${category_name}&_id=${id}`);
    setIsLoading(!isLoading);
  };

  return (
    <>
      <Swiper
        onInit={(swiper) => {
          // attach custom buttons
          swiper.params.navigation.prevEl = prevRef.current;
          swiper.params.navigation.nextEl = nextRef.current;
          swiper.navigation.init();
          swiper.navigation.update();
        }}
        spaceBetween={8}
        navigation={{
          prevEl: prevRef.current,
          nextEl: nextRef.current,
        }}
        allowTouchMove={false}
        loop
        breakpoints={{
          375: { width: 375, slidesPerView: 2 },
          414: { width: 414, slidesPerView: 3 },
          660: { width: 660, slidesPerView: 4 },
          768: { width: 768, slidesPerView: 6 },
          991: { width: 991, slidesPerView: 8 },
          1140: { width: 1140, slidesPerView: 9 },
          1680: { width: 1680, slidesPerView: 10 },
          1920: { width: 1920, slidesPerView: 10 },
        }}
        modules={[Navigation]}
        className="mySwiper category-slider my-10"
      >
        {error ? (
          <p className="flex justify-center items-center m-auto text-xl text-red-500">
            <span>{String(error)}</span>
          </p>
        ) : (
          <>
            {data?.[0]?.children?.map((category, i) => (
              <SwiperSlide key={category?._id || i} className="group">
                <div
                  onClick={() => handleCategoryClick(category?._id, category.name)}
                  className="text-center cursor-pointer p-3 bg-white rounded-lg"
                >
                  <div className="bg-white p-2 mx-auto w-10 h-10 rounded-full shadow-md">
                    <Image
                      src={
                        category?.icon ||
                        "https://res.cloudinary.com/ahossain/image/upload/v1655097002/placeholder_kvepfp.png"
                      }
                      alt="category"
                      width={35}
                      height={35}
                    />
                  </div>

                  <h3 className="text-xs text-gray-600 mt-2 font-serif group-hover:text-emerald-500">
                    {showingTranslateValue(category?.name)}
                  </h3>
                </div>
              </SwiperSlide>
            ))}
          </>
        )}

        <button type="button" ref={prevRef} className="prev">
          <IoChevronBackOutline />
        </button>
        <button type="button" ref={nextRef} className="next">
          <IoChevronForward />
        </button>
      </Swiper>
    </>
  );
};

export default React.memo(CategoryCarousel);
