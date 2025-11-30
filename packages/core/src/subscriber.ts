import type { Field, FieldSchema } from "./types";

export type SubscriberCallback<T extends Record<string, FieldSchema>> = (
  changes: readonly Field<T>[]
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

  public emitChanges(changes: readonly Field<T>[]) {
    for (const subscriber of this.subscribers) {
      subscriber(changes);
    }
  }
}
