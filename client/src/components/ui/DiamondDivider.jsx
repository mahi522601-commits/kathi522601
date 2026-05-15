export default function DiamondDivider() {
  return (
    <div className="flex items-center justify-center gap-2 my-4">
      <div className="flex-1 border-t border-dotted border-gold max-w-[100px]" />
      <svg width="12" height="12" viewBox="0 0 12 12" fill="var(--color-gold)">
        <polygon points="6,0 12,6 6,12 0,6" />
      </svg>
      <svg width="8" height="8" viewBox="0 0 8 8" fill="var(--color-gold)">
        <polygon points="4,0 8,4 4,8 0,4" />
      </svg>
      <svg width="12" height="12" viewBox="0 0 12 12" fill="var(--color-gold)">
        <polygon points="6,0 12,6 6,12 0,6" />
      </svg>
      <div className="flex-1 border-t border-dotted border-gold max-w-[100px]" />
    </div>
  );
}
