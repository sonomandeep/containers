import { z } from "zod";

const numberRegEx = /^\d+$/;

function portSchema(fieldName: string) {
  return z
    .string()
    .trim()
    .min(1, { message: `${fieldName} port is required.` })
    .regex(numberRegEx, { message: `${fieldName} port must be a number.` })
    .refine(
      (value) => {
        const port = Number.parseInt(value, 10);
        return port >= 1 && port <= 65_535;
      },
      { message: `${fieldName} port must be 1-65535.` }
    );
}

export const envVarSchema = z.object({
  key: z
    .string()
    .trim()
    .min(1, { message: "Variable name is required." })
    .regex(/^[a-z_]\w*$/i, {
      message: "Invalid variable name format.",
    }),
  value: z.string().min(1, { message: "Variable value is required." }),
});

export type EnvVar = z.infer<typeof envVarSchema>;

export const portMappingSchema = z.object({
  hostPort: portSchema("Host"),
  containerPort: portSchema("Container"),
});

export type PortMapping = z.infer<typeof portMappingSchema>;

const containerNameSchema = z
  .string()
  .trim()
  .min(1, { message: "Container name is required." })
  .max(128, { message: "Name too long (max 128 chars)." })
  .regex(/^[a-z0-9][\w.-]*$/i, {
    message: "Invalid container name format.",
  });

const imageSchema = z
  .string()
  .trim()
  .min(1, { message: "Image is required." })
  .regex(
    /^[a-z0-9]+([._-][a-z0-9]+)*(\/[a-z0-9]+([._-][a-z0-9]+)*)*(:[\w.-]+)?$/,
    {
      message: "Invalid image format.",
    }
  );

const cpuSchema = z
  .string()
  .trim()
  .optional()
  .refine(
    (value) => {
      if (!value || value === "") {
        return true;
      }

      const cpu = Number.parseFloat(value);
      return !Number.isNaN(cpu) && cpu > 0 && cpu <= 128;
    },
    { message: "CPU must be 0.1-128." }
  );

const memorySchema = z
  .string()
  .trim()
  .optional()
  .refine(
    (value) => {
      if (!value || value === "") {
        return true;
      }

      const num = Number.parseInt(value, 10);
      return numberRegEx.test(value) && !Number.isNaN(num) && num > 0;
    },
    { message: "Memory must be a positive number (in MB)." }
  );

const restartPolicySchema = z.enum([
  "no",
  "always",
  "on-failure",
  "unless-stopped",
]);

const networkRegEx = /^[a-z0-9][\w.-]*$/i;

export const basicStepSchema = z.object({
  name: containerNameSchema,
  image: imageSchema,
  restartPolicy: restartPolicySchema,
  command: z.string().trim().optional(),
});
export type BasicStepInput = z.infer<typeof basicStepSchema>;

export const launchContainerSchema = z
  .object({
    name: containerNameSchema,
    image: imageSchema,
    restartPolicy: restartPolicySchema,
    command: z.string().trim().optional(),
    cpu: cpuSchema,
    memory: memorySchema,
    network: z
      .string()
      .trim()
      .optional()
      .refine(
        (value) => {
          if (!value || value === "") {
            return true;
          }

          return networkRegEx.test(value);
        },
        { message: "Invalid network name." }
      ),
    envs: z
      .array(envVarSchema)
      .optional()
      .refine(
        (envs) => {
          if (!envs || envs.length === 0) {
            return true;
          }

          const keys = envs.map((e) => e.key);
          return new Set(keys).size === keys.length;
        },
        { message: "Duplicate environment variable names." }
      ),
    ports: z
      .array(portMappingSchema)
      .optional()
      .refine(
        (ports) => {
          if (!ports || ports.length === 0) {
            return true;
          }

          const hostPorts = ports.map((p) => p.hostPort);
          return new Set(hostPorts).size === hostPorts.length;
        },
        { message: "Duplicate host ports." }
      ),
  })
  .refine(
    (data) => {
      if (data.network === "host" && data.ports && data.ports.length > 0) {
        return false;
      }
      return true;
    },
    {
      message: "Port mapping not supported with host network.",
      path: ["network"],
    }
  );

export type LaunchContainerInput = z.infer<typeof launchContainerSchema>;
