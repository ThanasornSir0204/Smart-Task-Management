"use client";

import { useLocale } from "@/context/LocaleContext";
import { swalConfirmLogout } from "@/lib/swal";
import { getFirebaseAuth } from "@/config/firebase";
import { AppNav } from "@/components/layout/AppNav";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faListCheck,
  faRightFromBracket,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { signOut, type User } from "firebase/auth";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

export function AppShell({
  user,
  children,
}: {
  user: User;
  children: ReactNode;
}) {
  const router = useRouter();
  const { t } = useLocale();

  async function handleLogout() {
    if (!(await swalConfirmLogout())) return;
    await signOut(getFirebaseAuth());
    router.replace("/login");
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <FontAwesomeIcon
              icon={faListCheck}
              className="text-xl text-[var(--accent)]"
            />
            <div>
              <h1 className="text-lg font-bold sm:text-xl">{t.appName}</h1>
              <p className="text-xs text-slate-500">{user.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600"
          >
            <FontAwesomeIcon icon={faRightFromBracket} />
            <span className="hidden sm:inline">{t.common.logout}</span>
          </button>
        </div>
        <AppNav />
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}

export function LoadingScreen() {
  const { t } = useLocale();
  return (
    <div className="flex min-h-screen items-center justify-center gap-2">
      <FontAwesomeIcon icon={faSpinner} spin />
      {t.common.loading}
    </div>
  );
}
