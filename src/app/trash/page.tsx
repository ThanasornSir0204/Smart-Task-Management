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
      <h1 className="linear-heading-lg mb-6">{t.trash.title}</h1>
      {loading ? (
        <p className="linear-text-secondary">{t.common.loading}</p>
      ) : tasks.length === 0 ? (
        <div className="linear-empty">
          <p>{t.trash.empty}</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="linear-card-sm flex items-center justify-between gap-4"
            >
              <div>
                <p className="font-medium">{task.title}</p>
                <p className="linear-label">
                  ลบเมื่อ{" "}
                  {task.deletedAt ? formatDisplayDate(task.deletedAt) : "-"}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => restore(task.id)}
                  className="linear-btn linear-btn-secondary"
                >
                  <FontAwesomeIcon icon={faUndo} />
                  {t.common.restore}
                </button>
                <button
                  type="button"
                  onClick={() => permanentDelete(task.id, task.title)}
                  className="linear-btn linear-btn-danger"
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
