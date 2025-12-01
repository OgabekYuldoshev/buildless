import type { NodeSchema } from "@buildless/core";

export type InputNodeProps = {
  title: string;
  placeholder: string;
};

export const InputNode: NodeSchema<InputNodeProps> = {
  defaultProps: {
    title: "This is an input",
    placeholder: "Enter your input",
  },
};
