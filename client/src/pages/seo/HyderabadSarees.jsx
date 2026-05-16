import SEO from '../../components/SEO';

export default function HyderabadSarees() {
  return (
    <div className="min-h-screen bg-[#faf7f2] px-6 py-16 text-[#1C120A]">
      <SEO
        title="Trending Sarees in Hyderabad | Khyathi Collections"
        description="Shop trending sarees in Hyderabad including bridal sarees, silk sarees, wedding sarees, and designer collections from Khyathi Collections."
        keywords="trending sarees in Hyderabad, silk sarees Hyderabad, bridal sarees Hyderabad, wedding sarees Hyderabad"
        image="https://khyathicollections.com/banner.jpg"
        url="https://khyathicollections.com/sarees-in-hyderabad"
      />

      <div className="mx-auto max-w-5xl">
        <h1 className="mb-6 text-5xl font-bold">
          Trending Sarees in Hyderabad
        </h1>

        <p className="mb-5 text-lg leading-8">
          Khyathi Collections offers premium trending sarees in Hyderabad including silk sarees,
          bridal sarees, wedding sarees, designer sarees, and traditional ethnic collections.
        </p>

        <p className="mb-5 text-lg leading-8">
          Explore handcrafted sarees designed for weddings, festivals, receptions, engagements,
          and traditional South Indian occasions.
        </p>

        <h2 className="mb-4 mt-10 text-3xl font-bold">
          Popular Saree Categories in Hyderabad
        </h2>

        <ul className="list-disc space-y-3 pl-6 text-lg">
          <li>Bridal Sarees</li>
          <li>Kanchipuram Silk Sarees</li>
          <li>Wedding Sarees</li>
          <li>Designer Party Wear Sarees</li>
          <li>Traditional South Indian Sarees</li>
          <li>Celebrity Inspired Sarees</li>
        </ul>
      </div>
    </div>
  );
}