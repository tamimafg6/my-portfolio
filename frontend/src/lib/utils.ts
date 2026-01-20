import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string, locale: string = "en"): string {
  const d = typeof date === "string" ? new Date(date) : date;

  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  return new Intl.DateTimeFormat(locale, options).format(d);
}

export function formatDateRange(
  startDate: Date | string,
  endDate: Date | string | null,
  locale: string = "en",
): string {
  const start = formatDate(startDate, locale);

  if (!endDate) {
    return `${start} - ${locale === "fr" ? "Présent" : "Present"}`;
  }

  const end = formatDate(endDate, locale);
  return `${start} - ${end}`;
}
