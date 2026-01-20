"use client";

import { type ConfigStepInput, configStepSchema } from "@containers/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import { ListPlusIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { DialogCard, DialogFooter } from "@/components/core/dialog";
import { Button } from "@/components/ui/button";
import { Empty, EmptyDescription, EmptyHeader } from "@/components/ui/empty";
import {
  Field,
  FieldError,
  FieldLabel,
  FieldSeparator,
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

type Props = {
  goBack: () => void;
  handleSubmit: (input: ConfigStepInput) => void;
};

export function ConfigStep({ goBack, handleSubmit }: Props) {
  const form = useForm<ConfigStepInput>({
    resolver: zodResolver(configStepSchema),
    defaultValues: {
      cpu: "",
      memory: "",
      network: "",
      envs: [],
      ports: [],
    },
  });

  const envs = useFieldArray({ control: form.control, name: "envs" });
  const ports = useFieldArray({ control: form.control, name: "ports" });

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

        <FieldSeparator />

        <div className="flex flex-col gap-3">
          <FieldSet className="gap-2">
            <div className="inline-flex items-center justify-between">
              <FieldLabel>Environment Variables</FieldLabel>

              <Button
                onClick={() => envs.append({ key: "", value: "" })}
                size="icon-xs"
                type="button"
                variant="ghost"
              >
                <PlusIcon />
              </Button>
            </div>

            {envs.fields.length > 0 ? (
              envs.fields.map((item, index) => (
                <div
                  className="inline-flex items-center gap-2 font-mono"
                  key={item.id}
                >
                  <Controller
                    control={form.control}
                    name={`envs.${index}.key`}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <Input
                          {...field}
                          aria-invalid={fieldState.invalid}
                          placeholder="KEY"
                        />
                      </Field>
                    )}
                  />

                  <Controller
                    control={form.control}
                    name={`envs.${index}.value`}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <Input
                          {...field}
                          aria-invalid={fieldState.invalid}
                          placeholder="VALUE"
                        />
                      </Field>
                    )}
                  />

                  <Button
                    onClick={() => envs.remove(index)}
                    size="icon-sm"
                    type="button"
                    variant="ghost"
                  >
                    <Trash2Icon className="opacity-60" />
                  </Button>
                </div>
              ))
            ) : (
              <div>
                <Empty className="flex h-7! items-center rounded-md border border-dashed p-0!">
                  <EmptyHeader>
                    <EmptyDescription className="flex flex-row items-center justify-center gap-2">
                      <ListPlusIcon className="size-3.5 opacity-60" />
                      No environment variables defined.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              </div>
            )}
          </FieldSet>

          {form.formState.errors.envs && (
            <FieldError>Validation error, check envs</FieldError>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <FieldSet className="gap-2">
            <div className="inline-flex items-center justify-between">
              <FieldLabel>Ports</FieldLabel>

              <Button
                onClick={() => ports.append({ public: "", private: "" })}
                size="icon-xs"
                type="button"
                variant="ghost"
              >
                <PlusIcon />
              </Button>
            </div>

            {ports.fields.length > 0 ? (
              ports.fields.map((item, index) => (
                <div
                  className="inline-flex items-center gap-2 font-mono"
                  key={item.id}
                >
                  <Controller
                    control={form.control}
                    name={`ports.${index}.public`}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <Input
                          {...field}
                          aria-invalid={fieldState.invalid}
                          placeholder="Public"
                        />
                      </Field>
                    )}
                  />

                  <Controller
                    control={form.control}
                    name={`ports.${index}.private`}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <Input
                          {...field}
                          aria-invalid={fieldState.invalid}
                          placeholder="Private"
                        />
                      </Field>
                    )}
                  />

                  <Button
                    onClick={() => ports.remove(index)}
                    size="icon-sm"
                    type="button"
                    variant="ghost"
                  >
                    <Trash2Icon className="opacity-60" />
                  </Button>
                </div>
              ))
            ) : (
              <div>
                <Empty className="flex h-7! items-center rounded-md border border-dashed p-0!">
                  <EmptyHeader>
                    <EmptyDescription className="flex flex-row items-center justify-center gap-2">
                      <ListPlusIcon className="size-3.5 opacity-60" />
                      No ports mappings defined.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              </div>
            )}
          </FieldSet>

          {form.formState.errors.ports && (
            <FieldError>Validation error, check port mappings</FieldError>
          )}
        </div>
      </DialogCard>

      <DialogFooter className="px-0">
        <Button onClick={goBack} type="button" variant="outline">
          Back
        </Button>

        <Button type="submit">Next</Button>
      </DialogFooter>
    </form>
  );
}
