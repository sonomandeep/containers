"use client";

import { BoxIcon, HardDriveIcon, Layers2Icon } from "lucide-react";
import { Logo } from "@/components/core/logo";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { auth } from "@/lib/auth";
import { NavMain } from "./main";
import { NavUser } from "./user";

const items = [
  {
    name: "Containers",
    url: "/containers",
    icon: BoxIcon,
  },
  {
    name: "Images",
    url: "/images",
    icon: Layers2Icon,
  },
  {
    name: "Volumes",
    url: "/volumes",
    icon: HardDriveIcon,
  },
];

export function AppSidebar() {
  const { data: session } = auth.useSession();

  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <div className="inline-flex items-center gap-3">
          <Logo size={24} />
          <h1>ACME Inc.</h1>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={items} />
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
