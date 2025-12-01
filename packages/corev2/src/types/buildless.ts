import type { DefaultSchema, GetSchemaFromConfig, GetSchemaType, MapSchemaToTypes } from "./utils";

export type BuildlessConfig = {
  readonly schema: DefaultSchema;
};

export type BuildlessGenerics<
  Config extends BuildlessConfig = BuildlessConfig,
  Schema extends GetSchemaFromConfig<Config> = GetSchemaFromConfig<Config>,
  Types extends GetSchemaType<Schema> = GetSchemaType<Schema>,
  Schemas extends MapSchemaToTypes<Schema> = MapSchemaToTypes<Schema>
> = {
  Types: Types;
  Schemas: Schemas;
};