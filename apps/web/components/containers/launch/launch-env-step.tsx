"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type EnvVar = { key: string; value: string };

export function LaunchEnvStep() {
  const [envVars, setEnvVars] = useState<EnvVar[]>([
    { key: "NODE_ENV", value: "production" },
  ]);

  const handleEnvChange = (
    index: number,
    field: keyof EnvVar,
    value: string,
  ) => {
    setEnvVars((prev) =>
      prev.map((env, i) => (i === index ? { ...env, [field]: value } : env)),
    );
  };

  const handleAddEnv = () => {
    setEnvVars((prev) => [...prev, { key: "", value: "" }]);
  };

  return (
    <div className="space-y-3 text-left">
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
                handleEnvChange(index, "value", e.target.value)
              }
              placeholder="Value"
              value={env.value}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
