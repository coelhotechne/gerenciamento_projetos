export default function BrandMark({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M16 2.5 L28 9.25 V22.75 L16 29.5 L4 22.75 V9.25 Z"
        stroke="var(--accent)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="16" cy="16" r="3.4" fill="var(--accent)" />
      <circle cx="16" cy="7" r="1.8" fill="var(--success)" />
      <circle cx="24.5" cy="21.5" r="1.8" fill="var(--success)" />
      <circle cx="7.5" cy="21.5" r="1.8" fill="var(--success)" />
      <path d="M16 10.4V13" stroke="var(--border-strong)" strokeWidth="1.4" />
      <path d="M18.6 17.7L23 20.4" stroke="var(--border-strong)" strokeWidth="1.4" />
      <path d="M13.4 17.7L9 20.4" stroke="var(--border-strong)" strokeWidth="1.4" />
    </svg>
  );
}
