import { draggable } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { Box, ExpandIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { NodeType } from "@/nodes";
import { SidebarMenuButton } from "./ui/sidebar";

interface BaseFieldProps {
	type: NodeType;
}
export function BaseField({ type }: BaseFieldProps) {
	const componentRef = useRef<HTMLButtonElement>(null);
	const [isDragging, setDragging] = useState(false);

	useEffect(() => {
		const element = componentRef.current;
		if (!element) return;

		return draggable({
			element,
			getInitialData: () => ({
				sourceType: "starter",
				nodeType: type,
			}),
			onDragStart: () => setDragging(true),
			onDrop: () => setDragging(false),
		});
	}, [type]);

	return (
		<SidebarMenuButton
			className={cn(
				"w-full border cursor-grab",
				isDragging && "opacity-50 cursor-grabbing",
			)}
			ref={componentRef}
		>
			<Box />
			<span className="text-sm">{type}</span>
			<ExpandIcon className="ml-auto" />
		</SidebarMenuButton>
	);
}
