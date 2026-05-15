import { Helmet } from 'react-helmet-async';
import HeroSection from '../components/home/HeroSection';
import TopSellers from '../components/home/TopSellers';
import Testimonials from '../components/home/Testimonials';
import InstagramFeed from '../components/home/InstagramFeed';
import TrustBadges from '../components/home/TrustBadges';

export default function Home() {
  return (
    <>
      <Helmet>
        <title>Khyathi Collections | Luxury Sarees & Ethnic Wear</title>
      </Helmet>
      <HeroSection />
      <TopSellers />
      <Testimonials />
      <InstagramFeed />
      <TrustBadges />
    </>
  );
}
