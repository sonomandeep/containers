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
  command: z
    .string({ message: "Command must be a string." })
    .trim()
    .optional(),
  network: z
    .string({ message: "Network must be a string." })
    .trim()
    .min(1, { message: "Please specify a network." }),
  restartPolicy: z
    .string({ message: "Restart policy must be a string." })
    .trim()
    .min(1, { message: "Please select a restart policy." }),
});

export const launchConfigSchema = z.object({
  cpu: z.string(),
  memory: z.string(),
  envs: z.array(z.any()),
  ports: z.array(z.any()),
});
