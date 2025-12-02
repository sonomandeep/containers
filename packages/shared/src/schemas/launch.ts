import { z } from "zod";

export const envVarSchema = z.object({
  key: z.string().min(1),
  value: z.string().min(1),
});

export type EnvVar = z.infer<typeof envVarSchema>;

export const portMappingSchema = z.object({
  hostPort: z
    .string()
    .trim()
    .min(1, { message: "Host port is required." })
    .regex(/^\d+$/, { message: "Host port must be a valid number." })
    .refine(
      (value) => {
        const port = Number.parseInt(value, 10);
        return port >= 1 && port <= 65535;
      },
      { message: "Host port must be between 1 and 65535." },
    ),
  containerPort: z
    .string()
    .trim()
    .min(1, { message: "Container port is required." })
    .regex(/^\d+$/, { message: "Container port must be a valid number." })
    .refine(
      (value) => {
        const port = Number.parseInt(value, 10);
        return port >= 1 && port <= 65535;
      },
      { message: "Container port must be between 1 and 65535." },
    ),
});

export type PortMapping = z.infer<typeof portMappingSchema>;

export const launchContainerSchema = z.object({
  name: z.string().min(1),
  image: z.string().min(1),
  restartPolicy: z.string().min(1),
  command: z.string().optional(),
  cpu: z.string().optional(),
  memory: z.string().optional(),
  network: z.string().optional(),
  envs: z.array(envVarSchema).optional().default([]),
  ports: z.array(portMappingSchema).optional().default([]),
});

export type LaunchContainerInput = z.infer<typeof launchContainerSchema>;
