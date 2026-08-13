import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  query,
  updateDoc,
  where,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { createBlankResume, type Resume } from "./types";

// KAN-3 scope: one resume per (guest or real) user, found-or-created on
// load. KAN-5/KAN-6 (dashboard, clone) will introduce multiple resumes
// per user — this module's shape (a `resumes` collection keyed by
// ownerId) already supports that, we're just not building the UI for it
// yet, per the pitch's scoping.

const RESUMES = "resumes";

/**
 * Subscribes to the current user's first resume, creating one if none
 * exists yet. Returns an unsubscribe function. `onChange` fires with the
 * resume once it's available, and again on every remote update.
 */
export function subscribeToPrimaryResume(
  ownerId: string,
  onChange: (resume: Resume) => void,
  onError: (message: string) => void
): Unsubscribe {
  const q = query(collection(db, RESUMES), where("ownerId", "==", ownerId));

  let unsubscribed = false;
  let creating = false;

  const unsubscribe = onSnapshot(
    q,
    async (snapshot) => {
      if (unsubscribed) return;

      if (!snapshot.empty) {
        const first = snapshot.docs[0];
        onChange({ id: first.id, ...(first.data() as Omit<Resume, "id">) });
        return;
      }

      // No resume yet for this user — create one. Guard against the
      // snapshot listener firing again (e.g. from our own write) and
      // racing a second create.
      if (creating) return;
      creating = true;
      try {
        await addDoc(collection(db, RESUMES), createBlankResume(ownerId));
        // The listener fires again once the new doc is visible; no need
        // to call onChange here.
      } catch (err) {
        onError(
          err instanceof Error ? err.message : "Could not create your resume."
        );
      } finally {
        creating = false;
      }
    },
    (err) => onError(err.message)
  );

  return () => {
    unsubscribed = true;
    unsubscribe();
  };
}

/** Partial update, autosave-style. Caller is responsible for debouncing —
 * see editor/useAutosave.ts. */
export async function updateResume(
  resumeId: string,
  patch: Partial<Omit<Resume, "id" | "ownerId" | "createdAt">>
): Promise<void> {
  // Client timestamp rather than serverTimestamp(): this is a debounced
  // autosave, not something needing server-authoritative ordering, and a
  // plain number keeps the Resume type simple (no Firestore Timestamp
  // conversion on read).
  await updateDoc(doc(db, RESUMES, resumeId), {
    ...patch,
    updatedAt: Date.now(),
  });
}
