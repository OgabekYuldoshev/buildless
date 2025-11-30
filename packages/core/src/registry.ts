import type {
	NodeSchema,
	NodeSchemaByType,
	NodeSchemaType,
} from "./types";

interface CreateRegistryOptions<T extends Record<string, NodeSchema>> {
	nodes: T;
}

export interface Registry<T extends Record<string, NodeSchema>> {
	getNodeSchema<Type extends NodeSchemaType<T>>(type: Type): NodeSchemaByType<T, Type>;
}

export function createRegistry<T extends Record<string, NodeSchema>>({
	nodes,
}: CreateRegistryOptions<T>): Registry<T> {
	const registry = new Map<NodeSchemaType<T>, NodeSchemaByType<T, NodeSchemaType<T>>>(
		Object.entries(nodes).map(([key, value]) => [
			key as NodeSchemaType<T>,
			value as NodeSchemaByType<T, NodeSchemaType<T>>,
		]),
	);

	return {
		getNodeSchema<Type extends NodeSchemaType<T>>(type: Type) {
			const nodeSchema = registry.get(type);

			if (!nodeSchema) {
				throw new Error(`Node schema with type ${String(type)} not found`);
			}

			return nodeSchema as NodeSchemaByType<T, Type>;
		},
	};
}
