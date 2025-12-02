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
        actions={<ImagesTableHeaderActions />}
        title={<ImagesTableHeaderTitle />}
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
        <Badge className="px-2 font-mono text-xs" variant="outline">
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

      <Button aria-label="Filter images" size="icon-sm" variant="ghost">
        <FunnelIcon className="size-3.5 opacity-60" />
      </Button>
      <Button aria-label="Sort images" size="icon-sm" variant="ghost">
        <ArrowUpDownIcon className="size-3.5 opacity-60" />
      </Button>
    </>
  );
}
