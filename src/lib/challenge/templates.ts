import type {
  ChallengeGoal,
  ExperienceLevel,
  WorkoutLocation,
} from "./types";

export type ProgramExerciseTemplate = {
  name: string;
  targetSets: number;
  targetReps: number;
  weightKg: number | null;
  restSeconds: number;
  memo: string | null;
};

export type ProgramRoutineTemplate = {
  name: string;
  shortName: string;
  exercises: ProgramExerciseTemplate[];
};

const SCALE: Record<ExperienceLevel, number> = {
  beginner: 0.7,
  intermediate: 1,
  advanced: 1.25,
};

function weight(base: number, level: ExperienceLevel) {
  return Math.max(2.5, Math.round((base * SCALE[level]) / 2.5) * 2.5);
}

function gymLowerA(level: ExperienceLevel): ProgramRoutineTemplate {
  return {
    name: "Lower Body A · 힙 집중",
    shortName: "Session A",
    exercises: [
      { name: "힙쓰러스트", targetSets: 4, targetReps: 10, weightKg: weight(30, level), restSeconds: 90, memo: "정점에서 엉덩이를 1초 조여주세요." },
      { name: "덤벨 RDL", targetSets: 3, targetReps: 12, weightKg: weight(8, level), restSeconds: 75, memo: "양손 각각의 중량이에요." },
      { name: "레그프레스", targetSets: 3, targetReps: 12, weightKg: weight(40, level), restSeconds: 90, memo: "무릎과 발끝 방향을 맞춰주세요." },
      { name: "힙 어브덕션", targetSets: 3, targetReps: 15, weightKg: weight(25, level), restSeconds: 60, memo: null },
      { name: "데드버그", targetSets: 3, targetReps: 10, weightKg: null, restSeconds: 45, memo: "허리가 뜨지 않게 천천히 진행해요." },
    ],
  };
}

function gymUpper(level: ExperienceLevel): ProgramRoutineTemplate {
  return {
    name: "Upper Body · 등 라인",
    shortName: "Session B",
    exercises: [
      { name: "랫풀다운", targetSets: 4, targetReps: 10, weightKg: weight(20, level), restSeconds: 75, memo: "팔보다 등을 먼저 당긴다고 생각해요." },
      { name: "시티드 로우", targetSets: 3, targetReps: 12, weightKg: weight(20, level), restSeconds: 75, memo: null },
      { name: "덤벨 숄더프레스", targetSets: 3, targetReps: 10, weightKg: weight(5, level), restSeconds: 75, memo: "양손 각각의 중량이에요." },
      { name: "케이블 페이스풀", targetSets: 3, targetReps: 15, weightKg: weight(7.5, level), restSeconds: 60, memo: null },
      { name: "플랭크", targetSets: 3, targetReps: 30, weightKg: null, restSeconds: 45, memo: "반복 수 대신 초 단위로 진행해요." },
    ],
  };
}

function gymLowerB(level: ExperienceLevel): ProgramRoutineTemplate {
  return {
    name: "Lower Body B · 하체 라인",
    shortName: "Session C",
    exercises: [
      { name: "고블릿 스쿼트", targetSets: 4, targetReps: 10, weightKg: weight(10, level), restSeconds: 90, memo: null },
      { name: "불가리안 스플릿 스쿼트", targetSets: 3, targetReps: 10, weightKg: weight(5, level), restSeconds: 75, memo: "양손 각각의 중량이에요." },
      { name: "레그컬", targetSets: 3, targetReps: 12, weightKg: weight(15, level), restSeconds: 60, memo: null },
      { name: "케이블 킥백", targetSets: 3, targetReps: 15, weightKg: weight(5, level), restSeconds: 60, memo: null },
      { name: "사이드 플랭크", targetSets: 3, targetReps: 25, weightKg: null, restSeconds: 45, memo: "반복 수 대신 초 단위로 진행해요." },
    ],
  };
}

function gymFullBody(level: ExperienceLevel): ProgramRoutineTemplate {
  return {
    name: "Full Body · 전신 밸런스",
    shortName: "Session D",
    exercises: [
      { name: "스미스 스쿼트", targetSets: 3, targetReps: 10, weightKg: weight(20, level), restSeconds: 90, memo: null },
      { name: "루마니안 데드리프트", targetSets: 3, targetReps: 10, weightKg: weight(20, level), restSeconds: 90, memo: null },
      { name: "체스트프레스", targetSets: 3, targetReps: 12, weightKg: weight(15, level), restSeconds: 75, memo: null },
      { name: "랫풀다운", targetSets: 3, targetReps: 12, weightKg: weight(20, level), restSeconds: 75, memo: null },
      { name: "케이블 우드찹", targetSets: 3, targetReps: 12, weightKg: weight(7.5, level), restSeconds: 60, memo: null },
    ],
  };
}

