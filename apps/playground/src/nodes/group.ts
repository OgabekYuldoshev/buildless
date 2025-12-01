import type { Schema } from "@buildless/core";

export type GroupNodeProps = {
  title: string;
  grid: number;
};

export const GroupNode: Schema<GroupNodeProps> = {
  defaultProps: {
    title: "This is a group",
    grid: 2,
  },
  canHaveChildren: true
};
