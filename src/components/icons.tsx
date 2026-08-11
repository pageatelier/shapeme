import { Footprints, Settings } from "lucide-react";

type IconProps = {
  className?: string;
};

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function HomeIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M4 11.5 12 4l8 7.5" />
      <path d="M6 10v9h12v-9" />
    </svg>
  );
}

export function DumbbellIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M6.5 6.5v11M17.5 6.5v11M3 9.5v5M21 9.5v5M6.5 12h11" />
    </svg>
  );
}

/** Move — deliberately not gym-equipment (running/dance/yoga all count as
 * "Move"), so this wraps Lucide's Footprints glyph instead of DumbbellIcon,
 * restyled to this file's shared stroke width. */
export function MoveIcon({ className }: IconProps) {
  return <Footprints className={className} strokeWidth={1.6} />;
}

export function SettingsIcon({ className }: IconProps) {
  return <Settings className={className} strokeWidth={1.6} />;
}

/** Alternative Move draft — a hand-drawn figure mid-movement, in case the
 * Lucide glyph reads too clinical/medical for this context. Not wired into
 * the nav; kept here for a side-by-side comparison. */
export function MoveDanceIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <circle cx="13.2" cy="4.6" r="2.1" />
      <path d="M12.3 6.6c-.7 2-.9 3.6-.6 5.2" />
      <path d="M11.4 9.3C9.3 8.1 7.9 6.8 7 5" />
      <path d="M12.1 10.4c2.1.7 3.7 1.9 4.5 3.7" />
      <path d="M11.6 11.6c-1.6 1.7-2.6 3.6-3.1 6.4" />
      <path d="M12.2 11.8c1.8 1.4 2.8 3.3 2.9 6.2" />
    </svg>
  );
}

export function CalendarIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <rect x="4" y="4.5" width="16" height="15" rx="3" />
      <path d="M8 3v3M16 3v3M4 10h16" />
    </svg>
  );
}

export function UserIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <circle cx="12" cy="8" r="3.4" />
      <path d="M5 20c1-3.6 4-5.4 7-5.4S18 16.4 19 20" />
    </svg>
  );
}

export function PlusIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function HeartIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M20.8 8.6c0 5.4-8.8 10.4-8.8 10.4S3.2 14 3.2 8.6a5 5 0 0 1 8.8-3.2 5 5 0 0 1 8.8 3.2Z" />
    </svg>
  );
}

export function WaterDropIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M12 3s6.5 7 6.5 11.5a6.5 6.5 0 1 1-13 0C5.5 10 12 3 12 3Z" />
    </svg>
  );
}

export function MealIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <rect x="3.5" y="5" width="17" height="14" rx="3" />
      <circle cx="12" cy="12" r="3.2" />
    </svg>
  );
}

export function CameraIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <rect x="3.5" y="6" width="17" height="13" rx="2.5" />
      <circle cx="12" cy="12.5" r="3.2" />
      <path d="M8.5 6l1.3-2h4.4l1.3 2" />
    </svg>
  );
}

export function ChevronLeftIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M15 5l-7 7 7 7" />
    </svg>
  );
}

export function ChevronRightIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M9 5l7 7-7 7" />
    </svg>
  );
}

export function EditIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-3-3L5 17v3Z" />
      <path d="M13.5 8 16 10.5" />
    </svg>
  );
}

/** Decorative 4-petal flower — matches the app's flower motif (see the PWA
 * icon). Filled, not stroked, since it's an illustration rather than a line
 * icon; used as the empty-slot placeholder in the Body Timeline grid. */
export function FlowerIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      {/* Each petal circle's edge passes through the shared center point
          (distance from its own center to (12,12) equals its radius) — the
          standard construction for a 4-petal quatrefoil from plain circles. */}
      <circle cx="12" cy="7" r="5" />
      <circle cx="17" cy="12" r="5" />
      <circle cx="12" cy="17" r="5" />
      <circle cx="7" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.4" fill="var(--color-peach-300)" />
    </svg>
  );
}

export function ScaleIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="4" />
      <path d="M12 8v4l2.5 2.5" />
    </svg>
  );
}

