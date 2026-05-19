import { NextResponse } from "next/server";
import { getResolvedStrapiURL } from "@/lib/utils";

const strapiUrl = getResolvedStrapiURL();
const token = process.env.STRAPI_API_TOKEN;

const headers = () => ({
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tournamentSlug = searchParams.get("tournamentSlug");

    // Primary: fetch via custom public-registrations endpoint
    let url = `${strapiUrl}/api/public-registrations`;
    if (tournamentSlug) {
      url += `?tournamentSlug=${encodeURIComponent(tournamentSlug)}`;
    }

    const response = await fetch(url, {
      headers: headers(),
      next: { revalidate: 0 } // Avoid caching
    });

    if (!response.ok) {
      // Fallback: fetch via standard registrations endpoint using token
      let fallbackUrl = `${strapiUrl}/api/registrations?populate[0]=tournament&populate[1]=player&populate[2]=player.photo&populate[3]=player.teamPlayers&populate[4]=player.teamPlayers.team&populate[5]=photo&sort=createdAt:desc&pagination[pageSize]=1000`;
      
      if (tournamentSlug) {
        // Resolve tournament documentId first
        const tRes = await fetch(`${strapiUrl}/api/public-tournaments?filters[slug][$eq]=${encodeURIComponent(tournamentSlug)}`, {
          headers: headers(),
        });
        const tPayload = await tRes.json();
        const tournamentDocId = tPayload?.data?.[0]?.documentId;
        if (tournamentDocId) {
          fallbackUrl += `&filters[tournament][documentId][$eq]=${tournamentDocId}`;
        } else {
          return NextResponse.json({ data: [] });
        }
      }

      const fallbackResponse = await fetch(fallbackUrl, {
        headers: headers(),
        next: { revalidate: 0 }
      });

      if (fallbackResponse.ok) {
        const payload = await fallbackResponse.json();
        return NextResponse.json({ data: payload?.data || [] });
      }

      return NextResponse.json({ error: "Failed to fetch registrations from Strapi" }, { status: response.status });
    }

    const payload = await response.json();
    return NextResponse.json({ data: payload?.data || [] });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Fetch registrations failed" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const photo = formData.get("photo") as File | null;
    const screenshot = formData.get("paymentScreenshot") as File | null;

    const tournamentVal = formData.get("tournamentDocId") || formData.get("tournament");
    const parsedTournament = typeof tournamentVal === "string" && isNaN(Number(tournamentVal))
      ? tournamentVal
      : Number(tournamentVal);

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
      tournament: parsedTournament,
    };

    // Always use public-registrations for robust creation, avoiding complex API Token write permissions
    const endpoint = `${strapiUrl}/api/public-registrations`;
    const body = new FormData();
    body.append("data", JSON.stringify(data));
    if (photo instanceof File && photo.size > 0) body.append("photo", photo, photo.name);
    if (screenshot instanceof File && screenshot.size > 0) body.append("paymentScreenshot", screenshot, screenshot.name);

    const registrationResponse = await fetch(endpoint, {
      method: "POST",
      body,
    });

    const registrationPayload = await registrationResponse.json().catch(() => null);
    if (!registrationResponse.ok) {
      return NextResponse.json(
        {
          error: registrationPayload?.error?.message ?? "Could not save registration in Strapi",
        },
        { status: registrationResponse.status }
      );
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
