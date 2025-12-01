"use client";

import type z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeftIcon, ArrowRight } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
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
    },
  });

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

            {/* <div className="flex items-center justify-between"> */}
            {/*   <Label>Environment variables</Label> */}
            {/*   <Button onClick={handleAddEnv} size="sm" type="button" variant="ghost"> */}
            {/*     Add */}
            {/*   </Button> */}
            {/* </div> */}
            {/**/}
            {/* <div className="grid gap-2"> */}
            {/*   {envVars.map((env, index) => ( */}
            {/*     <div */}
            {/*       className="grid grid-cols-2 gap-2" */}
            {/*       key={`${index}-${env.key}-${env.value}`} */}
            {/*     > */}
            {/*       <Input */}
            {/*         name={`env[${index}].key`} */}
            {/*         onChange={(e) => handleEnvChange(index, "key", e.target.value)} */}
            {/*         placeholder="KEY" */}
            {/*         value={env.key} */}
            {/*       /> */}
            {/*       <Input */}
            {/*         name={`env[${index}].value`} */}
            {/*         onChange={(e) => */}
            {/*           handleEnvChange(index, "value", e.target.value)} */}
            {/*         placeholder="Value" */}
            {/*         value={env.value} */}
            {/*       /> */}
            {/*     </div> */}
            {/*   ))} */}
            {/* </div> */}
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
