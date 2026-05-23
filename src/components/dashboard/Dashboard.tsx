"use client";

import { getFirebaseAuth, getFirebaseDb } from "@/config/firebase";
import { LeaderboardPanel } from "@/components/dashboard/LeaderboardPanel";
import { TemplatesPanel } from "@/components/dashboard/TemplatesPanel";
import { WeeklyChart } from "@/components/dashboard/WeeklyChart";
import { AppShell, LoadingScreen } from "@/components/layout/AppShell";
import {
  TaskEditModal,
  type TaskEditPayload,
} from "@/components/tasks/TaskEditModal";
import { useLocale } from "@/context/LocaleContext";
import { useTasks } from "@/hooks/useTasks";
import { useUserProfile } from "@/hooks/useUserProfile";
import { fetchTaskHistory, logTaskChange } from "@/lib/taskHistory";
import {
  requestNotificationPermission,
  scheduleDeadlineChecks,
  showDeadlineNotification,
} from "@/lib/notifications";
import { searchTasks, sortTasks } from "@/lib/searchSort";
import {
  createTemplate,
  deadlineFromTemplate,
  subscribeTemplates,
} from "@/lib/templates";
import {
  buildTasksCsv,
  currentTimeHM,
  downloadCsv,
  filterTasksForView,
  formatDateYMD,
  formatDeadlineDisplay,
  formatDisplayDate,
  getFirebaseErrorMessage,
  isOverdue,
  priorityBadgeClasses,
  STATUS_STICKERS,
  statusBadgeClasses,
  taskMatchesDateRange,
  TASK_PRIORITIES,
  TASK_STATUSES,
  todayYMD,
} from "@/lib/taskHelpers";
import { newSubtaskId } from "@/lib/taskMapper";
import {
  swalAlertError,
  swalAlertSuccess,
  swalAlertWarning,
  swalConfirmDelete,
} from "@/lib/swal";
import { recordTaskDone } from "@/lib/userService";
import type {
  ExportDateRange,
  SortDirection,
  SortField,
  StatusFilter,
  Task,
  TaskStatus,
  TaskTemplate,
} from "@/types/task";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendar,
  faClock,
  faFileExport,
  faFilter,
  faFire,
  faHistory,
  faListCheck,
  faPenToSquare,
  faPlus,
  faSearch,
  faTrash,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { onAuthStateChanged, type User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";

export function Dashboard() {
  const router = useRouter();
  const { t } = useLocale();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const { tasks, loading: tasksLoading, error: tasksError } = useTasks(
    user?.uid,
    "active",
  );
  const { profile, leaderboard } = useUserProfile(user?.uid, user?.email ?? null);
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);

  const [title, setTitle] = useState("");
  const [newStatus, setNewStatus] = useState<TaskStatus>("TODO");
  const [deadline, setDeadline] = useState(todayYMD());
  const [deadlineTime, setDeadlineTime] = useState(currentTimeHM());
  const [tagsText, setTagsText] = useState("");
  const [priority, setPriority] = useState<"HIGH" | "MEDIUM" | "LOW">("MEDIUM");
  const [sticker, setSticker] = useState<string | null>(null);
  const [subtasksText, setSubtasksText] = useState("");
  const [templateName, setTemplateName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDir, setSortDir] = useState<SortDirection>("desc");

  const [exportRange, setExportRange] = useState<ExportDateRange>("all");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const [editTask, setEditTask] = useState<Task | null>(null);

  useEffect(() => {
    const auth = getFirebaseAuth();
    return onAuthStateChanged(auth, (u) => {
      if (!u) router.replace("/login");
      setUser(u);
      setAuthLoading(false);
    });
  }, [router]);

  useEffect(() => {
    if (!user) return;
    return subscribeTemplates(
      user.uid,
      setTemplates,
      () => {},
    );
  }, [user]);

  useEffect(() => {
    if (!profile?.notificationsEnabled) return;
    return scheduleDeadlineChecks(tasks, true, showDeadlineNotification);
  }, [tasks, profile?.notificationsEnabled]);

  const counts = useMemo(() => {
    const active = tasks.filter((x) => !x.isDeleted);
    const todo = active.filter((x) => x.status === "TODO").length;
    const doing = active.filter((x) => x.status === "DOING").length;
    const done = active.filter((x) => x.status === "DONE").length;
    const total = active.length;
    const percent = total === 0 ? 0 : Math.round((done / total) * 100);
    return { todo, doing, done, total, percent };
  }, [tasks]);

  const visibleTasks = useMemo(() => {
    const filtered = filterTasksForView(tasks, statusFilter, overdueOnly);
    const searched = searchTasks(filtered, searchQuery);
    return sortTasks(searched, sortField, sortDir);
  }, [tasks, statusFilter, overdueOnly, searchQuery, sortField, sortDir]);

  const exportTasks = useMemo(() => {
    const filtered = filterTasksForView(tasks, statusFilter, overdueOnly);
    const searched = searchTasks(filtered, searchQuery);
    return searched.filter((task) =>
      taskMatchesDateRange(task, exportRange, customStart, customEnd),
    );
  }, [
    tasks,
    statusFilter,
    overdueOnly,
    searchQuery,
    exportRange,
    customStart,
    customEnd,
  ]);

  function parseSubtasksFromText(text: string) {
    return text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => ({ id: newSubtaskId(), title: line, done: false }));
  }

  async function handleAddTask(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    const trimmed = title.trim();
    if (!trimmed) {
      await swalAlertWarning("กรุณากรอกชื่องาน");
      return;
    }
    setSubmitting(true);
    try {
      const db = getFirebaseDb();
      await addDoc(collection(db, "tasks"), {
        userId: user.uid,
        title: trimmed,
        status: newStatus,
        deadline,
        deadlineTime,
        tags: tagsText
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean),
        priority,
        subtasks: parseSubtasksFromText(subtasksText),
        sticker,
        pomodoroMinutes: 0,
        isDeleted: false,
        deletedAt: null,
        lastNotifiedAt: null,
        createdAt: serverTimestamp(),
      });
      if (newStatus === "DONE") await recordTaskDone(user.uid);
      setTitle("");
      setTagsText("");
      setSubtasksText("");
      setSticker(null);
      setDeadline(todayYMD());
      setDeadlineTime(currentTimeHM());
      await swalAlertSuccess("เพิ่มงานแล้ว");
    } catch (err) {
      await swalAlertError(getFirebaseErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function saveTemplate() {
    if (!user || !templateName.trim()) {
      await swalAlertWarning("ตั้งชื่อเทมเพลตก่อน");
      return;
    }
    await createTemplate(user.uid, {
      name: templateName.trim(),
      title: title.trim() || "งานใหม่",
      status: newStatus,
      deadlineOffsetDays: 0,
      deadlineTime,
      tags: tagsText
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean),
      priority,
      subtasks: parseSubtasksFromText(subtasksText),
      sticker,
    });
    setTemplateName("");
    await swalAlertSuccess("บันทึกเทมเพลตแล้ว");
  }

  async function applyTemplate(tpl: TaskTemplate) {
    setTitle(tpl.title);
    setNewStatus(tpl.status);
    setDeadline(deadlineFromTemplate(tpl.deadlineOffsetDays));
    setDeadlineTime(tpl.deadlineTime);
    setTagsText(tpl.tags.join(", "));
    setPriority(tpl.priority);
    setSticker(tpl.sticker);
    setSubtasksText(tpl.subtasks.map((s) => s.title).join("\n"));
    await swalAlertSuccess(`โหลดเทมเพลต "${tpl.name}"`);
  }

  async function handleSaveEdit(payload: TaskEditPayload) {
    if (!editTask || !user) return;
    const db = getFirebaseDb();
    const ref = doc(db, "tasks", editTask.id);
    const fields: (keyof TaskEditPayload)[] = [
      "title",
      "status",
      "deadline",
      "deadlineTime",
    ];
    for (const field of fields) {
      const oldVal = String(
        field === "title"
          ? editTask.title
          : field === "status"
            ? editTask.status
            : field === "deadline"
              ? editTask.deadline
              : editTask.deadlineTime,
      );
      const newVal = String(payload[field]);
      await logTaskChange(editTask.id, field, oldVal, newVal);
    }
    if (payload.status === "DONE" && editTask.status !== "DONE") {
      await recordTaskDone(user.uid);
    }
    await updateDoc(ref, { ...payload });
    await swalAlertSuccess("บันทึกแล้ว");
  }

  async function softDelete(task: Task) {
    if (!(await swalConfirmDelete(task.title))) return;
    const db = getFirebaseDb();
    await updateDoc(doc(db, "tasks", task.id), {
      isDeleted: true,
      deletedAt: serverTimestamp(),
    });
    await swalAlertSuccess("ย้ายไปถังขยะแล้ว");
  }

  async function showHistory(task: Task) {
    const history = await fetchTaskHistory(task.id);
    const html =
      history.length === 0
        ? `<p>${t.dashboard.noHistory}</p>`
        : `<ul style="text-align:left;font-size:13px;max-height:240px;overflow:auto">${history
            .map(
              (h) =>
                `<li><b>${h.field}</b>: ${h.oldValue} → ${h.newValue} <small>(${h.changedAt.toLocaleString()})</small></li>`,
            )
            .join("")}</ul>`;
    const Swal = (await import("sweetalert2")).default;
    await Swal.fire({
      title: t.dashboard.history,
      html,
      confirmButtonText: "ตกลง",
      background: document.documentElement.classList.contains("dark")
        ? "#0f172a"
        : "#fff",
      color: document.documentElement.classList.contains("dark")
        ? "#f1f5f9"
        : "#0f172a",
    });
  }

  async function handleExportCsv() {
    if (exportTasks.length === 0) {
      await swalAlertWarning("ไม่มีข้อมูล Export");
      return;
    }
    downloadCsv(buildTasksCsv(exportTasks), `tasks_${formatDateYMD()}.csv`);
    await swalAlertSuccess(`Export ${exportTasks.length} รายการ`);
  }

  if (authLoading || !user) return <LoadingScreen />;

  return (
    <AppShell user={user}>
      {tasksError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {tasksError}
        </div>
      )}

      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 dark:border-orange-900 dark:bg-orange-950/30 lg:col-span-1">
          <p className="flex items-center gap-2 text-sm font-medium text-orange-800 dark:text-orange-200">
            <FontAwesomeIcon icon={faFire} />
            {t.dashboard.streak}
          </p>
          <p className="mt-1 text-3xl font-bold tabular-nums">
            {profile?.streakCount ?? 0}{" "}
            <span className="text-base font-normal">{t.dashboard.streakDays}</span>
          </p>
        </div>
        <div className="lg:col-span-2">
          <WeeklyChart tasks={tasks} />
        </div>
      </div>

      <section className="mb-8">
        <h2 className="mb-4 text-lg font-semibold">{t.dashboard.summary}</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {(
            [
              ["TODO", counts.todo],
              ["DOING", counts.doing],
              ["DONE", counts.done],
              ["ALL", counts.total],
            ] as const
          ).map(([label, value]) => (
            <div
              key={label}
              className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
            >
              <p className="text-xs uppercase text-slate-500">{label}</p>
              <p className="text-3xl font-bold">{value}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-2 flex justify-between text-sm">
            <span>{t.dashboard.progress}</span>
            <span>{counts.percent}%</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all"
              style={{ width: `${counts.percent}%` }}
            />
          </div>
        </div>
      </section>

      <div className="mb-8 grid gap-6 lg:grid-cols-3">
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <FontAwesomeIcon icon={faPlus} className="text-[var(--accent)]" />
            {t.dashboard.addTask}
          </h2>
          <form onSubmit={handleAddTask} className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="ชื่องาน"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
                required
              />
            </div>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as TaskStatus)}
              className="rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
            >
              {TASK_STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <select
              value={priority}
              onChange={(e) =>
                setPriority(e.target.value as "HIGH" | "MEDIUM" | "LOW")
              }
              className="rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
            >
              {TASK_PRIORITIES.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
            />
            <input
              type="time"
              value={deadlineTime}
              onChange={(e) => setDeadlineTime(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
            />
            <input
              value={tagsText}
              onChange={(e) => setTagsText(e.target.value)}
              placeholder={t.dashboard.tags}
              className="sm:col-span-2 rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
            />
            <textarea
              value={subtasksText}
              onChange={(e) => setSubtasksText(e.target.value)}
              placeholder="งานย่อย (หนึ่งบรรทัดต่อหนึ่งรายการ)"
              rows={2}
              className="sm:col-span-2 rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
            />
            <div className="flex flex-wrap gap-1 sm:col-span-2">
              {STATUS_STICKERS.map((s) => (
                <button
                  key={s || "none"}
                  type="button"
                  onClick={() => setSticker(s || null)}
                  className={`rounded border px-2 py-0.5 text-lg ${sticker === (s || null) ? "border-[var(--accent)]" : "border-slate-300"}`}
                >
                  {s || "—"}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 sm:col-span-2">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2 font-semibold text-white"
              >
                <FontAwesomeIcon icon={faPlus} />
                {t.dashboard.addTask}
              </button>
              <input
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="ชื่อเทมเพลต"
                className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800"
              />
              <button
                type="button"
                onClick={saveTemplate}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600"
              >
                บันทึกเทมเพลต
              </button>
            </div>
          </form>
        </section>
        <div className="space-y-4">
          <TemplatesPanel templates={templates} onApply={applyTemplate} />
          <LeaderboardPanel entries={leaderboard} />
        </div>
      </div>

      <section className="mb-8 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-4 flex items-center gap-2 font-semibold">
          <FontAwesomeIcon icon={faFilter} />
          {t.dashboard.filters}
        </h2>
        <div className="mb-3 flex flex-wrap gap-2">
          {(["ALL", ...TASK_STATUSES] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setStatusFilter(f)}
              className={`rounded-full px-3 py-1 text-sm ${statusFilter === f ? "bg-[var(--accent)] text-white" : "bg-slate-100 dark:bg-slate-800"}`}
            >
              {f === "ALL" ? t.common.all : f}
            </button>
          ))}
        </div>
        <label className="mb-4 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={overdueOnly}
            onChange={(e) => setOverdueOnly(e.target.checked)}
          />
          <FontAwesomeIcon icon={faTriangleExclamation} className="text-red-500" />
          {t.dashboard.overdueOnly}
        </label>
        <div className="mb-4 grid gap-3 sm:grid-cols-3">
          <div className="relative sm:col-span-2">
            <FontAwesomeIcon
              icon={faSearch}
              className="absolute left-3 top-2.5 text-slate-400"
            />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.common.search}
              className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 dark:border-slate-600 dark:bg-slate-800"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value as SortField)}
              className="flex-1 rounded-lg border border-slate-300 px-2 py-2 text-sm dark:border-slate-600 dark:bg-slate-800"
            >
              <option value="createdAt">created</option>
              <option value="deadline">deadline</option>
              <option value="title">title</option>
              <option value="priority">priority</option>
            </select>
            <select
              value={sortDir}
              onChange={(e) => setSortDir(e.target.value as SortDirection)}
              className="rounded-lg border border-slate-300 px-2 py-2 text-sm dark:border-slate-600 dark:bg-slate-800"
            >
              <option value="desc">↓</option>
              <option value="asc">↑</option>
            </select>
          </div>
        </div>
        <button
          type="button"
          onClick={handleExportCsv}
          className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm text-white"
        >
          <FontAwesomeIcon icon={faFileExport} />
          Export ({exportTasks.length})
        </button>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">{t.dashboard.taskList}</h2>
        {tasksLoading ? (
          <p>{t.common.loading}</p>
        ) : visibleTasks.length === 0 ? (
          <p className="text-slate-500">ไม่มีงาน</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <table className="min-w-full text-sm">
              <thead className="border-b bg-slate-50 text-xs uppercase dark:bg-slate-800/50">
                <tr>
                  <th className="px-4 py-3">งาน</th>
                  <th className="px-4 py-3">สถานะ</th>
                  <th className="px-4 py-3">Deadline</th>
                  <th className="px-4 py-3 text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-slate-800">
                {visibleTasks.map((task) => {
                  const overdue = isOverdue(
                    task.deadline,
                    task.deadlineTime,
                    task.status,
                  );
                  return (
                    <tr
                      key={task.id}
                      className={overdue ? "bg-red-50 dark:bg-red-950/20" : ""}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-start gap-2">
                          {task.sticker && (
                            <span className="text-lg">{task.sticker}</span>
                          )}
                          <div>
                            <p className={overdue ? "font-semibold text-red-700" : "font-medium"}>
                              {task.title}
                            </p>
                            <p className="text-xs text-slate-500">
                              <span className={`mr-1 rounded px-1 ${priorityBadgeClasses(task.priority)}`}>
                                {task.priority}
                              </span>
                              {task.tags.map((tag) => (
                                <span key={tag} className="mr-1">
                                  #{tag}
                                </span>
                              ))}
                            </p>
                            {task.subtasks.length > 0 && (
                              <p className="text-xs text-slate-400">
                                งานย่อย {task.subtasks.filter((s) => s.done).length}/
                                {task.subtasks.length}
                                {task.pomodoroMinutes > 0 &&
                                  ` · โฟกัส ${task.pomodoroMinutes} นาที`}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusBadgeClasses(task.status)}`}
                        >
                          {task.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1">
                          <FontAwesomeIcon icon={faCalendar} className="text-slate-400" />
                          {formatDeadlineDisplay(task.deadline, task.deadlineTime)}
                        </span>
                        <br />
                        <span className="text-xs text-slate-400">
                          + {formatDisplayDate(task.createdAt)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => showHistory(task)}
                            className="rounded border px-2 py-1 text-xs"
                            title={t.dashboard.history}
                          >
                            <FontAwesomeIcon icon={faHistory} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditTask(task)}
                            className="rounded border border-sky-300 px-2 py-1 text-xs text-sky-700"
                          >
                            <FontAwesomeIcon icon={faPenToSquare} />
                          </button>
                          <button
                            type="button"
                            onClick={() => softDelete(task)}
                            className="rounded border border-red-300 px-2 py-1 text-xs text-red-700"
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <TaskEditModal
        task={editTask}
        open={!!editTask}
        onClose={() => setEditTask(null)}
        onSave={handleSaveEdit}
      />
    </AppShell>
  );
}
