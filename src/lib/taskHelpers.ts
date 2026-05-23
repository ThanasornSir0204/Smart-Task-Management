import type {
  ExportDateRange,
  Task,
  TaskPriority,
  TaskStatus,
} from "@/types/task";

export const TASK_PRIORITIES: TaskPriority[] = ["HIGH", "MEDIUM", "LOW"];

export const STATUS_STICKERS = ["", "🔥", "⭐", "💡", "🎯", "📌", "✅", "⚡", "🚀", "📚"];

export const TASK_STATUSES: TaskStatus[] = ["TODO", "DOING", "DONE"];

export function formatDateYMD(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseYMD(ymd: string): Date {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function formatDisplayDate(date: Date): string {
  return date.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function todayYMD(): string {
  return formatDateYMD(new Date());
}

export function currentTimeHM(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

/** Legacy tasks without deadlineTime are treated as end of day. */
export function normalizeDeadlineTime(value: string | undefined): string {
  if (value && /^\d{2}:\d{2}$/.test(value)) return value;
  return "23:59";
}

export function getDeadlineDateTime(deadline: string, deadlineTime: string): Date {
  const [y, m, d] = deadline.split("-").map(Number);
  const time = normalizeDeadlineTime(deadlineTime);
  const [hh, mm] = time.split(":").map(Number);
  return new Date(y, m - 1, d, hh, mm, 0, 0);
}

export function formatDeadlineDisplay(deadline: string, deadlineTime: string): string {
  return `${deadline} ${normalizeDeadlineTime(deadlineTime)}`;
}

export function isOverdue(
  deadline: string,
  deadlineTime: string,
  status: TaskStatus,
): boolean {
  if (status === "DONE") return false;
  return getDeadlineDateTime(deadline, deadlineTime) < new Date();
}

export function getWeekRange(reference: Date = new Date()): {
  start: string;
  end: string;
} {
  const day = reference.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(reference);
  monday.setDate(reference.getDate() + diffToMonday);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return { start: formatDateYMD(monday), end: formatDateYMD(sunday) };
}

export function taskMatchesDateRange(
  task: Task,
  range: ExportDateRange,
  customStart: string,
  customEnd: string,
): boolean {
  const created = formatDateYMD(task.createdAt);

  switch (range) {
    case "all":
      return true;
    case "today":
      return created === todayYMD();
    case "week": {
      const { start, end } = getWeekRange();
      return created >= start && created <= end;
    }
    case "custom":
      if (!customStart || !customEnd) return true;
      return created >= customStart && created <= customEnd;
    default:
      return true;
  }
}

export function statusLabel(status: TaskStatus): string {
  switch (status) {
    case "TODO":
      return "TODO";
    case "DOING":
      return "DOING";
    case "DONE":
      return "DONE";
  }
}

export function statusBadgeClasses(status: TaskStatus): string {
  switch (status) {
    case "TODO":
      return "bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-100";
    case "DOING":
      return "bg-sky-200 text-sky-900 dark:bg-sky-900 dark:text-sky-100";
    case "DONE":
      return "bg-emerald-200 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-100";
  }
}

export function priorityBadgeClasses(priority: TaskPriority): string {
  switch (priority) {
    case "HIGH":
      return "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200";
    case "LOW":
      return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300";
    default:
      return "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-100";
  }
}

export function filterTasksForView(
  tasks: Task[],
  statusFilter: "ALL" | TaskStatus,
  overdueOnly: boolean,
): Task[] {
  return tasks.filter((task) => {
    if (task.isDeleted) return false;
    const statusMatch =
      statusFilter === "ALL" || task.status === statusFilter;
    const overdueMatch =
      !overdueOnly ||
      isOverdue(task.deadline, task.deadlineTime, task.status);
    return statusMatch && overdueMatch;
  });
}

export function buildTasksCsv(tasks: Task[]): string {
  const header = [
    "ลำดับ",
    "ชื่องาน",
    "สถานะ",
    "ความสำคัญ",
    "แท็ก",
    "deadline",
    "เวลา",
    "โฟกัส(นาที)",
    "วันที่เพิ่ม",
  ];
  const rows = tasks.map((task, index) => [
    String(index + 1),
    escapeCsvField(task.title),
    task.status,
    task.priority,
    escapeCsvField(task.tags.join("|")),
    task.deadline,
    normalizeDeadlineTime(task.deadlineTime),
    String(task.pomodoroMinutes),
    formatDateYMD(task.createdAt),
  ]);

  const lines = [header.join(","), ...rows.map((r) => r.join(","))];
  return "\uFEFF" + lines.join("\r\n");
}

function escapeCsvField(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function downloadCsv(content: string, filename: string): void {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function getFirebaseErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const code = (error as Error & { code?: string }).code;
    switch (code) {
      case "auth/invalid-email":
        return "อีเมลไม่ถูกต้อง";
      case "auth/user-disabled":
        return "บัญชีนี้ถูกระงับการใช้งาน";
      case "auth/user-not-found":
        return "ไม่พบบัญชีผู้ใช้ กรุณาสมัครสมาชิก";
      case "auth/wrong-password":
        return "รหัสผ่านไม่ถูกต้อง";
      case "auth/email-already-in-use":
        return "อีเมลนี้ถูกใช้งานแล้ว";
      case "auth/weak-password":
        return "รหัสผ่านอ่อนเกินไป (อย่างน้อย 6 ตัวอักษร)";
      case "auth/invalid-credential":
        return "อีเมลหรือรหัสผ่านไม่ถูกต้อง";
      case "auth/too-many-requests":
        return "ลองใหม่ภายหลัง มีการพยายามเข้าสู่ระบบมากเกินไป";
      case "permission-denied":
        return "ไม่มีสิทธิ์เข้าถึงข้อมูล ตรวจสอบ Firestore Rules";
      case "failed-precondition":
        if (/index/i.test(error.message)) {
          return (
            "Firestore Index กำลังสร้างอยู่ — รอสถานะเป็น Enabled ใน Firebase Console " +
            "(โดยทั่วไป 2–10 นาที) แล้วรีเฟรชหน้าเว็บ"
          );
        }
        return error.message || "เงื่อนไขไม่ครบสำหรับการดำเนินการ";
      default:
        if (/index.*building|requires an index/i.test(error.message)) {
          return (
            "Firestore Index กำลังสร้างอยู่ — รอสถานะเป็น Enabled ใน Firebase Console " +
            "(โดยทั่วไป 2–10 นาที) แล้วรีเฟรชหน้าเว็บ"
          );
        }
        return error.message || "เกิดข้อผิดพลาด กรุณาลองใหม่";
    }
  }
  return "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ";
}
