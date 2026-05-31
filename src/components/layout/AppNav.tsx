"use client";

import { useLocale } from "@/context/LocaleContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartSimple,
  faClock,
  faTrash,
  faUser,
} from "@fortawesome/free-solid-svg-icons";

const links = [
  { href: "/", icon: faChartSimple, key: "dashboard" as const, shortcut: "⌘1" },
  { href: "/focus", icon: faClock, key: "focus" as const, shortcut: "⌘2" },
  { href: "/trash", icon: faTrash, key: "trash" as const, shortcut: "⌘3" },
  { href: "/profile", icon: faUser, key: "profile" as const, shortcut: "⌘4" },
];

export function AppNav() {
  const pathname = usePathname();
  const { locale, setLocale, t } = useLocale();

  return (
    <nav className="flex flex-1 flex-col gap-0.5 px-3">
      {links.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`linear-sidebar-link ${active ? "linear-sidebar-link-active" : ""}`}
          >
            <FontAwesomeIcon icon={link.icon} className="w-3.5 shrink-0" />
            <span className="flex-1">{t.nav[link.key]}</span>
            <span className="linear-kbd">{link.shortcut}</span>
          </Link>
        );
      })}

      <div className="mt-4 border-t border-[var(--linear-border)] pt-3">
        <button
          type="button"
          onClick={() => setLocale(locale === "th" ? "en" : "th")}
          className="linear-sidebar-link w-full"
        >
          <span className="w-3.5 text-center text-[11px]">
            {locale === "th" ? "EN" : "TH"}
          </span>
          <span>{t.common.language}</span>
        </button>
      </div>
    </nav>
  );
}
