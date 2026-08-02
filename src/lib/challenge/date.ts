const DAY_MS = 86_400_000;

function utcDay(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return Date.UTC(year, month - 1, day);
}

export function addDays(date: string, amount: number) {
  const next = new Date(utcDay(date) + amount * DAY_MS);
  return next.toISOString().slice(0, 10);
}

export function challengeDayNumber(startDate: string, date: string) {
  return Math.floor((utcDay(date) - utcDay(startDate)) / DAY_MS) + 1;
}

export function challengeDayLabel(startDate: string, date: string) {
  const day = challengeDayNumber(startDate, date);
  if (day < 1) return "시작 전";
  if (day > 100) return "완료 후";
  return `Day ${day}`;
}

export function challengePhase(day: number) {
  if (day <= 14) return { title: "적응", description: "동작과 적정 중량을 찾는 단계" };
  if (day <= 45) return { title: "루틴 형성", description: "같은 루틴을 안정적으로 반복하는 단계" };
  if (day <= 75) return { title: "성장", description: "기록을 바탕으로 점진적으로 발전하는 단계" };
  return { title: "완성", description: "100일의 변화를 끝까지 쌓는 단계" };
}

export function isMilestoneDay(day: number) {
  return [1, 15, 30, 50, 75, 100].includes(day);
}