function homeLowerA(): ProgramRoutineTemplate {
  return {
    name: "Home Lower A · 힙 집중",
    shortName: "Session A",
    exercises: [
      { name: "글루트 브리지", targetSets: 4, targetReps: 15, weightKg: null, restSeconds: 60, memo: "정점에서 엉덩이를 1초 조여주세요." },
      { name: "굿모닝", targetSets: 3, targetReps: 15, weightKg: null, restSeconds: 60, memo: "등을 둥글게 말지 말고 엉덩이를 뒤로 보내요." },
      { name: "리버스 런지", targetSets: 3, targetReps: 10, weightKg: null, restSeconds: 60, memo: "양쪽 각각 10회예요." },
      { name: "프로그 펌프", targetSets: 3, targetReps: 20, weightKg: null, restSeconds: 45, memo: null },
      { name: "데드버그", targetSets: 3, targetReps: 10, weightKg: null, restSeconds: 45, memo: "허리가 뜨지 않게 천천히 진행해요." },
    ],
  };
}

function homeUpper(): ProgramRoutineTemplate {
  return {
    name: "Home Upper · 상체 라인",
    shortName: "Session B",
    exercises: [
      { name: "인클라인 푸시업", targetSets: 3, targetReps: 10, weightKg: null, restSeconds: 60, memo: "튼튼한 책상이나 벽을 이용해요." },
      { name: "슈퍼맨 풀다운", targetSets: 3, targetReps: 12, weightKg: null, restSeconds: 45, memo: "팔꿈치를 옆구리로 당기며 등을 조여요." },
      { name: "파이크 숄더 탭", targetSets: 3, targetReps: 10, weightKg: null, restSeconds: 60, memo: "양쪽 합계 10회예요." },
      { name: "프론 Y 레이즈", targetSets: 3, targetReps: 12, weightKg: null, restSeconds: 45, memo: null },
      { name: "플랭크", targetSets: 3, targetReps: 30, weightKg: null, restSeconds: 45, memo: "반복 수 대신 초 단위로 진행해요." },
    ],
  };
}

function homeLowerB(): ProgramRoutineTemplate {
  return {
    name: "Home Lower B · 하체 라인",
    shortName: "Session C",
    exercises: [
      { name: "템포 스쿼트", targetSets: 4, targetReps: 12, weightKg: null, restSeconds: 60, memo: "내려갈 때 3초, 올라올 때 1초로 진행해요." },
      { name: "불가리안 스플릿 스쿼트", targetSets: 3, targetReps: 10, weightKg: null, restSeconds: 60, memo: "양쪽 각각 10회예요." },
      { name: "싱글 레그 글루트 브리지", targetSets: 3, targetReps: 10, weightKg: null, restSeconds: 60, memo: "양쪽 각각 10회예요." },
      { name: "동키 킥", targetSets: 3, targetReps: 15, weightKg: null, restSeconds: 45, memo: "허리가 꺾이지 않게 복부에 힘을 줘요." },
      { name: "사이드 플랭크", targetSets: 3, targetReps: 25, weightKg: null, restSeconds: 45, memo: "반복 수 대신 초 단위로 진행해요." },
    ],
  };
}

function homeFullBody(): ProgramRoutineTemplate {
  return {
    name: "Home Full Body · 전신 밸런스",
    shortName: "Session D",
    exercises: [
      { name: "스쿼트", targetSets: 3, targetReps: 15, weightKg: null, restSeconds: 60, memo: null },
      { name: "리버스 런지", targetSets: 3, targetReps: 10, weightKg: null, restSeconds: 60, memo: "양쪽 각각 10회예요." },
      { name: "무릎 푸시업", targetSets: 3, targetReps: 10, weightKg: null, restSeconds: 60, memo: null },
      { name: "슈퍼맨 풀다운", targetSets: 3, targetReps: 12, weightKg: null, restSeconds: 45, memo: null },
      { name: "마운틴 클라이머", targetSets: 3, targetReps: 20, weightKg: null, restSeconds: 45, memo: "양쪽 합계 20회예요." },
    ],
  };
}

export function buildProgramTemplate({
  goal,
  experienceLevel,
  workoutDaysPerWeek,
  workoutLocation,
}: {
  goal: ChallengeGoal;
  experienceLevel: ExperienceLevel;
  workoutDaysPerWeek: number;
  workoutLocation: WorkoutLocation;
}) {
  const homeOnly = workoutLocation === "home";
  const lowerA = homeOnly ? homeLowerA() : gymLowerA(experienceLevel);
  const upper = homeOnly ? homeUpper() : gymUpper(experienceLevel);
  const lowerB = homeOnly ? homeLowerB() : gymLowerB(experienceLevel);
  const fullBody = homeOnly ? homeFullBody() : gymFullBody(experienceLevel);
  const base = [lowerA, upper, lowerB];

  if (goal === "upper-body") {
    base[0] = upper;
    base[1] = fullBody;
  }
  if (goal === "full-body" || goal === "strength") {
    base[1] = fullBody;
  }

  if (workoutDaysPerWeek >= 4) base.push(fullBody);
  return base.slice(0, Math.max(2, Math.min(4, workoutDaysPerWeek)));
}
