import type { Buildless } from "@buildless/core";
import { useCallback, useMemo, useSyncExternalStore } from "react";

export function useBuildless<T extends Buildless = Buildless>(buildless: T) {
  const indexes = useSyncExternalStore(
    buildless.subscribe,
    useCallback(() => buildless.getState(), [buildless]),
    useCallback(() => buildless.getState(), [buildless])
  );

  return useMemo(
    () => ({
      indexes,
      insert: buildless.insert,
      update: buildless.update,
      delete: buildless.delete,
      move: buildless.move,
    }),
    [indexes, buildless]
  );
}
