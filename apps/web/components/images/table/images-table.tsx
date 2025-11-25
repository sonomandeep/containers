"use client";

import type { Image } from "@containers/shared";
import { ArrowUpDownIcon, CornerDownLeftIcon, FunnelIcon, Trash2Icon } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DataTable,
  DataTableFooter,
  DataTableHeader,
  DataTableTable,
  useDataTableContext,
} from "@/components/ui/data-table";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { Spinner } from "@/components/ui/spinner";
import { columns } from "./columns";

interface ImagesTableProps {
  data: Image[];
}

export function ImagesTable({ data }: ImagesTableProps) {
  return (
    <DataTable columns={columns} data={data}>
      <DataTableHeader
        title={<ImagesTableHeaderTitle />}
        actions={<ImagesTableHeaderActions />}
      />
      <DataTableTable />
      <DataTableFooter />
    </DataTable>
  );
}

function ImagesTableHeaderTitle() {
  const { table } = useDataTableContext<Image>();
  const selectedCount = table.getFilteredSelectedRowModel().rows.length;

  return (
    <div className="inline-flex items-center gap-2">
      <h2>All Images</h2>

      {selectedCount > 0 && (
        <Badge variant="outline" className="px-2 text-xs font-mono">
          {`${selectedCount} selected`}
        </Badge>
      )}
    </div>
  );
}

function ImagesTableHeaderActions() {
  const { table } = useDataTableContext<Image>();
  const selectedCount = table.getFilteredSelectedRowModel().rows.length;

  return (
    <>
      {selectedCount > 0 && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              size="icon-sm"
              variant="destructive-ghost"
              aria-label={`Delete ${selectedCount} selected images`}
            >
              <Trash2Icon className="size-3.5" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your account
                and remove your data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel variant="secondary" size="sm">
                <>
                  Cancel
                  <KbdGroup>
                    <Kbd>ESC</Kbd>
                  </KbdGroup>
                </>
              </AlertDialogCancel>

              <AlertDialogAction size="sm" variant="destructive">
                <>
                  Pull Image
                  {false
                    ? (
                        <Spinner />
                      )
                    : (
                        <KbdGroup>
                          <Kbd>
                            <CornerDownLeftIcon />
                          </Kbd>
                        </KbdGroup>
                      )}
                </>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      <Button variant="ghost" size="icon-sm" aria-label="Filter images">
        <FunnelIcon className="size-3.5 opacity-60" />
      </Button>
      <Button variant="ghost" size="icon-sm" aria-label="Sort images">
        <ArrowUpDownIcon className="size-3.5 opacity-60" />
      </Button>
    </>
  );
}
