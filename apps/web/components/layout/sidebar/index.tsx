"use client";

import { BotIcon, BoxIcon, HardDriveIcon, LayersIcon } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { auth } from "@/lib/auth";
import { NavGroup } from "./main";
import { NavUser } from "./user";
import { WorkspaceSwitcher } from "./workspace-switcher";

type AppSidebarProps = {
  workspaceSlug: string;
};

function buildNavigationItems(workspaceSlug: string) {
  return {
    platform: [
      {
        name: "Containers",
        url: `/${workspaceSlug}/containers`,
        icon: BoxIcon,
      },
      {
        name: "Images",
        url: `/${workspaceSlug}/images`,
        icon: LayersIcon,
      },
      {
        name: "Volumes",
        url: `/${workspaceSlug}/volumes`,
        icon: HardDriveIcon,
      },
    ],
    config: [
      {
        name: "Agents",
        url: `/${workspaceSlug}/agents`,
        icon: BotIcon,
      },
    ],
  };
}

export function AppSidebar({ workspaceSlug }: AppSidebarProps) {
  const { data: session } = auth.useSession();
  const items = buildNavigationItems(workspaceSlug);

  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <WorkspaceSwitcher workspaceSlug={workspaceSlug} />
      </SidebarHeader>

      <SidebarContent>
        <NavGroup items={items.platform} label="Platform" />
        <NavGroup items={items.config} label="Config" />
      </SidebarContent>

      <SidebarFooter>
        <NavUser
          user={{
            name: session?.user.name || "",
            email: session?.user.email || "",
            avatar: "https://github.com/sonomandeep.png",
          }}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
