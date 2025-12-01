import { sortNodesByPosition } from "./helpers";
import type { DefaultSchema, Node, NodeId } from "./types";

export type NodeIndexes<
  Schema extends DefaultSchema = DefaultSchema,
  NodeValue extends Node<Schema> = Node<Schema>
> = {
  readonly _nodeMap: ReadonlyMap<NodeId, NodeValue>;
  readonly _parentMap: ReadonlyMap<NodeId, readonly NodeValue[]>;
  readonly _typeMap: ReadonlyMap<string, readonly NodeValue[]>;
  readonly _rootNodes: readonly NodeValue[];

  getNode(id: NodeId): NodeValue | undefined;
  getRootNodes(): readonly NodeValue[];
  getChildrenNodes(parentId: NodeId): readonly NodeValue[];
  getNodesByType(type: string): readonly NodeValue[];
  getAllNodes(): readonly NodeValue[];
  hasNode(id: NodeId): boolean;
  getNodeCount(): number;
};

export function createNodeIndexes<
  Schema extends DefaultSchema = DefaultSchema,
  NodeValues extends Node<Schema>[] = Node<Schema>[]
>(nodes: NodeValues): NodeIndexes<Schema, NodeValues[number]> {
  type NodeValue = NodeValues[number];
  const nodeMap = new Map<NodeId, NodeValue>();
  const parentMap = new Map<NodeId, NodeValue[]>();
  const typeMap = new Map<string, NodeValue[]>();
  const rootNodes: NodeValue[] = [];

  for (const node of nodes) {
    nodeMap.set(node.id, node);

    const parentId = node.parentId;

    if (parentId !== null) {
      if (!parentMap.has(parentId)) {
        parentMap.set(parentId, []);
      }

      const parentChildren = parentMap.get(parentId);

      if (parentChildren) {
        parentChildren.push(node);
      }
    }

    const type = node.type as string;

    if (!typeMap.has(type)) {
      typeMap.set(type, []);
    }

    const typeChildren = typeMap.get(type);

    if (typeChildren) {
      typeChildren.push(node);
    }

    if (parentId === null) {
      rootNodes.push(node);
    }
  }

  rootNodes.sort(sortNodesByPosition);

  for (const [_parentId, children] of parentMap.entries()) {
    children.sort(sortNodesByPosition);
  }

  return {
    _nodeMap: nodeMap,
    _parentMap: parentMap,
    _typeMap: typeMap,
    _rootNodes: rootNodes,

    getNode(id: NodeId) {
      return nodeMap.get(id);
    },
    getRootNodes() {
      return rootNodes;
    },
    getChildrenNodes(parentId: NodeId) {
      return parentMap.get(parentId) ?? [];
    },
    getNodesByType(type: string) {
      return typeMap.get(type) ?? [];
    },
    getAllNodes() {
      return Array.from(nodeMap.values());
    },
    hasNode(id: NodeId) {
      return nodeMap.has(id);
    },
    getNodeCount() {
      return nodeMap.size;
    },
  };
}
