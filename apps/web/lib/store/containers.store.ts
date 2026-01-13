import type { Container } from "@containers/shared";
import { create } from "zustand";

type ContainersStore = {
  containers: Array<Container>;
  setContainers: (containers: Array<Container>) => void;
};

export const useContainersStore = create<ContainersStore>((set) => ({
  containers: [],
  setContainers: (containers) => set({ containers }),
}));
