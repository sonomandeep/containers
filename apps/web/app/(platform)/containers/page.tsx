import type { Container } from "@/components/containers/table/columns";
import { columns } from "@/components/containers/table/columns";
import { ContainersTable } from "@/components/containers/table/data-table";

async function getData(): Promise<Array<Container>> {
  return [
    {
      id: "e1b9d7ad9c2f",
      name: "Nginx Proxy",
      image: "nginx:latest",
      status: "Running",
      ports: "80:80",
      created: new Date("2025-10-21T10:15:00"),
    },
    {
      id: "c2f8a9bd3e41",
      name: "Postgres DB",
      image: "postgres:16-alpine",
      status: "Running",
      ports: "5432:5432",
      created: new Date("2025-10-20T09:45:00"),
    },
    {
      id: "b7a3d1ce2f94",
      name: "Redis Cache",
      image: "redis:7.2",
      status: "Exited",
      ports: "6379:6379",
      created: new Date("2025-10-19T12:10:00"),
    },
    {
      id: "a4c2f9e6d7b1",
      name: "API Gateway",
      image: "node:22-alpine",
      status: "Running",
      ports: "3000:3000",
      created: new Date("2025-10-19T18:30:00"),
    },
    {
      id: "d9e1b5a7f3c8",
      name: "Background Worker",
      image: "python:3.12-slim",
      status: "Exited",
      ports: "-",
      created: new Date("2025-10-18T11:00:00"),
    },
    {
      id: "f2b6a4c1d8e9",
      name: "Frontend App",
      image: "nextjs:14",
      status: "Running",
      ports: "5173:5173",
      created: new Date("2025-10-17T16:40:00"),
    },
    {
      id: "e7d3a1f9b6c4",
      name: "SMTP Mailer",
      image: "mailhog:latest",
      status: "Running",
      ports: "8025:8025",
      created: new Date("2025-10-17T08:25:00"),
    },
    {
      id: "b9f2d1e4a7c6",
      name: "Nightly Backup",
      image: "alpine:3.19",
      status: "Exited",
      ports: "-",
      created: new Date("2025-10-16T21:50:00"),
    },
    {
      id: "a6c3e9b1f7d2",
      name: "Analytics Service",
      image: "plausible/analytics:2.0",
      status: "Running",
      ports: "8080:80",
      created: new Date("2025-10-16T13:10:00"),
    },
    {
      id: "c8e1f3a5b7d9",
      name: "Private Registry",
      image: "registry:2",
      status: "Running",
      ports: "5000:5000",
      created: new Date("2025-10-15T07:45:00"),
    },
  ];
}

export default async function Page() {
  const data = await getData();

  return (
    <ContainersTable columns={columns} data={data} />
  );
}
