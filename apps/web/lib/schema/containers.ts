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
    .string({ message: "Env key must be a string." })
    .trim()
    .min(1, { message: "Key is required." }),
  value: z.string({ message: "Env value must be a string." }).trim().optional(),
});

const portSchema = z.object({
  hostPort: z.string().trim(),
  containerPort: z.string().trim(),
});

export const launchConfigSchema = z.object({
  cpu: z.string().trim().optional(),
  memory: z.string().trim().optional(),
  envs: z.array(envVarSchema).default([]),
  ports: z.array(portSchema).default([]),
});
