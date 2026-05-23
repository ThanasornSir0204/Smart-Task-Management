"use client";

import { useLocale } from "@/context/LocaleContext";
import type { LeaderboardEntry } from "@/types/user";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFire, faTrophy } from "@fortawesome/free-solid-svg-icons";

export function LeaderboardPanel({ entries }: { entries: LeaderboardEntry[] }) {
  const { t } = useLocale();

  if (entries.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 p-4 text-center text-sm text-slate-500 dark:border-slate-700">
        เปิด &quot;แสดงในอันดับ&quot; ในโปรไฟล์เพื่อเข้าร่วม
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
        <FontAwesomeIcon icon={faTrophy} className="text-amber-500" />
        {t.dashboard.leaderboard}
      </h3>
      <ul className="space-y-2">
        {entries.map((entry, index) => (
          <li
            key={entry.uid}
            className="flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-800/50"
          >
            <span className="w-6 text-center font-bold text-slate-400">
              {index + 1}
            </span>
            {entry.avatarUrl ? (
              <img
                src={entry.avatarUrl}
                alt=""
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-200 text-sm font-bold dark:bg-sky-900">
                {entry.displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{entry.displayName}</p>
              <p className="text-xs text-slate-500">
                {entry.weekDoneCount} DONE ·{" "}
                <FontAwesomeIcon icon={faFire} className="text-orange-500" />{" "}
                {entry.streakCount}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
