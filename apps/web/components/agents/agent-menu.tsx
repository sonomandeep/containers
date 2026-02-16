"use client";

import type { Agent } from "@containers/shared";
import {
  AlertCircleIcon,
  CheckIcon,
  CopyIcon,
  CornerDownLeftIcon,
  EllipsisVerticalIcon,
  Trash2Icon,
} from "lucide-react";
import { useState, useTransition } from "react";
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
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { removeAgent } from "@/lib/services/agents.service";

type Props = {
  agent: Agent;
};

export function AgentMenu({ agent }: Props) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger render={<Button size="icon-sm" variant="ghost" />}>
          <EllipsisVerticalIcon />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => setDeleteDialogOpen(true)}
            variant="destructive"
          >
            <Trash2Icon />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteAgentAlertDialog
        id={agent.id}
        name={agent.name}
        open={deleteDialogOpen}
        setOpen={setDeleteDialogOpen}
      />
    </>
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
                  <FieldLabel htmlFor="name">
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
                    id="name"
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
