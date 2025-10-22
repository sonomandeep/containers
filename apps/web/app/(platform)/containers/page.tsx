import type { Container } from "@/components/containers/table/columns";
import { columns } from "@/components/containers/table/columns";
import { ContainersTable } from "@/components/containers/table/data-table";

async function getData(): Promise<Array<Container>> {
  return [
    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      email: "m@example.com",
    },
    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      email: "m@example.com",
    },
    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      email: "m@example.com",
    },
  ];
}

export default async function Page() {
  const data = await getData();
  return (
    <div>
      <ContainersTable columns={columns} data={data} />
    </div>
  );
}
