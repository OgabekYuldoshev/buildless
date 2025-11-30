import type { NodeIndexes } from "./indexes";
import type { Node, NodeSchema } from "./types";

export type SubscriberCallback<T extends Record<string, NodeSchema>> = (
	indexes: NodeIndexes<Node<T>>,
) => void;

export interface Subscriber<T extends Record<string, NodeSchema>> {
	subscribe(callback: SubscriberCallback<T>): () => void;
	unsubscribe(callback: SubscriberCallback<T>): void;
	emitChanges(indexes: NodeIndexes<Node<T>>): void;
}

export function createSubscriber<
	T extends Record<string, NodeSchema>,
>(): Subscriber<T> {
	const subscribers = new Set<SubscriberCallback<T>>();

	function unsubscribe(callback: SubscriberCallback<T>) {
		subscribers.delete(callback);
	}

	return {
		subscribe(callback: SubscriberCallback<T>) {
			subscribers.add(callback);
			return () => unsubscribe(callback);
		},
		unsubscribe,
		emitChanges(indexes: NodeIndexes<Node<T>>) {
			for (const subscriber of subscribers) {
				subscriber(indexes);
			}
		},
	};
}
