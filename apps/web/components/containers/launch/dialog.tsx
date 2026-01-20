"use client";

import type { Image } from "@containers/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import { CornerDownLeftIcon } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import z from "zod";
import {
  Dialog,
  DialogCard,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/core/dialog";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Textarea } from "@/components/ui/textarea";
import { useImagesStore } from "@/lib/store/images.store";

const restartPolicies = [
  {
    id: "no-policy",
    value: "No Policy",
  },
  {
    id: "always",
    value: "Always",
  },
  {
    id: "on-failure",
    value: "On Failure",
  },
  {
    id: "unless-stopped",
    value: "Unless Stopped",
  },
] as const;

const formSchema = z.object({
  name: z.string(),
  image: z.string(),
  command: z.string().optional(),
  restartPolicy: z.string(),
});

const steps = [
  { id: 1, label: "Basic" },
  { id: 2, label: "Config" },
  { id: 3, label: "Summary" },
] as const;

export function LaunchContainer() {
  const images = useImagesStore((state) => state.images);
  const [currentStep, setCurrentStep] = useState<number>(1);

  function renderStepContent() {
    switch (currentStep) {
      case 1:
        return <BasicStep images={images} />;
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

function BasicStep({ images }: { images: Array<Image> }) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      image: "",
      command: "",
      restartPolicy: "",
    },
  });

  function handleSubmit(input: z.infer<typeof formSchema>) {
    // biome-ignore lint/suspicious/noConsole: temp
    console.log(input);
  }

  return (
    <form className="w-full" onSubmit={form.handleSubmit(handleSubmit)}>
      <DialogCard className="mx-0 w-full">
        <Controller
          control={form.control}
          name="name"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Name</FieldLabel>
              <Input
                {...field}
                aria-invalid={fieldState.invalid}
                id={field.name}
                placeholder="api-gateway"
              />

              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="image"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="image">Image</FieldLabel>
              <Select
                name={field.name}
                onValueChange={field.onChange}
                value={field.value}
              >
                <SelectTrigger aria-invalid={fieldState.invalid} id="registry">
                  <SelectValue>
                    {(value: string) => {
                      if (!value) {
                        return "Select an image";
                      }

                      const current = images.find((item) => item.id === value);

                      if (!current) {
                        return <span>value</span>;
                      }

                      return <p>{current.tags.at(0) || current.name}</p>;
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {images.map((image) => (
                    <SelectItem key={image.id} value={image.id}>
                      {image.tags.at(0) || image.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="command"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="command">Command</FieldLabel>
              <Textarea
                {...field}
                aria-invalid={fieldState.invalid}
                id="command"
                placeholder="e.g. node index.js"
              />

              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="restartPolicy"
          render={({ field, fieldState }) => (
            <FieldSet>
              <FieldLabel>Restart Policy</FieldLabel>

              <RadioGroup
                className="grid grid-cols-2 gap-2"
                name={field.name}
                onValueChange={field.onChange}
                value={field.value}
              >
                {restartPolicies.map((policy) => (
                  <FieldLabel htmlFor={policy.id} key={policy.id}>
                    <Field
                      data-invalid={fieldState.invalid}
                      orientation="horizontal"
                    >
                      <FieldContent className="items-center">
                        <FieldTitle className="font-mono">
                          {policy.value}
                        </FieldTitle>
                      </FieldContent>
                      <RadioGroupItem
                        aria-invalid={fieldState.invalid}
                        className="hidden"
                        id={policy.id}
                        value={policy.id}
                      />
                    </Field>
                  </FieldLabel>
                ))}
              </RadioGroup>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </FieldSet>
          )}
        />
      </DialogCard>

      <DialogFooter className="px-0">
        <DialogClose render={<Button type="button" variant="outline" />}>
          Cancel
        </DialogClose>

        <Button disabled={!form.formState.isValid} type="submit">
          Confirm
        </Button>
      </DialogFooter>
    </form>
  );
}
