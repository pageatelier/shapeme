import { WorkoutView } from "@/components/workout/WorkoutView";
import { todayIsoDate } from "@/lib/body/date";
import { getMovementLogsByDateSafe } from "@/lib/movement/queries";
import { getRoutinesSafe } from "@/lib/workout/queries";
import { createClient } from "@/lib/supabase/server";

export default async function MovePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const date = todayIsoDate();
  const routines = user ? await getRoutinesSafe(user.id, date) : [];
  const movementLogs = user ? await getMovementLogsByDateSafe(user.id, date) : [];

  return <WorkoutView routines={routines} date={date} movementLogs={movementLogs} />;
}
