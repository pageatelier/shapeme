/**
 * The "SILUA" wordmark — the only place Cormorant Garamond is used in the
 * app (see --font-cormorant in globals.css / layout.tsx). Every other piece
 * of English UI text keeps --font-en (Instrument Sans).
 *
 * Uppercase tracks looser (+0.02em) than the lowercase version did — capital
 * serif letterforms don't have descenders/ascenders to collide, so opening
 * the tracking up (rather than the lowercase version's tightened -0.02em)
 * reads as editorial rather than cramped.
 */
import { BrandMarkIcon } from "@/components/icons";

export function BrandLogo({
  className = "",
  light = false,
  hideIcon = false,
}: {
  className?: string;
  light?: boolean;
  /** Text-only wordmark, no BrandMarkIcon — for spots (like the login
   * screen's photo-first hero) where the mark competes with a bigger
   * display line right below it and reads cleaner on its own. */
  hideIcon?: boolean;
}) {
  return (
    <span className={`inline-flex items-center gap-1.5 ${light ? "text-white" : "text-text-primary"} ${className}`}>
      {!hideIcon && <BrandMarkIcon className="h-[0.8em] w-[0.8em]" />}
      <p className="font-cormorant text-2xl font-semibold tracking-[0.02em] whitespace-nowrap uppercase">
        silua
      </p>
    </span>
  );
}
