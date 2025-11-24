"use client";

import { DialogClose } from "@radix-ui/react-dialog";
import { CornerDownLeftIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import REGISTRIES from "@/lib/constants/registries";

export function PullImageDialog() {
  const [registry, setRegistry] = useState(REGISTRIES.at(0));

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm">
          Pull Image

          <KbdGroup>
            <Kbd>
              <CornerDownLeftIcon />
            </Kbd>
          </KbdGroup>
        </Button>
      </DialogTrigger>

      <form>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pull Image</DialogTitle>
            <DialogDescription>
              Enter the name and tag of the image you want to pull.
            </DialogDescription>
          </DialogHeader>

          <FieldSet>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name">name</FieldLabel>

                <ButtonGroup className="w-full">
                  <Select value={registry.host} onValueChange={(value) => setRegistry(REGISTRIES.find((current) => current.host === value))}>
                    <SelectTrigger className="font-mono w-40">{registry.label}</SelectTrigger>

                    <SelectContent className="min-w-24">
                      {REGISTRIES.map((current) => (
                        <SelectItem key={current.host} value={current.host}>
                          {current.label}
                          <span className="text-muted-foreground">{current.host}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Input id="name" name="name" placeholder="nginx" />
                </ButtonGroup>
                <FieldDescription>This appears on invoices and emails.</FieldDescription>
              </Field>

              <Field>
                <FieldLabel htmlFor="tag">Tag</FieldLabel>
                <Input id="tag" name="tag" placeholder="latest" autoComplete="off" />
              </Field>
            </FieldGroup>
          </FieldSet>

          <DialogFooter>
            <ButtonGroup>
              <DialogClose asChild>
                <Button size="sm" variant="secondary" type="button">
                  Cancel

                  <KbdGroup>
                    <Kbd>ESC</Kbd>
                  </KbdGroup>
                </Button>
              </DialogClose>
            </ButtonGroup>

            <Button size="sm" type="submit">
              Pull Image

              <KbdGroup>
                <Kbd>
                  <CornerDownLeftIcon />
                </Kbd>
              </KbdGroup>
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
