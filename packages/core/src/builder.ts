import { createQuery, type Query } from "./query";
import type { SubscriberCallback } from "./subscriber";
import type {
  Field,
  FieldId,
  FieldSchema,
  GetFieldSchemaByType,
  GetFieldSchemaType,
} from "./types";
import { generateKeyBetween } from "./utils/fractional-indexing";
import { generateId } from "./utils/uuid";

export interface Builder<T extends Record<string, FieldSchema>> {
  insert<Type extends GetFieldSchemaType<T>>(options: {
    type: Type;
    index: number;
    parentId?: FieldId | null;
    defaultProps?: Partial<GetFieldSchemaByType<T, Type>["defaultProps"]>;
  }): Field<T>;
  update<Type extends GetFieldSchemaType<T>>(options: {
    id: FieldId;
    type: Type;
    props: Partial<GetFieldSchemaByType<T, Type>["defaultProps"]>;
  }): Field<T>;
  delete(id: FieldId): void;
  move(options: {
    id: FieldId;
    newIndex: number;
    newParentId?: FieldId | null;
  }): Field<T>;
  getState(): readonly Field<T>[];
  subscribe(callback: SubscriberCallback<T>): () => void;
}

import { createSubscriber } from "./subscriber";
import { createRegistry } from "./registry";

export interface BuilderProps<T extends Record<string, FieldSchema>> {
  fields: T;
}
export function createBuilder<T extends Record<string, FieldSchema>>({
  fields,
}: BuilderProps<T>): Builder<T> {
  const subscriber = createSubscriber<T>();
  const registry = createRegistry<T>({ fields });
  let query: Query<Field[]> | null = null;
  const state = new Map<FieldId, Field<T>>();
  let cachedState: Field<T>[] | null = null;

  function invalidateCachedState() {
    cachedState = null;
    query = null;
  }

  function getFields() {
    return Array.from(state.values());
  }

  function validateFieldIndex(index: number, maxLength: number) {
    if (index < 0 || index > maxLength) {
      throw new Error(
        `Invalid index ${index}. Must be between 0 and ${maxLength}`
      );
    }
  }

  function calculateFieldPosition(index: number, fields: Field[]): string {
    const prevField = index > 0 ? fields[index - 1] : null;
    const nextField = index < fields.length ? fields[index] : null;
    const prevPosition = prevField?.position ?? null;
    const nextPosition = nextField?.position ?? null;
    return generateKeyBetween(prevPosition, nextPosition);
  }

  function getQuery() {
    if (query) {
      return query;
    }

    query = createQuery(getFields());

    return query;
  }

  function getState(): readonly Field<T>[] {
    if (cachedState) {
      return [...cachedState];
    }

    cachedState = [...getFields()];

    return cachedState;
  }

  return {
    insert<Type extends GetFieldSchemaType<T>>(options: {
      type: Type;
      index: number;
      parentId?: FieldId | null;
      defaultProps?: Partial<GetFieldSchemaByType<T, Type>["defaultProps"]>;
    }) {
      const { type, index, parentId = null, defaultProps = {} } = options;
      const fieldSchema = registry.getFieldSchema(type);

      if (parentId !== null && !state.has(parentId)) {
        throw new Error(
          `Cannot insert: Parent field with id "${parentId}" does not exist`
        );
      }

      const queryInstance = getQuery();
      const fields = parentId
        ? queryInstance.getChildrenNodes(parentId)
        : queryInstance.getRootNodes();

      validateFieldIndex(index, fields.length);

      const id = generateId();

      const position = calculateFieldPosition(index, fields);

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

      state.set(id, field);

      invalidateCachedState();

      subscriber.emitChanges(getState());

      return field;
    },

    update<Type extends GetFieldSchemaType<T>>(options: {
      id: FieldId;
      type: Type;
      props: Partial<GetFieldSchemaByType<T, Type>["defaultProps"]>;
    }) {
      const { id, type, props } = options;

      const field = state.get(id);

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

      state.set(id, updatedField);

      invalidateCachedState();

      subscriber.emitChanges(getState());

      return updatedField;
    },

    delete(id: FieldId) {
      if (!state.has(id)) {
        throw new Error(`Cannot delete: Field with id "${id}" does not exist`);
      }

      const queryInstance = getQuery();

      const recursivelyRemove = (id: FieldId) => {
        const children = queryInstance.getChildrenNodes(id);

        for (const child of children) {
          recursivelyRemove(child.id);
        }

        state.delete(id);
      };

      recursivelyRemove(id);

      invalidateCachedState();

      subscriber.emitChanges(getState());
    },

    move(options: {
      id: FieldId;
      newIndex: number;
      newParentId?: FieldId | null;
    }) {
      const { id, newIndex, newParentId = null } = options;

      const field = state.get(id);

      if (!field) {
        throw new Error(`Cannot update: Field with id "${id}" does not exist`);
      }

      const targetParentId =
        newParentId === undefined ? field.parentId : newParentId;

      if (targetParentId !== null && !state.has(targetParentId)) {
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
          const parentNode = state.get(currentId);
          currentId = parentNode?.parentId ?? null;
        }
      }

      const queryInstance = getQuery();
      const targetFields = newParentId
        ? queryInstance.getChildrenNodes(newParentId)
        : queryInstance.getRootNodes();

      const filteredFields = targetFields.filter((n) => n.id !== id);

      validateFieldIndex(newIndex, filteredFields.length);

      const position = calculateFieldPosition(newIndex, filteredFields);

      const updatedField: Field<T> = {
        ...field,
        position,
        parentId: targetParentId,
      };

      state.set(id, updatedField);

      invalidateCachedState();

      subscriber.emitChanges(getState());

      return updatedField;
    },

    getState,

    subscribe(callback: SubscriberCallback<T>) {
      return subscriber.subscribe(callback);
    },
  };
}
