"use client";

import type { ColumnDef } from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDownIcon, FunnelIcon } from "lucide-react";
import Footer from "@/components/containers/footer";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  title: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  title,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    columnResizeMode: "onChange",
  });

  return (
    <div className="flex flex-col overflow-hidden h-full">
      <div className="w-full inline-flex items-center px-2 pb-2 justify-between border-b border-secondary">
        <h2>{title}</h2>

        <div className="inline-flex items-center gap-4">
          <FunnelIcon className="size-3.5 opacity-60" />
          <ArrowUpDownIcon className="size-3.5 opacity-60" />
        </div>
      </div>

      <div className="flex-1">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className={cn(
                        header.id === "select" && "text-center p-0!",
                      )}
                      style={{
                        width: header.getSize(),
                      }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length
              ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className={cn(
                            cell.column.id === "select" && "text-center p-0!",
                          )}
                          style={{
                            width: cell.column.getSize(),
                          }}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )
              : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
          </TableBody>
        </Table>
      </div>

      <Footer />
    </div>
  );
}
