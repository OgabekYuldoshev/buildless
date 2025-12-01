import { useBuilder } from "@buildless/react";
import { useMemo } from "react";
import { createFormBuilder } from "@/lib/builder";

export function useFormBuilder() {
	const builder = useMemo(() => createFormBuilder(), []);

	return useBuilder(builder);
}
