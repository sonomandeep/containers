"use client";

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
import { useMemo } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import type z from "zod";
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
    (state) => state.setConfigInput
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
    [cpu, memory, network, envsDefault, portsDefault]
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
            <div className="inline-flex w-full gap-2">
              <Controller
                control={form.control}
                name="cpu"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>CPU (vCPU)</FieldLabel>

                    <Input
                      {...field}
                      aria-invalid={fieldState.invalid}
                      id={field.name}
                      placeholder="2"
                      type="number"
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
                    <FieldLabel htmlFor={field.name}>Memory (in mb)</FieldLabel>

                    <Input
                      {...field}
                      aria-invalid={fieldState.invalid}
                      id={field.name}
                      placeholder="2048"
                      type="number"
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
                  <FieldLabel htmlFor={field.name}>Network Mode</FieldLabel>

                  <Select
                    defaultValue={field.value}
                    name={field.name}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger
                      aria-invalid={fieldState.invalid}
                      id={field.name}
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

              <div className="space-y-2">
                {envs.fields.length > 0 ? (
                  envs.fields.map((current, index) => (
                    <div className="flex gap-2" key={current.id}>
                      <Controller
                        control={form.control}
                        name={`envs.${index}.key`}
                        render={({ field, fieldState }) => (
                          <Field>
                            <Input
                              {...field}
                              aria-invalid={fieldState.invalid}
                              className="font-mono"
                              placeholder="Key"
                            />

                            {fieldState.invalid && (
                              <FieldError errors={[fieldState.error]} />
                            )}
                          </Field>
                        )}
                      />

                      <Controller
                        control={form.control}
                        name={`envs.${index}.value`}
                        render={({ field, fieldState }) => (
                          <Field>
                            <Input
                              {...field}
                              aria-invalid={fieldState.invalid}
                              className="font-mono"
                              placeholder="Value"
                            />
                            {fieldState.invalid && (
                              <FieldError errors={[fieldState.error]} />
                            )}
                          </Field>
                        )}
                      />

                      <Button
                        onClick={() => envs.remove(index)}
                        size="icon"
                        type="button"
                        variant="ghost"
                      >
                        <XIcon className="size-3.5 opacity-60" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <Empty className="flex h-9 items-center border border-dashed p-0!">
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
              <div className="inline-flex items-center justify-between">
                <FieldLabel>Port Mappings</FieldLabel>

                <Button
                  onClick={() =>
                    ports.append({ hostPort: "", containerPort: "" })
                  }
                  size="icon-xs"
                  type="button"
                  variant="ghost"
                >
                  <PlusIcon />
                </Button>
              </div>

              <div className="space-y-2">
                {ports.fields.length > 0 ? (
                  ports.fields.map((current, index) => (
                    <div className="flex gap-2" key={current.id}>
                      <Controller
                        control={form.control}
                        name={`ports.${index}.hostPort`}
                        render={({ field, fieldState }) => (
                          <Field>
                            <Input
                              {...field}
                              aria-invalid={fieldState.invalid}
                              className="font-mono"
                              placeholder="Host"
                            />

                            {fieldState.invalid && (
                              <FieldError errors={[fieldState.error]} />
                            )}
                          </Field>
                        )}
                      />

                      <Controller
                        control={form.control}
                        name={`ports.${index}.containerPort`}
                        render={({ field, fieldState }) => (
                          <Field>
                            <Input
                              {...field}
                              aria-invalid={fieldState.invalid}
                              className="font-mono"
                              placeholder="Container"
                            />
                            {fieldState.invalid && (
                              <FieldError errors={[fieldState.error]} />
                            )}
                          </Field>
                        )}
                      />

                      <Button
                        onClick={() => ports.remove(index)}
                        size="icon"
                        type="button"
                        variant="ghost"
                      >
                        <XIcon className="size-3.5 opacity-60" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <Empty className="flex h-9 items-center border border-dashed p-0!">
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
          className="inline-flex w-full justify-between"
          orientation="horizontal"
        >
          <Button
            onClick={handleBack}
            size="sm"
            type="button"
            variant="outline"
          >
            <ArrowLeftIcon className="size-3.5 opacity-60" />
            Back
          </Button>

          <Button size="sm" type="submit">
            Next
            <ArrowRightIcon className="size-3.5 opacity-60" />
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
