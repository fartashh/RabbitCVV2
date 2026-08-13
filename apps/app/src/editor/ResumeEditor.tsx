import { useEffect, useRef, useState } from "react";
import { useGuestSession } from "../auth/GuestSessionProvider";
import { subscribeToPrimaryResume, updateResume } from "../resume/service";
import type { Resume } from "../resume/types";
import { useAutosave } from "./useAutosave";
import { ContactSection } from "./sections/ContactSection";
import { SummarySection } from "./sections/SummarySection";
import { ExperienceSection } from "./sections/ExperienceSection";
import { EducationSection } from "./sections/EducationSection";
import { SkillsSection } from "./sections/SkillsSection";
import "./editor.css";

export function ResumeEditor() {
  const { user } = useGuestSession();
  const [resume, setResume] = useState<Resume | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");

  // Once we've loaded a resume, this component's local state is the
  // source of truth for the rest of the session — see the comment on
  // `hasLoaded` below for why we don't keep syncing from the listener
  // after that point.
  const hasLoaded = useRef(false);

  useEffect(() => {
    if (!user) return;
    hasLoaded.current = false;
    const unsubscribe = subscribeToPrimaryResume(
      user.uid,
      (loaded) => {
        if (hasLoaded.current) return;
        hasLoaded.current = true;
        setResume(loaded);
      },
      (message) => setError(message)
    );
    return unsubscribe;
  }, [user]);

  const autosave = useAutosave<Resume>((next) => {
    setStatus("saving");
    updateResume(next.id, {
      label: next.label,
      contact: next.contact,
      summary: next.summary,
      experience: next.experience,
      education: next.education,
      skills: next.skills,
    })
      .then(() => setStatus("saved"))
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Could not save your changes.")
      );
  });

  function patch(fields: Partial<Resume>) {
    if (!resume) return;
    const next = { ...resume, ...fields };
    // Local state is authoritative for the rest of this session — see
    // the `hasLoaded` comment in the effect above. This intentionally
    // does NOT wait for the Firestore round-trip before updating what's
    // on screen, which is what makes typing feel instant.
    setResume(next);
    autosave(next);
  }

  if (error) {
    return (
      <p role="alert" style={{ color: "#b3261e", padding: 24 }}>
        {error}
      </p>
    );
  }

  if (!resume) {
    return <p style={{ padding: 24 }}>Loading your resume…</p>;
  }

  return (
    <div className="resume-editor">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <h1 style={{ fontSize: "1.1rem" }}>{resume.label || "My Resume"}</h1>
        <span style={{ fontSize: "0.8rem", opacity: 0.6 }}>
          {status === "saving" ? "Saving…" : status === "saved" ? "Saved" : ""}
        </span>
      </div>

      <ContactSection value={resume.contact} onChange={(contact) => patch({ contact })} />
      <SummarySection value={resume.summary} onChange={(summary) => patch({ summary })} />
      <ExperienceSection
        value={resume.experience}
        onChange={(experience) => patch({ experience })}
      />
      <EducationSection value={resume.education} onChange={(education) => patch({ education })} />
      <SkillsSection value={resume.skills} onChange={(skills) => patch({ skills })} />
    </div>
  );
}
