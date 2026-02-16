"use client";

import {
  type Agent,
  type UpdateAgentInput,
  updateAgentSchema,
} from "@containers/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircleIcon,
  CheckIcon,
  CopyIcon,
  CornerDownLeftIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  Trash2Icon,
} from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/core/alert-dialog";
import {
  Dialog,
  DialogCard,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/core/dialog";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { removeAgent, updateAgent } from "@/lib/services/agents.service";

type Props = {
  agent: Agent;
};

export function AgentMenu({ agent }: Props) {
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger render={<Button size="icon-sm" variant="ghost" />}>
          <EllipsisVerticalIcon />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setRenameDialogOpen(true)}>
            <PencilIcon />
            Rename
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => setDeleteDialogOpen(true)}
            variant="destructive"
          >
            <Trash2Icon />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <RenameAgentDialog
        id={agent.id}
        name={agent.name}
        open={renameDialogOpen}
        setOpen={setRenameDialogOpen}
      />

      <DeleteAgentAlertDialog
        id={agent.id}
        name={agent.name}
        open={deleteDialogOpen}
        setOpen={setDeleteDialogOpen}
      />
    </>
  );
}

function RenameAgentDialog({
  id,
  name,
  open,
  setOpen,
}: {
  id: string;
  name: string;
  open: boolean;
  setOpen: (value: boolean) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const form = useForm<UpdateAgentInput>({
    resolver: zodResolver(updateAgentSchema),
    mode: "onChange",
    defaultValues: {
      name,
    },
  });
  const currentName = form.watch("name") ?? "";
  const hasNameChanged = currentName.trim() !== name.trim();

  useEffect(() => {
    if (open) {
      form.reset({ name });
      setSubmissionError(null);
    }
  }, [form, name, open]);

  function handleDialogStateChange(value: boolean) {
    setOpen(value);

    if (!value) {
      setSubmissionError(null);
      form.reset({ name });
    }
  }

  function handleSubmit(input: UpdateAgentInput) {
    setSubmissionError(null);

    startTransition(() => {
      updateAgent(id, input)
        .then((result) => {
          if (result.error || result.data === null) {
            setSubmissionError(
              result.error || "Unexpected error while updating the agent."
            );
            return;
          }

          toast.success("Agent updated successfully");
          handleDialogStateChange(false);
        })
        .catch(() => {
          setSubmissionError("Unexpected error while updating the agent.");
        });
    });
  }

  return (
    <Dialog onOpenChange={handleDialogStateChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Update Agent
            <span>Rename</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <DialogCard>
            <Field data-invalid={form.formState.errors.name !== undefined}>
              <FieldLabel htmlFor="rename-agent-name">Agent Name</FieldLabel>
              <Input
                {...form.register("name")}
                aria-invalid={form.formState.errors.name !== undefined}
                autoComplete="off"
                id="rename-agent-name"
                placeholder={name}
              />
              <FieldDescription>
                Choose a new unique name for this workspace.
              </FieldDescription>
              {form.formState.errors.name && (
                <FieldError errors={[form.formState.errors.name]} />
              )}
            </Field>

            {submissionError && (
              <Alert variant="destructive">
                <div className="inline-flex items-center gap-2">
                  <AlertCircleIcon className="size-3" />
                  <AlertTitle>{submissionError}</AlertTitle>
                </div>
              </Alert>
            )}
          </DialogCard>

          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>
              Cancel
            </DialogClose>

            <Button
              disabled={isPending || !form.formState.isValid || !hasNameChanged}
              type="submit"
            >
              Save
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

function DeleteAgentAlertDialog({
  id,
  name,
  open,
  setOpen,
}: {
  id: string;
  name: string;
  open: boolean;
  setOpen: (value: boolean) => void;
}) {
  const [agentName, setAgentName] = useState("");
  const [isPending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);

  function handleDialogStateChange(value: boolean) {
    setOpen(value);

    if (!value) {
      setAgentName("");
      setCopied(false);
    }
  }

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(name);

      setCopied(true);
      setTimeout(() => setCopied(false), 500);
    } catch {
      setCopied(false);
    }
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    startTransition(() => {
      toast.promise(
        removeAgent(id).then((result) => {
          if (result.error) {
            throw new Error(result.error);
          }

          handleDialogStateChange(false);

          return result;
        }),
        {
          loading: "Deleting agent...",
          success: "Agent deleted successfully",
          error: (error) => error.message,
        }
      );
    });
  };

  return (
    <AlertDialog onOpenChange={handleDialogStateChange} open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="inline-flex items-baseline gap-2 p-2">
            <AlertDialogTitle>Delete Agent</AlertDialogTitle>
            <span className="text-muted-foreground text-xs">{name}</span>
          </div>
        </AlertDialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="mx-2 flex flex-col gap-3 rounded-lg border border-card-border bg-background p-3">
            <Alert variant="destructive">
              <div className="inline-flex items-center gap-2">
                <AlertCircleIcon className="size-3" />
                <AlertTitle>This will permanently delete the agent.</AlertTitle>
              </div>
            </Alert>

            <FieldSet>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="delete-agent-name">
                    Type
                    <Button
                      className="inline-flex items-center gap-1.5"
                      onClick={copyToClipboard}
                      size="sm"
                      type="button"
                      variant="secondary"
                    >
                      {name}
                      {copied ? (
                        <CheckIcon className="size-2.5" />
                      ) : (
                        <CopyIcon className="size-2.5" />
                      )}
                    </Button>
                    to confirm
                  </FieldLabel>

                  <Input
                    autoComplete="off"
                    id="delete-agent-name"
                    onChange={(event) => setAgentName(event.target.value)}
                    placeholder={name}
                    value={agentName}
                  />

                  <FieldDescription>
                    This helps prevent accidental deletions.
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </FieldSet>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => handleDialogStateChange(false)}
              type="button"
            >
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              disabled={agentName !== name || isPending}
              type="submit"
              variant="destructive"
            >
              Delete Agent
              {isPending ? (
                <Spinner className="size-3" />
              ) : (
                <CornerDownLeftIcon className="size-3 opacity-60" />
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
