import { useEffect, useState } from "react";

// KAN-3 scope: skills as a flat list, entered comma-separated. No
// autocomplete/suggestions/categorization — that's speculative polish
// this cycle's pitch doesn't call for.
//
// Keeps its own raw-text state rather than deriving the input's value
// from `value.join(", ")` directly — otherwise typing "React, " gets its
// trailing comma silently eaten on every keystroke (join drops empty
// segments), which makes the field fight the user while they type.
export function SkillsSection({
  value,
  onChange,
}: {
  value: string[];
  onChange: (value: string[]) => void;
}) {
  const [text, setText] = useState(value.join(", "));

  // Stay in sync if the resume loads/reloads out from under us (e.g. the
  // initial Firestore snapshot arriving after this component mounts).
  useEffect(() => {
    setText(value.join(", "));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.join(", ")]);

  return (
    <section>
      <h2>Skills</h2>
      <input
        placeholder="TypeScript, React, Firebase, ... (comma-separated)"
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          onChange(
            e.target.value
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          );
        }}
      />
    </section>
  );
}
