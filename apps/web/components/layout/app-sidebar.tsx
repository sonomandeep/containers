import {
  BoxIcon,
  ChevronDownIcon,
  HardDriveIcon,
  LayoutDashboardIcon,
  ServerIcon,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const items = [
  {
    title: "Home",
    url: "/",
    icon: LayoutDashboardIcon,
  },
  {
    title: "Containers",
    url: "/containers",
    icon: BoxIcon,
  },
  {
    title: "Images",
    url: "/images",
    icon: ServerIcon,
  },
  {
    title: "Volumes",
    url: "/volumes",
    icon: HardDriveIcon,
  },
];

export function AppSidebar() {
  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <div className="inline-flex items-center justify-between">
          <div className="inline-flex items-center gap-4">
            <div className="bg-neutral-200 size-8 rounded-md"></div>
            <h1>mando.sh</h1>
          </div>

          <ChevronDownIcon className="opacity-60 size-3.5" />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
