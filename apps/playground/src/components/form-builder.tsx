import { Canvas } from "./canvas";
import { LeftBar } from "./left-bar";
import { RightBar } from "./right-bar";
import { SidebarProvider } from "./ui/sidebar";

export function FormBuilder() {
  return (
    <SidebarProvider>
        <LeftBar/>
        <Canvas/>
        <RightBar/>
    </SidebarProvider>
  )
}
