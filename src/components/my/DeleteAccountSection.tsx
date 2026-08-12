"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const CONFIRM_WORD = "DELETE";

/**
 * "Reset your Silua data" — wipes data/storage but deliberately keeps the
 * login account usable (contrast with PermanentDeleteAccountSection, which
 * removes the account too). Collapsed state renders as a plain settings
 * row (just red label text, no tinted box) so it sits quietly inside the
 * normal Account card; the red/error-tinted confirmation panel only
 * appears once actually expanded — SILUA's Settings shouldn't greet you
 * with a big warning box on first load.
 */
export function DeleteAccountSection() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setDeleting(true);
    setError(null);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Please log in first.");

      const [bodyRes, mealRes] = await Promise.all([
        supabase.from("body_entries").select("front_image, side_image, back_image").eq("user_id", user.id),
        supabase.from("meal_logs").select("image_path").eq("user_id", user.id),
      ]);

      const bodyPaths = (bodyRes.data ?? [])
        .flatMap((r) => [r.front_image, r.side_image, r.back_image])
        .filter((p): p is string => Boolean(p));
      const mealPaths = (mealRes.data ?? [])
        .map((r) => r.image_path as string | null)
        .filter((p): p is string => Boolean(p));

      if (bodyPaths.length > 0) await supabase.storage.from("body-photos").remove(bodyPaths);
      if (mealPaths.length > 0) await supabase.storage.from("meal-photos").remove(mealPaths);

      const { data: avatarFiles } = await supabase.storage.from("avatars").list(user.id);
      if (avatarFiles && avatarFiles.length > 0) {
        await supabase.storage.from("avatars").remove(avatarFiles.map((f) => `${user.id}/${f.name}`));
      }

      await Promise.all([
        supabase.from("workout_routines").delete().eq("user_id", user.id),
        supabase.from("body_entries").delete().eq("user_id", user.id),
        supabase.from("water_logs").delete().eq("user_id", user.id),
        supabase.from("meal_logs").delete().eq("user_id", user.id),
        supabase.from("daily_notes").delete().eq("user_id", user.id),
      ]);

      await supabase.auth.updateUser({
        data: {
          display_name: null,
          avatar_url: null,
          bio: null,
          monthly_goal: null,
          height_cm: null,
          weight_kg: null,
          goal_weight_kg: null,
          water_goal_ml: null,
          weekly_workout_goal: null,
          focus_area: null,
          goal_period: null,
          cup_ml: null,
          week_start_day: null,
          notification_time: null,
          notifications_enabled: null,
          self_love_message_enabled: null,
          dark_mode_enabled: null,
        },
      });

      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setDeleting(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-between px-4 py-3.5 text-left"
      >
        <span className="text-[13px] font-medium" style={{ color: "var(--color-error)" }}>
          Reset your Silua data
        </span>
      </button>
    );
  }

  return (
    <div
      className="flex flex-col gap-3 rounded-[var(--radius-lg)] p-4"
      style={{ background: "var(--color-error-soft)", border: "1px solid rgba(203, 116, 128, 0.25)" }}
    >
      <p className="text-[13px] font-bold text-text-primary">Start fresh?</p>
      <p className="text-[12px] leading-relaxed text-text-secondary">
        This permanently deletes your body photos, workouts, meals, water logs, notes, and profile data. Your
        account will stay active, so you can start fresh anytime.
      </p>
      <input
        value={confirmText}
        onChange={(e) => setConfirmText(e.target.value)}
        placeholder={`Type "${CONFIRM_WORD}" to confirm`}
        className="min-h-[44px] rounded-[var(--radius-md)] px-4 text-[15px] text-text-primary outline-none"
        style={{ background: "var(--surface-solid)", border: "var(--border-soft)" }}
      />
      {error && <p className="text-[12px] text-error">{error}</p>}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleDelete}
          disabled={confirmText !== CONFIRM_WORD || deleting}
          className="min-h-[40px] flex-1 rounded-full text-[13px] font-bold text-text-inverse disabled:opacity-40"
          style={{ background: "var(--color-error)" }}
        >
          {deleting ? "Deleting..." : "Delete my data"}
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setConfirmText("");
            setError(null);
          }}
          disabled={deleting}
          className="min-h-[40px] rounded-full px-4 text-[13px] font-semibold text-text-secondary"
          style={{ background: "var(--surface-card)", border: "var(--border-soft)" }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
