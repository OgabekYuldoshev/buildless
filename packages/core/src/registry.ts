import type {
	FieldSchema,
	GetFieldSchema,
	GetFieldSchemaByType,
	GetFieldSchemaType,
} from "./types";

interface RegistryOptions<T extends Record<string, FieldSchema>> {
	fields: T;
}

export interface Registry<T extends Record<string, FieldSchema>> {
	getFieldSchema<Type extends GetFieldSchemaType<T>>(type: Type): GetFieldSchemaByType<T, Type>;
}

export function createRegistry<T extends Record<string, FieldSchema>>({
	fields,
}: RegistryOptions<T>): Registry<T> {
	const registry = new Map<GetFieldSchemaType<T>, GetFieldSchema<T>>(
		Object.entries(fields).map(([key, value]) => [
			key as GetFieldSchemaType<T>,
			value as GetFieldSchema<T>,
		]),
	);

	return {
		getFieldSchema<Type extends GetFieldSchemaType<T>>(type: Type) {
			const fieldSchema = registry.get(type);

			if (!fieldSchema) {
				throw new Error(`Field schema with type ${String(type)} not found`);
			}

			return fieldSchema as GetFieldSchemaByType<T, Type>;
		},
	};
}
