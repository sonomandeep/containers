"use client";

import { CornerDownLeftIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { Label } from "@/components/ui/label";
import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperTrigger,
} from "@/components/ui/stepper";

const steps = [1, 2, 3, 4];

export function LaunchContainer() {
  const [currentStep, setCurrentStep] = useState(2);

  return (
    <Dialog>
      <form>
        <DialogTrigger asChild>
          <Button size="sm">
            New Container
            <KbdGroup>
              <Kbd>
                <CornerDownLeftIcon />
              </Kbd>
            </KbdGroup>
          </Button>
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>Launch Container</DialogTitle>

            <DialogDescription>
              Configure and launch a new Docker container with custom settings
            </DialogDescription>
          </DialogHeader>

          <div className="w-full space-y-8 text-center">
            <Stepper
              className="gap-1"
              onValueChange={setCurrentStep}
              value={currentStep}
            >
              {steps.map((step) => (
                <StepperItem className="flex-1" key={step} step={step}>
                  <StepperTrigger
                    asChild
                    className="w-full flex-col items-start gap-2"
                  >
                    <StepperIndicator asChild className="h-1 w-full bg-border">
                      <span className="sr-only">{step}</span>
                    </StepperIndicator>
                  </StepperTrigger>
                </StepperItem>
              ))}
            </Stepper>
          </div>

          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="name-1">Name</Label>
              <Input id="name-1" name="name" defaultValue="Pedro Duarte" />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="username-1">Username</Label>
              <Input id="username-1" name="username" defaultValue="@peduarte" />
            </div>
          </div>

          <DialogFooter className="flex flex-row justify-between items-center">
            <DialogClose asChild>
              <Button size="sm" variant="secondary">Cancel</Button>
            </DialogClose>

            <Button size="sm" type="submit">Next</Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
