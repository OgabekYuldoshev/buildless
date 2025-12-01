import type { DefaultSchema, GetSchema, GetSchemaType } from "./types";

export interface Registry<
  Schema extends DefaultSchema,
  Type extends GetSchemaType<Schema> = GetSchemaType<Schema>
> {
  getSchema(type: Type): GetSchema<Schema, Type>;
  canHaveChildren(type: Type): boolean;
}
export function createRegistry<
  Schema extends DefaultSchema,
  Type extends GetSchemaType<Schema> = GetSchemaType<Schema>
>(schemas: Schema) {
  const registry = new Map<Type, GetSchema<Schema, Type>>();

  for (const [type, schema] of Object.entries(schemas)) {
    registry.set(type as Type, schema as GetSchema<Schema, Type>);
  }

  function getSchema(type: Type) {
    const schema = registry.get(type);

    if (!schema) {
      throw new Error(`Schema with type ${String(type)} not found`);
    }

    return schema;
  }
  return {
    getSchema,
    canHaveChildren(type: Type) {
      const schema = getSchema(type);
      return schema.canHaveChildren ?? false;
    },
  };
}
