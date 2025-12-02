"use client";

import type { Image } from "@containers/shared";
import { useEffect } from "react";
import { useImagesStore } from "@/lib/store";

type Props = {
  images: Array<Image>;
};

export default function ImagesDispatcher({ images }: Props) {
  const setImages = useImagesStore((state) => state.setImages);

  useEffect(() => {
    setImages(images);
  }, [images, setImages]);

  return null;
}
