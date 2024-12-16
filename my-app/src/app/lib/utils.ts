import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { toast } from "sonner";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function copyToClipboard(
  text: string,
  message: string | boolean = false,
) {
  toast.info(message || "Se copio en portapapeles");
  navigator.clipboard.writeText(text).catch((e) => {
    console.log(e);
  });
}
