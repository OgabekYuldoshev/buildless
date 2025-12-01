import type { Builder } from "@buildless/core";
import { useCallback, useMemo, useSyncExternalStore } from "react";

export function useBuilder<
	T extends Builder<any> = Builder<any>,
>(builder: T) {
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
