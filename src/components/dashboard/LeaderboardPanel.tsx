"use client";

import { useLocale } from "@/context/LocaleContext";
import type { LeaderboardEntry } from "@/types/user";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFire, faTrophy } from "@fortawesome/free-solid-svg-icons";

export function LeaderboardPanel({ entries }: { entries: LeaderboardEntry[] }) {
  const { t } = useLocale();

  if (entries.length === 0) {
    return (
      <div className="linear-card-sm linear-empty py-8 text-[13px]">
        เปิด &quot;แสดงในอันดับ&quot; ในโปรไฟล์เพื่อเข้าร่วม
      </div>
    );
  }

  return (
    <div className="linear-card-sm">
      <h3 className="linear-label mb-3 flex items-center gap-2">
        <FontAwesomeIcon icon={faTrophy} className="text-[var(--linear-accent)]" />
        {t.dashboard.leaderboard}
      </h3>
      <ul className="space-y-1">
        {entries.map((entry, index) => (
          <li
            key={entry.uid}
            className="flex items-center gap-3 rounded-[4px] px-2 py-2 transition-colors hover:bg-[var(--linear-surface-hover)]"
          >
            <span className="w-5 text-center linear-text-tertiary text-[13px]">
              {index + 1}
            </span>
            {entry.avatarUrl ? (
              <img
                src={entry.avatarUrl}
                alt=""
                className="h-7 w-7 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--linear-active)] text-[13px] font-medium text-[var(--linear-accent)]">
                {entry.displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium">{entry.displayName}</p>
              <p className="linear-text-tertiary text-[12px]">
                {entry.weekDoneCount} DONE ·{" "}
                <FontAwesomeIcon icon={faFire} className="text-[var(--linear-accent)]" />{" "}
                {entry.streakCount}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
