"use client";

import { getFirebaseDb } from "@/config/firebase";
import { getFirebaseErrorMessage } from "@/lib/taskHelpers";
import { mapFirestoreTask } from "@/lib/taskMapper";
import type { Task } from "@/types/task";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";

export function useTasks(userId: string | undefined, mode: "active" | "trash") {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setTasks([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const db = getFirebaseDb();
      const q =
        mode === "trash"
          ? query(
              collection(db, "tasks"),
              where("userId", "==", userId),
              where("isDeleted", "==", true),
              orderBy("deletedAt", "desc"),
            )
          : query(
              collection(db, "tasks"),
              where("userId", "==", userId),
              orderBy("createdAt", "desc"),
            );

      const unsubscribe = onSnapshot(
        q,
        (snap) => {
          const mapped = snap.docs.map((d) =>
            mapFirestoreTask(d.id, d.data() as Record<string, unknown>),
          );
          setTasks(
            mode === "active"
              ? mapped.filter((t) => !t.isDeleted)
              : mapped,
          );
          setLoading(false);
        },
        (err) => {
          setError(getFirebaseErrorMessage(err));
          setLoading(false);
        },
      );

      return () => unsubscribe();
    } catch (err) {
      setError(getFirebaseErrorMessage(err));
      setLoading(false);
    }
  }, [userId, mode]);

  return { tasks, loading, error };
}
