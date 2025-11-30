import type {
  FieldSchema,
  GetFieldSchema,
  GetFieldSchemaByType,
  GetFieldSchemaType,
} from "./types";

interface RegistryOptions<T extends Record<string, FieldSchema>> {
  fields: T;
}

export class Registry<T extends Record<string, FieldSchema>> {
  private registry: Map<GetFieldSchemaType<T>, GetFieldSchema<T>>;

  constructor({ fields }: RegistryOptions<T>) {
    this.registry = new Map(
      Object.entries(fields).map(([key, value]) => [
        key as GetFieldSchemaType<T>,
        value as GetFieldSchema<T>,
      ])
    );
  }

  public getFieldSchema<Type extends GetFieldSchemaType<T>>(type: Type) {
    const fieldSchema = this.registry.get(type);

    if (!fieldSchema) {
      throw new Error(`Field schema with type ${String(type)} not found`);
    }

    return fieldSchema as GetFieldSchemaByType<T, Type>;
  }
}
