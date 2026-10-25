'use client';

/**
 * BannerA — اسلایدر تمام‌عرض با Swiper
 */

import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export default function BannerA({ banners }) {
  if (!banners?.length) return null;

  return (
    <div className="w-full relative group">
      <Swiper
        loop
        spaceBetween={10}
        slidesPerView={1}
        navigation
        autoplay={{ delay: 4000, disableOnInteraction: false, pauseOnMouseEnter: true }}
        pagination={{ clickable: true }}
        modules={[Navigation, Pagination, Autoplay]}
        className="w-full h-48 sm:h-64 md:h-[400px] rounded-2xl overflow-hidden shadow-lg"
      >
        {banners.map((banner) => (
          <SwiperSlide key={banner.id}>
            <Link href={banner.link || '#'} className="relative block w-full h-full bg-stone-100">
              <img src={banner.image} alt="" className="w-full h-full object-contain" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
