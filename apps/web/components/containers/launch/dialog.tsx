"use client";

import type { BasicStepInput } from "@containers/shared";
import { CornerDownLeftIcon } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/core/dialog";
import { Button } from "@/components/ui/button";
import {
  Stepper,
  StepperContent,
  StepperIndicator,
  StepperItem,
  StepperNav,
  StepperPanel,
  StepperTitle,
  StepperTrigger,
} from "@/components/ui/stepper";
import { BasicStep } from "./basic-step";

const steps = [
  { id: 1, label: "Basic" },
  { id: 2, label: "Config" },
  { id: 3, label: "Summary" },
] as const;

export function LaunchContainer() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formState, setFormState] = useState<BasicStepInput>();

  function setBasicStepState(input: BasicStepInput) {
    setFormState((prev) => ({ ...prev, ...input }));
  }

  useEffect(() => {
    // biome-ignore lint/suspicious/noConsole: temp
    console.log(formState);
  }, [formState]);

  function renderStepContent() {
    switch (currentStep) {
      case 1:
        return <BasicStep handleSubmit={setBasicStepState} />;
      case 2:
        return <p>{currentStep}</p>;
      case 3:
        return <p>{currentStep}</p>;
      default:
        return null;
    }
  }

  return (
    <Dialog>
      <DialogTrigger render={<Button />}>
        Launch Container
        <CornerDownLeftIcon className="size-3 opacity-60" />
      </DialogTrigger>

      <DialogContent>
        <DialogHeader className="px-3">
          <DialogTitle>Launch Container</DialogTitle>
        </DialogHeader>

        <Stepper
          className="space-y-3 px-2"
          onValueChange={setCurrentStep}
          value={currentStep}
        >
          <StepperNav className="gap-2 px-1">
            {steps.map((step) => (
              <StepperItem
                className="relative flex-1 items-start"
                key={step.id}
                step={step.id}
              >
                <StepperTrigger className="flex grow flex-col items-start justify-center gap-1">
                  <StepperIndicator className="h-1 w-full rounded-full bg-border data-[state=active]:bg-primary" />
                  <div className="flex flex-col items-start gap-1">
                    <StepperTitle className="text-start group-data-[state=inactive]/step:text-muted-foreground">
                      {step.label}
                    </StepperTitle>
                  </div>
                </StepperTrigger>
              </StepperItem>
            ))}
          </StepperNav>

          <StepperPanel>
            {steps.map((step) => (
              <StepperContent
                className="flex items-center"
                key={step.id}
                value={step.id}
              >
                {renderStepContent()}
              </StepperContent>
            ))}
          </StepperPanel>
        </Stepper>
      </DialogContent>
    </Dialog>
  );
}
