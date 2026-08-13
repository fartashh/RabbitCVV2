import type { ContactInfo } from "../../resume/types";

export function ContactSection({
  value,
  onChange,
}: {
  value: ContactInfo;
  onChange: (value: ContactInfo) => void;
}) {
  const set = (field: keyof ContactInfo) => (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange({ ...value, [field]: e.target.value });

  return (
    <section>
      <h2>Contact</h2>
      <div className="field-row">
        <input placeholder="Full name" value={value.name} onChange={set("name")} />
      </div>
      <div className="field-row">
        <input placeholder="Email" value={value.email} onChange={set("email")} />
        <input placeholder="Phone" value={value.phone} onChange={set("phone")} />
      </div>
      <div className="field-row">
        <input placeholder="Location" value={value.location} onChange={set("location")} />
      </div>
    </section>
  );
}
