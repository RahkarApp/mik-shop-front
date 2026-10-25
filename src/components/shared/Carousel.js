'use client';

import Card from "./Cart";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";





export default function Carousel({
  items,
  width = "w-full",
}) {
  return (
    <div className={`relative ${width} mx-auto h-fit `}>
      {/* کامپوننت Swiper برای کروسل */}
      <Swiper
        modules={[Navigation, Autoplay]}
        spaceBetween={0}
        slidesPerView={1}
        slidesPerGroup={1}
        loop={true}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        navigation={{
          prevEl: ".swiper-button-prev",
          nextEl: ".swiper-button-next",
        }}
        dir="rtl"
        effect="slide"
        speed={600}
       
       touchRatio={1.5} 
       touchAngle={45} 
       simulateTouch={true} //
       allowTouchMove={true} 
        breakpoints={{
          1024: { slidesPerView: 3 },
        }}
        className=" overflow-hidden" // 
      >
        {items && items.map((item, index) => (
          <SwiperSlide key={index}>
            <div className="flex justify-center items-center  text-justify leading-relaxed">
              <Card
                name={item.name}
                company={item.company}
                text={item.text}
              />
            </div>
          </SwiperSlide>
        ))}
        {/* دکمه‌ها*/}
        <div
          className="swiper-button-prev !text-secondary w-12 h-12 after:!text-xl "
          style={{ color: "#7000EE" }}
        ></div>
        <div
          className="swiper-button-next !text-secondary w-12 h-12 after:!text-xl  "
          style={{ color: "#7000EE" }}
        ></div>
      </Swiper>
    </div>
  );
}