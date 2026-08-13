import type { EducationEntry } from "../../resume/types";

function blankEntry(): EducationEntry {
  return {
    id: crypto.randomUUID(),
    school: "",
    degree: "",
    field: "",
    startDate: "",
    endDate: "",
  };
}

export function EducationSection({
  value,
  onChange,
}: {
  value: EducationEntry[];
  onChange: (value: EducationEntry[]) => void;
}) {
  const update = (id: string, patch: Partial<EducationEntry>) =>
    onChange(value.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry)));

  const remove = (id: string) => onChange(value.filter((entry) => entry.id !== id));

  return (
    <section>
      <h2>Education</h2>
      {value.map((entry) => (
        <div className="entry-card" key={entry.id}>
          <button
            type="button"
            className="remove-btn"
            onClick={() => remove(entry.id)}
            aria-label="Remove education entry"
          >
            Remove
          </button>
          <div className="field-row">
            <input
              placeholder="School"
              value={entry.school}
              onChange={(e) => update(entry.id, { school: e.target.value })}
            />
          </div>
          <div className="field-row">
            <input
              placeholder="Degree (e.g. B.Sc.)"
              value={entry.degree}
              onChange={(e) => update(entry.id, { degree: e.target.value })}
            />
            <input
              placeholder="Field of study"
              value={entry.field}
              onChange={(e) => update(entry.id, { field: e.target.value })}
            />
          </div>
          <div className="field-row">
            <input
              placeholder="Start year"
              value={entry.startDate}
              onChange={(e) => update(entry.id, { startDate: e.target.value })}
            />
            <input
              placeholder="End year"
              value={entry.endDate}
              onChange={(e) => update(entry.id, { endDate: e.target.value })}
            />
          </div>
        </div>
      ))}
      <button type="button" className="add-btn" onClick={() => onChange([...value, blankEntry()])}>
        + Add education
      </button>
    </section>
  );
}
