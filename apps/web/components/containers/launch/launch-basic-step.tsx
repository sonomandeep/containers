"use client";

import type z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeftIcon, ArrowRight } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { launchBasicSchema } from "@/lib/schema/containers";

interface Props {
  handleNext: () => void;
}

export function LaunchBasicStep({ handleNext }: Props) {
  const form = useForm<z.infer<typeof launchBasicSchema>>({
    resolver: zodResolver(launchBasicSchema),
    defaultValues: {
      name: "",
      image: "",
      command: "",
      network: "bridge",
      restartPolicy: "no",
    },
  });

  function onSubmit(data: z.infer<typeof launchBasicSchema>) {
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
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Name</FieldLabel>

                  <Input {...field} id={field.name} type="text" placeholder="Backend App" aria-invalid={fieldState.invalid} />

                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="image"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Image</FieldLabel>

                  <Select name={field.name} value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="image" aria-invalid={fieldState.invalid}>
                      <SelectValue placeholder="Select image" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="node">node:20-alpine</SelectItem>
                      <SelectItem value="python">python:3.12-slim</SelectItem>
                      <SelectItem value="nginx">nginx:stable-alpine</SelectItem>
                    </SelectContent>
                  </Select>

                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="command"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Command (Optional)</FieldLabel>
                  <Textarea
                    {...field}
                    id={field.name}
                    placeholder="e.g. npm start"
                    rows={4}
                  />
                  <FieldDescription>
                    Custom startup command.
                  </FieldDescription>

                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <div className="inline-flex gap-2">
              <Controller
                name="network"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Network Mode</FieldLabel>

                    <Select name={field.name} defaultValue={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id={field.name} aria-invalid={fieldState.invalid}>
                        <SelectValue placeholder="Select mode" />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="bridge">Bridge (default)</SelectItem>
                        <SelectItem value="host">Host</SelectItem>
                        <SelectItem value="none">None</SelectItem>
                      </SelectContent>
                    </Select>

                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                name="restartPolicy"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Restart Policy</FieldLabel>

                    <Select name={field.name} defaultValue={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id={field.name} aria-invalid={fieldState.invalid}>
                        <SelectValue placeholder="Select restart policy" />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="no">No</SelectItem>
                        <SelectItem value="on-failure">On failure</SelectItem>
                        <SelectItem value="always">Always</SelectItem>
                        <SelectItem value="unless-stopped">Unless stopped</SelectItem>
                      </SelectContent>
                    </Select>

                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </div>
          </FieldGroup>
        </FieldSet>

        <Field orientation="horizontal" className="w-full inline-flex justify-between">
          <Button
            disabled
            size="sm"
            type="button"
            variant="outline"
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
