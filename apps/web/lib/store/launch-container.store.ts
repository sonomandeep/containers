import type { Image } from "@containers/shared/src/schemas/images";
import type { EnvVar, PortMapping } from "@/lib/schema/containers";
import { create } from "zustand";

interface LaunchContainerStore {
  name: string;
  image: Image | null;
  restartPolicy: string;
  command: string;
  setBasicInput: (input: {
    name: string;
    image: Image | null;
    restartPolicy: string;
    command: string;
  }) => void;
  cpu: string;
  memory: string;
  network: string;
  envs: Array<EnvVar>;
  ports: Array<PortMapping>;
  setConfigInput: (input: {
    cpu: string;
    memory: string;
    network: string;
    envs: Array<EnvVar>;
    ports: Array<PortMapping>;
  }) => void;
}

const useLaunchContainerStore = create<LaunchContainerStore>((set) => ({
  name: "",
  image: null,
  restartPolicy: "",
  command: "",
  setBasicInput: (input) =>
    set({
      name: input.name,
      image: input.image,
      restartPolicy: input.restartPolicy,
      command: input.command,
    }),
  cpu: "",
  memory: "",
  network: "",
  envs: [],
  ports: [],
  setConfigInput: (input) =>
    set({
      cpu: input.cpu,
      memory: input.memory,
      network: input.network,
      envs: input.envs,
      ports: input.ports,
    }),
}));

export default useLaunchContainerStore;
