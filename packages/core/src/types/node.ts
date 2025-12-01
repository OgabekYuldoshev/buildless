import type {
  DefaultProps,
  DefaultSchema,
  GetSchemaProps,
  GetSchemaType,
  NodeId,
  NodePosition,
} from "./utils";

export type Schema<Props extends DefaultProps = DefaultProps> = {
  props: Props;
  canHaveChildren?: boolean;
};

export type Node<
  Schema extends DefaultSchema = DefaultSchema,
  Type extends GetSchemaType<Schema> = GetSchemaType<Schema>,
  Props extends GetSchemaProps<Schema, Type> = GetSchemaProps<Schema, Type>
> = {
  id: NodeId;
  type: Type;
  props: Props;
  position: NodePosition;
  parentId: NodeId | null;
};
