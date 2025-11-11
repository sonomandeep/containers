"use client";

import type {
  ColumnDef,
  Row,
  Table as TableInstance,
} from "@tanstack/react-table";
import type { MouseEvent, ReactNode } from "react";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDownIcon, FunnelIcon } from "lucide-react";
import { createContext, use } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface DataTableContextValue<TData> {
  table: TableInstance<TData>;
  columnsLength: number;
}

const DataTableContext = createContext<DataTableContextValue<any> | null>(null);

type DataTableRenderable<TData> =
  | ReactNode
  | ((context: DataTableContextValue<TData>) => ReactNode);

function DefaultHeaderActions() {
  return (
    <>
      <FunnelIcon className="size-3.5 opacity-60" />
      <ArrowUpDownIcon className="size-3.5 opacity-60" />
    </>
  );
}

function renderSlot<TData>(
  slot: DataTableRenderable<TData> | undefined,
  context: DataTableContextValue<TData>,
  fallback?: ReactNode,
) {
  if (slot === undefined) {
    return fallback ?? null;
  }

  return typeof slot === "function" ? slot(context) : slot;
}

export function useDataTableContext<TData>() {
  const context = use(DataTableContext);

  if (!context) {
    throw new Error("DataTable components must be used within <DataTable />");
  }

  return context as DataTableContextValue<TData>;
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  children?: ReactNode;
  className?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  children,
  className,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    columnResizeMode: "onChange",
  });

  return (
    <DataTableContext.Provider
      value={{
        table,
        columnsLength: columns.length,
      }}
    >
      <div className={cn("flex flex-col overflow-hidden h-full", className)}>
        {children}
      </div>
    </DataTableContext.Provider>
  );
}

interface DataTableHeaderProps<TData> {
  title?: ReactNode;
  children?: DataTableRenderable<TData>;
  actions?: DataTableRenderable<TData>;
}

export function DataTableHeader<TData>({
  title,
  children,
  actions,
}: DataTableHeaderProps<TData>) {
  const context = useDataTableContext<TData>();

  if (children) {
    return (
      <div className="w-full border-b border-secondary px-2 pb-2">
        {renderSlot(children, context)}
      </div>
    );
  }

  return (
    <div className="w-full inline-flex items-center px-2 pb-2 justify-between border-b border-secondary">
      {title ? typeof title === "string" ? <h2>{title}</h2> : title : <span />}

      <div className="inline-flex items-center gap-4">
        {renderSlot(actions, context, <DefaultHeaderActions />)}
      </div>
    </div>
  );
}

interface DataTableTableProps<TData = unknown> {
  emptyMessage?: ReactNode;
  onRowClick?: (row: Row<TData>) => void;
}

export function DataTableTable<TData>({
  emptyMessage = "No results.",
  onRowClick,
}: DataTableTableProps<TData>) {
  const { table, columnsLength } = useDataTableContext<TData>();
  const rows = table.getRowModel().rows;
  const interactiveSelector =
    "a, button, input, textarea, select, label, [role='button'], [data-row-click-ignore]";

  const getRowClickHandler = (row: Row<TData>) => {
    if (!onRowClick) {
      return undefined;
    }

    return (event: MouseEvent<HTMLTableRowElement>) => {
      if (event.defaultPrevented) {
        return;
      }

      const target = event.target;

      if (
        target instanceof Element &&
        target.closest(interactiveSelector) !== null
      ) {
        return;
      }

      onRowClick(row);
    };
  };

  return (
    <div className="flex-1">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="hover:bg-transparent">
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className={cn(header.id === "select" && "text-center p-0!")}
                  style={{ width: header.getSize() }}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {rows?.length ? (
            rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                onClick={getRowClickHandler(row)}
                className={cn(onRowClick && "cursor-pointer")}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={cn(
                      cell.column.id === "select" && "text-center p-0!",
                    )}
                    style={{ width: cell.column.getSize() }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columnsLength} className="h-24 text-center">
                {emptyMessage}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

interface DataTableFooterProps<TData> {
  children?: DataTableRenderable<TData>;
  pageSizeOptions?: number[];
}

export function DataTableFooter<TData>({
  children,
  pageSizeOptions = [10, 25, 50],
}: DataTableFooterProps<TData>) {
  const context = useDataTableContext<TData>();

  if (children) {
    return (
      <div className="px-2 pt-2 border-t border-secondary">
        {renderSlot(children, context)}
      </div>
    );
  }

  return <DefaultFooter context={context} pageSizeOptions={pageSizeOptions} />;
}

interface DefaultFooterProps<TData> {
  context: DataTableContextValue<TData>;
  pageSizeOptions: number[];
}

function DefaultFooter<TData>({
  context,
  pageSizeOptions,
}: DefaultFooterProps<TData>) {
  const { table } = context;
  const pagination = table.getState().pagination;
  const pageCount = table.getPageCount();
  const pageIndex = pagination.pageIndex;
  const pageSize = pagination.pageSize;
  const totalRows = table.getFilteredRowModel().rows.length;
  const start = totalRows ? pageIndex * pageSize + 1 : 0;
  const end = totalRows ? Math.min(totalRows, (pageIndex + 1) * pageSize) : 0;
  const visiblePages = getVisiblePages(pageCount, pageIndex);

  return (
    <div className="grid grid-cols-1 gap-4 px-2 pt-2 border-t border-secondary sm:grid-cols-3">
      <div>
        <p className="text-muted-foreground">
          Results:
          <span className="text-foreground">
            &nbsp;
            {start}
            &nbsp;
          </span>
          -
          <span className="text-foreground">
            &nbsp;
            {end}
            &nbsp;
          </span>
          of {totalRows}
        </p>
      </div>

      <div className="flex justify-center">
        <Pagination className="justify-center">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                aria-disabled={!table.getCanPreviousPage()}
                onClick={(event) => {
                  event.preventDefault();
                  if (table.getCanPreviousPage()) {
                    table.previousPage();
                  }
                }}
              />
            </PaginationItem>

            {visiblePages.map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  size="icon-sm"
                  href="#"
                  isActive={page === pageIndex}
                  onClick={(event) => {
                    event.preventDefault();
                    table.setPageIndex(page);
                  }}
                >
                  {page + 1}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                href="#"
                aria-disabled={!table.getCanNextPage()}
                onClick={(event) => {
                  event.preventDefault();
                  if (table.getCanNextPage()) {
                    table.nextPage();
                  }
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      <div className="flex justify-end">
        <Select
          value={String(pageSize)}
          onValueChange={(value) => table.setPageSize(Number(value))}
        >
          <SelectTrigger className="w-[180px]" size="sm">
            <SelectValue placeholder="Items per page" />
          </SelectTrigger>

          <SelectContent>
            <SelectGroup>
              {pageSizeOptions.map((option) => (
                <SelectItem key={option} value={String(option)}>
                  {option} per Page
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

function getVisiblePages(
  pageCount: number,
  currentPage: number,
  windowSize = 3,
) {
  if (pageCount <= windowSize) {
    return Array.from({ length: pageCount }, (_, index) => index);
  }

  const half = Math.floor(windowSize / 2);
  let start = Math.max(currentPage - half, 0);
  let end = start + windowSize - 1;

  if (end >= pageCount) {
    end = pageCount - 1;
    start = end - windowSize + 1;
  }

  return Array.from({ length: windowSize }, (_, index) => start + index);
}
