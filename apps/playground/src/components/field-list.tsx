import { useFormBuilder } from "@/hooks/use-form-builder";

interface FieldListProps {
    parentId: string | null;
}
export function FieldList({ parentId }: FieldListProps) {
    const form = useFormBuilder();
    console.log(form.indexes)
    return (
        <div>
           hello
        </div>
    );
}
