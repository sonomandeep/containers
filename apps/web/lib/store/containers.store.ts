import type { Container } from "@containers/shared";
import { create } from "zustand";

type ContainersStore = {
  containers: Array<Container>;
  initialized: boolean;
  setContainers: (containers: Array<Container>) => void;
};

export const useContainersStore = create<ContainersStore>((set) => ({
  containers: [],
  initialized: false,
  setContainers: (containers) => set({ containers, initialized: true }),
}));
