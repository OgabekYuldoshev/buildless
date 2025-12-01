import { createBuildless } from "@buildless/core";
import { useBuildless } from "@buildless/react";
import { nodes } from "@/nodes";

const builder = createBuildless({ schema: nodes });

export function useFormBuilder() {
  return useBuildless(builder);
}
