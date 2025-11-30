import type { NodeIndexes } from "./indexes";
import type { Node, NodeId } from "./types";

export function getParentNode<T extends Node>(
	indexes: NodeIndexes<T>,
	id: NodeId,
): T | undefined {
	const node = indexes.getNode(id);
	if (!node || node.parentId === null) {
		return undefined;
	}
	return indexes.getNode(node.parentId);
}

export function getDescendants<T extends Node>(
	indexes: NodeIndexes<T>,
	id: NodeId,
): T[] {
	const descendants: T[] = [];
	const children = indexes.getChildrenNodes(id);

	for (const child of children) {
		descendants.push(child);
		descendants.push(...getDescendants(indexes, child.id));
	}

	return descendants;
}

export function getAncestors<T extends Node>(
	indexes: NodeIndexes<T>,
	id: NodeId,
): T[] {
	const ancestors: T[] = [];
	let currentId: NodeId | null = id;

	while (currentId !== null) {
		const node = indexes.getNode(currentId);
		if (!node) break;

		if (node.parentId !== null) {
			const parent = indexes.getNode(node.parentId);
			if (parent) {
				ancestors.unshift(parent);
				currentId = node.parentId;
			} else {
				break;
			}
		} else {
			break;
		}
	}

	return ancestors;
}

export function getSiblings<T extends Node>(
	indexes: NodeIndexes<T>,
	id: NodeId,
): T[] {
	const node = indexes.getNode(id);
	if (!node) return [];

	const siblings =
		node.parentId === null
			? indexes.getRootNodes()
			: indexes.getChildrenNodes(node.parentId);

	return [...siblings].filter((n) => n.id !== id);
}

export function getNodeDepth<T extends Node>(
	indexes: NodeIndexes<T>,
	id: NodeId,
): number {
	return getAncestors(indexes, id).length;
}

export function isLeafNode<T extends Node>(
	indexes: NodeIndexes<T>,
	id: NodeId,
): boolean {
	return indexes.getChildrenNodes(id).length === 0;
}

export function getLeafNodes<T extends Node>(indexes: NodeIndexes<T>): T[] {
	const allNodes = indexes.getAllNodes();
	return allNodes.filter((node) => isLeafNode(indexes, node.id));
}

export function isDescendantOf<T extends Node>(
	indexes: NodeIndexes<T>,
	nodeId: NodeId,
	ancestorId: NodeId,
): boolean {
	const ancestors = getAncestors(indexes, nodeId);
	return ancestors.some((ancestor) => ancestor.id === ancestorId);
}

export interface TreeNode<T extends Node> {
	node: T;
	children: TreeNode<T>[];
}

export function buildTree<T extends Node>(
	indexes: NodeIndexes<T>,
	rootId?: NodeId | null,
): TreeNode<T>[] {
	const roots = rootId
		? ([indexes.getNode(rootId)].filter(Boolean) as T[])
		: indexes.getRootNodes();

	return roots.map((root) => ({
		node: root,
		children: buildTree(indexes, root.id),
	}));
}
