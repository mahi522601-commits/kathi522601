import SEO from '../../components/SEO';

export default function BangaloreSarees() {
  return (
    <div className="min-h-screen bg-[#faf7f2] px-6 py-16 text-[#1C120A]">
      <SEO
        title="Best Sarees in Bangalore | Khyathi Collections"
        description="Shop trending sarees in Bangalore including silk sarees, bridal sarees, wedding sarees, and premium designer collections."
        keywords="sarees in Bangalore, silk sarees Bangalore, bridal sarees Bangalore, trending sarees Bangalore"
        image="https://khyathicollections.com/banner.jpg"
        url="https://khyathicollections.com/sarees-in-bangalore"
      />

      <div className="mx-auto max-w-5xl">
        <h1 className="mb-6 text-5xl font-bold">
          Best Sarees in Bangalore
        </h1>

        <p className="mb-5 text-lg leading-8">
          Discover premium saree collections in Bangalore from Khyathi Collections.
          We provide silk sarees, bridal sarees, wedding collections, and trendy ethnic wear.
        </p>

        <p className="mb-5 text-lg leading-8">
          Our collections are curated for modern women who love traditional elegance.
        </p>
      </div>
    </div>
  );
}