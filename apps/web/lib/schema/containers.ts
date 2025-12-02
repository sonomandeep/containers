import z from "zod";

export const launchBasicSchema = z.object({
  name: z
    .string({ message: "Name must be a string." })
    .trim()
    .min(1, { message: "Please enter a name." }),
  image: z
    .string({ message: "Image must be a string." })
    .trim()
    .min(1, { message: "Please select an image." }),
  command: z.string({ message: "Command must be a string." }).trim().optional(),
  network: z
    .string({ message: "Network must be a string." })
    .trim()
    .min(1, { message: "Please specify a network." }),
  restartPolicy: z
    .string({ message: "Restart policy must be a string." })
    .trim()
    .min(1, { message: "Please select a restart policy." }),
});

const envVarSchema = z.object({
  key: z
    .string({ message: "Key must be a string." })
    .trim()
    .min(1, { message: "Key is required." }),
  value: z
    .string({ message: "Value must be a string." })
    .trim()
    .min(1, { message: "Value is required." }),
});

const portSchema = z.object({
  hostPort: z
    .string({ message: "Host port must be a string." })
    .trim()
    .min(1, { message: "Host port is required." })
    .regex(/^\d+$/, { message: "Host port must be a valid number." })
    .refine((val) => {
      const port = Number.parseInt(val, 10);
      return port >= 1 && port <= 65535;
    }, { message: "Host port must be between 1 and 65535." }),
  containerPort: z
    .string({ message: "Container port must be a string." })
    .trim()
    .min(1, { message: "Container port is required." })
    .regex(/^\d+$/, { message: "Container port must be a valid number." })
    .refine((val) => {
      const port = Number.parseInt(val, 10);
      return port >= 1 && port <= 65535;
    }, { message: "Container port must be between 1 and 65535." }),
});

export const launchConfigSchema = z.object({
  cpu: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine((val) => {
      if (!val || val === "") {
        return true;
      }

      return /^(?:\d+|\d*\.\d+)$/.test(val);
    }, { message: "CPU must be a valid number." })
    .refine((val) => {
      if (!val || val === "")
        return true;
      const cpu = Number.parseFloat(val);
      return cpu > 0 && cpu <= 128;
    }, { message: "CPU must be between 0.1 and 128 cores." }),
  memory: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine((val) => {
      if (!val || val === "")
        return true;
      return /^\d+$/.test(val);
    }, { message: "Memory must be a valid number." })
    .refine((val) => {
      if (!val || val === "")
        return true;
      const mem = Number.parseInt(val, 10);
      return mem >= 128 && mem <= 524288;
    }, { message: "Memory must be between 128 MB and 524288 MB (512 GB)." }),
  envs: z.array(envVarSchema),
  ports: z.array(portSchema),
});
