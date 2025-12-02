import type { Image } from "@containers/shared";
import { create } from "zustand";

interface ImagesStore {
  images: Array<Image>;
  setImages: (images: Array<Image>) => void;
}

const useImagesStore = create<ImagesStore>((set) => ({
  images: [],
  setImages: (images) => set({ images }),
}));

export default useImagesStore;
