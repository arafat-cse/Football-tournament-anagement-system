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

export function getPublicStrapiURL() {
  const raw =
    process.env.NEXT_PUBLIC_STRAPI_MEDIA_URL ||
    process.env.NEXT_PUBLIC_STRAPI_BASE_URL ||
    process.env.NEXT_PUBLIC_STRAPI_API_URL ||
    process.env.STRAPI_BASE_URL ||
    process.env.STRAPI_INTERNAL_URL ||
    "https://adminball.bmhbd.org/";

  return raw.endsWith("/") ? raw.slice(0, -1) : raw;
}

export function getStrapiAuthURL() {
  return getStrapiAuthURLs()[0];
}

export function getStrapiAuthURLs() {
  const urls = [
    process.env.STRAPI_AUTH_URL ||
      process.env.NEXT_PUBLIC_STRAPI_BASE_URL ||
      process.env.NEXT_PUBLIC_STRAPI_API_URL ||
      process.env.STRAPI_BASE_URL ||
      process.env.STRAPI_INTERNAL_URL ||
      "https://adminball.bmhbd.org/",
    process.env.NEXT_PUBLIC_STRAPI_BASE_URL,
    process.env.NEXT_PUBLIC_STRAPI_API_URL,
    process.env.STRAPI_BASE_URL,
    process.env.STRAPI_INTERNAL_URL,
    "https://adminball.bmhbd.org/",
  ]
    .filter((url): url is string => Boolean(url))
    .map((url) => (url.endsWith("/") ? url.slice(0, -1) : url));

  return [...new Set(urls)];
}

export function getStrapiMedia(url: string | null) {
  if (url == null) return null;
  if (url.startsWith("data:")) return url;
  const publicBaseUrl = getPublicStrapiURL();
  if (url.startsWith("//")) return `https:${url}`;
  if (url.startsWith("http")) {
    try {
      const mediaUrl = new URL(url);
      if (["127.0.0.1", "localhost", "0.0.0.0"].includes(mediaUrl.hostname)) {
        return `${publicBaseUrl}${mediaUrl.pathname}${mediaUrl.search}`;
      }
    } catch {
      return url;
    }
    return url;
  }
  const baseUrl = publicBaseUrl;
  return `${baseUrl}${url.startsWith("/") ? "" : "/"}${url}`;
}

export function formatDate(dateString: string) {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}
