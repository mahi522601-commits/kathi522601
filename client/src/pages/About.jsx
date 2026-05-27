import { Helmet } from 'react-helmet-async';

export default function About() {
  return (
    <>
      <Helmet>
        <title>About Us | Khyathi Collections</title>
      </Helmet>
      <section className="section-block">
        <div className="page-shell">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-sm uppercase tracking-[0.24em] text-gold-dark">Our Story</p>
            <h1 className="mt-4 font-heading text-5xl text-primary md:text-6xl">Tradition, texture, and quiet luxury</h1>
            <p className="mt-6 text-sm leading-8 text-body md:text-lg">
              Khyathi Collections celebrates Indian ethnic wear with curated sarees, festive half sarees,
              elegant dresses, and fabrics chosen for grace and confidence. Each piece is selected to feel
              rooted in tradition yet easy to wear for modern occasions.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {[
              {
                title: 'Curated Drapes',
                body: 'Every collection is chosen for finish, feel, and flattering movement.',
              },
              {
                title: 'Festive Color Stories',
                body: 'Warm tones, jewel palettes, and gold accents shape the Khyathi mood.',
              },
              {
                title: 'Thoughtful Service',
                body: 'From browsing to delivery, we aim to make the entire experience feel special.',
              },
            ].map((item) => (
              <div key={item.title} className="card-surface p-6">
                <h2 className="font-heading text-3xl text-primary">{item.title}</h2>
                <p className="mt-4 text-sm leading-7 text-body">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
