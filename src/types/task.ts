export type TaskStatus = "TODO" | "DOING" | "DONE";

export type TaskPriority = "HIGH" | "MEDIUM" | "LOW";

export interface Subtask {
  id: string;
  title: string;
  done: boolean;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  status: TaskStatus;
  deadline: string;
  deadlineTime: string;
  createdAt: Date;
  tags: string[];
  priority: TaskPriority;
  subtasks: Subtask[];
  sticker: string | null;
  pomodoroMinutes: number;
  isDeleted: boolean;
  deletedAt: Date | null;
  lastNotifiedAt: string | null;
}

export interface TaskTemplate {
  id: string;
  userId: string;
  name: string;
  title: string;
  status: TaskStatus;
  deadlineOffsetDays: number;
  deadlineTime: string;
  tags: string[];
  priority: TaskPriority;
  subtasks: Subtask[];
  sticker: string | null;
}

export interface TaskHistoryEntry {
  id: string;
  field: string;
  oldValue: string;
  newValue: string;
  changedAt: Date;
}

export type StatusFilter = "ALL" | TaskStatus;

export type ExportDateRange = "all" | "today" | "week" | "custom";

export type SortField = "createdAt" | "deadline" | "title" | "priority";

export type SortDirection = "asc" | "desc";
