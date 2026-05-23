import { getFirebaseDb } from "@/config/firebase";
import { formatDateYMD } from "@/lib/taskHelpers";
import type { LeaderboardEntry, Locale, ThemeAccent, UserProfile } from "@/types/user";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type Timestamp,
} from "firebase/firestore";

function weekKey(date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return formatDateYMD(d);
}

function randomInviteCode(): string {
  return Math.random().toString(36).slice(2, 10).toUpperCase();
}

function mapUserProfile(
  uid: string,
  data: Record<string, unknown>,
): UserProfile {
  const updated = data.updatedAt as Timestamp | undefined;
  return {
    uid,
    email: (data.email as string) ?? null,
    displayName: String(data.displayName ?? "User"),
    avatarUrl: String(data.avatarUrl ?? ""),
    themeAccent: (data.themeAccent as ThemeAccent) ?? "sky",
    locale: (data.locale as Locale) ?? "th",
    streakCount: Number(data.streakCount ?? 0),
    lastStreakDate: (data.lastStreakDate as string) ?? null,
    leaderboardOptIn: Boolean(data.leaderboardOptIn ?? false),
    notificationsEnabled: Boolean(data.notificationsEnabled ?? false),
    inviteCode: String(data.inviteCode ?? ""),
    referredBy: (data.referredBy as string) ?? null,
    weekDoneCount: Number(data.weekDoneCount ?? 0),
    weekKey: String(data.weekKey ?? weekKey()),
    totalDoneCount: Number(data.totalDoneCount ?? 0),
    updatedAt: updated?.toDate?.() ?? new Date(),
  };
}

export async function ensureUserProfile(
  uid: string,
  email: string | null,
  referredBy?: string | null,
): Promise<UserProfile> {
  const db = getFirebaseDb();
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  const today = formatDateYMD();

  if (!snap.exists()) {
    const profile = {
      email,
      displayName: email?.split("@")[0] ?? "User",
      avatarUrl: "",
      themeAccent: "sky",
      locale: "th",
      streakCount: 1,
      lastStreakDate: today,
      leaderboardOptIn: false,
      notificationsEnabled: false,
      inviteCode: randomInviteCode(),
      referredBy: referredBy ?? null,
      weekDoneCount: 0,
      weekKey: weekKey(),
      totalDoneCount: 0,
      updatedAt: serverTimestamp(),
    };
    await setDoc(ref, profile);
    return mapUserProfile(uid, profile as Record<string, unknown>);
  }

  const existing = mapUserProfile(uid, snap.data() as Record<string, unknown>);
  let streakCount = existing.streakCount;
  let lastStreakDate = existing.lastStreakDate;

  if (lastStreakDate !== today) {
    const yesterday = formatDateYMD(new Date(Date.now() - 86400000));
    if (lastStreakDate === yesterday) {
      streakCount += 1;
    } else {
      streakCount = 1;
    }
    lastStreakDate = today;
    await updateDoc(ref, { streakCount, lastStreakDate, updatedAt: serverTimestamp() });
  }

  if (!existing.inviteCode) {
    await updateDoc(ref, {
      inviteCode: randomInviteCode(),
      updatedAt: serverTimestamp(),
    });
  }

  const refreshed = await getDoc(ref);
  return mapUserProfile(uid, refreshed.data() as Record<string, unknown>);
}

export async function updateUserProfile(
  uid: string,
  patch: Partial<
    Pick<
      UserProfile,
      | "displayName"
      | "avatarUrl"
      | "themeAccent"
      | "locale"
      | "leaderboardOptIn"
      | "notificationsEnabled"
    >
  >,
): Promise<void> {
  const db = getFirebaseDb();
  await updateDoc(doc(db, "users", uid), {
    ...patch,
    updatedAt: serverTimestamp(),
  });
}

export async function recordTaskDone(uid: string): Promise<void> {
  const db = getFirebaseDb();
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;

  const data = snap.data();
  const currentWeek = weekKey();
  const prevWeek = String(data.weekKey ?? "");
  const weekDoneCount =
    prevWeek === currentWeek ? Number(data.weekDoneCount ?? 0) + 1 : 1;

  await updateDoc(ref, {
    weekKey: currentWeek,
    weekDoneCount,
    totalDoneCount: Number(data.totalDoneCount ?? 0) + 1,
    updatedAt: serverTimestamp(),
  });
}

export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  const db = getFirebaseDb();
  const q = query(
    collection(db, "users"),
    where("leaderboardOptIn", "==", true),
    orderBy("weekDoneCount", "desc"),
    limit(10),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      uid: d.id,
      displayName: String(data.displayName ?? "User"),
      avatarUrl: String(data.avatarUrl ?? ""),
      weekDoneCount: Number(data.weekDoneCount ?? 0),
      streakCount: Number(data.streakCount ?? 0),
    };
  });
}

export function applyThemeAccent(accent: ThemeAccent): void {
  document.documentElement.dataset.accent = accent;
}

export { weekKey };
