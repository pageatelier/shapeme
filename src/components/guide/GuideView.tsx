import { AiGuideSection } from "./AiGuideSection";

// GoalSection (static demo, no real function) was removed — it fully
// overlapped with AiGuideSection's real 운동 목표 field. BodyMeditationSection
// is hidden for now (component file kept) rather than deleted, since it may
// come back later.
export function GuideView() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-[-0.03em] text-text-primary">Guide</h1>

      <AiGuideSection />
    </div>
  );
}
