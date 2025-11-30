import type { Field, FieldSchema } from "./types";

type SubscriberCallback<T extends Record<string, FieldSchema>> = (
	changes: Field<T>[],
) => void;

export class Subscriber<T extends Record<string, FieldSchema>> {
	private subscribers = new Set<SubscriberCallback<T>>();

	public subscribe(callback: SubscriberCallback<T>) {
		this.subscribers.add(callback);
		return () => this.unsubscribe(callback);
	}

	public unsubscribe(callback: SubscriberCallback<T>) {
		this.subscribers.delete(callback);
	}

	public emitChanges(changes: Field<T>[]) {
		for (const subscriber of this.subscribers) {
			subscriber(changes);
		}
	}
}
