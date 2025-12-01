"use client";

import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PortMapping { hostPort: string; containerPort: string }

export function LaunchNetworkStep() {
  const [ports, setPorts] = useState<PortMapping[]>([
    { hostPort: "8080", containerPort: "3000" },
  ]);

  const handlePortChange = (
    index: number,
    key: keyof PortMapping,
    value: string,
  ) => {
    setPorts((prev) =>
      prev.map((port, i) => (i === index ? { ...port, [key]: value } : port)),
    );
  };

  const handleAddPort = () => {
    setPorts((prev) => [...prev, { hostPort: "", containerPort: "" }]);
  };

  return (
    <div className="grid gap-4 text-left">
      <div className="grid gap-2">
        <Label htmlFor="network-mode">Network mode</Label>
        <Select defaultValue="bridge">
          <SelectTrigger id="network-mode" className="w-full">
            <SelectValue placeholder="Select network mode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="bridge">Bridge (default)</SelectItem>
            <SelectItem value="host">Host</SelectItem>
            <SelectItem value="none">None</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Port mappings</Label>
          <Button
            onClick={handleAddPort}
            size="sm"
            type="button"
            variant="ghost"
          >
            <PlusIcon className="mr-1 h-4 w-4" />
            Add
          </Button>
        </div>

        <div className="grid gap-3">
          {ports.map((port, index) => (
            <div
              className="grid grid-cols-2 gap-2"
              key={`${index}-${port.hostPort}-${port.containerPort}`}
            >
              <Input
                name={`ports[${index}].hostPort`}
                onChange={(e) =>
                  handlePortChange(index, "hostPort", e.target.value)}
                placeholder="Host port"
                value={port.hostPort}
              />
              <Input
                name={`ports[${index}].containerPort`}
                onChange={(e) =>
                  handlePortChange(index, "containerPort", e.target.value)}
                placeholder="Container port"
                value={port.containerPort}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
