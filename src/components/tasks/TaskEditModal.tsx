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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        role="dialog"
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">{t.common.edit}</h2>
          <button type="button" onClick={onClose} className="p-1">
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">ชื่องาน</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium">สถานะ</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
              >
                {TASK_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                {t.dashboard.priority}
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
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
              <label className="mb-1 block text-sm font-medium">วันที่</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">เวลา</label>
              <input
                type="time"
                value={deadlineTime}
                onChange={(e) => setDeadlineTime(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
                required
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">
              {t.dashboard.tags}
            </label>
            <input
              value={tagsText}
              onChange={(e) => setTagsText(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">
              {t.dashboard.sticker}
            </label>
            <div className="flex flex-wrap gap-2">
              {STATUS_STICKERS.map((s) => (
                <button
                  key={s || "none"}
                  type="button"
                  onClick={() => setSticker(s || null)}
                  className={`rounded-lg border px-2 py-1 text-lg ${
                    sticker === (s || null)
                      ? "border-[var(--accent)] ring-2 ring-[var(--accent)]"
                      : "border-slate-300 dark:border-slate-600"
                  }`}
                >
                  {s || "—"}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">
              {t.dashboard.subtasks}
            </label>
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
                  />
                  <input
                    value={sub.title}
                    onChange={(e) => {
                      const next = [...subtasks];
                      next[idx] = { ...sub, title: e.target.value };
                      setSubtasks(next);
                    }}
                    className="flex-1 rounded border border-slate-300 px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-800"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setSubtasks(subtasks.filter((_, i) => i !== idx))
                    }
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
              className="mt-2 inline-flex items-center gap-1 text-sm text-sky-600"
            >
              <FontAwesomeIcon icon={faPlus} /> เพิ่มงานย่อย
            </button>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border px-4 py-2 dark:border-slate-600"
            >
              {t.common.cancel}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-[var(--accent)] px-4 py-2 font-semibold text-white"
            >
              {saving ? "..." : t.common.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
