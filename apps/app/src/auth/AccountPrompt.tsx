import { useState, type FormEvent } from "react";
import {
  classifyLinkError,
  linkGuestToAccount,
  signInToExistingAccount,
} from "./accountLink";
import "./account-prompt.css";

const DISMISS_KEY = "rabbitcv:account-prompt-dismissed";

// KAN-4: shown once the current guest resume has meaningful content (see
// resume/types.ts hasMeaningfulContent) and the session is still
// anonymous. Two states: a small dismissible banner (the "nudge"), and an
// expanded form when the user opts in. Dismissing stores a flag in
// localStorage so a page reload doesn't re-nag every time — this is a
// per-browser preference, not account data, so localStorage (not
// Firestore) is the right place for it.

function isDismissed(): boolean {
  try {
    return localStorage.getItem(DISMISS_KEY) === "1";
  } catch {
    // Storage can be unavailable (private browsing, etc.) — fail open,
    // i.e. just show the prompt again rather than crash.
    return false;
  }
}

function setDismissed() {
  try {
    localStorage.setItem(DISMISS_KEY, "1");
  } catch {
    // Nothing to do if storage isn't available — worst case the banner
    // reappears on reload.
  }
}

export function AccountPrompt({ visible }: { visible: boolean }) {
  const [dismissed, setDismissedState] = useState(isDismissed);
  const [expanded, setExpanded] = useState(false);
  const [mode, setMode] = useState<"create" | "signin">("create");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [linked, setLinked] = useState(false);

  if (!visible || dismissed) return null;

  function dismiss() {
    setDismissed();
    setDismissedState(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (mode === "create") {
        await linkGuestToAccount(email, password);
      } else {
        await signInToExistingAccount(email, password);
      }
      setLinked(true);
    } catch (err) {
      const classified = classifyLinkError(err);
      switch (classified.type) {
        case "email-in-use":
          // KAN-4 named rabbit hole: don't attempt account merge — offer
          // signing in to the existing account instead, and be explicit
          // that doing so leaves the current guest draft behind.
          setError(
            "That email already has an account. You can log in instead, " +
              "but this guest resume won't carry over to it — switch to " +
              "\"Log in\" below if that's okay."
          );
          break;
        case "weak-password":
          setError("Password should be at least 6 characters.");
          break;
        case "invalid-email":
          setError("That doesn't look like a valid email address.");
          break;
        case "unknown":
          setError(classified.message);
          break;
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (linked) {
    return (
      <div className="account-prompt account-prompt--done" role="status">
        Account created — this resume is saved to it now.
      </div>
    );
  }

  if (!expanded) {
    return (
      <div className="account-prompt account-prompt--banner" role="note">
        <span>Create an account to save this resume and come back to it later.</span>
        <div className="account-prompt__actions">
          <button type="button" onClick={() => setExpanded(true)}>
            Save my resume
          </button>
          <button type="button" className="account-prompt__dismiss" onClick={dismiss}>
            Not now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="account-prompt account-prompt--form">
      <div className="account-prompt__tabs">
        <button
          type="button"
          className={mode === "create" ? "active" : ""}
          onClick={() => {
            setMode("create");
            setError(null);
          }}
        >
          Create account
        </button>
        <button
          type="button"
          className={mode === "signin" ? "active" : ""}
          onClick={() => {
            setMode("signin");
            setError(null);
          }}
        >
          Log in
        </button>
        <button
          type="button"
          className="account-prompt__dismiss"
          onClick={() => setExpanded(false)}
          aria-label="Close"
        >
          ×
        </button>
      </div>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          autoComplete={mode === "create" ? "new-password" : "current-password"}
        />
        {error && (
          <p role="alert" className="account-prompt__error">
            {error}
          </p>
        )}
        <button type="submit" disabled={submitting}>
          {submitting
            ? "Working…"
            : mode === "create"
              ? "Create account"
              : "Log in"}
        </button>
      </form>
    </div>
  );
}
