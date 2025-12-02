"use client";

import type { LucideIcon } from "lucide-react";
import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

interface ThemeToggleItem {
  value: string;
  label: string;
  icon: LucideIcon;
}

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
      defaultValue={theme}
      spacing={1}
      type="single"
    >
      {items.map((item) => (
        <ThemeToggleButton
          isActive={theme === item.value}
          item={item}
          key={item.value}
          setActive={setTheme}
        />
      ))}
    </ToggleGroup>
  );
}

function ThemeToggleButton({
  item,
  isActive,
  setActive,
}: {
  item: ThemeToggleItem;
  isActive: boolean;
  setActive: (value: string) => void;
}) {
  return (
    <ToggleGroupItem
      className={cn("flex-1", isActive && "")}
      onClick={() => setActive(item.value)}
      value={item.value}
    >
      <item.icon />
    </ToggleGroupItem>
  );
}
