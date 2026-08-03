/**
 * The "shapeme" wordmark — the only place Cormorant Garamond is used in the
 * app (see --font-cormorant in globals.css / layout.tsx). Every other piece
 * of English UI text keeps --font-en (Instrument Sans).
 *
 * Tracking is looser than the old Instrument Sans wordmark's -0.055em —
 * that value was tuned for a geometric sans and made this serif's letterforms
 * collide, so it's backed off to -0.02em here.
 */
export function BrandLogo({ className = "" }: { className?: string }) {
  return (
    <p
      className={`font-cormorant text-2xl font-semibold tracking-[-0.02em] whitespace-nowrap text-text-primary lowercase ${className}`}
    >
      shapeme
    </p>
  );
}
