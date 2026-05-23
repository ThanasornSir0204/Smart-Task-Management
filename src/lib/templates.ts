import { getFirebaseDb } from "@/config/firebase";
import { formatDateYMD, todayYMD } from "@/lib/taskHelpers";
import { mapFirestoreTemplate } from "@/lib/taskMapper";
import type { TaskTemplate } from "@/types/task";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";

export function subscribeTemplates(
  userId: string,
  onData: (templates: TaskTemplate[]) => void,
  onError: (err: Error) => void,
): () => void {
  const db = getFirebaseDb();
  const q = query(
    collection(db, "taskTemplates"),
    where("userId", "==", userId),
  );
  return onSnapshot(
    q,
    (snap) => {
      onData(
        snap.docs.map((d) =>
          mapFirestoreTemplate(d.id, d.data() as Record<string, unknown>),
        ),
      );
    },
    (err) => onError(err),
  );
}

export async function createTemplate(
  userId: string,
  template: Omit<TaskTemplate, "id" | "userId">,
): Promise<void> {
  const db = getFirebaseDb();
  await addDoc(collection(db, "taskTemplates"), {
    userId,
    ...template,
    createdAt: serverTimestamp(),
  });
}

export async function deleteTemplate(templateId: string): Promise<void> {
  const db = getFirebaseDb();
  await deleteDoc(doc(db, "taskTemplates", templateId));
}

export function deadlineFromTemplate(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return formatDateYMD(d) || todayYMD();
}
