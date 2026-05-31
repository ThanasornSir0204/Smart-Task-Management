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
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-[860px] items-center justify-between px-8 py-6">
        <div className="flex items-center gap-2">
          <FontAwesomeIcon icon={faListCheck} className="text-[var(--linear-accent)]" />
          <span className="linear-subheading text-[15px]">{t.appName}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setLocale(locale === "th" ? "en" : "th")}
            className="linear-btn linear-btn-ghost"
          >
            {locale === "th" ? "EN" : "TH"}
          </button>
          <Link href="/login" className="linear-btn linear-btn-secondary">
            {t.nav.login}
          </Link>
          <Link href="/login" className="linear-btn linear-btn-primary">
            {t.landing.cta}
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-[860px] px-8 py-16 text-center">
        <h1 className="linear-heading-lg text-[32px] sm:text-[40px]">
          {t.landing.hero}
        </h1>
        <p className="mx-auto mt-4 max-w-xl linear-text-secondary leading-[1.7]">
          จัดการงาน · โฟกัส · แชร์อันดับ · เทมเพลต · ถังขยะ · PWA — สร้างด้วย
          Next.js และ Firebase
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/login" className="linear-btn linear-btn-primary px-6">
            {t.landing.cta}
          </Link>
          <a href="#demo" className="linear-btn linear-btn-secondary px-6">
            {t.landing.demo}
          </a>
        </div>
      </section>

      <section id="demo" className="mx-auto max-w-[860px] px-8 pb-12">
        <h2 className="linear-heading mb-4 text-center">{t.landing.demo}</h2>
        <div className="linear-table-wrap">
          <div className="border-b border-[var(--linear-border)] px-4 py-2 linear-text-tertiary text-[12px]">
            Demo — ไม่เชื่อม Firebase
          </div>
          <table className="linear-table">
            <thead>
              <tr>
                <th>งาน</th>
                <th>สถานะ</th>
                <th>Deadline</th>
              </tr>
            </thead>
            <tbody>
              {DEMO_TASKS.map((task) => (
                <tr key={task.title}>
                  <td>
                    {task.sticker} {task.title}
                  </td>
                  <td>
                    <span className="linear-badge">{task.status}</span>
                  </td>
                  <td className="linear-text-secondary">{task.deadline}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mx-auto max-w-[860px] px-8 pb-20">
        <h2 className="linear-heading mb-6 text-center">{t.landing.features}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.key} className="linear-card-sm">
              <FontAwesomeIcon
                icon={f.icon}
                className="mb-2 text-[var(--linear-accent)]"
              />
              <p className="text-[13px] font-medium">{FEATURE_TEXT[f.key][locale]}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
