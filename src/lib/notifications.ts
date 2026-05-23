import { getDeadlineDateTime } from "@/lib/taskHelpers";
import type { Task } from "@/types/task";

const NOTIFY_BEFORE_MS = 15 * 60 * 1000;

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return false;
  }
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const result = await Notification.requestPermission();
  return result === "granted";
}

export function scheduleDeadlineChecks(
  tasks: Task[],
  enabled: boolean,
  onNotify: (task: Task) => void,
): () => void {
  if (!enabled || typeof window === "undefined") {
    return () => {};
  }

  const tick = () => {
    const now = Date.now();
    for (const task of tasks) {
      if (task.isDeleted || task.status === "DONE") continue;
      const due = getDeadlineDateTime(task.deadline, task.deadlineTime).getTime();
      const notifyAt = due - NOTIFY_BEFORE_MS;
      const key = `${task.id}-${task.deadline}-${task.deadlineTime}`;
      if (now >= notifyAt && now < due) {
        const last = sessionStorage.getItem(`notified-${key}`);
        if (!last) {
          sessionStorage.setItem(`notified-${key}`, "1");
          onNotify(task);
        }
      }
    }
  };

  tick();
  const id = window.setInterval(tick, 60_000);
  return () => window.clearInterval(id);
}

export function showDeadlineNotification(task: Task): void {
  if (Notification.permission !== "granted") return;
  new Notification("ใกล้ถึงกำหนดส่ง", {
    body: `${task.sticker ?? "📌"} ${task.title} — ${task.deadline} ${task.deadlineTime}`,
    icon: "/globe.svg",
    tag: task.id,
  });
}
