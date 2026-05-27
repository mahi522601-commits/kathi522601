export default function ColorSwatch({
  color,
  selected = false,
  onClick,
  className = '',
  showLabel = false,
}) {
  return (
    <button
      type="button"
      title={color.name}
      onClick={onClick}
      className={`group inline-flex items-center gap-2 rounded-full ${className}`}
    >
      <span
        className={`h-4 w-4 rounded-full border transition md:h-[14px] md:w-[14px] ${
          selected ? 'border-primary ring-2 ring-primary/20' : 'border-white/70 ring-1 ring-black/5'
        }`}
        style={{ background: color.hex }}
      />
      {showLabel ? <span className="text-sm text-body">{color.name}</span> : null}
    </button>
  );
}
