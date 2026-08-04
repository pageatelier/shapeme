"use client";

import { useState } from "react";
import { Toast } from "@/components/Toast";
import { AiGuideSection } from "./AiGuideSection";
import { BodyMeditationSection } from "./BodyMeditationSection";
import { GoalSection } from "./GoalSection";

export function GuideView() {
  const [toast, setToast] = useState<string | null>(null);

  function showComingSoon() {
    setToast("곧 만나볼 수 있어요 🌷");
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-[-0.03em] text-text-primary">Guide</h1>

      <GoalSection onCreatePlan={showComingSoon} />
      <AiGuideSection onAction={showComingSoon} />
      <BodyMeditationSection onSelect={showComingSoon} />

      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </div>
  );
}
