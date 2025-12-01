import { useMemo } from "react";
import { useFormBuilder } from "@/hooks/use-form-builder";

interface FieldListProps {
    parentId: string | null;
}
export function FieldList({ parentId }: FieldListProps) {
    const form = useFormBuilder();
    const nodes = useMemo(() => {
        if (parentId !== null) {
            return form.indexes.getChildrenNodes(parentId);
        }

        return form.indexes.getRootNodes();
    }, [form.indexes, parentId]);

    return (
        <div>
           hello
        </div>
    );
}
