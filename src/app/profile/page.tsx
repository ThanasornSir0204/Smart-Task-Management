"use client";

import { AppShell, LoadingScreen } from "@/components/layout/AppShell";
import { useLocale } from "@/context/LocaleContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import {
  applyThemeAccent,
  updateUserProfile,
} from "@/lib/userService";
import { requestNotificationPermission } from "@/lib/notifications";
import { swalAlertSuccess } from "@/lib/swal";
import type { ThemeAccent } from "@/types/user";
import { getFirebaseAuth } from "@/config/firebase";
import { onAuthStateChanged, type User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy, faSave } from "@fortawesome/free-solid-svg-icons";

const ACCENTS: ThemeAccent[] = ["sky", "violet", "emerald", "rose", "amber"];

export default function ProfilePage() {
  const router = useRouter();
  const { t, locale, setLocale } = useLocale();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const { profile, setProfile } = useUserProfile(user?.uid, user?.email ?? null);

  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [themeAccent, setThemeAccent] = useState<ThemeAccent>("sky");
  const [leaderboardOptIn, setLeaderboardOptIn] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    const auth = getFirebaseAuth();
    return onAuthStateChanged(auth, (u) => {
      if (!u) router.replace("/login");
      setUser(u);
      setAuthLoading(false);
    });
  }, [router]);

  useEffect(() => {
    if (!profile) return;
    setDisplayName(profile.displayName);
    setAvatarUrl(profile.avatarUrl);
    setThemeAccent(profile.themeAccent);
    setLeaderboardOptIn(profile.leaderboardOptIn);
    setNotificationsEnabled(profile.notificationsEnabled);
  }, [profile]);

  async function handleSave() {
    if (!user || !profile) return;
    let notify = notificationsEnabled;
    if (notify) {
      notify = await requestNotificationPermission();
      setNotificationsEnabled(notify);
    }
    await updateUserProfile(user.uid, {
      displayName: displayName.trim() || profile.displayName,
      avatarUrl: avatarUrl.trim(),
      themeAccent,
      locale,
      leaderboardOptIn,
      notificationsEnabled: notify,
    });
    applyThemeAccent(themeAccent);
    setProfile({
      ...profile,
      displayName: displayName.trim(),
      avatarUrl,
      themeAccent,
      locale,
      leaderboardOptIn,
      notificationsEnabled: notify,
    });
    await swalAlertSuccess("บันทึกโปรไฟล์แล้ว");
  }

  function copyInvite() {
    if (!profile) return;
    const base =
      typeof window !== "undefined" ? window.location.origin : "";
    const link = `${base}/login?invite=${profile.inviteCode}`;
    navigator.clipboard.writeText(link);
    void swalAlertSuccess("คัดลอกลิงก์เชิญแล้ว");
  }

  if (authLoading || !user || !profile) return <LoadingScreen />;

  return (
    <AppShell user={user}>
      <h1 className="mb-6 text-2xl font-bold">{t.profile.title}</h1>
      <div className="max-w-lg space-y-5 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-4">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt=""
              className="h-16 w-16 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--accent)] text-2xl font-bold text-white">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <p className="font-semibold">{displayName}</p>
            <p className="text-sm text-slate-500">{user.email}</p>
            <p className="text-xs text-orange-600">
              <FontAwesomeIcon icon={faCopy} className="mr-1" />
              Streak {profile.streakCount} วัน
            </p>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            {t.profile.displayName}
          </label>
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">
            {t.profile.avatarUrl}
          </label>
          <input
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://..."
            className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">
            {t.profile.accent}
          </label>
          <div className="flex flex-wrap gap-2">
            {ACCENTS.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => {
                  setThemeAccent(a);
                  applyThemeAccent(a);
                }}
                className={`rounded-lg border px-3 py-1 capitalize ${themeAccent === a ? "border-[var(--accent)] ring-2" : ""}`}
                data-accent-preview={a}
              >
                {a}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">
            {t.common.language}
          </label>
          <select
            value={locale}
            onChange={(e) => setLocale(e.target.value as "th" | "en")}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
          >
            <option value="th">ไทย</option>
            <option value="en">English</option>
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={leaderboardOptIn}
            onChange={(e) => setLeaderboardOptIn(e.target.checked)}
          />
          {t.profile.leaderboardOptIn}
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={notificationsEnabled}
            onChange={(e) => setNotificationsEnabled(e.target.checked)}
          />
          {t.profile.notifications}
        </label>
        {profile.referredBy && (
          <p className="text-sm text-slate-500">
            {t.profile.referred}: {profile.referredBy}
          </p>
        )}
        <div className="rounded-lg bg-slate-50 p-3 text-sm dark:bg-slate-800/50">
          <p className="mb-2 font-medium">{t.profile.invite}</p>
          <code className="block break-all text-xs">
            {typeof window !== "undefined"
              ? `${window.location.origin}/login?invite=${profile.inviteCode}`
              : `/login?invite=${profile.inviteCode}`}
          </code>
          <button
            type="button"
            onClick={copyInvite}
            className="mt-2 inline-flex items-center gap-1 text-sky-600"
          >
            <FontAwesomeIcon icon={faCopy} />
            {t.profile.copyInvite}
          </button>
        </div>
        <button
          type="button"
          onClick={handleSave}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--accent)] py-2.5 font-semibold text-white"
        >
          <FontAwesomeIcon icon={faSave} />
          {t.common.save}
        </button>
      </div>
    </AppShell>
  );
}
