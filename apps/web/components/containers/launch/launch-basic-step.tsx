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
import { Textarea } from "@/components/ui/textarea";

interface EnvVar { key: string; value: string }

export function LaunchBasicStep() {
  const [envVars, setEnvVars] = useState<EnvVar[]>([
    { key: "NODE_ENV", value: "production" },
  ]);

  const handleEnvChange = (index: number, field: keyof EnvVar, value: string) =>
    setEnvVars((prev) =>
      prev.map((env, i) => (i === index ? { ...env, [field]: value } : env)),
    );

  const handleAddEnv = () =>
    setEnvVars((prev) => [...prev, { key: "", value: "" }]);

  return (
    <div className="grid gap-4 text-left">
      <div className="grid gap-2">
        <Label htmlFor="container-name">Name</Label>
        <Input id="container-name" name="name" placeholder="my-container" />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="container-image">Image</Label>
        <Select defaultValue="node">
          <SelectTrigger id="container-image" className="w-full">
            <SelectValue placeholder="Select image" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="node">node:20-alpine</SelectItem>
            <SelectItem value="python">python:3.12-slim</SelectItem>
            <SelectItem value="nginx">nginx:stable-alpine</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="container-command">Command (optional)</Label>
        <Textarea
          id="container-command"
          name="command"
          placeholder="e.g. npm start"
          rows={3}
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Environment variables</Label>
          <Button
            onClick={handleAddEnv}
            size="sm"
            type="button"
            variant="ghost"
          >
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
    </div>
  );
}
