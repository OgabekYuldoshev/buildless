import { createNodeIndexes, type NodeIndexes } from "./indexes";
import { createRegistry } from "./registry";
import type {
  BuildlessConfig,
  BuildlessGenerics,
  DefaultSchema,
  Node,
  NodeId,
} from "./types";
import { generateKeyBetween } from "./utils/fractional-indexing";
import { generateId } from "./utils/uuid";

export type SubscriberCallback<Schema extends DefaultSchema> = (
  indexes: NodeIndexes<Schema>
) => void;

export type Buildless<
  C extends BuildlessConfig = BuildlessConfig,
  G extends BuildlessGenerics<C> = BuildlessGenerics<C>
> = {
  insert<Type extends G["Types"]>(options: {
    type: Type;
    index: number;
    parentId?: NodeId | null;
    values?: Partial<G["Schemas"][Type]["props"]>;
  }): Readonly<Node<G["Schemas"], Type>>;
  update<Type extends G["Types"]>(options: {
    id: NodeId;
    type: Type;
    values: Partial<G["Schemas"][Type]["props"]>;
  }): Readonly<Node<G["Schemas"], Type>>;
  delete(id: NodeId): void;
  move(options: {
    id: NodeId;
    newIndex: number;
    newParentId?: NodeId | null;
  }): void;
  getState(): NodeIndexes<G["Schemas"]>;
  subscribe(callback: SubscriberCallback<G["Schemas"]>): () => void;
};

export function createBuildlessInternal<
  C extends BuildlessConfig,
  G extends BuildlessGenerics<C> = BuildlessGenerics<C>
>(config: C): Buildless<C, G> {
  const registry = createRegistry<G["Schemas"]>(config.schema as G["Schemas"]);
  const listeners = new Set<SubscriberCallback<G["Schemas"]>>();
  const state = new Map<NodeId, Node<G["Schemas"]>>();

  let cachedIndexes: NodeIndexes<G["Schemas"]> | null = null;

  function invalidateCachedState() {
    cachedIndexes = null;
  }

  function getNodes() {
    return Array.from(state.values());
  }

  function getState(): NodeIndexes<G["Schemas"]> {
    if (cachedIndexes) {
      return cachedIndexes;
    }

    const nodes = getNodes();
    cachedIndexes = createNodeIndexes(nodes);
    return cachedIndexes;
  }

  function emitChanges(indexes: NodeIndexes<G["Schemas"]>) {
    for (const listener of listeners) {
      listener(indexes);
    }
  }

  return {
    insert(options) {
      const { type, index, parentId = null, values = {} } = options;
      const schema = registry.getSchema(type);

      if (parentId !== null) {
        if (!state.has(parentId)) {
          throw new Error(
            `Cannot insert: Parent node with id "${parentId}" does not exist`
          );
        }

        const parentNode = state.get(parentId);
        if (parentNode && !registry.canHaveChildren(parentNode.type)) {
          throw new Error(
            `Cannot insert: Node type "${String(
              parentNode.type
            )}" cannot have children`
          );
        }
      }
      const indexes = getState();
      const nodes = parentId
        ? indexes.getChildrenNodes(parentId)
        : indexes.getRootNodes();

      validateNodeIndex(index, nodes.length);

      const id = generateId();

      const position = calculateNodePosition(index, nodes);

      const node = {
        id,
        type,
        props: {
          ...schema.props,
          ...values,
        },
        position,
        parentId,
      } satisfies Node<G["Schemas"]>;

      state.set(id, node);
      invalidateCachedState();

      emitChanges(getState());

      return node;
    },
    update(options) {
      const { id, type, values } = options;
      const node = state.get(id);
      if (!node) {
        throw new Error(`Cannot update: Node with id "${id}" does not exist`);
      }

      const updatedNode = {
        ...node,
        type,
        props: {
          ...node.props,
          ...values,
        },
      } satisfies Node<G["Schemas"]>;

      state.set(id, updatedNode);
      invalidateCachedState();
      emitChanges(getState());
      return updatedNode;
    },
    delete(id) {
      if (!state.has(id)) {
        throw new Error(`Cannot delete: Node with id "${id}" does not exist`);
      }

      const indexes = getState();

      const recursivelyRemove = (id: NodeId) => {
        const children = indexes.getChildrenNodes(id);

        for (const child of children) {
          recursivelyRemove(child.id);
        }

        state.delete(id);
      };

      recursivelyRemove(id);

      invalidateCachedState();
      emitChanges(getState());
    },
    move(options) {
      const { id, newIndex, newParentId = null } = options;
      const node = state.get(id);

      if (!node) {
        throw new Error(`Cannot update: Node with id "${id}" does not exist`);
      }

      const targetParentId =
        newParentId === undefined ? node.parentId : newParentId;

      if (targetParentId !== null) {
        if (!state.has(targetParentId)) {
          throw new Error(
            `Cannot move: Target parent node with id "${targetParentId}" does not exist`
          );
        }

        const targetParentNode = state.get(targetParentId);
        if (
          targetParentNode &&
          !registry.canHaveChildren(targetParentNode.type)
        ) {
          throw new Error(
            `Cannot move: Target parent node type "${String(
              targetParentNode.type
            )}" cannot have children`
          );
        }

        let currentId: NodeId | null = targetParentId;
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

      const indexes = getState();
      const targetNodes = newParentId
        ? indexes.getChildrenNodes(newParentId)
        : indexes.getRootNodes();

      const filteredNodes = targetNodes.filter((n) => n.id !== id);

      validateNodeIndex(newIndex, filteredNodes.length);

      const position = calculateNodePosition(newIndex, filteredNodes);

      const updatedNode = {
        ...node,
        position,
        parentId: targetParentId,
      } satisfies Node<G["Schemas"]>;

      state.set(id, updatedNode);
      invalidateCachedState();
      emitChanges(getState());
    },
    getState,
    subscribe(callback) {
      listeners.add(callback);
      return () => listeners.delete(callback);
    },
  };
}

function validateNodeIndex(index: number, maxLength: number) {
  if (index < 0 || index > maxLength) {
    throw new Error(
      `Invalid index ${index}. Must be between 0 and ${maxLength}`
    );
  }
}

function calculateNodePosition<NodeValue extends Node<any>>(
  index: number,
  nodes: readonly NodeValue[]
): string {
  const prevNode = index > 0 ? nodes[index - 1] : null;
  const nextNode = index < nodes.length ? nodes[index] : null;
  const prevPosition = prevNode?.position ?? null;
  const nextPosition = nextNode?.position ?? null;
  return generateKeyBetween(prevPosition, nextPosition);
}