export function NoteIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M6 4h9l3 3v13H6Z" />
      <path d="M9 11h6M9 15h6" />
    </svg>
  );
}

/** The actual brand mark (matches public/icons/icon-512.png, the PWA/app
 * icon) — a pinched hourglass silhouette, filled rather than stroked. The
 * outline is traced from the source PNG's pixel data (sampled at 41
 * scanlines, mapped into this 24x24 viewBox) rather than hand-drawn, so it
 * reproduces the real mark's curve instead of an approximation. Used next
 * to the "silua" wordmark in BrandLogo. currentColor so it follows the
 * wordmark's own color (white on a photo background, espresso ink
 * elsewhere) instead of needing separate light/dark assets. */
export function BrandMarkIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M2,2 L22,2 L20.59,2.5 L19.5,3 L18.52,3.5 L17.65,4 L16.89,4.5 L16.24,5 L15.7,5.5 L15.15,6 L14.61,6.5 L14.28,7 L13.85,7.5 L13.52,8 L13.2,8.5 L12.98,9 L12.76,9.5 L12.54,10 L12.43,10.5 L12.33,11 L12.22,11.5 L12.11,12 L12.22,12.5 L12.22,13 L12.33,13.5 L12.54,14 L12.65,14.5 L12.87,15 L13.2,15.5 L13.52,16 L13.85,16.5 L14.28,17 L14.61,17.5 L15.15,18 L15.7,18.5 L16.24,19 L16.89,19.5 L17.65,20 L18.41,20.5 L19.39,21 L20.48,21.5 L21.78,22 L2.22,22 L3.63,21.5 L4.72,21 L5.7,20.5 L6.46,20 L7.22,19.5 L7.76,19 L8.41,18.5 L8.85,18 L9.39,17.5 L9.72,17 L10.15,16.5 L10.48,16 L10.8,15.5 L11.13,15 L11.35,14.5 L11.46,14 L11.67,13.5 L11.78,13 L11.78,12.5 L11.89,12 L11.78,11.5 L11.78,11 L11.57,10.5 L11.46,10 L11.24,9.5 L11.02,9 L10.8,8.5 L10.48,8 L10.15,7.5 L9.72,7 L9.28,6.5 L8.85,6 L8.3,5.5 L7.65,5 L7.11,4.5 L6.35,4 L5.48,3.5 L4.5,3 L3.41,2.5 Z" />
    </svg>
  );
}

/** Nav icon for Body — an hourglass, echoing the app's brand mark, standing
 * in for "watch your body change over time" better than a literal camera. */
export function HourglassIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M5 21h14" />
      <path d="M5 3h14" />
      <path d="M17 21v-3.5a2.5 2.5 0 0 0-.9-1.9L12 12l4.1-3.6a2.5 2.5 0 0 0 .9-1.9V3" />
      <path d="M7 21v-3.5a2.5 2.5 0 0 1 .9-1.9L12 12 7.9 8.4A2.5 2.5 0 0 1 7 6.5V3" />
    </svg>
  );
}

/** Nav icon for Guide — an open book. */
export function BookIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M4 6c2-1 5-1 8 1v12c-3-2-6-2-8-1V6Z" />
      <path d="M20 6c-2-1-5-1-8 1v12c3-2 6-2 8-1V6Z" />
    </svg>
  );
}

export function BellIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M6 10a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5h-15S6 14 6 10Z" />
      <path d="M10 18.5a2 2 0 0 0 4 0" />
    </svg>
  );
}

export function ChevronDownIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M5 9l7 7 7-7" />
    </svg>
  );
}

export function ChevronUpIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M5 15l7-7 7 7" />
    </svg>
  );
}

export function CheckIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

export function CloseIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

/** Switch/flip camera — used by the live capture view's front/back toggle. */
export function FlipCameraIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M4 12a8 8 0 0 1 13.5-5.5L20 9" />
      <path d="M20 5v4h-4" />
      <path d="M20 12a8 8 0 0 1-13.5 5.5L4 15" />
      <path d="M4 19v-4h4" />
    </svg>
  );
}

export function LockIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <rect x="5.5" y="10.5" width="13" height="9.5" rx="2.5" />
      <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
    </svg>
  );
}
