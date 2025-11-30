import type { Field, FieldId } from "./types";

export interface Query<T extends Field[]> {
	getNode(id: FieldId): Field | undefined;
	getRootNodes(): Field[];
	getChildrenNodes(parentId: FieldId): Field[];
}

function sortNodesByPosition(nodes: Field[]) {
	return [...nodes].sort((a, b) =>
		a.position < b.position ? -1 : a.position > b.position ? 1 : 0,
	);
}

export function createQuery<T extends Field<any>[]>(nodes: T): Query<T> {
	const nodeMap = new Map<FieldId, Field>(
		nodes.map((node) => [node.id, node]),
	);

	const getNodes = () => Array.from(nodeMap.values());

	return {
		getNode(id: FieldId) {
			return nodeMap.get(id);
		},
		getRootNodes() {
			return sortNodesByPosition(
				getNodes().filter((node) => node.parentId === null),
			);
		},
		getChildrenNodes(parentId: FieldId) {
			return sortNodesByPosition(
				getNodes().filter((node) => node.parentId === parentId),
			);
		},
	};
}
