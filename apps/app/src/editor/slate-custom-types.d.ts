// Slate's TypeScript types are generic by default and need module
// augmentation to know our custom element/mark shape. See
// https://docs.slatejs.org/concepts/12-typescript
import type { BaseEditor } from "slate";
import type { HistoryEditor } from "slate-history";
import type { ReactEditor } from "slate-react";

type ParagraphElement = { type: "paragraph"; children: CustomText[] };
type BulletedListElement = { type: "bulleted-list"; children: ListItemElement[] };
type ListItemElement = { type: "list-item"; children: CustomText[] };

type CustomElement = ParagraphElement | BulletedListElement | ListItemElement;

type CustomText = { text: string; bold?: boolean; italic?: boolean };

declare module "slate" {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor & HistoryEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}
