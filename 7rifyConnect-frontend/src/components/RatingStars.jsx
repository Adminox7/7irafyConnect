export default function RatingStars({ value = 0, size = 16 }) {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  const Star = ({ filled }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden className={filled ? "text-amber-500" : "text-slate-300"}>
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27z" fill="currentColor" />
    </svg>
  );
  return (
    <div className="inline-flex items-center gap-0.5 align-middle" aria-label={`تقييم ${value} من 5`}>
      {Array.from({ length: full }).map((_, i) => (
        <Star key={`f${i}`} filled />
      ))}
      {half && (
        <div className="relative" style={{ width: size, height: size }}>
          <svg width={size} height={size} viewBox="0 0 24 24" className="absolute left-0 top-0 text-amber-500">
            <defs>
              <clipPath id="half">
                <rect x="0" y="0" width="12" height="24" />
              </clipPath>
            </defs>
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27z" fill="currentColor" clipPath="url(#half)" />
          </svg>
          <svg width={size} height={size} viewBox="0 0 24 24" className="absolute left-0 top-0 text-slate-300">
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27z" fill="currentColor" />
          </svg>
        </div>
      )}
      {Array.from({ length: empty }).map((_, i) => (
        <Star key={`e${i}`} />
      ))}
    </div>
  );
}
