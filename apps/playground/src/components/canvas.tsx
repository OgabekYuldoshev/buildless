import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { useEffect, useMemo, useRef, useState } from "react";
import { useFormBuilder } from "@/hooks/use-form-builder";
import { cn } from "@/lib/utils";
import type { DraggableData } from "@/types";

export function Canvas() {
    const componentRef = useRef<HTMLDivElement>(null);
    const form = useFormBuilder();
    const [isDragOver, setDragOver] = useState(false);

    const rootNodes = useMemo(() => form.indexes.getRootNodes(), [form.indexes]);

    useEffect(() => {
        const element = componentRef.current;
        if (!element) return;

        return dropTargetForElements({
            element,
            canDrop: ({ source }) => {
                const data = source.data as DraggableData;
                return data.sourceType === "base";
            },
            onDragEnter: () => setDragOver(true),
            onDragLeave: () => setDragOver(false),
            onDrop({ source }) {
                setDragOver(false);
                form.insert({
                    type: source.data.nodeType as string,
                    index: 0,
                })
            },
        });
    }, []);


    if (rootNodes.length === 0) {
        return (
            <main
                ref={componentRef}
                className={cn("flex-1", isDragOver && "bg-red-500")}
            >
                <div>Canvas</div>
            </main>
        );
    }

    return (
        <main className={cn("flex-1")}>
            salom
        </main>
    );
}
