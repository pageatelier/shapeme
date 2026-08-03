import { redirect } from "next/navigation";

// Workout was renamed to Move (/move) in the MVP refactor. Kept as a
// redirect rather than deleting the route so any existing /workout link
// (bookmarks, old shares) doesn't break.
export default function WorkoutPage() {
  redirect("/move");
}
