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
      <div className="mx-auto max-w-md linear-card text-center">
        <h1 className="linear-heading-lg mb-8">{t.focus.title}</h1>
        <p className="mb-8 font-mono text-6xl tabular-nums text-[var(--linear-accent)]">
          {mm}:{ss}
        </p>
        <select
          value={taskId}
          onChange={(e) => setTaskId(e.target.value)}
          className="linear-select mb-6"
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
            className="linear-btn linear-btn-primary"
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
            className="linear-btn linear-btn-secondary linear-btn-icon"
          >
            <FontAwesomeIcon icon={faRotateRight} />
          </button>
        </div>
        <button
          type="button"
          onClick={saveFocus}
          disabled={!taskId}
          className="linear-btn linear-btn-secondary mt-6 w-full"
        >
          {t.focus.complete}
        </button>
      </div>
    </AppShell>
  );
}
