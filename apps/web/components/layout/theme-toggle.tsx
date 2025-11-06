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

const items: Array<ThemeToggleItem> = [{
  value: "system",
  label: "System",
  icon: MonitorIcon,
}, {
  value: "light",
  label: "Light",
  icon: SunIcon,
}, {
  value: "dark",
  label: "Dark",
  icon: MoonIcon,
}];

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <ToggleGroup type="single" className="w-full p-1" spacing={1}>
      {items.map((item) => (
        <ThemeToggleButton key={item.value} item={item} isActive={theme === item.value} setActive={setTheme} />
      ))}
    </ToggleGroup>
  );
}

function ThemeToggleButton({ item, isActive, setActive }: { item: ThemeToggleItem; isActive: boolean; setActive: (value: string) => void }) {
  return (
    <ToggleGroupItem value={item.value} className={cn("flex-1", isActive && "")} onClick={() => setActive(item.value)}><item.icon /></ToggleGroupItem>
  );
}
