import {
  EmailAuthProvider,
  linkWithCredential,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../lib/firebase";

// KAN-4: converting a guest to a real account is done by *linking* a
// credential onto the existing anonymous Firebase user (linkWithCredential),
// not by creating a brand-new user. That keeps auth.currentUser.uid
// unchanged, which is the whole trick — resumes.ownerId already points at
// that uid (see resume/service.ts), so the existing draft becomes the new
// account's data with no migration step at all.

export type LinkAccountError =
  | { type: "email-in-use" }
  | { type: "weak-password" }
  | { type: "invalid-email" }
  | { type: "unknown"; message: string };

/** Upgrades the current anonymous session to a permanent email/password
 * account in place. Throws on failure — callers should route the error
 * through `classifyLinkError` for user-facing handling. */
export async function linkGuestToAccount(
  email: string,
  password: string
): Promise<void> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("No active session to attach an account to.");
  }
  const credential = EmailAuthProvider.credential(email, password);
  await linkWithCredential(user, credential);
}

/** KAN-4 rabbit hole fallback: if the email is already registered to a
 * different account, we don't attempt to merge — the user can sign in to
 * that existing account instead. Doing so switches auth.currentUser away
 * from the current anonymous user, so the in-progress guest draft is left
 * behind (not deleted, just no longer reachable) — this is the documented,
 * accepted no-go, not an oversight. */
export async function signInToExistingAccount(
  email: string,
  password: string
): Promise<void> {
  await signInWithEmailAndPassword(auth, email, password);
}

export function classifyLinkError(err: unknown): LinkAccountError {
  const code = (err as { code?: string } | undefined)?.code;
  switch (code) {
    case "auth/email-already-in-use":
    case "auth/credential-already-in-use":
      return { type: "email-in-use" };
    case "auth/weak-password":
      return { type: "weak-password" };
    case "auth/invalid-email":
      return { type: "invalid-email" };
    default:
      return {
        type: "unknown",
        message: err instanceof Error ? err.message : "Something went wrong.",
      };
  }
}
