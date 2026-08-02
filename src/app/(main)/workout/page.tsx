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
  const routines = user ? await getRoutinesSafe(user.id, date, challenge?.id) : [];
  const logs = user && challenge ? await getChallengeDayLogsSafe(user.id, challenge.id, challenge.startDate, date) : [];
  const todayLog = logs.find((log) => log.logDate === date) ?? null;
  const completedCount = logs.filter((log) => log.status === "workout" && log.logDate !== date).length;
  const activeRoutineId = todayLog?.routineId ?? routines[completedCount % Math.max(1, routines.length)]?.id ?? null;
  const day = challenge ? Math.max(1, Math.min(100, challengeDayNumber(challenge.startDate, date))) : null;

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
