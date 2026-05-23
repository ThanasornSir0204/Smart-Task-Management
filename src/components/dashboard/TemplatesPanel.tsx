"use client";

import { useLocale } from "@/context/LocaleContext";
import { createTemplate, deleteTemplate } from "@/lib/templates";
import type { TaskTemplate } from "@/types/task";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBolt, faTrash } from "@fortawesome/free-solid-svg-icons";

export function TemplatesPanel({
  templates,
  onApply,
}: {
  templates: TaskTemplate[];
  onApply: (template: TaskTemplate) => void;
}) {
  const { t } = useLocale();

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <h3 className="mb-3 text-sm font-semibold">{t.dashboard.templates}</h3>
      {templates.length === 0 ? (
        <p className="text-sm text-slate-500">บันทึกเทมเพลตจากฟอร์มเพิ่มงาน</p>
      ) : (
        <ul className="space-y-2">
          {templates.map((tpl) => (
            <li
              key={tpl.id}
              className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-800/50"
            >
              <span className="truncate text-sm font-medium">{tpl.name}</span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => onApply(tpl)}
                  className="rounded bg-[var(--accent)] px-2 py-1 text-xs text-white"
                  title="ใช้เทมเพลต"
                >
                  <FontAwesomeIcon icon={faBolt} />
                </button>
                <button
                  type="button"
                  onClick={() => deleteTemplate(tpl.id)}
                  className="rounded border border-red-300 px-2 py-1 text-xs text-red-600"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
