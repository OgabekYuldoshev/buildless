import { GroupNode } from "./group";
import { InputNode } from "./input";
import { SelectNode } from "./select";
import { TextNode } from "./text";
import { TextareaNode } from "./textarea";
import { TitleNode } from "./title";

export const nodes = {
  title: TitleNode,
  text: TextNode,
  group: GroupNode,
  input: InputNode,
  select: SelectNode,
  textarea: TextareaNode,
};

export type NodeType = keyof typeof nodes;
export type NodeSchema = typeof nodes;

export const nodesByCategory: Record<string, NodeType[]> = {
  title: ["title", "text"],
  form: ["input", "select", "textarea"],
  layout: ["group"],
};
