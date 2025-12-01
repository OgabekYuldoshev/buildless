import type { NodeSchema } from "@buildless/core";

export type SelectNodeProps = {
  title: string;
  placeholder: string;
  options: Array<{
    label: string;
    value: string;
  }>;
};

export const SelectNode: NodeSchema<SelectNodeProps> = {
  defaultProps: {
    title: "This is a select",
    placeholder: "Select an option",
    options: [],
  },
};
