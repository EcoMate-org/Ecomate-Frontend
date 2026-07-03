import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // mirrors the FastAPI service's own limit

/**
 * POST /api/playground/classify
 *
 * Thin proxy to the FastAPI classification service. Forwards the "image"
 * multipart field and normalizes FastAPI's { detail: ... } error shape into
 * { error: string } so the Playground page can show it directly.
 */
export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("image");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No image was provided." }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "Image exceeds maximum size of 5MB." },
      { status: 413 },
    );
  }

  const baseUrl = process.env.FASTAPI_CLASSIFIER_URL;
  if (!baseUrl) {
    console.error("FASTAPI_CLASSIFIER_URL is not set.");
    return NextResponse.json(
      { error: "Classification service is not configured." },
      { status: 500 },
    );
  }

  const upstreamForm = new FormData();
  upstreamForm.append("image", file, file.name || "snapshot.jpg");

  let upstreamRes: Response;
  try {
    upstreamRes = await fetch(`${baseUrl}/classify`, { method: "POST", body: upstreamForm });
  } catch (err) {
    console.error("Failed to reach classification service:", err);
    return NextResponse.json(
      { error: "Couldn't reach the classification service. Please try again." },
      { status: 502 },
    );
  }

  const payload = await upstreamRes.json().catch(() => null);

  if (!upstreamRes.ok) {
    const detail =
      payload && typeof payload === "object" && "detail" in payload
        ? (payload as { detail: unknown }).detail
        : null;

    const message =
      typeof detail === "string"
        ? detail
        : "The image couldn't be classified. Please check it shows a recyclable item or artwork.";

    return NextResponse.json({ error: message }, { status: upstreamRes.status });
  }

  return NextResponse.json(payload, { status: 200 });
}