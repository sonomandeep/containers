"use client";

import { type ConfigStepInput, configStepSchema } from "@containers/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import {
  DialogCard,
  DialogClose,
  DialogFooter,
} from "@/components/core/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Props = {
  handleSubmit: (input: ConfigStepInput) => void;
};

export function ConfigStep({ handleSubmit }: Props) {
  const form = useForm<ConfigStepInput>({
    resolver: zodResolver(configStepSchema),
    defaultValues: {
      cpu: "",
      memory: "",
      network: "",
    },
  });

  return (
    <form className="w-full" onSubmit={form.handleSubmit(handleSubmit)}>
      <DialogCard className="mx-0 w-full">
        <div className="inline-flex gap-2">
          <Controller
            control={form.control}
            name="cpu"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>CPU</FieldLabel>
                <Input
                  {...field}
                  aria-invalid={fieldState.invalid}
                  id={field.name}
                  placeholder="0.5"
                />

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="memory"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Memory (MB)</FieldLabel>
                <Input
                  {...field}
                  aria-invalid={fieldState.invalid}
                  id={field.name}
                  placeholder="512"
                />

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </div>

        <Controller
          control={form.control}
          name="network"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="network">Network</FieldLabel>
              <Select
                name={field.name}
                onValueChange={field.onChange}
                value={field.value}
              >
                <SelectTrigger aria-invalid={fieldState.invalid} id="network">
                  <SelectValue>
                    {(value: string) => {
                      if (!value) {
                        return "Select a network";
                      }

                      const current = [].find(() => false);

                      if (!current) {
                        return <span>value</span>;
                      }

                      return <p>{current}</p>;
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {[].map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <DialogFooter className="px-0">
          <DialogClose render={<Button type="button" variant="outline" />}>
            Back
          </DialogClose>

          <Button type="submit">Next</Button>
        </DialogFooter>
      </DialogCard>
    </form>
  );
}
