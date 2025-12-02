"use client";

import { CornerDownLeftIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import {
  Stepper,
  StepperIndicator,
  StepperItem,
} from "@/components/ui/stepper";
import { useLaunchContainerStore } from "@/lib/store";
import { LaunchBasicStep } from "./launch-basic-step";
import { LaunchConfigStep } from "./launch-config-step";
import { LaunchSummaryStep } from "./launch-summary-step";

const steps = [
  { id: 1, label: "Basic" },
  { id: 2, label: "Config" },
  { id: 3, label: "Summary" },
] as const;

type StepId = (typeof steps)[number]["id"];

export function LaunchContainer() {
  const stepIds = useMemo(() => steps.map(({ id }) => id), []);
  const [currentStep, setCurrentStep] = useState<StepId>(stepIds[0]);
  const [open, setOpen] = useState(false);
  const resetStore = useLaunchContainerStore((state) => state.reset);

  const handleStepChange = (step: number) => {
    if (stepIds.includes(step as StepId)) {
      setCurrentStep(step as StepId);
    }
  };

  const currentIndex = stepIds.indexOf(currentStep);
  const isFirstStep = currentIndex === 0;
  const isLastStep = currentIndex === stepIds.length - 1;
  const nextStep = stepIds[currentIndex + 1];
  const prevStep = stepIds[currentIndex - 1];

  const handleNext = () => {
    if (!isLastStep && nextStep) {
      setCurrentStep(nextStep);
    }
  };

  const handleBack = () => {
    if (!isFirstStep && prevStep) {
      setCurrentStep(prevStep);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setCurrentStep(stepIds[0]);
    resetStore();
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <LaunchBasicStep handleNext={handleNext} />;
      case 2:
        return (
          <LaunchConfigStep handleBack={handleBack} handleNext={handleNext} />
        );
      case 3:
        return (
          <LaunchSummaryStep
            handleBack={handleBack}
            handleClose={handleClose}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={(value) => setOpen(value)}>
      <form>
        <DialogTrigger asChild>
          <Button size="sm" onClick={() => setOpen(true)}>
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

          <div className="w-full space-y-6">
            <Stepper
              className="gap-3"
              onValueChange={handleStepChange}
              value={currentStep}
            >
              {steps.map((step) => (
                <StepperItem className="flex-1" key={step.id} step={step.id}>
                  <div className="w-full flex-col items-start gap-2">
                    <StepperIndicator asChild className="h-1 w-full bg-border">
                      <span className="sr-only">{step.label}</span>
                    </StepperIndicator>
                    <span className="text-xs font-medium text-muted-foreground">
                      {step.label}
                    </span>
                  </div>
                </StepperItem>
              ))}
            </Stepper>

            <div className="min-h-[360px]">{renderStepContent()}</div>
          </div>
        </DialogContent>
      </form>
    </Dialog>
  );
}
