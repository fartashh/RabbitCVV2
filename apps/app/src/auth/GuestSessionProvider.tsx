import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInAnonymously,
  type User,
} from "firebase/auth";
import { auth } from "../lib/firebase";

// KAN-2: a first-time visitor lands straight in the editor with no login
// wall. We open a silent Firebase anonymous session so there's a stable
// user id to attach drafts to from the very first keystroke — later
// (KAN-4) that anonymous account gets linked to a real one instead of
// losing the draft.

type GuestSessionState = {
  user: User | null;
  /** True until we know whether there's a session (existing or freshly
   * created). The editor should not render/autosave before this settles. */
  loading: boolean;
  error: string | null;
};

const GuestSessionContext = createContext<GuestSessionState | undefined>(
  undefined
);

export function GuestSessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GuestSessionState>({
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    // onAuthStateChanged fires once immediately with the current session
    // (persisted across reloads by default), then again on any change.
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setState({ user, loading: false, error: null });
        return;
      }

      // No session yet (first visit, or a signed-out state) — open one
      // silently. The resulting user fires this same callback again.
      try {
        await signInAnonymously(auth);
      } catch (err) {
        setState({
          user: null,
          loading: false,
          error:
            err instanceof Error
              ? err.message
              : "Could not start a session. Check your connection and try again.",
        });
      }
    });

    return unsubscribe;
  }, []);

  return (
    <GuestSessionContext.Provider value={state}>
      {children}
    </GuestSessionContext.Provider>
  );
}

export function useGuestSession() {
  const ctx = useContext(GuestSessionContext);
  if (!ctx) {
    throw new Error("useGuestSession must be used inside GuestSessionProvider");
  }
  return ctx;
}
