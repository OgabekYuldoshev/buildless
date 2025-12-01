import type { BuildlessConfig } from "./buildless";
import type { Schema } from "./node";


export type NodeId = string & { __brand: "NodeId" };

export type NodePosition = string;

export type DefaultProps = Record<
  string,
  string | number | boolean | object | null
>;

export type DefaultSchema = Record<string, Schema>;

export type GetSchemaType<Schema extends DefaultSchema> = keyof Schema;

export type GetSchemaProps<
  Schema extends DefaultSchema,
  Type extends GetSchemaType<Schema>
> = GetSchema<Schema, Type>["props"];

export type GetSchema<
  Schema extends DefaultSchema,
  Type extends GetSchemaType<Schema>
> = Schema[Type];

export type GetSchemaFromConfig<Config extends BuildlessConfig> =
  Config["schema"];
  
export type MapSchemaToTypes<Schema extends DefaultSchema> = {
  [K in keyof Schema]: GetSchema<Schema, K>;
};
