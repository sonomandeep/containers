"use client";

import type { Image } from "@containers/shared";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useImagesStore } from "@/lib/store/images.store";
import { cn } from "@/lib/utils";

type DataTableProps<TData, TValue> = {
  columns: Array<ColumnDef<TData, TValue>>;
  data: Array<TData>;
};

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });
  const setActiveImage = useImagesStore((state) => state.setActiveImage);

  return (
    <Table className="table-fixed">
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead
                className={cn(
                  "[&_svg]:size-3",
                  header.column.id === "select" && "w-8"
                )}
                key={header.id}
              >
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => (
            <TableRow
              className="cursor-pointer"
              data-state={row.getIsSelected() && "selected"}
              key={row.id}
              onClick={() => {
                setActiveImage(row.original as Image | null);
              }}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell
                  className={cn(
                    "truncate",
                    cell.column.id === "select" && "w-8"
                  )}
                  key={cell.id}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell className="h-24 text-center" colSpan={columns.length}>
              No results.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
