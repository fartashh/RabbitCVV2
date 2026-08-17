import type { Descendant } from "slate";

// KAN-3 data model. Kept deliberately flat and simple for Cycle 1 — dates
// are free-text ("Jan 2022") rather than structured date pickers, and
// there's no notion of templates/themes yet (that's a later cycle).
// KAN-6 (clone) duplicates a whole Resume document as-is, so anything
// added here should stay easy to deep-copy.

export type RichText = Descendant[];

export interface ContactInfo {
  name: string;
  email: string;
  phone: string;
  location: string;
}

export interface ExperienceEntry {
  id: string;
  company: string;
  title: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  /** Rich text, capped to bold/italic/bulleted-list per the pitch's named
   * rabbit hole — see editor/RichTextField.tsx. */
  bullets: RichText;
}

export interface EducationEntry {
  id: string;
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
}

export interface Resume {
  id: string;
  ownerId: string;
  /** User-facing label, e.g. "Frontend Engineer @ Acme" — this is what
   * KAN-6's clone flow prompts for for a new version. */
  label: string;
  contact: ContactInfo;
  summary: string;
  experience: ExperienceEntry[];
  education: EducationEntry[];
  skills: string[];
  createdAt: number;
  updatedAt: number;
}

export const emptyRichText: RichText = [{ type: "paragraph", children: [{ text: "" }] }];

/** KAN-4: the account-creation prompt only makes sense once there's
 * something worth not losing. "Meaningful" is deliberately loose — a name
 * or a first experience entry — rather than trying to score resume
 * completeness. */
export function hasMeaningfulContent(resume: Resume): boolean {
  return Boolean(resume.contact.name.trim()) || resume.experience.length > 0;
}

export function createBlankResume(ownerId: string, label = "My Resume"): Omit<Resume, "id"> {
  const now = Date.now();
  return {
    ownerId,
    label,
    contact: { name: "", email: "", phone: "", location: "" },
    summary: "",
    experience: [],
    education: [],
    skills: [],
    createdAt: now,
    updatedAt: now,
  };
}
