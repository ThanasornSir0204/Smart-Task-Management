"use client";

import { useLocale } from "@/context/LocaleContext";
import { deleteTemplate } from "@/lib/templates";
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
    <div className="linear-card-sm">
      <h3 className="linear-label mb-3">{t.dashboard.templates}</h3>
      {templates.length === 0 ? (
        <p className="linear-text-secondary text-[13px]">บันทึกเทมเพลตจากฟอร์มเพิ่มงาน</p>
      ) : (
        <ul className="space-y-1">
          {templates.map((tpl) => (
            <li
              key={tpl.id}
              className="flex items-center justify-between gap-2 rounded-[4px] px-2 py-2 transition-colors hover:bg-[var(--linear-surface-hover)]"
            >
              <span className="truncate text-[13px] font-medium">{tpl.name}</span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => onApply(tpl)}
                  className="linear-btn linear-btn-primary linear-btn-icon"
                  title="ใช้เทมเพลต"
                >
                  <FontAwesomeIcon icon={faBolt} />
                </button>
                <button
                  type="button"
                  onClick={() => deleteTemplate(tpl.id)}
                  className="linear-btn linear-btn-danger linear-btn-icon"
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
