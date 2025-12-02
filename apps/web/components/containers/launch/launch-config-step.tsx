"use client";

import type z from "zod";
import { launchContainerSchema } from "@containers/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ListPlusIcon,
  NetworkIcon,
  PlusIcon,
  XIcon,
} from "lucide-react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Empty, EmptyDescription, EmptyHeader } from "@/components/ui/empty";
import {
  Field,
  FieldError,
  FieldGroup,
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
import { useLaunchContainerStore } from "@/lib/store";

interface Props {
  handleBack: () => void;
  handleNext: () => void;
}

const schema = launchContainerSchema.pick({
  cpu: true,
  memory: true,
  network: true,
  envs: true,
  ports: true,
});

type ConfigInput = z.infer<typeof schema>;

export function LaunchConfigStep({ handleBack, handleNext }: Props) {
  const setConfigInput = useLaunchContainerStore(
    (state) => state.setConfigInput,
  );
  const cpu = useLaunchContainerStore((state) => state.cpu);
  const memory = useLaunchContainerStore((state) => state.memory);
  const network = useLaunchContainerStore((state) => state.network);
  const envsDefault = useLaunchContainerStore((state) => state.envs);
  const portsDefault = useLaunchContainerStore((state) => state.ports);
  const defaultValues = useMemo(
    () => ({
      cpu: cpu || "",
      memory: memory || "",
      network: network || "bridge",
      envs: envsDefault?.length ? envsDefault : [],
      ports: portsDefault?.length ? portsDefault : [],
    }),
    [cpu, memory, network, envsDefault, portsDefault],
  );
  const form = useForm<ConfigInput>({
    resolver: zodResolver(schema),
    defaultValues,
  });
  const envs = useFieldArray({ control: form.control, name: "envs" });
  const ports = useFieldArray({ control: form.control, name: "ports" });

  function onSubmit(data: ConfigInput) {
    setConfigInput({
      cpu: data.cpu ?? "",
      memory: data.memory ?? "",
      network: data.network ?? "",
      envs: data.envs ?? [],
      ports: data.ports ?? [],
    });
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

                    <Input
                      {...field}
                      id={field.name}
                      type="number"
                      placeholder="2"
                      aria-invalid={fieldState.invalid}
                    />

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="memory"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Memory (in mb)</FieldLabel>

                    <Input
                      {...field}
                      id={field.name}
                      type="number"
                      placeholder="2048"
                      aria-invalid={fieldState.invalid}
                    />

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>

            <Controller
              name="network"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Network Mode</FieldLabel>

                  <Select
                    name={field.name}
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                    >
                      <SelectValue placeholder="Select mode" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="bridge">Bridge (default)</SelectItem>
                      <SelectItem value="host">Host</SelectItem>
                      <SelectItem value="none">None</SelectItem>
                    </SelectContent>
                  </Select>

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

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
                {envs.fields.length > 0 ? (
                  envs.fields.map((field, index) => (
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
                  ))
                ) : (
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
                  onClick={() =>
                    ports.append({ hostPort: "", containerPort: "" })
                  }
                >
                  <PlusIcon />
                </Button>
              </div>

              <div className="space-y-2">
                {ports.fields.length > 0 ? (
                  ports.fields.map((field, index) => (
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
                ) : (
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

        <Field
          orientation="horizontal"
          className="w-full inline-flex justify-between"
        >
          <Button
            size="sm"
            type="button"
            variant="outline"
            onClick={handleBack}
          >
            <ArrowLeftIcon className="opacity-60 size-3.5" />
            Back
          </Button>

          <Button size="sm" type="submit">
            Next
            <ArrowRightIcon className="opacity-60 size-3.5" />
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
