"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { updateSettings } from "@/lib/settings/mutations";
import type { Settings } from "@/lib/settings/types";
import { ToggleRow } from "./ToggleRow";

export function NotificationSettings({ settings }: { settings: Settings }) {
  const router = useRouter();
  const [enabled, setEnabled] = useState(settings.notificationsEnabled);
  const [pending, setPending] = useState(false);

  async function toggle() {
    const next = !enabled;
    setEnabled(next);
    setPending(true);
    try {
      await updateSettings({ notificationsEnabled: next });
      router.refresh();
    } catch {
      setEnabled(!next);
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <ToggleRow label="Notifications" on={enabled} disabled={pending} onToggle={toggle} />
      <p className="px-4 pb-3 text-[11px] text-text-secondary">Gentle reminders from Silua.</p>
    </div>
  );
}
