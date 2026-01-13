"use client";

import { type PullImageInput, pullImageSchema } from "@containers/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import { CornerDownLeftIcon, LayersIcon } from "lucide-react";
import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import REGISTRIES from "@/lib/constants/registries";
import { pullImage } from "@/lib/services/images.service";
import { useImagesStore } from "@/lib/store/images.store";
import { Alert, AlertTitle } from "../ui/alert";

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
    startTransition(() => {
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
                            (item) => item.host === value
                          );

                          if (!current) {
                            return <span>value</span>;
                          }

                          return (
                            <p>
                              {current.label}
                              <span className="pl-2 text-muted-foreground">
                                {current.host}
                              </span>
                            </p>
                          );
                        }}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {REGISTRIES.map((item) => (
                        <SelectItem key={item.id} value={item.host}>
                          <p className="font-medium">
                            {item.label}
                            <span className="pl-2 font-mono font-normal text-muted-foreground">
                              {item.host}
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
                control={form.control}
                name="name"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                    <Input
                      {...field}
                      aria-invalid={fieldState.invalid}
                      id={field.name}
                      placeholder="Image name"
                    />

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="tag"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Tag</FieldLabel>
                    <Input
                      {...field}
                      aria-invalid={fieldState.invalid}
                      id={field.name}
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
                <div className="inline-flex items-center gap-2">
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
