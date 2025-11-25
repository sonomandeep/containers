export interface Registry {
  id: number;
  label: string;
  host: string;
}

const REGISTRIES: Array<Registry> = [
  {
    id: 0,
    label: "Docker Hub",
    host: "docker.io",
  },
  {
    id: 1,
    label: "GHCR",
    host: "ghcr.io",
  },
  {
    id: 2,
    label: "GitLab",
    host: "registry.gitlab.com",
  },
  {
    id: 3,
    label: "ACR",
    host: "azurecr.io",
  },
  {
    id: 4,
    label: "GAR",
    host: "us-docker.pkg.dev",
  },
  {
    id: 5,
    label: "ECR Public",
    host: "public.ecr.aws",
  },
];

export default REGISTRIES;
