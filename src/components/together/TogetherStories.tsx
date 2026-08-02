"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PlusIcon } from "@/components/icons";
import { Toast } from "@/components/Toast";
import type { FriendCard } from "@/lib/friends/types";
import { StoryAvatar } from "./StoryAvatar";

// Only mounted once a friend avatar is tapped, so its JS (+ CheerPanel)
// ships in its own chunk instead of Home's initial bundle.
const StoryViewer = dynamic(() => import("./StoryViewer").then((m) => m.StoryViewer), {
  ssr: false,
});

export function TogetherStories({
  me,
  friends,
}: {
  me: { displayName: string; avatarUrl: string | null; todayProgress: number; memo: string | null };
  friends: FriendCard[];
}) {
  const router = useRouter();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  return (
    <section>
      <div className="scrollbar-hide flex gap-4 overflow-x-auto pb-1">
        <StoryAvatar
          displayName={me.displayName}
          avatarUrl={me.avatarUrl}
          progress={me.todayProgress}
          memo={me.memo}
          isMe
          onClick={() => router.push("/my")}
          ariaLabel="내 프로필 — 친구 추가하러 가기"
        />

        {friends.map((friend, i) => (
          <StoryAvatar
            key={friend.friendId}
            displayName={friend.displayName}
            avatarUrl={friend.avatarUrl}
            progress={friend.hasActivityToday ? friend.todayProgress : null}
            memo={friend.memo}
            onClick={() => setOpenIndex(i)}
            ariaLabel={`${friend.displayName}의 오늘 기록 보기`}
          />
        ))}

        {friends.length === 0 && (
          <button
            type="button"
            onClick={() => router.push("/my")}
            aria-label="친구 초대하러 가기"
            className="flex w-16 shrink-0 flex-col items-center gap-1.5"
          >
            <div
              className="flex h-[60px] w-[60px] items-center justify-center rounded-full"
              style={{ border: "1px dashed rgba(86, 62, 58, 0.2)", background: "var(--surface-card)" }}
            >
              <PlusIcon className="h-4 w-4 text-text-muted" />
            </div>
            <span className="text-[11px] font-medium text-text-muted">초대하기</span>
          </button>
        )}
      </div>

      {friends.length === 0 && (
        <p className="mt-2 text-[12px] leading-relaxed text-text-secondary">
          친구와 오늘의 달성률만 나누고 서로 응원해보세요.
        </p>
      )}

      {openIndex !== null && friends[openIndex] && (
        <StoryViewer
          friends={friends}
          index={openIndex}
          onIndexChange={setOpenIndex}
          onClose={() => setOpenIndex(null)}
          onCheerSent={(name) => setToast(`${name}님에게 응원을 보냈어요 🌷`)}
        />
      )}

      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </section>
  );
}
