import type { ExperienceEntry } from "../../resume/types";
import { emptyRichText } from "../../resume/types";
import { RichTextField } from "../RichTextField";

function blankEntry(): ExperienceEntry {
  return {
    id: crypto.randomUUID(),
    company: "",
    title: "",
    location: "",
    startDate: "",
    endDate: "",
    current: false,
    bullets: emptyRichText,
  };
}

export function ExperienceSection({
  value,
  onChange,
}: {
  value: ExperienceEntry[];
  onChange: (value: ExperienceEntry[]) => void;
}) {
  const update = (id: string, patch: Partial<ExperienceEntry>) =>
    onChange(value.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry)));

  const remove = (id: string) => onChange(value.filter((entry) => entry.id !== id));

  return (
    <section>
      <h2>Experience</h2>
      {value.map((entry) => (
        <div className="entry-card" key={entry.id}>
          <button
            type="button"
            className="remove-btn"
            onClick={() => remove(entry.id)}
            aria-label="Remove experience entry"
          >
            Remove
          </button>
          <div className="field-row">
            <input
              placeholder="Title"
              value={entry.title}
              onChange={(e) => update(entry.id, { title: e.target.value })}
            />
            <input
              placeholder="Company"
              value={entry.company}
              onChange={(e) => update(entry.id, { company: e.target.value })}
            />
          </div>
          <div className="field-row">
            <input
              placeholder="Location"
              value={entry.location}
              onChange={(e) => update(entry.id, { location: e.target.value })}
            />
          </div>
          <div className="field-row">
            <input
              placeholder="Start (e.g. Jan 2022)"
              value={entry.startDate}
              onChange={(e) => update(entry.id, { startDate: e.target.value })}
            />
            <input
              placeholder="End (e.g. Present)"
              value={entry.endDate}
              disabled={entry.current}
              onChange={(e) => update(entry.id, { endDate: e.target.value })}
            />
            <label className="current-toggle">
              <input
                type="checkbox"
                checked={entry.current}
                onChange={(e) =>
                  update(entry.id, {
                    current: e.target.checked,
                    endDate: e.target.checked ? "Present" : "",
                  })
                }
              />
              Current
            </label>
          </div>
          <RichTextField
            value={entry.bullets}
            onChange={(bullets) => update(entry.id, { bullets })}
            placeholder="What did you do? Use bullets for impact statements."
          />
        </div>
      ))}
      <button type="button" className="add-btn" onClick={() => onChange([...value, blankEntry()])}>
        + Add experience
      </button>
    </section>
  );
}
