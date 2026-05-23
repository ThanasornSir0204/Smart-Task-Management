"use client";

import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartSimple,
  faClock,
  faMoon,
  faSun,
  faTrash,
  faUser,
} from "@fortawesome/free-solid-svg-icons";

const links = [
  { href: "/", icon: faChartSimple, key: "dashboard" as const },
  { href: "/focus", icon: faClock, key: "focus" as const },
  { href: "/trash", icon: faTrash, key: "trash" as const },
  { href: "/profile", icon: faUser, key: "profile" as const },
];

export function AppNav() {
  const pathname = usePathname();
  const { theme, toggleTheme, mounted } = useTheme();
  const { locale, setLocale, t } = useLocale();

  return (
    <nav className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-white/90 px-4 py-2 dark:border-slate-800 dark:bg-slate-900/90">
      {links.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              active
                ? "bg-[var(--accent)] text-white"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            }`}
          >
            <FontAwesomeIcon icon={link.icon} />
            {t.nav[link.key]}
          </Link>
        );
      })}
      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          onClick={() => setLocale(locale === "th" ? "en" : "th")}
          className="rounded-lg border border-slate-300 px-2 py-1 text-xs dark:border-slate-600"
        >
          {locale === "th" ? "EN" : "TH"}
        </button>
        <button
          type="button"
          onClick={toggleTheme}
          className="rounded-lg border border-slate-300 p-2 dark:border-slate-600"
          aria-label="theme"
        >
          <FontAwesomeIcon icon={mounted && theme === "dark" ? faSun : faMoon} />
        </button>
      </div>
    </nav>
  );
}
