import type { Container } from "@containers/shared";
import type { ListRoute } from "./containers.routes";
import type { AppRouteHandler } from "@/lib/types";

const containers: Array<Container> = [
  {
    id: "e1b9d7ad9c2f",
    name: "Nginx Proxy",
    image: "nginx:latest",
    state: "running",
    ports: "80:80",
    created: 1730045189123,
  },
  {
    id: "c2f8a9bd3e41",
    name: "Postgres DB",
    image: "postgres:16-alpine",
    state: "running",
    ports: "5432:5432",
    created: 1728622847098,
  },
  {
    id: "b7a3d1ce2f94",
    name: "Redis Cache",
    image: "redis:7.2",
    state: "exited",
    ports: "6379:6379",
    created: 1729447125611,
  },
  {
    id: "a4c2f9e6d7b1",
    name: "API Gateway",
    image: "node:22-alpine",
    state: "running",
    ports: "3000:3000",
    created: 1729941712004,
  },
  {
    id: "d9e1b5a7f3c8",
    name: "Background Worker",
    image: "python:3.12-slim",
    state: "exited",
    ports: "-",
    created: 1728359433812,
  },
  {
    id: "f2b6a4c1d8e9",
    name: "Frontend App",
    image: "nextjs:14",
    state: "running",
    ports: "5173:5173",
    created: 1730225536950,
  },
  {
    id: "e7d3a1f9b6c4",
    name: "SMTP Mailer",
    image: "mailhog:latest",
    state: "running",
    ports: "8025:8025",
    created: 1729178230791,
  },
  {
    id: "b9f2d1e4a7c6",
    name: "Nightly Backup",
    image: "alpine:3.19",
    state: "exited",
    ports: "-",
    created: 1730476902332,
  },
  {
    id: "a6c3e9b1f7d2",
    name: "Analytics Service",
    image: "plausible/analytics:2.0",
    state: "running",
    ports: "8080:80",
    created: 1729701120471,
  },
  {
    id: "c8e1f3a5b7d9",
    name: "Private Registry",
    image: "registry:2",
    state: "running",
    ports: "5000:5000",
    created: 1728834526484,
  },
];

export const list: AppRouteHandler<ListRoute> = (c) => {
  return c.json(containers);
};
