export type NodeId = string & { __brand: "NodeId" };

export type DefaultProps = Record<string, string | number | boolean | null | object>;

export type NodeSchema<T extends DefaultProps = DefaultProps> = {
	defaultProps: T;
	canHaveChildren?: boolean;
};

export type Node<
	Schema extends Record<string, NodeSchema> = Record<string, NodeSchema>,
	Type extends NodeSchemaType<Schema> = string
> = {
	id: NodeId;
	type: Type;
	props: NodeSchemaByType<Schema, Type>["defaultProps"];
	position: string;
	parentId: NodeId | null;
};

export type NodeSchemaType<T extends Record<string, NodeSchema>> = keyof T;

export type NodeSchemaByType<
	T extends Record<string, NodeSchema>,
	Key extends NodeSchemaType<T>,
> = T[Key];
