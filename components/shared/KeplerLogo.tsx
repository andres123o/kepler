export function KeplerLogo({ className }: { className?: string }) {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 500 500"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <radialGradient id="planetGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
          <stop offset="0%" style={{ stopColor: "#ffca28", stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: "#800080", stopOpacity: 1 }} />
        </radialGradient>
        <linearGradient id="ringGradientFront" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: "#2a1a6a", stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: "#4a1a8a", stopOpacity: 1 }} />
        </linearGradient>
        <linearGradient id="ringGradientBack" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: "#2a1a6a", stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: "#4a1a8a", stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <g transform="translate(250, 250)">
        <ellipse cx="0" cy="0" rx="200" ry="50" fill="url(#ringGradientBack)" transform="rotate(10)" />
        <circle cx="0" cy="0" r="100" fill="url(#planetGradient)" />
        <path d="M -197 34 A 200 50 10 0 1 197 -34 L 188 -49 A 200 50 10 0 0 -188 49 Z" fill="url(#ringGradientFront)" />
      </g>
    </svg>
  );
}

