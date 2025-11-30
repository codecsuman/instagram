import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}


// ✅ Safe File Reader for Preview + Upload
export const readFileAsDataURL = (file) => {
  return new Promise((resolve, reject) => {

    if (!file) return reject("No file selected");

    const reader = new FileReader();

    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject("Invalid File Format");
      }
    };

    reader.onerror = () => reject("File Reading Failed");

    reader.readAsDataURL(file);
  });
};
