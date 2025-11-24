"use client";

import { BoxIcon, CornerDownLeftIcon } from "lucide-react";
import {
  SheetHeaderBackButton,
  SheetHeaderBadge,
  SheetHeaderToolbar,
} from "@/components/core/sheet-header";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
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
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";

export function LaunchContainerSheet() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="sm">
          New Container
          <CornerDownLeftIcon className="size-3.5 opacity-60" />
        </Button>
      </SheetTrigger>

      <SheetContent side="right">
        <SheetHeaderToolbar>
          <div className="inline-flex items-center gap-2">
            <SheetHeaderBackButton />
            <SheetHeaderBadge icon={BoxIcon}>New Container</SheetHeaderBadge>
          </div>
        </SheetHeaderToolbar>

        <form className="h-full flex flex-col">
          <div className="flex-1 w-full">
            <div className="p-4 border-b border-secondary">
              <FieldSet>
                <FieldLegend>Main</FieldLegend>
                <FieldDescription>
                  This appears on invoices and emails.
                </FieldDescription>

                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="name">Name</FieldLabel>
                    <Input
                      id="name"
                      name="name"
                      placeholder="web-server"
                      autoComplete="off"
                    />
                    <FieldDescription>
                      Optional: Assign a name to the container.
                    </FieldDescription>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="command">Command</FieldLabel>
                    <Textarea
                      id="command"
                      name="command"
                      placeholder="Override default container command"
                      autoComplete="off"
                    />
                  </Field>

                  <Field>
                    <FieldLabel>Department</FieldLabel>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="engineering">Engineering</SelectItem>
                        <SelectItem value="design">Design</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="sales">Sales</SelectItem>
                        <SelectItem value="support">
                          Customer Support
                        </SelectItem>
                        <SelectItem value="hr">Human Resources</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="operations">Operations</SelectItem>
                      </SelectContent>
                    </Select>
                    <FieldDescription>
                      Select your department or area of work.
                    </FieldDescription>
                  </Field>
                </FieldGroup>
              </FieldSet>
            </div>
          </div>

          <SheetFooter className="border-t border-secondary p-2">
            <div className="inline-flex items-center justify-end gap-2">
              <SheetClose asChild>
                <Button size="sm" variant="secondary" type="button">
                  Close
                </Button>
              </SheetClose>

              <Button size="sm" type="submit">
                Save
                <CornerDownLeftIcon className="size-3.5 opacity-60" />
              </Button>
            </div>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
