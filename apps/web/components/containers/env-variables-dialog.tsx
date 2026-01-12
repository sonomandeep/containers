"use client";

import {
  AlertTriangleIcon,
  CornerDownLeftIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";
import { useState } from "react";
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
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";

type Props = {
  id: string;
  name: string;
  open: boolean;
  setOpen(value: boolean): void;
};

export default function EnvVariablesDialog({ id, name, open, setOpen }: Props) {
  const form = useForm({
    defaultValues: {
      envs: [{ key: "", value: "" }],
    },
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "envs",
  });
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = (values: unknown) => {
    console.log(values);
  };

  return (
    <Dialog onOpenChange={(value) => setOpen(value)} open={open}>
      <DialogContent className="gap-0! bg-neutral-100! p-0!">
        <DialogHeader>
          <div className="inline-flex items-baseline gap-2 p-2">
            <DialogTitle className="text-sm!">
              Environment Variables
            </DialogTitle>
            <span className="text-muted-foreground text-xs">{name}</span>
          </div>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="mx-2 flex flex-col gap-3 rounded-lg border border-neutral-200 bg-white p-3">
            <Alert variant="warning">
              <div className="inline-flex items-center gap-2">
                <AlertTriangleIcon className="size-3" />
                <AlertTitle>
                  Saving will restart <span className="font-mono">{name}</span>
                  &nbsp;container.
                </AlertTitle>
              </div>
            </Alert>

            <div className="flex flex-col gap-3">
              <FieldSet className="gap-2">
                {fields.map((field, index) => (
                  <div
                    className="inline-flex items-center gap-2 font-mono"
                    key={field.id}
                  >
                    <Controller
                      name={`envs.${index}.key`}
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <Input
                            {...field}
                            aria-invalid={fieldState.invalid}
                            placeholder="KEY"
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
                        <Field data-invalid={fieldState.invalid}>
                          <Input
                            {...field}
                            aria-invalid={fieldState.invalid}
                            placeholder="VALUE"
                          />
                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      )}
                    />

                    <Button
                      size="icon-sm"
                      variant="ghost"
                      type="button"
                      onClick={() => remove(index)}
                    >
                      <Trash2Icon className="opacity-60" />
                    </Button>
                  </div>
                ))}
              </FieldSet>

              <Button
                className="border-dashed text-muted-foreground"
                variant="outline"
                type="button"
                onClick={() => append({ key: "", value: "" })}
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
