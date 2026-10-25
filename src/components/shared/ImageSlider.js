'use client';

import React, { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';
import { FreeMode, Navigation, Thumbs, Autoplay } from 'swiper/modules';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ImageSlider({ images }) {
  const [thumbsSwiper, setThumbsSwiper] = useState(null);

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-96 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400">
        <span className="text-sm">تصویری موجود نیست</span>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="relative group rounded-2xl overflow-hidden bg-white shadow-sm border border-gray-100">
        <Swiper
          style={{
            '--swiper-navigation-color': '#000',
            '--swiper-pagination-color': '#000',
          }}
          loop={true}
          spaceBetween={10}
          navigation={{
            nextEl: '.swiper-button-next-custom',
            prevEl: '.swiper-button-prev-custom',
          }}
          autoplay={{
            delay: 4000,
            disableOnInteraction: false,
          }}
          thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
          modules={[FreeMode, Navigation, Thumbs, Autoplay]}
          className="w-full aspect-square md:aspect-[4/3] relative z-10"
        >
          {images.map((src, index) => (
            <SwiperSlide key={index} className="bg-white flex items-center justify-center p-8">
              <motion.img
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                src={src}
                alt={`Slide ${index + 1}`}
                className="w-full h-full object-contain mix-blend-multiply"
              />
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Custom Navigation */}
        <div className="swiper-button-next-custom absolute top-1/2 right-4 z-20 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center text-gray-800 cursor-pointer opacity-0 group-hover:opacity-100 transition-all -translate-y-1/2 hover:scale-110 hover:bg-white">
          <ChevronRight className='w-5 h-5' />
        </div>
        <div className="swiper-button-prev-custom absolute top-1/2 left-4 z-20 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center text-gray-800 cursor-pointer opacity-0 group-hover:opacity-100 transition-all -translate-y-1/2 hover:scale-110 hover:bg-white">
          <ChevronLeft className='w-5 h-5' />
        </div>
      </div>

      <Swiper
        onSwiper={setThumbsSwiper}
        loop={true}
        spaceBetween={12}
        slidesPerView={4}
        freeMode={true}
        watchSlidesProgress={true}
        modules={[FreeMode, Navigation, Thumbs]}
        className="w-full px-1"
      >
        {images.map((src, index) => (
          <SwiperSlide key={index} className="cursor-pointer rounded-xl overflow-hidden border-2 border-transparent transition-all !w-[22%] !h-auto aspect-square">
            <div className="w-full h-full bg-white rounded-xl border border-gray-100 p-2 flex items-center justify-center relative">
              <img src={src} alt={`Thumbnail ${index + 1}`} className='w-full h-full object-contain mix-blend-multiply' />
              {/* Active overlay styles handled by swiper-slide-thumb-active class globally if needed, or via js */}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <style jsx global>{`
        .swiper-slide-thumb-active .w-full {
             @apply border-primary ring-2 ring-primary/20;
        }
      `}</style>
    </div>
  );
}
