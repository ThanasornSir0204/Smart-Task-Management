"use client";

import { getFirebaseDb } from "@/config/firebase";
import { AppShell, LoadingScreen } from "@/components/layout/AppShell";
import { useLocale } from "@/context/LocaleContext";
import { useTasks } from "@/hooks/useTasks";
import { formatDisplayDate } from "@/lib/taskHelpers";
import { swalAlertSuccess, swalConfirmDelete } from "@/lib/swal";
import { getFirebaseAuth } from "@/config/firebase";
import { deleteDoc, doc, updateDoc, deleteField } from "firebase/firestore";
import { onAuthStateChanged, type User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faUndo } from "@fortawesome/free-solid-svg-icons";

export default function TrashPage() {
  const router = useRouter();
  const { t } = useLocale();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const { tasks, loading } = useTasks(user?.uid, "trash");

  useEffect(() => {
    const auth = getFirebaseAuth();
    return onAuthStateChanged(auth, (u) => {
      if (!u) router.replace("/login");
      setUser(u);
      setAuthLoading(false);
    });
  }, [router]);

  async function restore(taskId: string) {
    const db = getFirebaseDb();
    await updateDoc(doc(db, "tasks", taskId), {
      isDeleted: false,
      deletedAt: deleteField(),
    });
    await swalAlertSuccess("กู้คืนแล้ว");
  }

  async function permanentDelete(taskId: string, title: string) {
    if (!(await swalConfirmDelete(title))) return;
    const db = getFirebaseDb();
    await deleteDoc(doc(db, "tasks", taskId));
    await swalAlertSuccess("ลบถาวรแล้ว");
  }

  if (authLoading || !user) return <LoadingScreen />;

  return (
    <AppShell user={user}>
      <h1 className="mb-6 text-2xl font-bold">{t.trash.title}</h1>
      {loading ? (
        <p>{t.common.loading}</p>
      ) : tasks.length === 0 ? (
        <p className="text-slate-500">{t.trash.empty}</p>
      ) : (
        <ul className="space-y-3">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900"
            >
              <div>
                <p className="font-medium">{task.title}</p>
                <p className="text-xs text-slate-500">
                  ลบเมื่อ{" "}
                  {task.deletedAt
                    ? formatDisplayDate(task.deletedAt)
                    : "-"}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => restore(task.id)}
                  className="inline-flex items-center gap-1 rounded-lg border px-3 py-1 text-sm"
                >
                  <FontAwesomeIcon icon={faUndo} />
                  {t.common.restore}
                </button>
                <button
                  type="button"
                  onClick={() => permanentDelete(task.id, task.title)}
                  className="inline-flex items-center gap-1 rounded-lg border border-red-300 px-3 py-1 text-sm text-red-700"
                >
                  <FontAwesomeIcon icon={faTrash} />
                  {t.trash.permanentDelete}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}
