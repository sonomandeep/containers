import type { Container } from "@/components/containers/table/columns";
import { columns } from "@/components/containers/table/columns";
import { ContainersTable } from "@/components/containers/table/data-table";

async function getData(): Promise<Array<Container>> {
  return [
    {
      id: "c1",
      name: "web-app",
      image: "nginx:latest",
      status: "Running",
      ports: "80:80",
      created: new Date("2025-10-21T10:15:00"),
    },
    {
      id: "c2",
      name: "db",
      image: "postgres:16-alpine",
      status: "Running",
      ports: "5432:5432",
      created: new Date("2025-10-20T09:45:00"),
    },
    {
      id: "c3",
      name: "redis-cache",
      image: "redis:7.2",
      status: "Exited",
      ports: "6379:6379",
      created: new Date("2025-10-19T12:10:00"),
    },
    {
      id: "c4",
      name: "api-server",
      image: "node:22-alpine",
      status: "Running",
      ports: "3000:3000",
      created: new Date("2025-10-19T18:30:00"),
    },
    {
      id: "c5",
      name: "worker",
      image: "python:3.12-slim",
      status: "Exited",
      ports: "-",
      created: new Date("2025-10-18T11:00:00"),
    },
    {
      id: "c6",
      name: "frontend",
      image: "nextjs:14",
      status: "Running",
      ports: "5173:5173",
      created: new Date("2025-10-17T16:40:00"),
    },
    {
      id: "c7",
      name: "mailer",
      image: "mailhog:latest",
      status: "Running",
      ports: "8025:8025",
      created: new Date("2025-10-17T08:25:00"),
    },
    {
      id: "c8",
      name: "backup",
      image: "alpine:3.19",
      status: "Exited",
      ports: "-",
      created: new Date("2025-10-16T21:50:00"),
    },
    {
      id: "c9",
      name: "analytics",
      image: "plausible/analytics:2.0",
      status: "Running",
      ports: "8080:80",
      created: new Date("2025-10-16T13:10:00"),
    },
    {
      id: "c10",
      name: "registry",
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
