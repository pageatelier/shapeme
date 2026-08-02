"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { updateSettings } from "@/lib/settings/mutations";
import type { Settings } from "@/lib/settings/types";
import { ToggleRow } from "./ToggleRow";

export function DisplaySettings({ settings }: { settings: Settings }) {
  const router = useRouter();
  const [pending, setPending] = useState<keyof Settings | null>(null);
  const [darkMode, setDarkMode] = useState(settings.darkModeEnabled);
  const [notifications, setNotifications] = useState(settings.notificationsEnabled);
  const [selfLove, setSelfLove] = useState(settings.selfLoveMessageEnabled);

  async function toggle(
    key: "darkModeEnabled" | "notificationsEnabled" | "selfLoveMessageEnabled",
    current: boolean,
    setLocal: (v: boolean) => void,
  ) {
    const next = !current;
    setLocal(next);
    setPending(key);
    try {
      await updateSettings({ [key]: next });
      router.refresh();
    } catch {
      setLocal(current);
    } finally {
      setPending(null);
    }
  }

  return (
    <>
      <ToggleRow
        label="다크 모드"
        on={darkMode}
        disabled={pending === "darkModeEnabled"}
        onToggle={() => toggle("darkModeEnabled", darkMode, setDarkMode)}
      />
      <ToggleRow
        label="알림 받기"
        on={notifications}
        disabled={pending === "notificationsEnabled"}
        onToggle={() => toggle("notificationsEnabled", notifications, setNotifications)}
      />
      <ToggleRow
        label="Self Love Message 표시"
        on={selfLove}
        disabled={pending === "selfLoveMessageEnabled"}
        onToggle={() => toggle("selfLoveMessageEnabled", selfLove, setSelfLove)}
      />
    </>
  );
}
