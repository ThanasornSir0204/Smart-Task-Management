"use client";

import { weeklyDoneSeries } from "@/lib/searchSort";
import { useLocale } from "@/context/LocaleContext";
import type { Task } from "@/types/task";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function WeeklyChart({ tasks }: { tasks: Task[] }) {
  const { t } = useLocale();
  const data = weeklyDoneSeries(tasks);

  return (
    <div className="h-56 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <h3 className="mb-2 text-sm font-semibold">{t.dashboard.weeklyChart}</h3>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis dataKey="day" tick={{ fontSize: 11 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
          <Tooltip />
          <Bar dataKey="done" fill="var(--accent)" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
