"use client";

import { BoxIcon, PlusIcon } from "lucide-react";
import {
  SheetHeaderBackButton,
  SheetHeaderBadge,
  SheetHeaderToolbar,
} from "@/components/core/sheet-header";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function LaunchContainerSheet() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="sm" variant="outline">
          <PlusIcon className="size-3.5 opacity-80" />
          New Container
        </Button>
      </SheetTrigger>

      <SheetContent side="right">
        <SheetHeaderToolbar>
          <div className="inline-flex items-center gap-2">
            <SheetHeaderBackButton />
            <SheetHeaderBadge icon={BoxIcon}>New Container</SheetHeaderBadge>
          </div>
        </SheetHeaderToolbar>

        <form className="p-4">
          <FieldSet>
            <FieldLegend>Profile</FieldLegend>
            <FieldDescription>
              This appears on invoices and emails.
            </FieldDescription>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name">Full name</FieldLabel>
                <Input id="name" autoComplete="off" placeholder="Evil Rabbit" />
                <FieldDescription>
                  This appears on invoices and emails.
                </FieldDescription>
              </Field>
              <Field>
                <FieldLabel htmlFor="username">Username</FieldLabel>
                <Input id="username" autoComplete="off" aria-invalid />
                <FieldError>Choose another username.</FieldError>
              </Field>
              <Field orientation="horizontal">
                <Switch id="newsletter" />
                <FieldLabel htmlFor="newsletter">
                  Subscribe to the newsletter
                </FieldLabel>
              </Field>
            </FieldGroup>
          </FieldSet>
        </form>
      </SheetContent>
    </Sheet>
  );
}
