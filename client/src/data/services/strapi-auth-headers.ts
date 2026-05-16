import { getAuthToken } from "./get-auth-token";

export async function getStrapiAuthHeaders() {
  const jwt = await getAuthToken();
  const token = jwt ?? process.env.STRAPI_API_TOKEN;

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}
