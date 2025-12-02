import { create } from "zustand";

interface Env { key: string; value: string }
interface Port { hostPort: string; containerPort: string }

interface LaunchContainerStore {
  name: string;
  image: string;
  restartPolicy: string;
  command: string;
  setBasicInput: (input: { name: string; image: string; restartPolicy: string; command: string }) => void;
  cpu: string;
  memory: string;
  network: string;
  envs: Array<Env>;
  ports: Array<Port>;
  setConfigInput: (input: { cpu: string; memory: string; network: string; envs: Array<Env>; ports: Array<Port> }) => void;
}

const useLaunchContainerStore = create<LaunchContainerStore>((set) => ({
  name: "",
  image: "",
  restartPolicy: "",
  command: "",
  setBasicInput: (input) => set({ name: input.name, image: input.image, restartPolicy: input.restartPolicy, command: input.command }),
  cpu: "",
  memory: "",
  network: "",
  envs: [],
  ports: [],
  setConfigInput: (input) => set({ cpu: input.cpu, memory: input.memory, network: input.network, envs: input.envs, ports: input.ports }),
}));

export default useLaunchContainerStore;
