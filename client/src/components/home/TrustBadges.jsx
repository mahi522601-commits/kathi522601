export default function TrustBadges() {
  const content =
    'Free Shipping on Every Order  •  Flexible Return Policies  •  Secure Checkout  •  Free Shipping on Every Order  •  Flexible Return Policies  •  Secure Checkout  •  ';

  return (
    <section className="overflow-hidden border-y border-borderwarm bg-cream py-4">
      <div className="animate-marquee whitespace-nowrap text-sm uppercase tracking-[0.22em] text-primary">
        <span>{content}</span>
        <span>{content}</span>
      </div>
    </section>
  );
}
