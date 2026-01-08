import { type Container, ContainerStateEnum } from "@containers/shared";
import {
  AlertCircle,
  CornerDownLeftIcon,
  EllipsisVerticalIcon,
  FileTextIcon,
  FolderKeyIcon,
  HardDriveIcon,
  NetworkIcon,
  SquareTerminalIcon,
  Trash2Icon,
} from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Alert, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { deleteContainer } from "@/lib/services/containers.service";
import { useContainersStore } from "@/lib/store/containers.store";

type Props = {
  container: Container;
};

export function ContainerMenu({ container }: Props) {
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
            disabled={container.state !== ContainerStateEnum.exited}
            onClick={() => setDeleteContainerDialogOpen(true)}
            variant="destructive"
          >
            <Trash2Icon />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteAlertDialog
        id={container.id}
        name={container.name}
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
  const store = useContainersStore((state) => state);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    startTransition(() => {
      toast.promise(
        deleteContainer(id).then((result) => {
          if (result.error) {
            throw new Error(result.error);
          }

          store.setContainers(
            store.containers.filter((container) => container.id !== id)
          );

          return result;
        }),
        {
          loading: "Deleting container...",
          success: "Container deleted successfully",
          error: (error) => error.message,
        }
      );
    });
  };

  return (
    <AlertDialog open={open}>
      <AlertDialogContent className="gap-0! rounded-lg! bg-neutral-100! p-0!">
        <AlertDialogHeader className="gap-0!">
          <div className="inline-flex items-baseline gap-2 p-2">
            <AlertDialogTitle className="text-sm">
              Delete Container
            </AlertDialogTitle>
            <span className="text-muted-foreground text-xs">{name}</span>
          </div>
        </AlertDialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="mx-2 flex flex-col gap-3 rounded-lg border border-neutral-200 bg-white p-3">
            <Alert variant="destructive">
              <div className="inline-flex items-center gap-2">
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
                    autoComplete="off"
                    id="name"
                    onChange={(event) => setContainerName(event.target.value)}
                    placeholder={name}
                    value={containerName}
                  />
                  <FieldDescription>
                    This helps prevent accidental deletions.
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </FieldSet>
          </div>

          <AlertDialogFooter className="p-2">
            <AlertDialogCancel onClick={() => setOpen(false)} type="button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={containerName !== name || isPending}
              type="submit"
              variant="destructive"
            >
              Delete Container
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
