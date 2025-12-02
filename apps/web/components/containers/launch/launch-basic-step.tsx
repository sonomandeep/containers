"use client";

import type z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
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
import { useImagesStore, useLaunchContainerStore } from "@/lib/store";

interface Props {
  handleNext: () => void;
}

export function LaunchBasicStep({ handleNext }: Props) {
  const setBasicInput = useLaunchContainerStore((state) => state.setBasicInput);
  const images = useImagesStore((state) => state.images);
  const form = useForm<z.infer<typeof launchBasicSchema>>({
    resolver: zodResolver(launchBasicSchema),
    defaultValues: {
      name: "",
      imageId: "",
      command: "",
      restartPolicy: "no",
    },
  });

  function onSubmit(data: z.infer<typeof launchBasicSchema>) {
    const selected
      = images.find((opt) => opt.id === data.imageId) || null;
    setBasicInput({
      name: data.name,
      image: selected,
      restartPolicy: data.restartPolicy,
      command: data.command,
    });
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

                  <Input
                    {...field}
                    id={field.name}
                    type="text"
                    placeholder="Backend App"
                    aria-invalid={fieldState.invalid}
                  />

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="imageId"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Image</FieldLabel>

                  <Select
                    name={field.name}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger id="image" aria-invalid={fieldState.invalid}>
                      <SelectValue placeholder="Select image" />
                    </SelectTrigger>

                    <SelectContent>
                      {images.map((option) => (
                        <SelectItem key={option.id} value={option.id}>
                          <span>{option.repoTags[0] ?? option.id}</span>
                          <span className="text-muted-foreground">{option.id.replace("sha256:", "").slice(0, 12)}</span>
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
              name="restartPolicy"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Restart Policy</FieldLabel>

                  <Select
                    name={field.name}
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                    >
                      <SelectValue placeholder="Select restart policy" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="no">No</SelectItem>
                      <SelectItem value="on-failure">On failure</SelectItem>
                      <SelectItem value="always">Always</SelectItem>
                      <SelectItem value="unless-stopped">
                        Unless stopped
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="command"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>
                    Command (Optional)
                  </FieldLabel>
                  <Textarea
                    {...field}
                    id={field.name}
                    placeholder="e.g. npm start"
                    rows={4}
                  />
                  <FieldDescription>Custom startup command.</FieldDescription>

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </FieldSet>

        <Field
          orientation="horizontal"
          className="w-full inline-flex justify-between"
        >
          <Button disabled size="sm" type="button" variant="outline">
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
