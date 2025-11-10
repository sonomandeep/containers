import { columns } from "@/components/containers/table/columns";
import { DataTable } from "@/components/ui/data-table";
import { logger } from "@/lib/logger";
import { listContainers } from "@/lib/services/containers.service";

export default async function Page() {
  const { data, error } = await listContainers();

  if (error) {
    logger.error(error);
    throw new Error(error.statusText);
  }

  return <DataTable columns={columns} data={data} title="All Containers" />;
}
