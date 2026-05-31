"use client";

import { useLocale } from "@/context/LocaleContext";
import { swalConfirmLogout } from "@/lib/swal";
import { getFirebaseAuth } from "@/config/firebase";
import { AppNav } from "@/components/layout/AppNav";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faListCheck,
  faRightFromBracket,
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
    <div className="flex min-h-screen">
      <aside className="linear-sidebar fixed inset-y-0 left-0 z-30 flex flex-col">
        <div className="flex items-center gap-2 px-4 py-5">
          <FontAwesomeIcon
            icon={faListCheck}
            className="text-[var(--linear-accent)]"
          />
          <span className="linear-subheading text-[15px]">{t.appName}</span>
        </div>

        <AppNav />

        <div className="mt-auto border-t border-[var(--linear-border)] p-3">
          <p className="linear-label truncate px-2 pb-2">{user.email}</p>
          <button
            type="button"
            onClick={handleLogout}
            className="linear-sidebar-link w-full"
          >
            <FontAwesomeIcon icon={faRightFromBracket} className="w-4" />
            {t.common.logout}
          </button>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 pl-[var(--linear-sidebar)]">
        <main className="mx-auto w-full max-w-[var(--linear-content)] px-8 py-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export function LoadingScreen({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center linear-text-secondary">
      {message}
    </div>
  );
}
