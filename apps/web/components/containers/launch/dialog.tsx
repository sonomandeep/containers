"use client";

import type { BasicStepInput, ConfigStepInput } from "@containers/shared";
import { CornerDownLeftIcon } from "lucide-react";
import { useState } from "react";
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
} from "@/components/ui/stepper";
import { BasicStep } from "./basic-step";
import { ConfigStep } from "./config-step";
import { SummaryStep } from "./summary-step";

const steps = [
  { id: 1, label: "Basic" },
  { id: 2, label: "Config" },
  { id: 3, label: "Summary" },
] as const;

export function LaunchContainer() {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formState, setFormState] = useState<{
    basic?: BasicStepInput;
    config?: ConfigStepInput;
  }>({});

  function goBack() {
    setCurrentStep((prev) => prev - 1);
  }

  function setBasicStepState(input: BasicStepInput) {
    setFormState((prev) => ({ ...prev, basic: input }));
    setCurrentStep(2);
  }

  function setConfigStepState(input: ConfigStepInput) {
    setFormState((prev) => ({ ...prev, config: input }));
    setCurrentStep(3);
  }

  function closeDialog() {
    setCurrentStep(1);
    setOpen(false);
  }

  function renderStepContent() {
    switch (currentStep) {
      case 1:
        return (
          <BasicStep
            formState={formState.basic}
            handleSubmit={setBasicStepState}
          />
        );
      case 2:
        return (
          <ConfigStep
            formState={formState.config}
            goBack={goBack}
            handleSubmit={setConfigStepState}
          />
        );
      case 3:
        return (
          <SummaryStep
            closeDialog={closeDialog}
            // biome-ignore lint/style/noNonNullAssertion: at this point all values are defined
            formState={{ basic: formState.basic!, config: formState.config! }}
            goBack={goBack}
          />
        );
      default:
        return null;
    }
  }

  return (
    <Dialog
      onOpenChange={(value) => {
        if (!value) {
          setCurrentStep(1);
        }

        setOpen(value);
      }}
      open={open}
    >
      <DialogTrigger render={<Button />}>
        Launch Container
        <CornerDownLeftIcon className="size-3 opacity-60" />
      </DialogTrigger>

      <DialogContent className="gap-0">
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
                <div className="flex grow flex-col items-start justify-center gap-1">
                  <StepperIndicator className="h-1 w-full rounded-full bg-border data-[state=active]:bg-primary" />
                  <div className="flex flex-col items-start gap-1">
                    <StepperTitle className="text-start group-data-[state=inactive]/step:text-muted-foreground">
                      {step.label}
                    </StepperTitle>
                  </div>
                </div>
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
