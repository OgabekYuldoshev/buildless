import type { NodeType } from "./nodes";

type BaseDraggableData = {
    sourceType: "base";
    nodeType: NodeType;
}

export type DraggableData = BaseDraggableData