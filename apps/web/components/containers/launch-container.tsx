"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CornerDownLeftIcon } from "lucide-react";
import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import z from "zod";
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
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useImagesStore } from "@/lib/store/images.store";

const restartPolicies = [
  {
    id: "no-policy",
    value: "No Policy",
  },
  {
    id: "always",
    value: "Always",
  },
  {
    id: "on-failure",
    value: "On Failure",
  },
  {
    id: "unless-stopped",
    value: "Unless Stopped",
  },
] as const;

const formSchema = z.object({
  name: z.string(),
  image: z.string(),
  command: z.string().optional(),
  restartPolicy: z.string(),
});

export function LaunchContainerDialog() {
  const store = useImagesStore((state) => state);
  const [isPending, startTransition] = useTransition();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      image: "",
      command: "",
      restartPolicy: "",
    },
  });

  function handleSubmit(input: z.infer<typeof formSchema>) {
    // biome-ignore lint/suspicious/noConsole: temp
    console.log(input);
  }

  return (
    <Dialog>
      <DialogTrigger render={<Button />}>
        Launch Container
        <CornerDownLeftIcon className="size-3 opacity-60" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Launch Container</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <DialogCard>
            <Controller
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                  <Input
                    {...field}
                    aria-invalid={fieldState.invalid}
                    id={field.name}
                    placeholder="api-gateway"
                  />

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="image"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="image">Image</FieldLabel>
                  <Select
                    name={field.name}
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <SelectTrigger
                      aria-invalid={fieldState.invalid}
                      id="registry"
                    >
                      <SelectValue>
                        {(value: string) => {
                          if (!value) {
                            return "Select an image";
                          }

                          const current = store.images.find(
                            (item) => item.id === value
                          );

                          if (!current) {
                            return <span>value</span>;
                          }

                          return <p>{current.tags.at(0) || current.name}</p>;
                        }}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {store.images.map((image) => (
                        <SelectItem key={image.id} value={image.id}>
                          {image.tags.at(0) || image.name}
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

            <Controller
              control={form.control}
              name="command"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="command">Command</FieldLabel>
                  <Textarea
                    {...field}
                    aria-invalid={fieldState.invalid}
                    id="command"
                    placeholder="e.g. node index.js"
                  />

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="restartPolicy"
              render={({ field, fieldState }) => (
                <FieldSet>
                  <FieldLabel>Restart Policy</FieldLabel>

                  <RadioGroup
                    className="grid grid-cols-2"
                    name={field.name}
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    {restartPolicies.map((policy) => (
                      <FieldLabel htmlFor={policy.id} key={policy.id}>
                        <Field
                          data-invalid={fieldState.invalid}
                          orientation="horizontal"
                        >
                          <FieldContent className="items-center">
                            <FieldTitle className="font-mono">
                              {policy.value}
                            </FieldTitle>
                          </FieldContent>
                          <RadioGroupItem
                            aria-invalid={fieldState.invalid}
                            className="hidden"
                            id={policy.id}
                            value={policy.id}
                          />
                        </Field>
                      </FieldLabel>
                    ))}
                  </RadioGroup>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </FieldSet>
              )}
            />
          </DialogCard>

          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>
              Cancel
            </DialogClose>

            <Button
              disabled={isPending || !form.formState.isValid}
              type="submit"
            >
              Confirm
              {isPending ? (
                <Spinner className="size-3 opacity-60" />
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
