import type { Field, FieldSchema } from "./types";

export type SubscriberCallback<T extends Record<string, FieldSchema>> = (
  changes: readonly Field<T>[]
) => void;

export interface Subscriber<T extends Record<string, FieldSchema>> {
  subscribe(callback: SubscriberCallback<T>): () => void;
  unsubscribe(callback: SubscriberCallback<T>): void;
  emitChanges(changes: readonly Field<T>[]): void;
}

export function createSubscriber<
  T extends Record<string, FieldSchema>
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
    emitChanges(changes: readonly Field<T>[]) {
      for (const subscriber of subscribers) {
        subscriber(changes);
      }
    },
  };
}
