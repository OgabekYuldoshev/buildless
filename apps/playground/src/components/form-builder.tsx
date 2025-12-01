import { LeftBar } from "./left-bar";
import { SidebarProvider } from "./ui/sidebar";

export function FormBuilder() {
  return (
    <SidebarProvider>
        <LeftBar/>
    </SidebarProvider>
  )
}
