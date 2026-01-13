"use client";

import { type PullImageInput, pullImageSchema } from "@containers/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import { CornerDownLeftIcon, LayersIcon } from "lucide-react";
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
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import REGISTRIES from "@/lib/constants/registries";
import { Input } from "@/components/ui/input";
import { Alert, AlertTitle } from "../ui/alert";
import { useTransition } from "react";
import { pullImage } from "@/lib/services/images.service";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { useImagesStore } from "@/lib/store/images.store";

export function PullImageDialog() {
  const store = useImagesStore((state) => state);
  const [isPending, startTransition] = useTransition();
  const form = useForm<PullImageInput>({
    resolver: zodResolver(pullImageSchema),
    defaultValues: {
      registry: "",
      name: "",
      tag: "",
    },
  });

  function handleSubmit(input: PullImageInput) {
    startTransition(async () => {
      toast.promise(
        pullImage(input).then(({ data, error }) => {
          if (error) {
            throw new Error(error);
          }

          if (!data) {
            throw new Error("Unexpected error occured, try again later.");
          }

          store.setImages([...store.images, data]);

          return data;
        }),
        {
          loading: "Pulling image...",
          success: (data) => (
            <p>
              Image <span className="font-mono">{data.name}</span> pulled
              successfully
            </p>
          ),
          error: (error) => error.message,
        }
      );
    });
  }

  const registry = form.watch("registry");
  const name = form.watch("name");
  const tag = form.watch("tag");

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

                  <FieldDescription>
                    Where the image is hosted (e.g. Docker Hub, GHCR).
                  </FieldDescription>

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <div className="grid grid-cols-[1fr_128px] gap-2">
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                      placeholder="Image name"
                    />

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="tag"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Tag</FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                      placeholder="Image tag"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>

            {registry && name && tag && (
              <Alert variant="info">
                <div className="inline-flex gap-2 items-center">
                  <LayersIcon className="size-3 opacity-60" />
                  <AlertTitle className="font-mono">
                    {`${registry}/${name}:${tag}`.toLowerCase()}
                  </AlertTitle>
                </div>
              </Alert>
            )}
          </DialogCard>

          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>
              Cancel
            </DialogClose>

            <Button
              type="submit"
              disabled={isPending || !form.formState.isValid}
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
