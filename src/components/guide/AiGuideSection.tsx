"use client";

import { useState } from "react";

const QUICK_QUESTIONS = ["오늘 운동 추천", "루틴 만들어줘", "몸이 피곤해요", "허리가 아파요"];

const EXAMPLE_ROUTINE = [
  { name: "스쿼트", detail: "3세트 × 12회" },
  { name: "런지", detail: "3세트 × 10회" },
  { name: "플랭크", detail: "3세트 × 30초" },
];

/**
 * No real AI call yet — "전송" always reveals the same static example
 * card. Swapping in a real response later just means replacing what
 * `handleSend` sets, since the input/response rendering is already in place.
 */
export function AiGuideSection({ onAction }: { onAction: () => void }) {
  const [input, setInput] = useState("");
  const [showResponse, setShowResponse] = useState(false);

  function handleSend() {
    if (!input.trim()) return;
    setShowResponse(true);
  }

  return (
    <section className="glass-card p-5">
      <p className="text-[15px] font-bold tracking-[-0.02em] text-text-primary">AI 가이드</p>
      <p className="mt-1 mb-4 text-[13px] text-text-secondary">몸과 운동에 대해 무엇이든 물어보세요.</p>

      <div className="mb-3 flex flex-wrap gap-1.5">
        {QUICK_QUESTIONS.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => setInput(q)}
            className="pill-unselected rounded-full px-3 py-1.5 text-[12px]"
          >
            {q}
          </button>
        ))}
      </div>

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={3}
        placeholder="무엇이든 편하게 물어보세요."
        className="mb-2 min-h-[44px] w-full resize-none rounded-[var(--radius-md)] px-3 py-2.5 text-[13px] leading-[1.6] text-text-secondary outline-none placeholder:text-text-disabled"
        style={{ background: "var(--surface-solid)", border: "var(--border-soft)" }}
      />

      <button
        type="button"
        onClick={handleSend}
        disabled={!input.trim()}
        className="mb-4 min-h-[40px] w-full rounded-full text-[13px] font-bold text-text-inverse disabled:opacity-50"
        style={{ background: "var(--gradient-primary)" }}
      >
        전송
      </button>

      {showResponse && (
        <div className="surface-card flex flex-col gap-3 p-4">
          <p className="text-[13px] leading-relaxed text-text-secondary">
            오늘은 하체 위주로 가볍게 움직여보는 걸 추천드려요. 무리하지 않는 선에서 천천히 시작해보세요 🌷
          </p>
          <div className="rounded-[var(--radius-md)] p-3" style={{ background: "var(--color-peach-100)" }}>
            <p className="mb-2 text-[12px] font-bold text-text-primary">예시 루틴</p>
            <div className="flex flex-col gap-1">
              {EXAMPLE_ROUTINE.map((ex) => (
                <p key={ex.name} className="text-[12px] text-text-secondary">
                  {ex.name} · {ex.detail}
                </p>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onAction}
              className="min-h-[36px] flex-1 rounded-full text-[12px] font-bold text-text-inverse"
              style={{ background: "var(--gradient-primary)" }}
            >
              오늘의 루틴으로 저장
            </button>
            <button
              type="button"
              onClick={onAction}
              className="min-h-[36px] rounded-full px-4 text-[12px] font-semibold text-text-secondary"
              style={{ background: "var(--surface-card)", border: "var(--border-soft)" }}
            >
              운동 변경
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
