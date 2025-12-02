"use client";

import type z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeftIcon, ArrowRight, ListPlusIcon, NetworkIcon, PlusIcon, XIcon } from "lucide-react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
} from "@/components/ui/empty";
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

                    <Input {...field} id={field.name} type="number" placeholder="2" aria-invalid={fieldState.invalid} />

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

                    <Input {...field} id={field.name} type="number" placeholder="2048" aria-invalid={fieldState.invalid} />

                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </div>

            <FieldSeparator />

            <Field>
              <div className="inline-flex justify-between items-center">
                <FieldLabel>Environment Variables</FieldLabel>

                <Button
                  variant="ghost"
                  size="icon-xs"
                  type="button"
                  onClick={() => envs.append({ key: "", value: "" })}
                >
                  <PlusIcon />
                </Button>
              </div>

              <div className="space-y-2">
                {envs.fields.length > 0
                  ? (envs.fields.map((field, index) => (
                      <div key={field.id} className="flex gap-2">
                        <Controller
                          name={`envs.${index}.key`}
                          control={form.control}
                          render={({ field, fieldState }) => (
                            <Field>
                              <Input
                                {...field}
                                placeholder="Key"
                                className="font-mono"
                                aria-invalid={fieldState.invalid}
                              />

                              {fieldState.invalid && (
                                <FieldError errors={[fieldState.error]} />
                              )}
                            </Field>
                          )}
                        />

                        <Controller
                          name={`envs.${index}.value`}
                          control={form.control}
                          render={({ field, fieldState }) => (
                            <Field>
                              <Input
                                {...field}
                                placeholder="Value"
                                className="font-mono"
                                aria-invalid={fieldState.invalid}
                              />
                              {fieldState.invalid && (
                                <FieldError errors={[fieldState.error]} />
                              )}
                            </Field>
                          )}
                        />

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => envs.remove(index)}
                        >
                          <XIcon className="size-3.5 opacity-60" />
                        </Button>
                      </div>
                    )))
                  : (
                      <Empty className="h-9 p-0! flex items-center border border-dashed">
                        <EmptyHeader>
                          <EmptyDescription className="flex flex-row items-center justify-center gap-2">
                            <ListPlusIcon className="size-3.5 opacity-60" />
                            No environment variables defined.
                          </EmptyDescription>
                        </EmptyHeader>
                      </Empty>
                    )}
              </div>
            </Field>

            <Field>
              <div className="inline-flex justify-between items-center">
                <FieldLabel>Port Mappings</FieldLabel>

                <Button
                  variant="ghost"
                  size="icon-xs"
                  type="button"
                  onClick={() => ports.append({ hostPort: "", containerPort: "" })}
                >
                  <PlusIcon />
                </Button>
              </div>

              <div className="space-y-2">
                {ports.fields.length > 0
                  ? ports.fields.map((field, index) => (
                      <div key={field.id} className="flex gap-2">
                        <Controller
                          name={`ports.${index}.hostPort`}
                          control={form.control}
                          render={({ field, fieldState }) => (
                            <Field>
                              <Input
                                {...field}
                                placeholder="Host"
                                className="font-mono"
                                aria-invalid={fieldState.invalid}
                              />

                              {fieldState.invalid && (
                                <FieldError errors={[fieldState.error]} />
                              )}
                            </Field>
                          )}
                        />

                        <Controller
                          name={`ports.${index}.containerPort`}
                          control={form.control}
                          render={({ field, fieldState }) => (
                            <Field>
                              <Input
                                {...field}
                                placeholder="Container"
                                className="font-mono"
                                aria-invalid={fieldState.invalid}
                              />
                              {fieldState.invalid && (
                                <FieldError errors={[fieldState.error]} />
                              )}
                            </Field>
                          )}
                        />

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => ports.remove(index)}
                        >
                          <XIcon className="size-3.5 opacity-60" />
                        </Button>
                      </div>
                    ))
                  : (
                      <Empty className="h-9 p-0! flex items-center border border-dashed">
                        <EmptyHeader>
                          <EmptyDescription className="flex flex-row items-center justify-center gap-2">
                            <NetworkIcon className="size-3.5 opacity-60" />
                            No port mappings defined.
                          </EmptyDescription>
                        </EmptyHeader>
                      </Empty>
                    )}
              </div>
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
