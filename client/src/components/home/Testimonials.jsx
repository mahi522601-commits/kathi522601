import { Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Link } from 'react-router-dom';
import { sampleTestimonials } from '../../firebase/seedData';
import { StarIcon } from '../ui/Icons';

export default function Testimonials() {
  return (
    <section className="section-block bg-white">
      <div className="page-shell">
        <div className="text-center">
          <h2 className="section-title">Happy Clients</h2>
          <p className="section-subtitle">We constantly work to make sure they&apos;re happy!</p>
        </div>

        <div className="mt-10">
          <Swiper
            modules={[Autoplay]}
            autoplay={{ delay: 4200, disableOnInteraction: false }}
            spaceBetween={20}
            breakpoints={{
              0: { slidesPerView: 1.05 },
              768: { slidesPerView: 2.1 },
              1024: { slidesPerView: 3 },
            }}
          >
            {sampleTestimonials.map((item) => (
              <SwiperSlide key={item.id}>
                <article className="card-surface h-full p-6">
                  <div className="flex gap-1 text-gold">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <StarIcon key={index} />
                    ))}
                  </div>
                  <p className="mt-5 text-base italic leading-7 text-body">&ldquo;{item.review}&rdquo;</p>
                  <p className="mt-6 font-semibold text-primary">{item.name}</p>
                  <div className="mt-6 flex items-center gap-4">
                    <img src={item.image} alt={item.productName} className="h-16 w-16 rounded-full object-cover" loading="lazy" />
                    <div>
                      <Link to={`/product/${item.productId}`} className="font-semibold text-primary">
                        {item.productName}
                      </Link>
                      <p className="text-sm text-muted">Featured pick</p>
                    </div>
                  </div>
                </article>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
}
