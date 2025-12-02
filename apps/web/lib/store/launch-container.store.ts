import { create } from "zustand";

interface LaunchContainerStore {
  name: string;
  image: string;
  restartPolicy: string;
  command: string;
  setBasicInput: (input: { name: string; image: string; restartPolicy: string; command: string }) => void;
}

const useLaunchContainerStore = create<LaunchContainerStore>((set) => ({
  name: "",
  image: "",
  restartPolicy: "",
  command: "",
  setBasicInput: (input) => set({ name: input.name, image: input.image, restartPolicy: input.restartPolicy, command: input.command }),
}));

export default useLaunchContainerStore;
