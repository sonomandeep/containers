import type { Image } from "@containers/shared";
import { create } from "zustand";

type ImagesStore = {
  images: Array<Image>;
  setImages: (images: Array<Image>) => void;
};

export const useImagesStore = create<ImagesStore>((set) => ({
  images: [],
  setImages: (images) => set({ images }),
}));
