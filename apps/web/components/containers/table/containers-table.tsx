"use client";

import type { Container } from "@containers/shared";
import type { Row } from "@tanstack/react-table";
import { useState } from "react";
import { ContainerSheet } from "@/components/containers/sheet/container-sheet";
import {
  DataTable,
  DataTableFooter,
  DataTableHeader,
  DataTableTable,
} from "@/components/ui/data-table";
import { columns } from "./columns";

interface ContainersTableProps {
  data: Container[];
}

export function ContainersTable({ data }: ContainersTableProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedContainer, setSelectedContainer] = useState<Container | null>(
    null,
  );

  const handleRowClick = (row: Row<Container>) => {
    setSelectedContainer(row.original);
    setIsSheetOpen(true);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setSelectedContainer(null);
    }

    setIsSheetOpen(open);
  };

  return (
    <>
      <DataTable columns={columns} data={data}>
        <DataTableHeader title="All Containers" />
        <DataTableTable onRowClick={handleRowClick} />
        <DataTableFooter />
      </DataTable>

      <ContainerSheet
        container={selectedContainer}
        open={isSheetOpen}
        onOpenChange={handleOpenChange}
      />
    </>
  );
}
