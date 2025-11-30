import type { FieldSchema } from "@buildless/core";

export type TitleFieldProps = {
  content: string;
};

export const TitleField: FieldSchema<TitleFieldProps> = {
  defaultProps: {
    content: "",
  },
};

export type ButtonFieldProps = {
  title: string;
  varinat: "primary" | "secondary" | "tertiary" | "quaternary";
};

export const ButtonField: FieldSchema<ButtonFieldProps> = {
  defaultProps: {
    title: "Ask me",
    varinat: "primary",
  },
};

export const fields = {
  TEXT: TitleField,
  BUTTON: ButtonField,
};
