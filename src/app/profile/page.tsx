"use client";

import { AppShell, LoadingScreen } from "@/components/layout/AppShell";
import { useLocale } from "@/context/LocaleContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { updateUserProfile } from "@/lib/userService";
import { requestNotificationPermission } from "@/lib/notifications";
import { swalAlertSuccess } from "@/lib/swal";
import { getFirebaseAuth } from "@/config/firebase";
import { onAuthStateChanged, type User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy, faSave } from "@fortawesome/free-solid-svg-icons";

export default function ProfilePage() {
  const router = useRouter();
  const { t, locale, setLocale } = useLocale();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const { profile, setProfile } = useUserProfile(user?.uid, user?.email ?? null);

  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
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
      themeAccent: "violet",
      locale,
      leaderboardOptIn,
      notificationsEnabled: notify,
    });
    setProfile({
      ...profile,
      displayName: displayName.trim(),
      avatarUrl,
      themeAccent: "violet",
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
      <h1 className="linear-heading-lg mb-6">{t.profile.title}</h1>
      <div className="linear-card max-w-lg space-y-5">
        <div className="flex items-center gap-4">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt=""
              className="h-14 w-14 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--linear-active)] text-xl font-medium text-[var(--linear-accent)]">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <p className="font-medium">{displayName}</p>
            <p className="linear-label">{user.email}</p>
            <p className="linear-label mt-0.5 text-[var(--linear-accent)]">
              Streak {profile.streakCount} วัน
            </p>
          </div>
        </div>

        <div>
          <label className="linear-label mb-1 block">{t.profile.displayName}</label>
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="linear-input"
          />
        </div>
        <div>
          <label className="linear-label mb-1 block">{t.profile.avatarUrl}</label>
          <input
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://..."
            className="linear-input"
          />
        </div>
        <div>
          <label className="linear-label mb-1 block">{t.common.language}</label>
          <select
            value={locale}
            onChange={(e) => setLocale(e.target.value as "th" | "en")}
            className="linear-select"
          >
            <option value="th">ไทย</option>
            <option value="en">English</option>
          </select>
        </div>
        <label className="flex items-center gap-2 linear-label">
          <input
            type="checkbox"
            checked={leaderboardOptIn}
            onChange={(e) => setLeaderboardOptIn(e.target.checked)}
            className="linear-checkbox"
          />
          {t.profile.leaderboardOptIn}
        </label>
        <label className="flex items-center gap-2 linear-label">
          <input
            type="checkbox"
            checked={notificationsEnabled}
            onChange={(e) => setNotificationsEnabled(e.target.checked)}
            className="linear-checkbox"
          />
          {t.profile.notifications}
        </label>
        {profile.referredBy && (
          <p className="linear-label">{t.profile.referred}: {profile.referredBy}</p>
        )}
        <div className="rounded-[6px] border border-[var(--linear-border)] bg-[var(--linear-bg)] p-3">
          <p className="linear-label mb-2 font-medium">{t.profile.invite}</p>
          <code className="block break-all linear-text-tertiary text-[12px]">
            {typeof window !== "undefined"
              ? `${window.location.origin}/login?invite=${profile.inviteCode}`
              : `/login?invite=${profile.inviteCode}`}
          </code>
          <button
            type="button"
            onClick={copyInvite}
            className="linear-btn linear-btn-ghost mt-2 text-[var(--linear-accent)]"
          >
            <FontAwesomeIcon icon={faCopy} />
            {t.profile.copyInvite}
          </button>
        </div>
        <button
          type="button"
          onClick={handleSave}
          className="linear-btn linear-btn-primary w-full"
        >
          <FontAwesomeIcon icon={faSave} />
          {t.common.save}
        </button>
      </div>
    </AppShell>
  );
}
