import type { Builder, NodeSchema } from "@buildless/core";
import { useCallback, useMemo, useSyncExternalStore } from "react";

export function useBuilder<
	T extends Record<string, NodeSchema>,
	B extends Builder<T> = Builder<T>,
>(builder: B) {
	const indexes = useSyncExternalStore(
		builder.subscribe,
		useCallback(() => builder.getState(), [builder]),
		useCallback(() => builder.getState(), [builder]),
	);

	const api = useMemo(
		() => ({
			indexes,
			insert: builder.insert,
			update: builder.update,
			delete: builder.delete,
			move: builder.move,
		}),
		[indexes, builder],
	);

	return api;
}
