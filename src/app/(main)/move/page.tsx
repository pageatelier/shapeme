import { WorkoutView } from "@/components/workout/WorkoutView";
import { todayIsoDate } from "@/lib/body/date";
import { getMovementLogsByDateSafe } from "@/lib/movement/queries";
import { getDailyMoveDifficultySafe, getRoutinesSafe } from "@/lib/workout/queries";
import { getCurrentUser } from "@/lib/supabase/server";

export default async function MovePage() {
  const user = await getCurrentUser();

  const date = todayIsoDate();
  // Independent reads — fetched together instead of one-after-another so
  // this page doesn't wait twice as long as it needs to.
  const [routines, movementLogs, difficulty] = user
    ? await Promise.all([
        getRoutinesSafe(user.id, date),
        getMovementLogsByDateSafe(user.id, date),
        getDailyMoveDifficultySafe(user.id, date),
      ])
    : [[], [], null];

  return <WorkoutView routines={routines} date={date} movementLogs={movementLogs} difficulty={difficulty} />;
}
