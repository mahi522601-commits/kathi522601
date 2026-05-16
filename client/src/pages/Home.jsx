import HeroSection from '../components/home/HeroSection';
import TopSellers from '../components/home/TopSellers';
import Testimonials from '../components/home/Testimonials';
import InstagramFeed from '../components/home/InstagramFeed';
import TrustBadges from '../components/home/TrustBadges';
import SEO from '../components/SEO';

export default function Home() {
  return (
    <>
      <SEO
        title="Khyathi Collections | Trending Sarees Online in Andhra Pradesh"
        description="Shop trending sarees online from Khyathi Collections. Premium silk sarees, wedding sarees, designer sarees, and traditional sarees in Hyderabad, Bangalore, and Andhra Pradesh."
        keywords="trending sarees, silk sarees, wedding sarees, designer sarees, sarees in Hyderabad, sarees in Bangalore, Andhra sarees"
        image="https://khyathicollections.com/banner.jpg"
        url="https://khyathicollections.com"
      />

      <HeroSection />
      <TopSellers />
      <Testimonials />
      <InstagramFeed />
      <TrustBadges />
    </>
  );
}