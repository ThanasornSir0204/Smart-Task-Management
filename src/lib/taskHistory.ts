import { getFirebaseDb } from "@/config/firebase";
import type { TaskHistoryEntry } from "@/types/task";
import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  type Timestamp,
} from "firebase/firestore";

export async function logTaskChange(
  taskId: string,
  field: string,
  oldValue: string,
  newValue: string,
): Promise<void> {
  if (oldValue === newValue) return;
  const db = getFirebaseDb();
  await addDoc(collection(db, "tasks", taskId, "history"), {
    field,
    oldValue,
    newValue,
    changedAt: serverTimestamp(),
  });
}

export async function fetchTaskHistory(
  taskId: string,
): Promise<TaskHistoryEntry[]> {
  const db = getFirebaseDb();
  const q = query(
    collection(db, "tasks", taskId, "history"),
    orderBy("changedAt", "desc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    const changed = data.changedAt as Timestamp;
    return {
      id: d.id,
      field: String(data.field ?? ""),
      oldValue: String(data.oldValue ?? ""),
      newValue: String(data.newValue ?? ""),
      changedAt: changed?.toDate?.() ?? new Date(),
    };
  });
}
