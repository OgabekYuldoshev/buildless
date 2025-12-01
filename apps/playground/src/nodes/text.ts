import type { NodeSchema } from "@buildless/core";

export type TextNodeProps = {
  content: string;
};

export const TextNode: NodeSchema<TextNodeProps> = {
  defaultProps: {
    content: "This is a text",
  },
};
