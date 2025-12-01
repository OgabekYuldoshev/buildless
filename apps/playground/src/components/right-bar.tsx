import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel } from "./ui/sidebar";

export function RightBar() {
  return (
    <Sidebar side="right">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>RightBar</SidebarGroupLabel>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
