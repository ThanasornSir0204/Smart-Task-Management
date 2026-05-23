"use client";

import { getFirebaseAuth, getFirebaseDb } from "@/config/firebase";
import { AppShell, LoadingScreen } from "@/components/layout/AppShell";
import { useLocale } from "@/context/LocaleContext";
import { useTasks } from "@/hooks/useTasks";
import { getFirebaseErrorMessage } from "@/lib/taskHelpers";
import { swalAlertSuccess } from "@/lib/swal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPause,
  faPlay,
  faRotateRight,
} from "@fortawesome/free-solid-svg-icons";
import { doc, updateDoc, increment } from "firebase/firestore";
import { onAuthStateChanged, type User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const POMODORO_SEC = 25 * 60;

export default function FocusPage() {
  const router = useRouter();
  const { t } = useLocale();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const { tasks } = useTasks(user?.uid, "active");
  const [taskId, setTaskId] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(POMODORO_SEC);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const doingTasks = tasks.filter(
    (t) => t.status === "DOING" || t.status === "TODO",
  );

  useEffect(() => {
    const auth = getFirebaseAuth();
    return onAuthStateChanged(auth, (u) => {
      if (!u) router.replace("/login");
      setUser(u);
      setAuthLoading(false);
    });
  }, [router]);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = window.setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          window.clearInterval(intervalRef.current!);
          setRunning(false);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [running]);

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  async function saveFocus() {
    if (!taskId || !user) return;
    const minutes = Math.round((POMODORO_SEC - secondsLeft) / 60) || 25;
    try {
      const db = getFirebaseDb();
      await updateDoc(doc(db, "tasks", taskId), {
        pomodoroMinutes: increment(minutes),
      });
      await swalAlertSuccess(`บันทึกโฟกัส ${minutes} นาที`);
      setSecondsLeft(POMODORO_SEC);
    } catch (err) {
      alert(getFirebaseErrorMessage(err));
    }
  }

  if (authLoading || !user) return <LoadingScreen />;

  return (
    <AppShell user={user}>
      <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-lg dark:border-slate-800 dark:bg-slate-900">
        <h1 className="mb-6 text-2xl font-bold">{t.focus.title}</h1>
        <p className="mb-6 font-mono text-6xl tabular-nums text-[var(--accent)]">
          {mm}:{ss}
        </p>
        <select
          value={taskId}
          onChange={(e) => setTaskId(e.target.value)}
          className="mb-6 w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
        >
          <option value="">{t.focus.selectTask}</option>
          {doingTasks.map((task) => (
            <option key={task.id} value={task.id}>
              {task.sticker} {task.title}
            </option>
          ))}
        </select>
        <div className="flex justify-center gap-3">
          <button
            type="button"
            onClick={() => setRunning(!running)}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2 text-white"
          >
            <FontAwesomeIcon icon={running ? faPause : faPlay} />
            {running ? t.focus.pause : t.focus.start}
          </button>
          <button
            type="button"
            onClick={() => {
              setRunning(false);
              setSecondsLeft(POMODORO_SEC);
            }}
            className="rounded-lg border px-4 py-2 dark:border-slate-600"
          >
            <FontAwesomeIcon icon={faRotateRight} />
          </button>
        </div>
        <button
          type="button"
          onClick={saveFocus}
          disabled={!taskId}
          className="mt-6 w-full rounded-lg border border-emerald-500 py-2 font-semibold text-emerald-700 disabled:opacity-50 dark:text-emerald-400"
        >
          {t.focus.complete}
        </button>
      </div>
    </AppShell>
  );
}
