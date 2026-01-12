"use client";

import { envinmentVariableSchema } from "@containers/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangleIcon,
  CornerDownLeftIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";
import { useTransition } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import z from "zod";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { updateEnvVariables } from "@/lib/services/containers.service";
import type { Container } from "@containers/shared";

type Props = {
  container: Container;
  open: boolean;
  setOpen(value: boolean): void;
};

const formSchema = z.object({
  envs: z.array(envinmentVariableSchema),
});

export default function EnvVariablesDialog({
  container,
  open,
  setOpen,
}: Props) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onSubmit",
    defaultValues: {
      envs: [...(container.envs || { key: "", value: "" })],
    },
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "envs",
  });
  const [isPending, startTransition] = useTransition();

  function handleSubmit(data: z.infer<typeof formSchema>) {
    startTransition(async () => {
      await updateEnvVariables(container.id, data.envs);
    });
  }

  return (
    <Dialog
      onOpenChange={(value) => {
        setOpen(value);
        if (!value) {
          form.reset();
        }
      }}
      open={open}
    >
      <DialogContent className="gap-0! bg-neutral-100! p-0!">
        <DialogHeader>
          <div className="inline-flex items-baseline gap-2 p-2">
            <DialogTitle className="text-sm!">
              Environment Variables
            </DialogTitle>
            <span className="text-muted-foreground text-xs">
              {container.name}
            </span>
          </div>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="mx-2 flex flex-col gap-3 rounded-lg border border-neutral-200 bg-white p-3">
            <Alert variant="warning">
              <div className="inline-flex items-center gap-2">
                <AlertTriangleIcon className="size-3" />
                <AlertTitle>
                  Saving will restart{" "}
                  <span className="font-mono">{container.name}</span>
                  &nbsp;container.
                </AlertTitle>
              </div>
            </Alert>

            <div className="flex flex-col gap-3">
              <FieldSet className="gap-2">
                {fields.map((item, index) => (
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
                      onClick={() => remove(index)}
                      size="icon-sm"
                      type="button"
                      variant="ghost"
                    >
                      <Trash2Icon className="opacity-60" />
                    </Button>
                  </div>
                ))}
              </FieldSet>

              {form.formState.errors.envs && (
                <FieldError>Validation error, check envs</FieldError>
              )}

              <Button
                className="border-dashed text-muted-foreground"
                onClick={() => append({ key: "", value: "" })}
                type="button"
                variant="outline"
              >
                <PlusIcon /> Add Variable
              </Button>
            </div>
          </div>

          <DialogFooter className="p-2">
            <DialogClose render={<Button variant="outline" />}>
              Cancel
            </DialogClose>

            <Button disabled={isPending} type="submit">
              Confirm
              {isPending ? (
                <Spinner className="size-3" />
              ) : (
                <CornerDownLeftIcon className="size-3 opacity-60" />
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
