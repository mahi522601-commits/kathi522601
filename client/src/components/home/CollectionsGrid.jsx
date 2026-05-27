import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import { sampleCollections } from '../../firebase/seedData';
import DiamondDivider from './DiamondDivider';

function CollectionCard({ collection }) {
  return (
    <Link to={`/collections/${collection.name.toLowerCase().replace(/\s+/g, '-')}`} className="group relative block overflow-hidden rounded-[1.1rem]">
      <img
        src={collection.image}
        alt={collection.name}
        className="h-[340px] w-full object-cover transition duration-500 group-hover:scale-[1.03]"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-6 text-white">
        <p className="font-heading text-3xl font-semibold">{collection.name}</p>
        <div className="mt-2 h-[2px] w-10 bg-white" />
      </div>
    </Link>
  );
}

export default function CollectionsGrid() {
  return (
    <section className="section-block bg-white">
      <div className="page-shell">
        <div className="text-center">
          <h2 className="section-title">Shop by Collections</h2>
          <p className="section-subtitle">Explore the newest Collections</p>
          <DiamondDivider />
        </div>

        <div className="mt-10 hidden grid-cols-4 gap-6 lg:grid">
          {sampleCollections.map((collection) => (
            <CollectionCard key={collection.name} collection={collection} />
          ))}
        </div>

        <div className="mt-10 lg:hidden">
          <Swiper
            modules={[Pagination]}
            pagination={{ clickable: true }}
            spaceBetween={14}
            breakpoints={{
              0: { slidesPerView: 1.15 },
              480: { slidesPerView: 2.05 },
            }}
          >
            {sampleCollections.map((collection) => (
              <SwiperSlide key={collection.name} className="pb-10">
                <CollectionCard collection={collection} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
}
