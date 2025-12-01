"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function LaunchResourcesStep() {
  return (
    <div className="grid gap-4 text-left">
      <div className="grid gap-2">
        <Label htmlFor="cpu-limit">CPU limit</Label>
        <Input
          id="cpu-limit"
          name="cpuLimit"
          placeholder="e.g. 1.5 (vCPUs)"
          type="number"
          step="0.1"
          min="0"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="memory-limit">Memory limit</Label>
        <Input
          id="memory-limit"
          name="memoryLimit"
          placeholder="e.g. 512 (MB)"
          type="number"
          min="0"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="restart-policy">Restart policy</Label>
        <Select defaultValue="no">
          <SelectTrigger id="restart-policy" className="w-full">
            <SelectValue placeholder="Select restart policy" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="no">No</SelectItem>
            <SelectItem value="on-failure">On failure</SelectItem>
            <SelectItem value="always">Always</SelectItem>
            <SelectItem value="unless-stopped">Unless stopped</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
