import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getResolvedStrapiURL() {
  const isServer = typeof window === "undefined";
  
  if (isServer && process.env.STRAPI_INTERNAL_URL) {
    let url = process.env.STRAPI_INTERNAL_URL;
    if (url.endsWith("/")) {
      url = url.slice(0, -1);
    }
    return url;
  }

  const raw = process.env.STRAPI_BASE_URL || process.env.NEXT_PUBLIC_STRAPI_BASE_URL || process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337";
  let url = raw.replace("localhost", "127.0.0.1");
  if (url.endsWith("/")) {
    url = url.slice(0, -1);
  }
  return url;
}

export function getStrapiURL() {
  return getResolvedStrapiURL();
}

export function getStrapiMedia(url: string | null) {
  if (url == null) return null;
  if (url.startsWith("data:")) return url;
  if (url.startsWith("http") || url.startsWith("//")) return url;
  const baseUrl = getStrapiURL();
  return `${baseUrl}${url.startsWith("/") ? "" : "/"}${url}`;
}

export function formatDate(dateString: string) {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}
