export function RadarLogo({ size = 42 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 42 42" className="text-primary">
      <circle cx="21" cy="21" r="20" fill="none" stroke="currentColor" strokeOpacity="0.4" />
      <circle cx="21" cy="21" r="13" fill="none" stroke="currentColor" strokeOpacity="0.3" />
      <circle cx="21" cy="21" r="6" fill="none" stroke="currentColor" strokeOpacity="0.25" />
      <line x1="21" y1="1" x2="21" y2="41" stroke="currentColor" strokeOpacity="0.25" />
      <line x1="1" y1="21" x2="41" y2="21" stroke="currentColor" strokeOpacity="0.25" />
      <path d="M21 21 L41 21 A20 20 0 0 0 34 7 Z" fill="currentColor" fillOpacity="0.35" />
      <circle cx="21" cy="21" r="2" fill="currentColor" />
    </svg>
  );
}
