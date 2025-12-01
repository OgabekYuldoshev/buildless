
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { nodesByCategory } from "@/nodes";
import { BaseField } from "./base-field";

export function LeftBar() {
	return (
		<Sidebar>
			<SidebarContent>
				{Object.entries(nodesByCategory).map(([category, nodes]) => (
					<SidebarGroup key={category}>
						<SidebarGroupLabel>{category}</SidebarGroupLabel>
						<SidebarGroupContent>
							<SidebarMenu>
								{nodes.map((item) => (
									<SidebarMenuItem key={item}>
										<BaseField key={item} type={item} />
									</SidebarMenuItem>
								))}
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>
				))}
			</SidebarContent>
		</Sidebar>
	)
}
