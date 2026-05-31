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
    <div className="linear-card-sm h-56">
      <h3 className="linear-label mb-3">{t.dashboard.weeklyChart}</h3>
      <ResponsiveContainer width="100%" height="82%">
        <BarChart data={data}>
          <CartesianGrid stroke="#2A2A2A" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 11, fill: "#8A8A9A" }}
            axisLine={{ stroke: "#2A2A2A" }}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 11, fill: "#8A8A9A" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: "#1A1A1A",
              border: "1px solid #2A2A2A",
              borderRadius: 6,
              fontSize: 13,
              color: "#FFFFFF",
            }}
            cursor={{ fill: "rgba(94, 106, 210, 0.08)" }}
          />
          <Bar dataKey="done" fill="#5E6AD2" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
