import { GeneralWorkoutView } from "@/components/workout/GeneralWorkoutView";
import { WorkoutView } from "@/components/workout/WorkoutView";
import { todayIsoDate } from "@/lib/body/date";
import { challengeDayNumber } from "@/lib/challenge/date";
import { getActiveChallengeSafe, getChallengeDayLogsSafe } from "@/lib/challenge/queries";
import { createClient } from "@/lib/supabase/server";
import { getRoutinesSafe } from "@/lib/workout/queries";

export default async function WorkoutPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const date = todayIsoDate();
  const challenge = user ? await getActiveChallengeSafe(user.id) : null;

  // No active 100-day program: plain, freely-editable routines (the
  // default, ongoing self-management experience).
  if (!challenge) {
    const routines = user ? await getRoutinesSafe(user.id, date, null) : [];
    return <GeneralWorkoutView routines={routines} date={date} />;
  }

  const routines = user ? await getRoutinesSafe(user.id, date, challenge.id) : [];
  const logs = user ? await getChallengeDayLogsSafe(user.id, challenge.id, challenge.startDate, date) : [];
  const todayLog = logs.find((log) => log.logDate === date) ?? null;
  const completedCount = logs.filter((log) => log.status === "workout" && log.logDate !== date).length;
  const activeRoutineId = todayLog?.routineId ?? routines[completedCount % Math.max(1, routines.length)]?.id ?? null;
  const day = Math.max(1, Math.min(100, challengeDayNumber(challenge.startDate, date)));

  return (
    <WorkoutView
      routines={routines}
      date={date}
      challenge={challenge}
      challengeDay={day}
      activeRoutineId={activeRoutineId}
      todayLog={todayLog}
    />
  );
}
