import type { NodeSchema } from "@buildless/core";

export type GroupNodeProps = {
  title: string;
  grid: number;
};

export const GroupNode: NodeSchema<GroupNodeProps> = {
  defaultProps: {
    title: "This is a group",
    grid: 2,
  },
  canHaveChildren: true
};
