interface BrandProps {
  tone?: "dark" | "light";
  compact?: boolean;
}

export function Brand({ tone = "dark", compact = false }: BrandProps) {
  const isLight = tone === "light";

  return (
    <div className="inline-flex items-center gap-2.5 whitespace-nowrap shrink-0">
      <svg
        width="28"
        height="28"
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0"
      >
        <path
          d="M14 2L24.5 8V20L14 26L3.5 20V8L14 2Z"
          className={isLight ? "stroke-saffron" : "stroke-primary"}
          strokeWidth="1.75"
          strokeLinejoin="round"
        />
        <path
          d="M9 10.5C11 9.5 13 10.2 14 11.4C15 10.2 17 9.5 19 10.5V18.5C17 17.6 15 18.2 14 19.3C13 18.2 11 17.6 9 18.5V10.5Z"
          className={isLight ? "fill-saffron/20 stroke-ink-foreground" : "fill-primary/10 stroke-ink"}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M14 11.4V19.3"
          className={isLight ? "stroke-ink-foreground" : "stroke-ink"}
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
      <span
        className={`font-display font-semibold tracking-tight whitespace-nowrap shrink-0 ${
          compact ? "text-sm max-w-[260px] truncate sm:max-w-none" : "text-base sm:text-lg"
        } ${isLight ? "text-ink-foreground" : "text-ink"}`}
      >
        GURU PINTAR, CERDAS, DAN PROFESIONAL
      </span>
    </div>
  );
}
