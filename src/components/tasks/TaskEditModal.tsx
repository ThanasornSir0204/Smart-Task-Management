"use client";

import { useLocale } from "@/context/LocaleContext";
import {
  STATUS_STICKERS,
  TASK_PRIORITIES,
  TASK_STATUSES,
} from "@/lib/taskHelpers";
import { newSubtaskId } from "@/lib/taskMapper";
import type { Subtask, Task, TaskPriority, TaskStatus } from "@/types/task";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTimes, faXmark } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";

export interface TaskEditPayload {
  title: string;
  status: TaskStatus;
  deadline: string;
  deadlineTime: string;
  tags: string[];
  priority: TaskPriority;
  sticker: string | null;
  subtasks: Subtask[];
}

export function TaskEditModal({
  task,
  open,
  onClose,
  onSave,
}: {
  task: Task | null;
  open: boolean;
  onClose: () => void;
  onSave: (payload: TaskEditPayload) => Promise<void>;
}) {
  const { t } = useLocale();
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<TaskStatus>("TODO");
  const [deadline, setDeadline] = useState("");
  const [deadlineTime, setDeadlineTime] = useState("");
  const [tagsText, setTagsText] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("MEDIUM");
  const [sticker, setSticker] = useState<string | null>(null);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!task) return;
    setTitle(task.title);
    setStatus(task.status);
    setDeadline(task.deadline);
    setDeadlineTime(task.deadlineTime);
    setTagsText(task.tags.join(", "));
    setPriority(task.priority);
    setSticker(task.sticker);
    setSubtasks(task.subtasks);
  }, [task]);

  if (!open || !task) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({
        title: title.trim(),
        status,
        deadline,
        deadlineTime,
        tags: tagsText
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean),
        priority,
        sticker: sticker || null,
        subtasks,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="linear-modal-overlay">
      <div role="dialog" className="linear-modal">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="linear-subheading">{t.common.edit}</h2>
          <button
            type="button"
            onClick={onClose}
            className="linear-btn linear-btn-ghost linear-btn-icon linear-text-secondary"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="linear-label mb-1 block">ชื่องาน</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="linear-input"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="linear-label mb-1 block">สถานะ</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="linear-select"
              >
                {TASK_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="linear-label mb-1 block">{t.dashboard.priority}</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="linear-select"
              >
                {TASK_PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="linear-label mb-1 block">วันที่</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="linear-input"
                required
              />
            </div>
            <div>
              <label className="linear-label mb-1 block">เวลา</label>
              <input
                type="time"
                value={deadlineTime}
                onChange={(e) => setDeadlineTime(e.target.value)}
                className="linear-input"
                required
              />
            </div>
          </div>
          <div>
            <label className="linear-label mb-1 block">{t.dashboard.tags}</label>
            <input
              value={tagsText}
              onChange={(e) => setTagsText(e.target.value)}
              className="linear-input"
            />
          </div>
          <div>
            <label className="linear-label mb-1 block">{t.dashboard.sticker}</label>
            <div className="flex flex-wrap gap-1">
              {STATUS_STICKERS.map((s) => (
                <button
                  key={s || "none"}
                  type="button"
                  onClick={() => setSticker(s || null)}
                  className={`linear-btn linear-btn-ghost linear-btn-icon text-base ${
                    sticker === (s || null)
                      ? "border border-[var(--linear-accent)]"
                      : ""
                  }`}
                >
                  {s || "—"}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="linear-label mb-1 block">{t.dashboard.subtasks}</label>
            <ul className="space-y-2">
              {subtasks.map((sub, idx) => (
                <li key={sub.id} className="flex gap-2">
                  <input
                    type="checkbox"
                    checked={sub.done}
                    onChange={(e) => {
                      const next = [...subtasks];
                      next[idx] = { ...sub, done: e.target.checked };
                      setSubtasks(next);
                    }}
                    className="linear-checkbox mt-2"
                  />
                  <input
                    value={sub.title}
                    onChange={(e) => {
                      const next = [...subtasks];
                      next[idx] = { ...sub, title: e.target.value };
                      setSubtasks(next);
                    }}
                    className="linear-input flex-1"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setSubtasks(subtasks.filter((_, i) => i !== idx))
                    }
                    className="linear-btn linear-btn-ghost linear-btn-icon linear-text-secondary"
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() =>
                setSubtasks([
                  ...subtasks,
                  { id: newSubtaskId(), title: "", done: false },
                ])
              }
              className="linear-btn linear-btn-ghost mt-2 text-[var(--linear-accent)]"
            >
              <FontAwesomeIcon icon={faPlus} /> เพิ่มงานย่อย
            </button>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="linear-btn linear-btn-secondary"
            >
              {t.common.cancel}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="linear-btn linear-btn-primary"
            >
              {saving ? "..." : t.common.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
