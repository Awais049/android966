interface StarRatingProps {
  rating: number;
  size?: "sm" | "md";
  showValue?: boolean;
}

export function StarRating({ rating, size = "sm", showValue = false }: StarRatingProps) {
  const sizeClass = size === "md" ? "text-base" : "text-sm";
  return (
    <div className="flex items-center gap-1">
      <div className={`flex ${sizeClass}`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} className={i < Math.round(rating) ? "star-filled" : "star-empty"}>
            ★
          </span>
        ))}
      </div>
      {showValue && <span className="text-xs text-neutral">{rating.toFixed(1)}</span>}
    </div>
  );
}
