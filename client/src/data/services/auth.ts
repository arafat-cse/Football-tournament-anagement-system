import { getStrapiAuthURLs } from "@/lib/utils";

interface RegisterUserProps {
  username: string;
  password: string;
  email: string;
}

interface LoginUserProps {
  identifier: string;
  password: string;
}

const authUrls = getStrapiAuthURLs();

async function postAuth(path: string, body: unknown) {
  let lastPayload: unknown = null;

  for (const baseUrl of authUrls) {
    try {
      const response = await fetch(new URL(path, baseUrl), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      const payload = await response.json().catch(() => null);
      if (response.ok || !lastPayload) lastPayload = payload;
      if (response.ok) return payload;
    } catch (error) {
      console.error(`Auth service failed for ${baseUrl}:`, error);
    }
  }

  return lastPayload;
}

export async function registerUserService(userData: RegisterUserProps) {
  return postAuth("/api/auth/local/register", { ...userData });
}

export async function loginUserService(userData: LoginUserProps) {
  return postAuth("/api/auth/local", { ...userData });
}
