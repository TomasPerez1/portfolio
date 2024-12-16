import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function copyToClipboard(text) {
  // toast.info("Se copio en portapapeles");
  navigator.clipboard.writeText(text).catch((e) => {
    console.log(e);
  });
}
