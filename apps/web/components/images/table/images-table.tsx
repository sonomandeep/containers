"use client";

import type { Image } from "@containers/shared";
import { ArrowUpDownIcon, FunnelIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DataTable,
  DataTableFooter,
  DataTableHeader,
  DataTableTable,
} from "@/components/ui/data-table";
import { columns } from "./columns";

interface ImagesTableProps {
  data: Image[];
}

export function ImagesTable({ data }: ImagesTableProps) {
  return (
    <DataTable columns={columns} data={data}>
      <DataTableHeader
        title="All Images"
        actions={({ table }) => (
          <ImagesTableHeaderActions
            selectedCount={table.getFilteredSelectedRowModel().rows.length}
          />
        )}
      />
      <DataTableTable />
      <DataTableFooter />
    </DataTable>
  );
}

interface ImagesTableHeaderActionsProps {
  selectedCount: number;
}

function ImagesTableHeaderActions({
  selectedCount,
}: ImagesTableHeaderActionsProps) {
  return (
    <>
      {selectedCount > 0 && (
        <Button
          variant="destructive-ghost"
          size="icon-sm"
          aria-label={`Delete ${selectedCount} selected images`}
        >
          <Trash2Icon className="size-3.5" />
        </Button>
      )}

      <Button variant="ghost" size="icon-sm">
        <FunnelIcon className="size-3.5 opacity-60" />
      </Button>
      <Button variant="ghost" size="icon-sm">
        <ArrowUpDownIcon className="size-3.5 opacity-60" />
      </Button>
    </>
  );
}
