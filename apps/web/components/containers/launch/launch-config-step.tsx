"use client";

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

interface EnvVar { key: string; value: string }

export function LaunchConfigStep() {
  const [envVars, setEnvVars] = useState<EnvVar[]>([
    { key: "NODE_ENV", value: "production" },
  ]);

  const handleEnvChange = (
    index: number,
    field: keyof EnvVar,
    value: string,
  ) =>
    setEnvVars((prev) =>
      prev.map((env, i) => (i === index ? { ...env, [field]: value } : env)),
    );

  const handleAddEnv = () =>
    setEnvVars((prev) => [...prev, { key: "", value: "" }]);

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
          <Label>Environment variables</Label>
          <Button onClick={handleAddEnv} size="sm" type="button" variant="ghost">
            Add
          </Button>
        </div>

        <div className="grid gap-2">
          {envVars.map((env, index) => (
            <div
              className="grid grid-cols-2 gap-2"
              key={`${index}-${env.key}-${env.value}`}
            >
              <Input
                name={`env[${index}].key`}
                onChange={(e) => handleEnvChange(index, "key", e.target.value)}
                placeholder="KEY"
                value={env.key}
              />
              <Input
                name={`env[${index}].value`}
                onChange={(e) =>
                  handleEnvChange(index, "value", e.target.value)}
                placeholder="Value"
                value={env.value}
              />
            </div>
          ))}
        </div>
      </div>

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
        <Select defaultValue="on-failure">
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
