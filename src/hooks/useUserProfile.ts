"use client";

import {
  applyThemeAccent,
  ensureUserProfile,
  fetchLeaderboard,
} from "@/lib/userService";
import type { LeaderboardEntry, UserProfile } from "@/types/user";
import { useEffect, useState } from "react";

export function useUserProfile(
  uid: string | undefined,
  email: string | null,
  inviteCode?: string | null,
) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setProfile(null);
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);

    (async () => {
      try {
        const p = await ensureUserProfile(uid, email, inviteCode ?? null);
        if (!active) return;
        setProfile(p);
        applyThemeAccent(p.themeAccent);
        const board = await fetchLeaderboard();
        if (active) setLeaderboard(board);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [uid, email, inviteCode]);

  return { profile, setProfile, leaderboard, loading, refreshLeaderboard: async () => setLeaderboard(await fetchLeaderboard()) };
}
