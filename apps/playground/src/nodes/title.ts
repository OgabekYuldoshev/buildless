import type { NodeSchema } from "@buildless/core";

export type TitleNodeProps = {
  content: string;
};

export const TitleNode: NodeSchema<TitleNodeProps> = {
  defaultProps: {
    content: "This is a title",
  },
};
