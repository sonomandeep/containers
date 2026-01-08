import { AlertCircle, CornerDownLeftIcon, Trash2Icon } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  EllipsisVerticalIcon,
  FileTextIcon,
  FolderKeyIcon,
  HardDriveIcon,
  NetworkIcon,
  SquareTerminalIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useTransition } from "react";
import { Alert, AlertTitle } from "@/components/ui/alert";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { deleteContainer } from "@/lib/services/containers.service";
import { Spinner } from "@/components/ui/spinner";

type Props = {
  id: string;
  name: string;
};

export function ContainerMenu({ id, name }: Props) {
  const [deleteContainerDialogOpen, setDeleteContainerDialogOpen] =
    useState(false);

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger render={<Button size="icon-sm" variant="ghost" />}>
          <EllipsisVerticalIcon />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuItem>
            <FileTextIcon />
            Logs
          </DropdownMenuItem>
          <DropdownMenuItem>
            <NetworkIcon />
            Ports
          </DropdownMenuItem>
          <DropdownMenuItem>
            <FolderKeyIcon />
            Variables
          </DropdownMenuItem>
          <DropdownMenuItem>
            <HardDriveIcon />
            Volumes
          </DropdownMenuItem>
          <DropdownMenuItem>
            <SquareTerminalIcon />
            Terminal
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => setDeleteContainerDialogOpen(true)}
            variant="destructive"
          >
            <Trash2Icon />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteAlertDialog
        id={id}
        name={name}
        open={deleteContainerDialogOpen}
        setOpen={setDeleteContainerDialogOpen}
      />
    </>
  );
}

function DeleteAlertDialog({
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
  const [containerName, setContainerName] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    startTransition(async () => {
      const { data, error } = await deleteContainer(id, name);
      console.log(data, error);
    });
  };

  return (
    <AlertDialog open={open}>
      <AlertDialogContent className="bg-neutral-100! rounded-lg! p-0! gap-0!">
        <AlertDialogHeader className="gap-0!">
          <div className="inline-flex gap-2 items-baseline p-2">
            <AlertDialogTitle className="text-sm">
              Delete Container
            </AlertDialogTitle>
            <span className="text-xs text-muted-foreground">{name}</span>
          </div>
        </AlertDialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="border border-neutral-200 bg-white rounded-lg mx-2 p-3 gap-3 flex flex-col">
            <Alert variant="destructive">
              <div className="inline-flex gap-2 items-center">
                <AlertCircle className="size-3" />
                <AlertTitle>
                  This will permanently delete the container.
                </AlertTitle>
              </div>
            </Alert>

            <FieldSet>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="name">
                    Type <span className="font-mono">{name}</span> to confirm
                  </FieldLabel>
                  <Input
                    id="name"
                    autoComplete="off"
                    placeholder={name}
                    value={containerName}
                    onChange={(event) => setContainerName(event.target.value)}
                  />
                  <FieldDescription>
                    This helps prevent accidental deletions.
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </FieldSet>
          </div>

          <AlertDialogFooter className="p-2">
            <AlertDialogCancel type="button" onClick={() => setOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={containerName !== name || isPending}
              type="submit"
            >
              Delete Container
              {isPending ? (
                <Spinner className="size-3" />
              ) : (
                <CornerDownLeftIcon className="opacity-60 size-3" />
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
