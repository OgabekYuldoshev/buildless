import { createNodeIndexes, type NodeIndexes } from "./indexes";
import type { SubscriberCallback } from "./subscriber";
import type {
	Node,
	NodeId,
	NodeSchema,
	NodeSchemaByType,
	NodeSchemaType,
} from "./types";
import { generateKeyBetween } from "./utils/fractional-indexing";
import { generateId } from "./utils/uuid";

export interface Builder<T extends Record<string, NodeSchema>> {
	insert<Type extends NodeSchemaType<T>>(options: {
		type: Type;
		index: number;
		parentId?: NodeId | null;
		defaultProps?: Partial<NodeSchemaByType<T, Type>["defaultProps"]>;
	}): Node<T>;
	update<Type extends NodeSchemaType<T>>(options: {
		id: NodeId;
		type: Type;
		props: Partial<NodeSchemaByType<T, Type>["defaultProps"]>;
	}): Node<T>;
	delete(id: NodeId): void;
	move(options: {
		id: NodeId;
		newIndex: number;
		newParentId?: NodeId | null;
	}): Node<T>;
	getState(): NodeIndexes<Node<T>>;
	subscribe(callback: SubscriberCallback<T>): () => void;
}

import { createRegistry } from "./registry";
import { createSubscriber } from "./subscriber";

export interface BuilderOptions<T extends Record<string, NodeSchema>> {
	nodes: T;
}

export function createBuilder<T extends Record<string, NodeSchema>>({
	nodes,
}: BuilderOptions<T>): Builder<T> {
	const subscriber = createSubscriber<T>();
	const registry = createRegistry<T>({ nodes });
	const state = new Map<NodeId, Node<T>>();

	let cachedIndexes: NodeIndexes<Node<T>> | null = null;

	function invalidateCachedState() {
		cachedIndexes = null;
	}

	function getNodes() {
		return Array.from(state.values());
	}

	function getState(): NodeIndexes<Node<T>> {
		if (cachedIndexes) {
			return cachedIndexes;
		}

		const nodes = getNodes();
		cachedIndexes = createNodeIndexes(nodes);
		return cachedIndexes;
	}

	function validateNodeIndex(index: number, maxLength: number) {
		if (index < 0 || index > maxLength) {
			throw new Error(
				`Invalid index ${index}. Must be between 0 and ${maxLength}`,
			);
		}
	}

	function calculateNodePosition(
		index: number,
		nodes: readonly Node<T>[],
	): string {
		const prevNode = index > 0 ? nodes[index - 1] : null;
		const nextNode = index < nodes.length ? nodes[index] : null;
		const prevPosition = prevNode?.position ?? null;
		const nextPosition = nextNode?.position ?? null;
		return generateKeyBetween(prevPosition, nextPosition);
	}

	return {
		insert<Type extends NodeSchemaType<T>>(options: {
			type: Type;
			index: number;
			parentId?: NodeId | null;
			defaultProps?: Partial<NodeSchemaByType<T, Type>["defaultProps"]>;
		}) {
			const { type, index, parentId = null, defaultProps = {} } = options;
			const nodeSchema = registry.getNodeSchema(type);

			if (parentId !== null && !state.has(parentId)) {
				throw new Error(
					`Cannot insert: Parent node with id "${parentId}" does not exist`,
				);
			}

			const indexes = getState();
			const nodes = parentId
				? indexes.getChildrenNodes(parentId)
				: indexes.getRootNodes();

			validateNodeIndex(index, nodes.length);

			const id = generateId();
			const position = calculateNodePosition(index, nodes);

			const node: Node<T> = {
				id,
				type,
				props: {
					...nodeSchema.defaultProps,
					...defaultProps,
				},
				position,
				parentId,
			};

			state.set(id, node);
			invalidateCachedState();
			subscriber.emitChanges(getState());

			return node;
		},

		update<Type extends NodeSchemaType<T>>(options: {
			id: NodeId;
			type: Type;
			props: Partial<NodeSchemaByType<T, Type>["defaultProps"]>;
		}) {
			const { id, type, props } = options;

			const node = state.get(id);

			if (!node) {
				throw new Error(`Cannot update: Node with id "${id}" does not exist`);
			}

			const updatedNode: Node<T> = {
				...node,
				type,
				props: {
					...node.props,
					...props,
				},
			};

			state.set(id, updatedNode);
			invalidateCachedState();
			subscriber.emitChanges(getState());

			return updatedNode;
		},

		delete(id: NodeId) {
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
			subscriber.emitChanges(getState());
		},

		move(options: {
			id: NodeId;
			newIndex: number;
			newParentId?: NodeId | null;
		}) {
			const { id, newIndex, newParentId = null } = options;

			const node = state.get(id);

			if (!node) {
				throw new Error(`Cannot update: Node with id "${id}" does not exist`);
			}

			const targetParentId =
				newParentId === undefined ? node.parentId : newParentId;

			if (targetParentId !== null && !state.has(targetParentId)) {
				throw new Error(
					`Cannot move: Target parent node with id "${targetParentId}" does not exist`,
				);
			}

			if (targetParentId !== null) {
				let currentId: NodeId | null = targetParentId;
				while (currentId !== null) {
					if (currentId === id) {
						throw new Error(
							`Cannot move: Node "${id}" cannot be moved to its own descendant`,
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

			const updatedNode: Node<T> = {
				...node,
				position,
				parentId: targetParentId,
			};

			state.set(id, updatedNode);
			invalidateCachedState();
			subscriber.emitChanges(getState());

			return updatedNode;
		},

		getState,
		subscribe(callback: SubscriberCallback<T>) {
			return subscriber.subscribe(callback);
		},
	};
}
