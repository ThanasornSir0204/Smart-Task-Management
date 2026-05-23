export type ThemeAccent =
  | "sky"
  | "violet"
  | "emerald"
  | "rose"
  | "amber";

export type Locale = "th" | "en";

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string;
  avatarUrl: string;
  themeAccent: ThemeAccent;
  locale: Locale;
  streakCount: number;
  lastStreakDate: string | null;
  leaderboardOptIn: boolean;
  notificationsEnabled: boolean;
  inviteCode: string;
  referredBy: string | null;
  weekDoneCount: number;
  weekKey: string;
  totalDoneCount: number;
  updatedAt: Date;
}

export interface LeaderboardEntry {
  uid: string;
  displayName: string;
  avatarUrl: string;
  weekDoneCount: number;
  streakCount: number;
}
