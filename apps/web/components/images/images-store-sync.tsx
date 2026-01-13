"use client";

import type { Image } from "@containers/shared";
import { useEffect } from "react";
import { useImagesStore } from "@/lib/store/images.store";

type Props = {
  images: Array<Image>;
};

export function ImagesStoreSync({ images }: Props) {
  const setImages = useImagesStore((state) => state.setImages);

  useEffect(() => {
    setImages(images);
  }, [images, setImages]);

  return null;
}
