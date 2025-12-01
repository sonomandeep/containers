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
import { Textarea } from "@/components/ui/textarea";

export function LaunchBasicStep() {
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
    </div>
  );
}
