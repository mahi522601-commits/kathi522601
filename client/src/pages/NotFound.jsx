import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import Sparkle from '../components/ui/Sparkle';

export default function NotFound() {
  return (
    <>
      <Helmet>
        <title>Page Not Found | Khyathi Collections</title>
      </Helmet>
      <section className="section-block relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 opacity-70">
          <Sparkle size={26} style={{ top: '15%', left: '12%' }} animate />
          <Sparkle size={18} style={{ bottom: '24%', right: '16%' }} animate delay={0.3} />
        </div>
        <div className="page-shell">
          <div className="card-surface mx-auto max-w-3xl px-6 py-16 text-center md:px-12">
            <p className="text-sm uppercase tracking-[0.24em] text-gold-dark">404</p>
            <h1 className="mt-4 font-heading text-5xl text-primary md:text-6xl">This page drifted out of the collection</h1>
            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-body md:text-base">
              The page you&apos;re looking for isn&apos;t here right now. Let&apos;s take you back to the curated edit.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link to="/" className="action-button">
                Back Home
              </Link>
              <Link to="/collections" className="action-button-outline">
                Shop Collection
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
