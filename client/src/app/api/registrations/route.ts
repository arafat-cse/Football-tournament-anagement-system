import { NextResponse } from "next/server";
import { getResolvedStrapiURL } from "@/lib/utils";

const strapiUrl = getResolvedStrapiURL();
const token = process.env.STRAPI_API_TOKEN;

const headers = () => ({
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

async function uploadFile(file: File | null) {
  if (!token) return undefined;
  if (!file || file.size === 0) return undefined;

  const body = new FormData();
  body.append("files", file);

  const response = await fetch(`${strapiUrl}/api/upload`, {
    method: "POST",
    headers: headers(),
    body,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`File upload failed: ${message}`);
  }

  const uploaded = await response.json();
  return uploaded?.[0]?.id;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const photo = formData.get("photo") as File | null;
    const screenshot = formData.get("paymentScreenshot") as File | null;
    const photoId = await uploadFile(photo);
    const screenshotId = await uploadFile(screenshot);

    const data: Record<string, unknown> = {
      name: formData.get("name"),
      phone: formData.get("phone"),
      email: formData.get("email") || undefined,
      age: Number(formData.get("age") || 0) || undefined,
      address: formData.get("address") || undefined,
      role: formData.get("role"),
      experience: formData.get("experience") || undefined,
      basePrice: Number(formData.get("basePrice") || 0),
      paymentMethod: formData.get("paymentMethod") || "bkash",
      transactionId: formData.get("transactionId") || undefined,
      amount: Number(formData.get("amount") || 0),
      paymentStatus: "pending",
      registrationStatus: "pending",
      tournament: Number(formData.get("tournament")),
      ...(photoId ? { photo: photoId } : {}),
      ...(screenshotId ? { paymentScreenshot: screenshotId } : {}),
    };

    const endpoint = token ? `${strapiUrl}/api/registrations` : `${strapiUrl}/api/public-registrations`;
    const publicBody = new FormData();
    publicBody.append("data", JSON.stringify(data));
    if (photo instanceof File && photo.size > 0) publicBody.append("photo", photo, photo.name);
    if (screenshot instanceof File && screenshot.size > 0) publicBody.append("paymentScreenshot", screenshot, screenshot.name);

    const registrationResponse = await fetch(endpoint, {
      method: "POST",
      headers: token
        ? {
            "Content-Type": "application/json",
            ...headers(),
          }
        : undefined,
      body: token ? JSON.stringify({ data }) : publicBody,
    });

    const registrationPayload = await registrationResponse.json().catch(() => null);
    if (!registrationResponse.ok) {
      return NextResponse.json(
        {
          error:
            registrationResponse.status === 403
              ? "Strapi permission denied. Add STRAPI_API_TOKEN in client/.env or enable public registration permissions."
              : registrationPayload?.error?.message ?? "Could not save registration in Strapi",
        },
        { status: registrationResponse.status }
      );
    }

    const registrationId = registrationPayload?.data?.id;
    if (registrationId && token) {
      await fetch(`${strapiUrl}/api/payments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...headers(),
        },
        body: JSON.stringify({
          data: {
            method: data.paymentMethod,
            transactionId: data.transactionId,
            amount: data.amount,
            status: "pending",
            tournament: data.tournament,
            registration: registrationId,
            ...(screenshotId ? { screenshot: screenshotId } : {}),
          },
        }),
      }).catch(() => null);
    }

    return NextResponse.json({ data: registrationPayload?.data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Registration failed";
    const isFetchFailed = message.toLowerCase().includes("fetch failed") || message.toLowerCase().includes("econnrefused");
    return NextResponse.json(
      {
        error: isFetchFailed
          ? `Could not connect to Strapi at ${strapiUrl}. Please run "yarn develop" in the server folder, then submit again.`
          : message,
      },
      { status: 500 }
    );
  }
}
