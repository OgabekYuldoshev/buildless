import { createQuery, type Query } from "./query";
import { Registry } from "./registry";
import { Subscriber, type SubscriberCallback } from "./subscriber";
import type {
  Field,
  FieldId,
  FieldSchema,
  GetFieldSchemaByType,
  GetFieldSchemaType,
} from "./types";
import { generateKeyBetween } from "./utils/fractional-indexing";
import { generateId } from "./utils/uuid";

export interface BuilderOptions<T extends Record<string, FieldSchema>> {
  subscriber: Subscriber<T>;
  registry: Registry<T>;
}

export class Builder<T extends Record<string, FieldSchema>> {
  private subscriber: Subscriber<T>;
  private registry: Registry<T>;
  private query: Query<Field[]> | null = null;
  private state: Map<FieldId, Field<T>>;
  private cachedState: Field<T>[] | null = null;

  constructor({ subscriber, registry }: BuilderOptions<T>) {
    this.subscriber = subscriber;
    this.registry = registry;
    this.state = new Map();
  }

  private invalidateCachedState() {
    this.cachedState = null;
    this.query = null;
  }

  private getFields() {
    return Array.from(this.state.values());
  }

  private validateFieldIndex(index: number, maxLength: number) {
    if (index < 0 || index > maxLength) {
      throw new Error(
        `Invalid index ${index}. Must be between 0 and ${maxLength}`
      );
    }
  }

  private calculateFieldPosition(index: number, fields: Field[]): string {
    const prevField = index > 0 ? fields[index - 1] : null;
    const nextField = index < fields.length ? fields[index] : null;
    const prevPosition = prevField?.position ?? null;
    const nextPosition = nextField?.position ?? null;
    return generateKeyBetween(prevPosition, nextPosition);
  }

  private getQuery() {
    if (this.query) {
      return this.query;
    }

    this.query = createQuery(this.getFields());

    return this.query;
  }

  public insert<Type extends GetFieldSchemaType<T>>(options: {
    type: Type;
    index: number;
    parentId?: FieldId | null;
    defaultProps?: Partial<GetFieldSchemaByType<T, Type>["defaultProps"]>;
  }) {
    const { type, index, parentId = null, defaultProps = {} } = options;
    const fieldSchema = this.registry.getFieldSchema(type);

    if (parentId !== null && !this.state.has(parentId)) {
      throw new Error(
        `Cannot insert: Parent field with id "${parentId}" does not exist`
      );
    }

    const query = this.getQuery();
    const fields = parentId
      ? query.getChildrenNodes(parentId)
      : query.getRootNodes();

    this.validateFieldIndex(index, fields.length);

    const id = generateId();

    const position = this.calculateFieldPosition(index, fields);

    const field: Field<T> = {
      id,
      type,
      props: {
        ...fieldSchema.defaultProps,
        ...defaultProps,
      },
      position,
      parentId,
    };

    this.state.set(id, field);

    this.invalidateCachedState();

    this.subscriber.emitChanges(this.getState());

    return field;
  }

  update<Type extends GetFieldSchemaType<T>>(options: {
    id: FieldId;
    type: Type;
    props: Partial<GetFieldSchemaByType<T, Type>["defaultProps"]>;
  }) {
    const { id, type, props } = options;

    const field = this.state.get(id);

    if (!field) {
      throw new Error(`Cannot update: Field with id "${id}" does not exist`);
    }

    const updatedField: Field<T> = {
      ...field,
      type,
      props: {
        ...field.props,
        ...props,
      },
    };

    this.state.set(id, updatedField);

    this.invalidateCachedState();

    this.subscriber.emitChanges(this.getState());

    return updatedField;
  }

  delete(id: FieldId) {
    if (!this.state.has(id)) {
      throw new Error(`Cannot delete: Field with id "${id}" does not exist`);
    }

    const query = this.getQuery();

    const recursivelyRemove = (id: FieldId) => {
      const children = query.getChildrenNodes(id);

      for (const child of children) {
        recursivelyRemove(child.id);
      }

      this.state.delete(id);
    };

    recursivelyRemove(id);

    this.invalidateCachedState();

    this.subscriber.emitChanges(this.getState());
  }

  move(options: {
    id: FieldId;
    newIndex: number;
    newParentId?: FieldId | null;
  }) {
    const { id, newIndex, newParentId = null } = options;

    const field = this.state.get(id);

    if (!field) {
      throw new Error(`Cannot update: Field with id "${id}" does not exist`);
    }

    const targetParentId =
      newParentId === undefined ? field.parentId : newParentId;

    if (targetParentId !== null && !this.state.has(targetParentId)) {
      throw new Error(
        `Cannot move: Target parent field with id "${targetParentId}" does not exist`
      );
    }

    if (targetParentId !== null) {
      let currentId: FieldId | null = targetParentId;
      while (currentId !== null) {
        if (currentId === id) {
          throw new Error(
            `Cannot move: Node "${id}" cannot be moved to its own descendant`
          );
        }
        const parentNode = this.state.get(currentId);
        currentId = parentNode?.parentId ?? null;
      }
    }

    const query = this.getQuery();
    const targetFields = newParentId
      ? query.getChildrenNodes(newParentId)
      : query.getRootNodes();

    const filteredFields = targetFields.filter((n) => n.id !== id);

    this.validateFieldIndex(newIndex, filteredFields.length);

    const position = this.calculateFieldPosition(newIndex, filteredFields);

    const updatedField: Field<T> = {
      ...field,
      position,
      parentId: targetParentId,
    };

    this.state.set(id, updatedField);

    this.invalidateCachedState();

    this.subscriber.emitChanges(this.getState());

    return updatedField;
  }

  public getState(): readonly Field<T>[] {
    if (this.cachedState) {
      return [...this.cachedState];
    }

    this.cachedState = [...this.getFields()];

    return this.cachedState;
  }

  public subscribe(callback: SubscriberCallback<T>) {
    return this.subscriber.subscribe(callback);
  }
}

export interface BuilderProps<T extends Record<string, FieldSchema>> {
  fields: T;
}
export function createBuilder<T extends Record<string, FieldSchema>>({
  fields,
}: BuilderProps<T>): Builder<T> {
  const subscriber = new Subscriber<T>();
  const registry = new Registry<T>({ fields });
  const builder = new Builder<T>({ subscriber, registry });
  return builder;
}
