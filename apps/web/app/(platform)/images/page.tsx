import { columns } from "@/components/images/table/columns";
import {
  DataTable,
  DataTableFooter,
  DataTableHeader,
  DataTableTable,
} from "@/components/ui/data-table";
import { logger } from "@/lib/logger";
import { listImages } from "@/lib/services/images.service";

export default async function Page() {
  const { data, error } = await listImages();

  if (error) {
    logger.error(error);
    throw new Error(error.statusText);
  }

  return (
    <DataTable columns={columns} data={data}>
      <DataTableHeader title="All Images" />
      <DataTableTable />
      <DataTableFooter />
    </DataTable>
  );
}
