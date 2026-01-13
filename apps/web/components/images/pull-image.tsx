"use client";

import { type PullImageInput, pullImageSchema } from "@containers/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import { CornerDownLeftIcon } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import {
  Dialog,
  DialogCard,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/core/dialog";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import REGISTRIES from "@/lib/constants/registries";

export function PullImageDialog() {
  const form = useForm<PullImageInput>({
    resolver: zodResolver(pullImageSchema),
    defaultValues: {
      registry: "",
      name: "",
      tag: "",
    },
  });

  function handleSubmit(data: PullImageInput) {
    console.log(data);
  }

  return (
    <Dialog>
      <DialogTrigger render={<Button />}>
        Pull Image
        <CornerDownLeftIcon className="size-3 opacity-60" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pull Image</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <DialogCard>
            <Controller
              control={form.control}
              name="registry"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="registry">Registry</FieldLabel>
                  <Select
                    name={field.name}
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <SelectTrigger
                      aria-invalid={fieldState.invalid}
                      className="min-w-[120px]"
                      id="registry"
                    >
                      <SelectValue>
                        {(value: string) => {
                          if (!value) {
                            return "Select a registry";
                          }

                          const current = REGISTRIES.find(
                            (registry) => registry.host === value
                          );

                          if (!current) {
                            return <span>value</span>;
                          }

                          return (
                            <p>
                              {current.label}
                              <span className="text-muted-foreground pl-2">
                                {current.host}
                              </span>
                            </p>
                          );
                        }}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {REGISTRIES.map((registry) => (
                        <SelectItem key={registry.id} value={registry.host}>
                          <p className="font-medium">
                            {registry.label}
                            <span className="font-mono font-normal text-muted-foreground pl-2">
                              {registry.host}
                            </span>
                          </p>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </DialogCard>

          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>
              Cancel
            </DialogClose>

            <Button type="submit">
              Confirm
              <CornerDownLeftIcon className="size-3 opacity-60" />
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
