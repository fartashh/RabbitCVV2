import { useGuestSession } from "./auth/GuestSessionProvider";
import { ResumeEditor } from "./editor/ResumeEditor";
import "./App.css";

function App() {
  const { user, loading, error } = useGuestSession();

  if (loading) {
    return (
      <section id="center">
        <p>Starting your session…</p>
      </section>
    );
  }

  if (error) {
    return (
      <section id="center">
        <p role="alert" style={{ color: "#b3261e" }}>
          {error}
        </p>
      </section>
    );
  }

  // KAN-2 established the session (no login wall); KAN-3 is what's
  // actually rendered once that session exists.
  if (user) {
    return <ResumeEditor />;
  }

  return null;
}

export default App;
