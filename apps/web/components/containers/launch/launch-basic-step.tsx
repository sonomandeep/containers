"use client";

import { launchContainerSchema } from "@containers/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import { useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import type z from "zod";
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

type Props = {
  handleNext: () => void;
};

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
    [name, image?.id, command, restartPolicy]
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
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Name</FieldLabel>

                  <Input
                    {...field}
                    aria-invalid={fieldState.invalid}
                    id={field.name}
                    placeholder="Backend App"
                    type="text"
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
                  <FieldLabel htmlFor={field.name}>Image</FieldLabel>

                  <Select
                    name={field.name}
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <SelectTrigger aria-invalid={fieldState.invalid} id="image">
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
              control={form.control}
              name="restartPolicy"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Restart Policy</FieldLabel>

                  <Select
                    defaultValue={field.value}
                    name={field.name}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger
                      aria-invalid={fieldState.invalid}
                      id={field.name}
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
              control={form.control}
              name="command"
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
          className="inline-flex w-full justify-between"
          orientation="horizontal"
        >
          <Button disabled size="sm" type="button" variant="outline">
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
