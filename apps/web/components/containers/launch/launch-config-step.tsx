"use client";

import type z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeftIcon, ArrowRight, PlusIcon, XIcon } from "lucide-react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel, FieldSeparator, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { launchConfigSchema } from "@/lib/schema/containers";

interface Props {
  handleBack: () => void;
  handleNext: () => void;
}

export function LaunchConfigStep({ handleBack, handleNext }: Props) {
  const form = useForm<z.infer<typeof launchConfigSchema>>({
    resolver: zodResolver(launchConfigSchema),
    defaultValues: {
      cpu: "",
      memory: "",
      envs: [],
      ports: [],
    },
  });
  const envs = useFieldArray({ control: form.control, name: "envs" });
  const ports = useFieldArray({ control: form.control, name: "ports" });

  function onSubmit(data: z.infer<typeof launchConfigSchema>) {
    // Do something with the form values.
    // eslint-disable-next-line no-console
    console.log(data);
    handleNext();
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <FieldSet>
          <FieldGroup>
            <div className="w-full inline-flex gap-2">
              <Controller
                name="cpu"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>CPU (vCPU)</FieldLabel>

                    <Input {...field} id={field.name} type="text" placeholder="2" aria-invalid={fieldState.invalid} />

                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                name="memory"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Memory (in mb)</FieldLabel>

                    <Input {...field} id={field.name} type="text" placeholder="2048" aria-invalid={fieldState.invalid} />

                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </div>

            <FieldSeparator />

            <Field>
              <FieldLabel>Environment Variables</FieldLabel>

              <div className="space-y-2">
                {envs.fields.map((field, index) => (
                  <div key={field.id} className="flex gap-2">
                    <div className="flex-1">
                      <Input
                        {...form.register(`envs.${index}.key` as const)}
                        placeholder="Key"
                        className="font-mono"
                      />
                    </div>
                    <div className="flex-1">
                      <Input
                        {...form.register(`envs.${index}.value` as const)}
                        placeholder="Value"
                        className="font-mono"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => envs.remove(index)}
                    >
                      <XIcon className="size-3.5 opacity-60" />
                    </Button>
                  </div>
                ))}
              </div>

              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => envs.append({ key: "", value: "" })}
              >
                <PlusIcon className="size-3.5 opacity-60" />
                Add Variable
              </Button>
            </Field>

            <Field>
              <FieldLabel>Port Mappings</FieldLabel>

              <div className="space-y-2">
                {ports.fields.map((field, index) => (
                  <div key={field.id} className="flex gap-2">
                    <div className="flex-1">
                      <Input
                        {...form.register(`ports.${index}.hostPort` as const)}
                        placeholder="Host"
                        className="font-mono"
                        type="number"
                      />
                    </div>
                    <div className="flex-1">
                      <Input
                        {...form.register(`ports.${index}.containerPort` as const)}
                        placeholder="Container"
                        className="font-mono"
                        type="number"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => ports.remove(index)}
                    >
                      <XIcon className="size-3.5 opacity-60" />
                    </Button>
                  </div>
                ))}
              </div>

              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => ports.append({ hostPort: "", containerPort: "" })}
              >
                <PlusIcon className="size-3.5 opacity-60" />
                Add Mapping
              </Button>
            </Field>
          </FieldGroup>
        </FieldSet>

        <Field orientation="horizontal" className="w-full inline-flex justify-between">
          <Button
            size="sm"
            type="button"
            variant="outline"
            onClick={handleBack}
          >
            <ArrowLeftIcon className="opacity-60 size-3.5" />
            Back
          </Button>

          <Button
            size="sm"
            type="submit"
          >
            Next
            <ArrowRight className="opacity-60 size-3.5" />
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
