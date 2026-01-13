import type { Image } from "@containers/shared";
import { create } from "zustand";

type ImagesStore = {
  images: Array<Image>;
  setImages: (images: Array<Image>) => void;
  activeImage: Image | null;
  setActiveImage: (image: Image | null) => void;
};

export const useImagesStore = create<ImagesStore>((set) => ({
  images: [],
  setImages: (images) => set({ images }),
  activeImage: null,
  setActiveImage: (activeImage) => set({ activeImage }),
}));
