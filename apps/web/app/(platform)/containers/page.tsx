import { columns } from "@/components/containers/table/columns";
import { ContainersTable } from "@/components/containers/table/data-table";
import { listContainers } from "@/lib/services/containers.service";

export default async function Page() {
  const { data, error } = await listContainers();

  if (error) {
    throw new Error(error.statusText);
  }

  return (
    <ContainersTable columns={columns} data={data} />
  );
}
