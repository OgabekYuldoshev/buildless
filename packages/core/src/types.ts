export type FieldId = string & { __brand: "FieldId" };

export type DefaultProps = Record<string, string | number | boolean | null>;

export type FieldSchema<T extends DefaultProps = DefaultProps> = {
  defaultProps: T;
};

export type Field<
  T extends Record<string, FieldSchema> = Record<string, FieldSchema>
> = {
  id: FieldId;
  type: GetFieldSchemaType<T>;
  props: GetFieldSchemaByType<T, GetFieldSchemaType<T>>["defaultProps"];
  position: string;
  parentId: FieldId | null;
};

export type GetFieldSchemaType<T extends Record<string, FieldSchema>> = keyof T;

export type GetFieldSchema<T extends Record<string, FieldSchema>> =
  T[GetFieldSchemaType<T>];

export type GetFieldSchemaByType<
  T extends Record<string, FieldSchema>,
  Key extends GetFieldSchemaType<T>
> = T[Key];
