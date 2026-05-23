"use client";

import { useLocale } from "@/context/LocaleContext";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faChartSimple,
  faFire,
  faGlobe,
  faListCheck,
  faTrophy,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";

const DEMO_TASKS = [
  {
    title: "ส่งรายงานทีม",
    status: "DOING",
    sticker: "🔥",
    deadline: "2026-05-24 17:00",
  },
  {
    title: "อ่านเอกสาร API",
    status: "TODO",
    sticker: "📚",
    deadline: "2026-05-25 10:00",
  },
  {
    title: "ทบทวน Sprint",
    status: "DONE",
    sticker: "✅",
    deadline: "2026-05-23 15:00",
  },
];

const FEATURES = [
  { icon: faFire, key: "streak" },
  { icon: faChartSimple, key: "charts" },
  { icon: faTrophy, key: "board" },
  { icon: faBell, key: "notify" },
  { icon: faUsers, key: "invite" },
  { icon: faGlobe, key: "i18n" },
] as const;

const FEATURE_TEXT: Record<string, { th: string; en: string }> = {
  streak: { th: "สตรีครายวัน", en: "Daily streaks" },
  charts: { th: "กราฟสรุป 7 วัน", en: "7-day charts" },
  board: { th: "อันดับสัปดาห์ (opt-in)", en: "Weekly leaderboard" },
  notify: { th: "แจ้งเตือนก่อน deadline", en: "Deadline alerts" },
  invite: { th: "ลิงก์เชิญเพื่อน", en: "Invite links" },
  i18n: { th: "ภาษาไทย / English", en: "Thai & English" },
};

export default function LandingPage() {
  const { locale, setLocale, t } = useLocale();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-sky-50 dark:from-slate-950 dark:to-slate-900">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-4 py-6">
        <div className="flex items-center gap-2 font-bold text-lg">
          <FontAwesomeIcon icon={faListCheck} className="text-sky-600" />
          {t.appName}
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setLocale(locale === "th" ? "en" : "th")}
            className="text-sm"
          >
            {locale === "th" ? "EN" : "TH"}
          </button>
          <Link
            href="/login"
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-600"
          >
            {t.nav.login}
          </Link>
          <Link
            href="/login"
            className="rounded-lg bg-sky-600 px-4 py-1.5 text-sm font-semibold text-white"
          >
            {t.landing.cta}
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-4 py-16 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          {t.landing.hero}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-slate-600 dark:text-slate-400">
          จัดการงาน · โฟกัส · แชร์อันดับ · เทมเพลต · ถังขยะ · PWA — สร้างด้วย
          Next.js และ Firebase
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/login"
            className="rounded-xl bg-sky-600 px-6 py-3 font-semibold text-white shadow-lg"
          >
            {t.landing.cta}
          </Link>
          <a
            href="#demo"
            className="rounded-xl border border-slate-300 px-6 py-3 font-semibold dark:border-slate-600"
          >
            {t.landing.demo}
          </a>
        </div>
      </section>

      <section id="demo" className="mx-auto max-w-5xl px-4 pb-12">
        <h2 className="mb-4 text-center text-xl font-semibold">{t.landing.demo}</h2>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b bg-slate-100 px-4 py-2 text-xs text-slate-500 dark:bg-slate-800">
            Demo — ไม่เชื่อม Firebase
          </div>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b text-xs uppercase text-slate-500">
                <th className="px-4 py-2">งาน</th>
                <th className="px-4 py-2">สถานะ</th>
                <th className="px-4 py-2">Deadline</th>
              </tr>
            </thead>
            <tbody>
              {DEMO_TASKS.map((task) => (
                <tr key={task.title} className="border-b dark:border-slate-800">
                  <td className="px-4 py-3">
                    {task.sticker} {task.title}
                  </td>
                  <td className="px-4 py-3">{task.status}</td>
                  <td className="px-4 py-3">{task.deadline}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-20">
        <h2 className="mb-6 text-center text-xl font-semibold">
          {t.landing.features}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.key}
              className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
            >
              <FontAwesomeIcon
                icon={f.icon}
                className="mb-2 text-xl text-sky-600"
              />
              <p className="font-medium">
                {FEATURE_TEXT[f.key][locale]}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
