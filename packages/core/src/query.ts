import type { Field, FieldId } from "./types";

export class Query<T extends Field[]> {
	private nodes: Map<FieldId, Field>;

	constructor(nodes: T) {
		this.nodes = new Map(nodes.map((node) => [node.id, node]));
	}

	private getNodes() {
		return Array.from(this.nodes.values());
	}

	private sortNodesByPosition(nodes: Field[]) {
		return [...nodes].sort((a, b) =>
			a.position < b.position ? -1 : a.position > b.position ? 1 : 0,
		);
	}

	public getNode(id: FieldId) {
		return this.nodes.get(id);
	}

	public getRootNodes() {
		return this.sortNodesByPosition(
			this.getNodes().filter((node) => node.parentId === null),
		);
	}

	public getChildrenNodes(parentId: FieldId) {
		return this.sortNodesByPosition(
			this.getNodes().filter((node) => node.parentId === parentId),
		);
	}
}

export function createQuery<T extends Field<any>[]>(nodes: T) {
	return new Query<T>(nodes);
}
