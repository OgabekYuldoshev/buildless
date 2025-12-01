import type { NodeSchema } from "@buildless/core";

export type TextareaNodeProps = {
  title: string;
  placeholder: string;
  rows: number;
};

export const TextareaNode: NodeSchema<TextareaNodeProps> = {
  defaultProps: {
    title: "This is a textarea",
    placeholder: "Enter your textarea",
    rows: 6,
  },
};
