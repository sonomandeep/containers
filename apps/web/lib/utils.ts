import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: Array<ClassValue>) {
  return twMerge(clsx(inputs));
}

export function formatImageId(name: string) {
  return name.replace("sha256:", "").slice(0, 12);
}
