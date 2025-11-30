import type { Builder } from "@buildless/core";
import { useCallback, useSyncExternalStore } from "react";

export function useBuilder<T extends Builder<any>>(builder: T) {
  const state = useSyncExternalStore(
    useCallback(
      (onStoreChange) => {
        return builder.subscribe(() => {
          onStoreChange();
        });
      },
      [builder]
    ),
    useCallback(() => builder.getState(), [builder]),
    useCallback(() => builder.getState(), [builder])
  );

  console.log(state);

  return builder;
}
