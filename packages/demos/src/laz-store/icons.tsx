// Icon paths ported verbatim from the LAZ Store reference design.

export function SignalIcon() {
  return (
    <svg width="16" height="12" viewBox="0 0 16 12" fill="#F5F5F5" aria-hidden="true">
      <rect x="0" y="7" width="3" height="5" />
      <rect x="4.5" y="4" width="3" height="8" />
      <rect x="9" y="1.5" width="3" height="10.5" />
    </svg>
  );
}

export function WifiIcon() {
  return (
    <svg width="16" height="12" viewBox="0 0 24 18" fill="#F5F5F5" aria-hidden="true">
      <path d="M12 15a2 2 0 100 4 2 2 0 000-4zM4.5 8.5a10.6 10.6 0 0115 0l-2 2a7.8 7.8 0 00-11 0z" />
    </svg>
  );
}

export function SearchIcon({ color = '#9B9B9B' }: { color?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

export function CartIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="#FFFFFF" aria-hidden="true">
      <path d="M7 6V4a5 5 0 0110 0v2h3l1 15H3L4 6z" />
      <circle cx="9" cy="20" r="1.4" fill="#E8231A" />
      <circle cx="17" cy="20" r="1.4" fill="#E8231A" />
    </svg>
  );
}

export function CartIconMuted() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M7 6V4a5 5 0 0110 0v2h3l1 15H3L4 6z" />
    </svg>
  );
}

export function BackChevronIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.4" aria-hidden="true">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

export function HomeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M3 11l9-8 9 8v9a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z" />
    </svg>
  );
}

export function CameraFabIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="#FFFFFF" aria-hidden="true">
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7l1.5-3h5L16 7" />
      <circle cx="12" cy="13.5" r="3.5" fill="#0B0B0D" />
    </svg>
  );
}

export function AccountIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4.4 3.6-7 8-7s8 2.6 8 7" />
    </svg>
  );
}

export function GalleryIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="#F5F5F5" aria-hidden="true">
      <rect x="3" y="5" width="18" height="15" rx="2" />
      <circle cx="9" cy="11" r="2" />
      <path d="M3 17l5-4 4 3 4-5 5 6" />
    </svg>
  );
}

export function FlipCameraIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F5F5F5" strokeWidth="2" aria-hidden="true">
      <path d="M3 12a9 9 0 0115-6.7M21 12a9 9 0 01-15 6.7" />
      <path d="M18 3v4h-4M6 21v-4h4" />
    </svg>
  );
}

export function FlashIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="#FFFFFF" aria-hidden="true">
      <path d="M7 3l-1.5 3H2v14h20V6h-3.5L17 3z" />
      <circle cx="12" cy="13" r="4" fill="#000000" />
    </svg>
  );
}

export function CheckIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#0B0B0D" strokeWidth="3" aria-hidden="true">
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}
