import { useCallback, useMemo } from "react";
import {
  createEditor,
  Editor,
  Element as SlateElement,
  Transforms,
  type Descendant,
} from "slate";
import { withHistory } from "slate-history";
import {
  Editable,
  Slate,
  withReact,
  type RenderElementProps,
  type RenderLeafProps,
} from "slate-react";

// KAN-3 named rabbit hole: rich text formatting can absorb unlimited time.
// This field intentionally supports exactly three things — bold, italic,
// bulleted list — and nothing else. Don't add headings, links, tables,
// alignment, etc. without a deliberate decision to spend more cycle
// budget on it; Slate makes all of that easy to bolt on, which is
// precisely the trap.

type Mark = "bold" | "italic";

function toggleMark(editor: Editor, mark: Mark) {
  const isActive = isMarkActive(editor, mark);
  if (isActive) {
    Editor.removeMark(editor, mark);
  } else {
    Editor.addMark(editor, mark, true);
  }
}

function isMarkActive(editor: Editor, mark: Mark): boolean {
  const marks = Editor.marks(editor);
  return marks ? marks[mark] === true : false;
}

function toggleBulletedList(editor: Editor) {
  const isActive = isBlockActive(editor, "bulleted-list");
  Transforms.unwrapNodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === "bulleted-list",
    split: true,
  });
  // Slate's TS types for setNodes/wrapNodes want a partial that matches
  // exactly one member of the CustomElement union, which fights a
  // runtime toggle between two element types — the `as` casts here are
  // the pattern Slate's own docs use for this exact case, not a sign of
  // a real type hole (isBlockActive above is what keeps this correct at
  // runtime).
  Transforms.setNodes(
    editor,
    { type: isActive ? "paragraph" : "list-item" } as Partial<SlateElement> as any, // eslint-disable-line @typescript-eslint/no-explicit-any
    { match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) }
  );
  if (!isActive) {
    const block = { type: "bulleted-list", children: [] } as SlateElement;
    Transforms.wrapNodes(editor, block as any); // eslint-disable-line @typescript-eslint/no-explicit-any
  }
}

function isBlockActive(editor: Editor, type: string): boolean {
  const [match] = Editor.nodes(editor, {
    match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === type,
  });
  return !!match;
}

function Element({ attributes, children, element }: RenderElementProps) {
  switch (element.type) {
    case "bulleted-list":
      return <ul {...attributes}>{children}</ul>;
    case "list-item":
      return <li {...attributes}>{children}</li>;
    default:
      return <p {...attributes}>{children}</p>;
  }
}

function Leaf({ attributes, children, leaf }: RenderLeafProps) {
  if (leaf.bold) children = <strong>{children}</strong>;
  if (leaf.italic) children = <em>{children}</em>;
  return <span {...attributes}>{children}</span>;
}

function ToolbarButton({
  active,
  label,
  onMouseDown,
}: {
  active: boolean;
  label: string;
  onMouseDown: () => void;
}) {
  return (
    <button
      type="button"
      // mousedown (not click/onClick) so the editor's text selection
      // isn't lost before the toggle runs.
      onMouseDown={(e) => {
        e.preventDefault();
        onMouseDown();
      }}
      aria-pressed={active}
      style={{
        fontWeight: active ? 700 : 400,
        background: active ? "#e8e8e8" : "transparent",
        border: "1px solid #d0d0d0",
        borderRadius: 4,
        padding: "2px 8px",
        marginRight: 4,
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}

export function RichTextField({
  value,
  onChange,
  placeholder,
}: {
  value: Descendant[];
  onChange: (value: Descendant[]) => void;
  placeholder?: string;
}) {
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);
  const renderElement = useCallback((props: RenderElementProps) => <Element {...props} />, []);
  const renderLeaf = useCallback((props: RenderLeafProps) => <Leaf {...props} />, []);

  return (
    <Slate editor={editor} initialValue={value} onChange={onChange}>
      <div style={{ marginBottom: 4 }}>
        <ToolbarButton
          active={isMarkActive(editor, "bold")}
          label="B"
          onMouseDown={() => toggleMark(editor, "bold")}
        />
        <ToolbarButton
          active={isMarkActive(editor, "italic")}
          label="I"
          onMouseDown={() => toggleMark(editor, "italic")}
        />
        <ToolbarButton
          active={isBlockActive(editor, "bulleted-list")}
          label="• List"
          onMouseDown={() => toggleBulletedList(editor)}
        />
      </div>
      <Editable
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        placeholder={placeholder}
        style={{
          border: "1px solid #d0d0d0",
          borderRadius: 4,
          padding: "8px 10px",
          minHeight: 80,
        }}
      />
    </Slate>
  );
}
