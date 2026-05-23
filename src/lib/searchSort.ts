import type { SortDirection, SortField, Task, TaskPriority } from "@/types/task";

const PRIORITY_WEIGHT: Record<TaskPriority, number> = {
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
};

export function searchTasks(tasks: Task[], queryText: string): Task[] {
  const q = queryText.trim().toLowerCase();
  if (!q) return tasks;
  return tasks.filter((task) => {
    const inTitle = task.title.toLowerCase().includes(q);
    const inTags = task.tags.some((tag) => tag.toLowerCase().includes(q));
    const inSub = task.subtasks.some((s) =>
      s.title.toLowerCase().includes(q),
    );
    return inTitle || inTags || inSub;
  });
}

export function sortTasks(
  tasks: Task[],
  field: SortField,
  direction: SortDirection,
): Task[] {
  const sorted = [...tasks].sort((a, b) => {
    let cmp = 0;
    switch (field) {
      case "title":
        cmp = a.title.localeCompare(b.title, "th");
        break;
      case "deadline":
        cmp =
          a.deadline.localeCompare(b.deadline) ||
          a.deadlineTime.localeCompare(b.deadlineTime);
        break;
      case "priority":
        cmp = PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority];
        break;
      case "createdAt":
      default:
        cmp = b.createdAt.getTime() - a.createdAt.getTime();
        break;
    }
    return direction === "asc" ? -cmp : cmp;
  });
  return sorted;
}

export function weeklyDoneSeries(tasks: Task[]): { day: string; done: number }[] {
  const days: { day: string; done: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const label = d.toLocaleDateString("th-TH", { weekday: "short" });
    const done = tasks.filter(
      (t) =>
        t.status === "DONE" &&
        !t.isDeleted &&
        `${t.createdAt.getFullYear()}-${String(t.createdAt.getMonth() + 1).padStart(2, "0")}-${String(t.createdAt.getDate()).padStart(2, "0")}` ===
          key,
    ).length;
    days.push({ day: label, done });
  }
  return days;
}
