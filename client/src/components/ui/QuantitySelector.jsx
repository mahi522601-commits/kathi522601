import { MinusIcon, PlusIcon } from './Icons';

export default function QuantitySelector({ value, onChange, compact = false, max }) {
  const wrapperClass = compact
    ? 'rounded-full border border-borderwarm bg-white'
    : 'rounded-full border border-borderwarm bg-white px-1';
  const maxValue = Number(max || 0);
  const isAtMax = maxValue > 0 && value >= maxValue;

  return (
    <div className={`inline-flex items-center gap-1 ${wrapperClass}`}>
      <button
        type="button"
        className="flex h-10 w-10 items-center justify-center rounded-full text-primary transition hover:bg-cream"
        onClick={() => onChange(Math.max(1, value - 1))}
      >
        <MinusIcon />
      </button>
      <span className="min-w-8 text-center text-sm font-semibold text-primary">{value}</span>
      <button
        type="button"
        className={`flex h-10 w-10 items-center justify-center rounded-full text-primary transition hover:bg-cream ${
          isAtMax ? 'cursor-not-allowed opacity-45' : ''
        }`}
        disabled={isAtMax}
        onClick={() => onChange(value + 1)}
      >
        <PlusIcon />
      </button>
    </div>
  );
}
