export default function Badge({ children, tone = 'sale', className = '' }) {
  const tones = {
    sale: 'bg-maroon text-white',
    neutral: 'bg-white/90 text-primary',
    muted: 'bg-[#a8937b] text-white',
    success: 'bg-emerald-600 text-white',
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
