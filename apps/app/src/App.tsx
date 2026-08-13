import { useGuestSession } from "./auth/GuestSessionProvider";
import "./App.css";

// KAN-2 scope: prove a first-time visitor gets a persistent guest session
// with no login wall. The real structured editor is KAN-3 — this is
// intentionally a thin placeholder so that scope stays separate and this
// one is demoable/reviewable on its own.
function App() {
  const { user, loading, error } = useGuestSession();

  return (
    <section id="center">
      <div>
        <h1>RabbitCV</h1>
        {loading && <p>Starting your session…</p>}
        {error && (
          <p role="alert" style={{ color: "#b3261e" }}>
            {error}
          </p>
        )}
        {!loading && !error && user && (
          <>
            <p>
              You're in — no account needed. Your resume will be here if you
              reload or come back later.
            </p>
            <p style={{ opacity: 0.6, fontSize: "0.85rem" }}>
              Guest session: {user.uid}
            </p>
          </>
        )}
      </div>
    </section>
  );
}

export default App;
