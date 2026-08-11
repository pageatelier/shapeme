"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

function downloadBlob(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function DataExportButtons() {
  const [busy, setBusy] = useState<"backup" | "export" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleBackup() {
    setBusy("backup");
    setError(null);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("로그인이 필요해요.");

      const [body, routines, exercises, setLogs, water, meals, notes] = await Promise.all([
        supabase.from("body_entries").select("*").eq("user_id", user.id),
        supabase.from("workout_routines").select("*").eq("user_id", user.id),
        supabase.from("workout_exercises").select("*").eq("user_id", user.id),
        supabase.from("workout_set_logs").select("*").eq("user_id", user.id),
        supabase.from("water_logs").select("*").eq("user_id", user.id),
        supabase.from("meal_logs").select("*").eq("user_id", user.id),
        supabase.from("daily_notes").select("*").eq("user_id", user.id),
      ]);

      const backup = {
        exportedAt: new Date().toISOString(),
        profile: user.user_metadata,
        bodyEntries: body.data ?? [],
        workoutRoutines: routines.data ?? [],
        workoutExercises: exercises.data ?? [],
        workoutSetLogs: setLogs.data ?? [],
        waterLogs: water.data ?? [],
        mealLogs: meals.data ?? [],
        dailyNotes: notes.data ?? [],
      };
      downloadBlob(
        `silua-backup-${new Date().toISOString().slice(0, 10)}.json`,
        JSON.stringify(backup, null, 2),
        "application/json",
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "백업에 실패했어요.");
    } finally {
      setBusy(null);
    }
  }

  async function handleExport() {
    setBusy("export");
    setError(null);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("로그인이 필요해요.");

      const [bodyRes, setLogsRes, waterRes, mealRes] = await Promise.all([
        supabase
          .from("body_entries")
          .select("date, front_image, side_image, back_image")
          .eq("user_id", user.id),
        supabase.from("workout_set_logs").select("log_date, sets").eq("user_id", user.id),
        supabase.from("water_logs").select("logged_at, amount_ml").eq("user_id", user.id),
        supabase.from("meal_logs").select("meal_date").eq("user_id", user.id),
      ]);

      type Bucket = { workoutSets: number; waterMl: number; meals: number; body: boolean };
      const byDate = new Map<string, Bucket>();
      function bucket(date: string): Bucket {
        const existing = byDate.get(date);
        if (existing) return existing;
        const fresh: Bucket = { workoutSets: 0, waterMl: 0, meals: 0, body: false };
        byDate.set(date, fresh);
        return fresh;
      }

      for (const row of (setLogsRes.data ?? []) as { log_date: string; sets: boolean[] }[]) {
        bucket(row.log_date).workoutSets += row.sets.filter(Boolean).length;
      }
      for (const row of (waterRes.data ?? []) as { logged_at: string; amount_ml: number }[]) {
        bucket(row.logged_at.slice(0, 10)).waterMl += row.amount_ml;
      }
      for (const row of (mealRes.data ?? []) as { meal_date: string }[]) {
        bucket(row.meal_date).meals += 1;
      }
      for (const row of (bodyRes.data ?? []) as {
        date: string;
        front_image: string | null;
        side_image: string | null;
        back_image: string | null;
      }[]) {
        bucket(row.date).body = Boolean(row.front_image || row.side_image || row.back_image);
      }

      const dates = Array.from(byDate.keys()).sort();
      const header = "date,workout_sets_done,water_ml,meal_logs,body_photo\n";
      const rows = dates.map((d) => {
        const b = byDate.get(d);
        if (!b) return `${d},0,0,0,no`;
        return `${d},${b.workoutSets},${b.waterMl},${b.meals},${b.body ? "yes" : "no"}`;
      });
      downloadBlob(
        `silua-records-${new Date().toISOString().slice(0, 10)}.csv`,
        header + rows.join("\n"),
        "text/csv",
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "내보내기에 실패했어요.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleBackup}
        disabled={busy !== null}
        className="flex w-full items-center justify-between px-4 py-3.5 text-left disabled:opacity-60"
      >
        <span className="text-[13px] font-medium text-text-primary">데이터 백업</span>
        <span className="text-xs text-text-muted">{busy === "backup" ? "생성 중..." : "JSON 다운로드"}</span>
      </button>
      <button
        type="button"
        onClick={handleExport}
        disabled={busy !== null}
        className="flex w-full items-center justify-between px-4 py-3.5 text-left disabled:opacity-60"
      >
        <span className="text-[13px] font-medium text-text-primary">기록 내보내기</span>
        <span className="text-xs text-text-muted">{busy === "export" ? "생성 중..." : "CSV 다운로드"}</span>
      </button>
      {error && <p className="px-4 pb-3 text-[12px] text-error">{error}</p>}
    </>
  );
}
