"use client";

import type { LucideIcon } from "lucide-react";
import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

type ThemeToggleItem = {
  value: string;
  label: string;
  icon: LucideIcon;
};

const items: Array<ThemeToggleItem> = [
  {
    value: "system",
    label: "System",
    icon: MonitorIcon,
  },
  {
    value: "light",
    label: "Light",
    icon: SunIcon,
  },
  {
    value: "dark",
    label: "Dark",
    icon: MoonIcon,
  },
];

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <ToggleGroup
      className="w-full p-1"
      onValueChange={(value) => {
        setTheme(value[0]);
      }}
      spacing={1}
      value={[theme]}
    >
      {items.map((item) => (
        <ThemeToggleButton
          isActive={theme === item.value}
          item={item}
          key={item.value}
        />
      ))}
    </ToggleGroup>
  );
}

function ThemeToggleButton({
  item,
  isActive,
}: {
  item: ThemeToggleItem;
  isActive: boolean;
}) {
  return (
    <ToggleGroupItem
      className={cn("flex-1", isActive && "")}
      value={item.value}
    >
      <item.icon />
    </ToggleGroupItem>
  );
}
