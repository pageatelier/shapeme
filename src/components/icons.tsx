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
