import React from "react"
import Link from "next/link"
import Image from "next/image"
import { Swiper, SwiperSlide } from "swiper/react"
import { Pagination, Autoplay, Navigation } from "swiper/modules"
import "swiper/css"
import "swiper/css/pagination"
import "swiper/css/navigation"

import useGetSetting from "@hooks/useGetSetting"
import useUtilsFunction from "@hooks/useUtilsFunction"

const MainCarousel = () => {
  const { storeCustomizationSetting } = useGetSetting()
  const { showingTranslateValue, showingUrl, showingImage } = useUtilsFunction()

  const sliderData = [
    {
      id: 1,
      title: showingTranslateValue(storeCustomizationSetting?.slider?.first_title),
      info: showingTranslateValue(storeCustomizationSetting?.slider?.first_description),
      buttonName: showingTranslateValue(storeCustomizationSetting?.slider?.first_button),
      url: showingUrl(storeCustomizationSetting?.slider?.first_link),
      image:
        showingImage(storeCustomizationSetting?.slider?.first_img) || "/slider/slider-1.jpg",
    },
    {
      id: 2,
      title: showingTranslateValue(storeCustomizationSetting?.slider?.second_title),
      info: showingTranslateValue(storeCustomizationSetting?.slider?.second_description),
      buttonName: showingTranslateValue(storeCustomizationSetting?.slider?.second_button),
      url: showingUrl(storeCustomizationSetting?.slider?.second_link),
      image:
        showingImage(storeCustomizationSetting?.slider?.second_img) || "/slider/slider-2.jpg",
    },
    {
      id: 3,
      title: showingTranslateValue(storeCustomizationSetting?.slider?.third_title),
      info: showingTranslateValue(storeCustomizationSetting?.slider?.third_description),
      buttonName: showingTranslateValue(storeCustomizationSetting?.slider?.third_button),
      url: showingUrl(storeCustomizationSetting?.slider?.third_link),
      image:
        showingImage(storeCustomizationSetting?.slider?.third_img) || "/slider/slider-3.jpg",
    },
    {
      id: 4,
      title: showingTranslateValue(storeCustomizationSetting?.slider?.four_title),
      info: showingTranslateValue(storeCustomizationSetting?.slider?.four_description),
      buttonName: showingTranslateValue(storeCustomizationSetting?.slider?.four_button),
      url: showingUrl(storeCustomizationSetting?.slider?.four_link),
      image:
        showingImage(storeCustomizationSetting?.slider?.four_img) || "/slider/slider-1.jpg",
    },
    {
      id: 5,
      title: showingTranslateValue(storeCustomizationSetting?.slider?.five_title),
      info: showingTranslateValue(storeCustomizationSetting?.slider?.five_description),
      buttonName: showingTranslateValue(storeCustomizationSetting?.slider?.five_button),
      url: showingUrl(storeCustomizationSetting?.slider?.five_link),
      image:
        showingImage(storeCustomizationSetting?.slider?.five_img) || "/slider/slider-2.jpg",
    },
  ]

  const showDots =
    !!storeCustomizationSetting?.slider?.bottom_dots || !!storeCustomizationSetting?.slider?.both_slider

  const showArrows =
    !!storeCustomizationSetting?.slider?.left_right_arrow || !!storeCustomizationSetting?.slider?.both_slider

  return (
    <Swiper
      spaceBetween={30}
      centeredSlides
      loop
      autoplay={{ delay: 2000, disableOnInteraction: false }}
      pagination={showDots ? { clickable: true } : false}
      navigation={showArrows ? true : false}
      modules={[Autoplay, Pagination, Navigation]}
      className="mySwiper"
    >
      {sliderData.map((item) => (
        <SwiperSlide className="h-full relative rounded-lg overflow-hidden" key={item.id}>
          <div className="text-sm text-gray-600 hover:text-emerald-dark">
            <Image
              src={item.image}
              alt={item.title || "Slide"}
              width={950}
              height={400}
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 950px"
              priority={item.id === 1}
            />
          </div>

          <div className="absolute top-0 left-0 z-10 flex w-full h-full items-center justify-start">
            <div className="pl-4 pr-12 sm:pl-10 sm:pr-16 w-10/12 lg:w-8/12 xl:w-7/12">
              <h1 className="mb-2 font-serif text-xl sm:text-lg md:text-2xl md:line-clamp-none lg:text-3xl font-bold text-gray-800 line-clamp-1">
                {item.title}
              </h1>

              <p className="text-base leading-6 text-gray-600 font-sans md:line-clamp-none line-clamp-1">
                {item.info}
              </p>

              <Link
                href={item.url || "/"}
                className="hidden sm:inline-block text-sm leading-6 font-serif font-medium mt-6 px-6 py-2 bg-emerald-500 text-center rounded-md text-white hover:bg-emerald-600"
              >
                {item.buttonName}
              </Link>
            </div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  )
}

export default React.memo(MainCarousel)
