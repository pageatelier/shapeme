// A tall block-shaped skeleton here would collapse the page down to its own
// height and then snap back out once real content streams in — on a
// fixed-position bottom-nav layout that reads as a blank box flashing
// between pages. A small centered spinner with generous min-height avoids
// that jump instead of trying to preview each page's very different shape.
export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div
        className="h-8 w-8 animate-spin rounded-full border-[3px]"
        style={{ borderColor: "var(--color-pink-200)", borderTopColor: "var(--color-pink-500)" }}
      />
    </div>
  );
}
