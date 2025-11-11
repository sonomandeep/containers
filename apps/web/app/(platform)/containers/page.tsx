import { ContainersTable } from "@/components/containers/table/containers-table";
import { logger } from "@/lib/logger";
import { listContainers } from "@/lib/services/containers.service";

export default async function Page() {
  const { data, error } = await listContainers();

  if (error) {
    logger.error(error);
    throw new Error(error.statusText);
  }

  return <ContainersTable data={data} />;
}
