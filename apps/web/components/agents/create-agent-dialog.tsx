"use client";

import {
  type Agent,
  type CreateAgentInput,
  createAgentSchema,
} from "@containers/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircleIcon,
  CheckIcon,
  CopyIcon,
  CornerDownLeftIcon,
} from "lucide-react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
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
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { createAgent } from "@/lib/services/agents.service";

const AGENT_IMAGE = "ghcr.io/containers/agent:latest";
const DOCKER_SOCKET_PATH = "/var/run/docker.sock";
const DEFAULT_AGENT_API_URL = "http://localhost:8080";

type DialogStep = "form" | "success";

export function CreateAgentDialog() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState<DialogStep>("form");
  const [createdAgent, setCreatedAgent] = useState<Agent | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const form = useForm<CreateAgentInput>({
    resolver: zodResolver(createAgentSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
    },
  });

  const command =
    createdAgent === null ? "" : buildAgentRunCommand(createdAgent.id);

  function resetDialogState() {
    setStep("form");
    setCreatedAgent(null);
    setSubmissionError(null);
    setCopied(false);
    form.reset();
  }

  function handleSubmit(input: CreateAgentInput) {
    setSubmissionError(null);

    startTransition(() => {
      createAgent(input)
        .then((result) => {
          if (result.error || result.data === null) {
            setSubmissionError(
              result.error || "Unexpected error while creating the agent."
            );
            return;
          }

          setCreatedAgent(result.data);
          setStep("success");
        })
        .catch(() => {
          setSubmissionError("Unexpected error while creating the agent.");
        });
    });
  }

  async function copyCommand() {
    if (!command) {
      return;
    }

    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 1000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Dialog
      onOpenChange={(value) => {
        setOpen(value);

        if (!value) {
          resetDialogState();
        }
      }}
      open={open}
    >
      <DialogTrigger render={<Button />}>
        Create Agent
        <CornerDownLeftIcon className="size-3 opacity-60" />
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Create Agent
            <span>{step === "form" ? "Configure" : "Run command"}</span>
          </DialogTitle>
        </DialogHeader>

        {step === "form" ? (
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <DialogCard>
              <Field data-invalid={form.formState.errors.name !== undefined}>
                <FieldLabel htmlFor="name">Agent Name</FieldLabel>
                <Input
                  {...form.register("name")}
                  aria-invalid={form.formState.errors.name !== undefined}
                  autoComplete="off"
                  id="name"
                  placeholder="edge-agent"
                />
                <FieldDescription>
                  Pick a unique name for this workspace.
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
        ) : (
          <>
            <DialogCard>
              <Alert variant="info">
                <div className="inline-flex items-center gap-2">
                  <AlertCircleIcon className="size-3" />
                  <AlertTitle>
                    The image is not published yet. This command will work once
                    GHCR publishing is enabled.
                  </AlertTitle>
                </div>
              </Alert>

              <div className="space-y-2">
                <p className="text-muted-foreground text-xs">
                  Agent <span className="font-mono">{createdAgent?.name}</span>{" "}
                  created. Run this command on your host:
                </p>
                <pre className="max-h-56 overflow-auto whitespace-pre-wrap break-all rounded-md border border-card-border bg-card p-2 font-mono text-[11px]/relaxed">
                  {command}
                </pre>
              </div>
            </DialogCard>

            <DialogFooter>
              <DialogClose render={<Button type="button" variant="outline" />}>
                Done
              </DialogClose>

              <Button onClick={copyCommand} type="button" variant="secondary">
                {copied ? "Copied" : "Copy command"}
                {copied ? (
                  <CheckIcon className="size-3 opacity-60" />
                ) : (
                  <CopyIcon className="size-3 opacity-60" />
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function buildAgentRunCommand(agentId: string) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_AGENT_API_URL;
  const agentName = `containers-agent-${agentId.slice(0, 12)}`;

  return [
    "docker run --detach --restart unless-stopped \\",
    `  --name ${agentName} \\`,
    `  -e AGENT_ID="${agentId}" \\`,
    `  -e AGENT_API_URL="${apiUrl}" \\`,
    `  -v ${DOCKER_SOCKET_PATH}:${DOCKER_SOCKET_PATH} \\`,
    `  ${AGENT_IMAGE}`,
  ].join("\n");
}
