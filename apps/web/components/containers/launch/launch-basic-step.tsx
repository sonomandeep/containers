"use client";

import type z from "zod";
import { launchContainerSchema } from "@containers/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import { useMemo } from "react";
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
import { useImagesStore, useLaunchContainerStore } from "@/lib/store";

interface Props {
  handleNext: () => void;
}

const schema = launchContainerSchema.pick({
  name: true,
  image: true,
  command: true,
  restartPolicy: true,
});
type BasicInput = z.infer<typeof schema>;

export function LaunchBasicStep({ handleNext }: Props) {
  const setBasicInput = useLaunchContainerStore((state) => state.setBasicInput);
  const name = useLaunchContainerStore((state) => state.name);
  const image = useLaunchContainerStore((state) => state.image);
  const restartPolicy = useLaunchContainerStore((state) => state.restartPolicy);
  const command = useLaunchContainerStore((state) => state.command);
  const images = useImagesStore((state) => state.images);
  const defaultValues = useMemo(
    () => ({
      name: name || "",
      image: image?.id || "",
      command: command || "",
      restartPolicy: restartPolicy || "no",
    }),
    [name, image?.id, command, restartPolicy],
  );
  const form = useForm<BasicInput>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  function onSubmit(data: BasicInput) {
    const selected = images.find((opt) => opt.id === data.image) || null;
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
              name="image"
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
                          <span className="text-muted-foreground">
                            {option.id.replace("sha256:", "").slice(0, 12)}
                          </span>
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
