export function Logo({ size = 52, dark = false }: { size?: number; dark?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-label="NITER logo">
      <defs>
        <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={dark ? '#60a5fa' : '#1d4ed8'} />
          <stop offset="1" stopColor={dark ? '#1d4ed8' : '#0b1a38'} />
        </linearGradient>
      </defs>
      <path d="M32 3 L58 12 V32 C58 47 46.5 56.5 32 61 C17.5 56.5 6 47 6 32 V12 Z" fill="url(#lg)" />
      <path d="M32 9 L52 16 V32 C52 44 43 51.8 32 55.5 C21 51.8 12 44 12 32 V16 Z" fill={dark ? '#0b1a38' : '#ffffff'} />
      <path d="M32 16 L44 20 V31 C44 39.4 38.8 44.6 32 47.2 C25.2 44.6 20 39.4 20 31 V20 Z" fill={dark ? '#1d4ed8' : '#2563eb'} />
      <path d="M24.5 24 h15 M32 24 V42 M26.5 31 q5.5 4 11 0 M26.5 37 q5.5 4 11 0" stroke={dark ? '#93c5fd' : '#f7df9a'} strokeWidth="2.2" strokeLinecap="round" fill="none" />
    </svg>
  );
}
