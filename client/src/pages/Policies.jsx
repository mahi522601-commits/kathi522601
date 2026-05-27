import { Helmet } from 'react-helmet-async';
import { policyContent } from '../utils/constants';

export default function Policies({ type }) {
  const content = policyContent[type] || policyContent['privacy-policy'];

  return (
    <>
      <Helmet>
        <title>{content.title} | Khyathi Collections</title>
      </Helmet>
      <section className="section-block">
        <div className="page-shell">
          <div className="card-surface mx-auto max-w-4xl px-6 py-10 md:px-10">
            <h1 className="font-heading text-5xl text-primary">{content.title}</h1>
            <p className="mt-4 text-sm leading-7 text-body md:text-base">{content.intro}</p>
            <div className="mt-8 space-y-4">
              {content.items.map((item) => (
                <div key={item} className="rounded-[1.3rem] bg-cream p-4 text-sm leading-7 text-body">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
