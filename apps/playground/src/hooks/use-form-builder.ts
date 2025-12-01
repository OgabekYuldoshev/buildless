import { useBuilder } from "@buildless/react";
import { createFormBuilder } from "@/lib/builder";

const builder = createFormBuilder();

export function useFormBuilder() {
  return useBuilder(builder);
}
