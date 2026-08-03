"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CameraIcon, HomeIcon, MoveIcon, NoteIcon, UserIcon } from "@/components/icons";

// Calendar intentionally isn't a tab anymore — it's reachable from My's
// "기록 모아보기" — but the route/page itself is untouched.
const items = [
  { href: "/", label: "today", Icon: HomeIcon },
  { href: "/body", label: "body", Icon: CameraIcon },
  { href: "/move", label: "move", Icon: MoveIcon },
  { href: "/journal", label: "journal", Icon: NoteIcon },
  { href: "/my", label: "my", Icon: UserIcon },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-4 left-1/2 z-10 flex w-[calc(100%-32px)] max-w-[calc(var(--container-sm)-32px)] -translate-x-1/2 items-center justify-between rounded-full border px-2.5 py-2"
      style={{
        background: "var(--glass-background-strong)",
        borderColor: "var(--glass-border)",
        boxShadow: "var(--shadow-floating)",
        backdropFilter: "blur(var(--glass-blur)) saturate(var(--glass-saturation))",
        WebkitBackdropFilter:
          "blur(var(--glass-blur)) saturate(var(--glass-saturation))",
      }}
    >
      {items.map(({ href, label, Icon }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className="flex flex-1 flex-col items-center gap-[3px] py-1"
            style={{ color: active ? "var(--color-pink-500)" : "var(--color-text-muted)" }}
          >
            <Icon className="h-5 w-5" />
            <span className="font-en text-[9px] font-semibold tracking-[0.03em] lowercase">
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
