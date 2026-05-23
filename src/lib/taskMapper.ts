import { normalizeDeadlineTime } from "@/lib/taskHelpers";
import type {
  Subtask,
  Task,
  TaskPriority,
  TaskStatus,
  TaskTemplate,
} from "@/types/task";
import type { Timestamp } from "firebase/firestore";

function parseSubtasks(raw: unknown): Subtask[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item, index) => {
    const row = item as Record<string, unknown>;
    return {
      id: String(row.id ?? `sub-${index}`),
      title: String(row.title ?? ""),
      done: Boolean(row.done),
    };
  });
}

function parseTags(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((t) => String(t).trim()).filter(Boolean);
}

export function mapFirestoreTask(
  id: string,
  data: Record<string, unknown>,
): Task {
  const created = data.createdAt as Timestamp | undefined;
  const deleted = data.deletedAt as Timestamp | undefined;
  return {
    id,
    userId: String(data.userId ?? ""),
    title: String(data.title ?? ""),
    status: data.status as TaskStatus,
    deadline: String(data.deadline ?? ""),
    deadlineTime: normalizeDeadlineTime(data.deadlineTime as string | undefined),
    createdAt: created?.toDate?.() ?? new Date(),
    tags: parseTags(data.tags),
    priority: (data.priority as TaskPriority) ?? "MEDIUM",
    subtasks: parseSubtasks(data.subtasks),
    sticker: (data.sticker as string) ?? null,
    pomodoroMinutes: Number(data.pomodoroMinutes ?? 0),
    deletedAt: deleted?.toDate?.() ?? null,
    isDeleted: Boolean(data.isDeleted ?? false),
    lastNotifiedAt: (data.lastNotifiedAt as string) ?? null,
  };
}

export function mapFirestoreTemplate(
  id: string,
  data: Record<string, unknown>,
): TaskTemplate {
  return {
    id,
    userId: String(data.userId ?? ""),
    name: String(data.name ?? "Template"),
    title: String(data.title ?? ""),
    status: data.status as TaskStatus,
    deadlineOffsetDays: Number(data.deadlineOffsetDays ?? 0),
    deadlineTime: normalizeDeadlineTime(data.deadlineTime as string | undefined),
    tags: parseTags(data.tags),
    priority: (data.priority as TaskPriority) ?? "MEDIUM",
    subtasks: parseSubtasks(data.subtasks),
    sticker: (data.sticker as string) ?? null,
  };
}

export function newSubtaskId(): string {
  return `sub-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}
