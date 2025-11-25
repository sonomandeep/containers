"use client";

import type { Image } from "@containers/shared";
import { ArrowUpDownIcon, FunnelIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DataTable,
  DataTableFooter,
  DataTableHeader,
  DataTableTable,
  useDataTableContext,
} from "@/components/ui/data-table";
import { columns } from "./columns";
import RemoveImagesDialog from "./remove-images.dialog";

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
  const selectedRows = table.getFilteredSelectedRowModel().rows;

  return (
    <>
      <RemoveImagesDialog images={selectedRows.map((row) => row.original)} />

      <Button variant="ghost" size="icon-sm" aria-label="Filter images">
        <FunnelIcon className="size-3.5 opacity-60" />
      </Button>
      <Button variant="ghost" size="icon-sm" aria-label="Sort images">
        <ArrowUpDownIcon className="size-3.5 opacity-60" />
      </Button>
    </>
  );
}
