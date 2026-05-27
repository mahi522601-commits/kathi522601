import { Helmet } from 'react-helmet-async';

export default function JewelleryComingSoon() {
  return (
    <>
      <Helmet>
        <title>Jewellery Collection | Coming Soon</title>

        <meta
          name="description"
          content="Luxury jewellery collections are coming soon to Khyathi Collections."
        />
      </Helmet>

      <div className="flex min-h-screen items-center justify-center bg-[#faf7f2] px-6">
        <div className="max-w-2xl text-center">
          <h1 className="mb-6 text-5xl font-bold text-[#1C120A]">
            Jewellery Collection
          </h1>

          <p className="mb-8 text-xl text-gray-700">
            Something beautiful is arriving soon.
          </p>

          <div className="rounded-3xl border border-[#d4b06a] bg-white p-10 shadow-xl">
            <h2 className="mb-4 text-3xl font-semibold text-[#1C120A]">
              Coming Soon
            </h2>

            <p className="text-gray-600">
              Premium bridal jewellery, traditional collections,
              temple jewellery, necklaces, earrings, bangles,
              and luxury designs will be launched shortly.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}