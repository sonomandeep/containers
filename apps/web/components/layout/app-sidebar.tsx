"use client";

import {
  BoxIcon,
  HardDriveIcon,
  LayoutDashboardIcon,
  ServerIcon,
} from "lucide-react";
import Image from "next/image";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { NavMain } from "./nav-main";
import NavUser from "./nav-user";

const items = [
  {
    name: "Dashboard",
    url: "/",
    icon: LayoutDashboardIcon,
  },
  {
    name: "Containers",
    url: "/containers",
    icon: BoxIcon,
  },
  {
    name: "Images",
    url: "/images",
    icon: ServerIcon,
  },
  {
    name: "Volumes",
    url: "/volumes",
    icon: HardDriveIcon,
  },
];

export function AppSidebar() {
  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <div className="inline-flex items-center gap-3">
          <Image src="/logo.svg" alt="ACME Inc. logo" width={24} height={24} />
          <h1>ACME Inc.</h1>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={items} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser
          user={{
            name: "Mando",
            email: "hello@mando.sh",
            avatar: "https://github.com/sonomandeep.png",
          }}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
