import type { Node, NodeId } from "./types";

export interface NodeIndexes<T extends Node<any>> {
	readonly _nodeMap: ReadonlyMap<NodeId, T>;
	readonly _parentIndex: ReadonlyMap<NodeId | null, readonly T[]>;
	readonly _typeIndex: ReadonlyMap<string, readonly T[]>;
	readonly _rootNodes: readonly T[];

	getNode(id: NodeId): T | undefined;
	getRootNodes(): readonly T[];
	getChildrenNodes(parentId: NodeId): readonly T[];
	getNodesByType(type: string): readonly T[];
	getAllNodes(): readonly T[];
	hasNode(id: NodeId): boolean;
	getNodeCount(): number;
}

export function createNodeIndexes<T extends Node<any>>(
	nodes: readonly T[],
): NodeIndexes<T> {
	const nodeMap = new Map<NodeId, T>();
	const parentIndex = new Map<NodeId | null, T[]>();
	const typeIndex = new Map<string, T[]>();
	const rootNodes: T[] = [];

	for (const node of nodes) {
		nodeMap.set(node.id, node);

		const parentId = node.parentId;
		if (!parentIndex.has(parentId)) {
			parentIndex.set(parentId, []);
		}
		const parentChildren = parentIndex.get(parentId);
		if (parentChildren) {
			parentChildren.push(node);
		}

		const type = String(node.type);
		if (!typeIndex.has(type)) {
			typeIndex.set(type, []);
		}
		const typeChildren = typeIndex.get(type);
		if (typeChildren) {
			typeChildren.push(node);
		}

		if (parentId === null) {
			rootNodes.push(node);
		}
	}

	rootNodes.sort((a, b) =>
		a.position < b.position ? -1 : a.position > b.position ? 1 : 0,
	);

	for (const [_parentId, children] of parentIndex.entries()) {
		children.sort((a, b) =>
			a.position < b.position ? -1 : a.position > b.position ? 1 : 0,
		);
	}

	return {
		_nodeMap: nodeMap,
		_parentIndex: parentIndex,
		_typeIndex: typeIndex,
		_rootNodes: rootNodes,

		getNode(id: NodeId) {
			return nodeMap.get(id);
		},
		getRootNodes() {
			return rootNodes;
		},
		getChildrenNodes(parentId: NodeId) {
			return parentIndex.get(parentId) ?? [];
		},
		getNodesByType(type: string) {
			return typeIndex.get(type) ?? [];
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
