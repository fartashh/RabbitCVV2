export function SummarySection({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <section>
      <h2>Summary</h2>
      <textarea
        placeholder="A couple of sentences on who you are and what you're looking for."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </section>
  );
}
