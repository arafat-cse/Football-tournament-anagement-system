"use client";

import React, { useState, useMemo } from "react";
import { CheckCircle2, Download, Loader2, Share2, X } from "lucide-react";

export type CardData = {
  name: string;
  role: string;
  age: string;
  tournamentName: string;
  photoUrl: string;
};

export const DEFAULT_PHOTO = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" fill="%23052e2b"/><circle cx="256" cy="256" r="220" fill="none" stroke="%2310b981" stroke-width="12"/><circle cx="256" cy="180" r="80" fill="%2322c55e"/><path d="M256 290c-100 0-150 50-150 100v30h300v-30c0-50-50-100-150-100z" fill="%2322c55e"/></svg>`;

function proxiedImageUrl(src: string) {
  const finalSrc = src || DEFAULT_PHOTO;
  if (finalSrc.startsWith("blob:") || finalSrc.startsWith("data:")) return finalSrc;
  return `/api/image-proxy?url=${encodeURIComponent(finalSrc)}`;
}

export async function loadImage(src: string) {
  if (!src) throw new Error("Image source is missing");

  // If it's already a local URL (blob or data), load it directly
  if (src.startsWith("blob:") || src.startsWith("data:")) {
    return new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Failed to load local image URL"));
      img.src = src;
    });
  }

  // For server images, use proxy and add cache buster to the query string properly
  const proxyUrl = proxiedImageUrl(src);
  const finalSrc = proxyUrl.includes("?") ? `${proxyUrl}&t=${Date.now()}` : `${proxyUrl}?t=${Date.now()}`;

  try {
    const response = await fetch(finalSrc);
    if (!response.ok) throw new Error(`Image proxy failed with ${response.status}`);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    return new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = blobUrl;
    });
  } catch (err) {
    console.error("Failed to proxy image, trying direct load fallback:", err);
    return new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }
}

export function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function createCardBlob(card: CardData, imageElement?: HTMLImageElement | null) {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1350;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas not supported");
  const ctx = context;

  function fillRoundRect(x: number, y: number, width: number, height: number, radius: number, color: string) {
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.roundRect(x, y, width, height, radius);
    ctx.fill();
  }

  function strokeRoundRect(x: number, y: number, width: number, height: number, radius: number, color: string, lineWidth: number) {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.roundRect(x, y, width, height, radius);
    ctx.stroke();
  }

  function drawCenteredText(value: string, x: number, y: number, font: string, color: string, maxWidth?: number) {
    ctx.fillStyle = color;
    ctx.font = font;
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.fillText(value, x, y, maxWidth);
  }

  ctx.fillStyle = "#f1f5f9";
  ctx.fillRect(0, 0, 1080, 1350);

  fillRoundRect(78, 64, 924, 1222, 34, "#ffffff");
  strokeRoundRect(78, 64, 924, 1222, 34, "#b7e4cf", 4);
  fillRoundRect(78, 64, 924, 178, 34, "#043b2f");
  ctx.fillStyle = "#043b2f";
  ctx.fillRect(78, 170, 924, 72);

  drawCenteredText(card.tournamentName || "Mirzapur Premier League", 540, 136, "900 48px Arial", "#ecfdf5", 820);
  drawCenteredText("OFFICIAL PLAYER CARD", 540, 188, "900 24px Arial", "#a7f3d0", 760);

  const x = 150;
  const y = 294;
  const width = 780;
  const height = 690;

  fillRoundRect(x, y, width, height, 28, "#ffffff");
  strokeRoundRect(x, y, width, height, 28, "#a7f3d0", 3);

  const photoUrlToLoad = card.photoUrl || DEFAULT_PHOTO;
  if (photoUrlToLoad || imageElement) {
    try {
      let image: HTMLImageElement | null = null;
      if (photoUrlToLoad) {
        image = await loadImage(photoUrlToLoad).catch(() => null);
      }
      if (!image && imageElement?.complete && imageElement.naturalWidth > 0) {
        image = imageElement;
      }
      if (!image) {
        image = await loadImage(DEFAULT_PHOTO);
      }
      if (!image) {
        throw new Error("Photo is not ready");
      }

      if ("decode" in image) await image.decode().catch(() => undefined);
      const imageWidth = image.naturalWidth || image.width;
      const imageHeight = image.naturalHeight || image.height;
      const scale = Math.min((width - 48) / imageWidth, (height - 48) / imageHeight);
      const drawWidth = imageWidth * scale;
      const drawHeight = imageHeight * scale;
      const drawX = x + (width - drawWidth) / 2;
      const drawY = y + (height - drawHeight) / 2;

      ctx.save();
      ctx.beginPath();
      ctx.roundRect(x, y, width, height, 28);
      ctx.clip();
      ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
      ctx.restore();
    } catch (err) {
      console.error("Canvas draw error:", err);
      fillRoundRect(x, y, width, height, 28, "#d1fae5");
      drawCenteredText((card.name || "P").slice(0, 1).toUpperCase(), 540, 670, "900 150px Arial", "#047857");
    }
  } else {
    fillRoundRect(x, y, width, height, 28, "#d1fae5");
    drawCenteredText((card.name || "P").slice(0, 1).toUpperCase(), 540, 670, "900 150px Arial", "#047857");
  }

  drawCenteredText(card.name, 540, 1080, "900 54px Arial", "#020617", 820);
  drawCenteredText(`Position: ${card.role || "-"}`, 540, 1142, "900 30px Arial", "#047857", 520);
  drawCenteredText(`Age: ${card.age || "-"}`, 540, 1205, "800 26px Arial", "#334155");

  fillRoundRect(150, 1242, 780, 58, 18, "#e7f8ef");
  drawCenteredText("PLAYER PROFILE CARD", 540, 1279, "900 28px Arial", "#065f46", 700);

  ctx.save();
  ctx.translate(970, 1098);
  ctx.rotate(-Math.PI / 2);
  ctx.fillStyle = "#0f766e";
  ctx.font = "800 22px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Create by mandsitbd.com", 0, 0, 360);
  ctx.restore();

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Could not generate card"));
    }, "image/png");
  });
}

export function PlayerCardPreview({ card, title = "Registration submitted", subtitle = "Your player card is ready for Facebook or social media posting." }: { card: CardData; title?: string; subtitle?: string }) {
  const [busy, setBusy] = useState(false);
  const imgRef = React.useRef<HTMLImageElement>(null);
  const fileName = useMemo(() => `${card.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "player"}-card.png`, [card.name]);
  const previewPhotoUrl = useMemo(() => proxiedImageUrl(card.photoUrl), [card.photoUrl]);

  async function downloadCard() {
    setBusy(true);
    try {
      const blob = await createCardBlob(card, imgRef.current);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (err) {
      console.error(err);
    }
    setBusy(false);
  }

  async function shareCard() {
    setBusy(true);
    try {
      const blob = await createCardBlob(card, imgRef.current);
      const file = new File([blob], fileName, { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: `${card.name} card`,
          text: `Check out ${card.name}'s card for ${card.tournamentName}!`,
          files: [file],
        });
      } else {
        await downloadCard();
      }
    } catch (err) {
      console.error(err);
    }
    setBusy(false);
  }

  return (
    <div className="grid gap-5 md:grid-cols-[400px_1fr]">
      <div className="overflow-hidden rounded-lg border border-emerald-100 bg-white shadow-sm">
        <div className="bg-emerald-950 p-4 text-center text-white">
          <h2 className="font-heading text-lg font-black">{card.tournamentName || "Mirzapur Premier League"}</h2>
          <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-lime-200">Official Player Card</p>
        </div>
        <div className="p-4">
          <div className="aspect-[1.03/1] overflow-hidden rounded-lg bg-emerald-50 ring-1 ring-emerald-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img ref={imgRef} src={previewPhotoUrl} alt={card.name} className="h-full w-full object-cover" />
          </div>

          <div className="mt-4 text-center">
            <h3 className="font-heading text-2xl font-black text-slate-950">{card.name}</h3>
            <p className="mx-auto mt-2 inline-flex rounded-md bg-emerald-100 px-4 py-2 text-sm font-extrabold text-emerald-800">Position: {card.role || "-"}</p>
          </div>

          <div className="mt-3 grid gap-1.5 text-[13px]">
            <div className="flex justify-between rounded-md bg-slate-50 px-3 py-2"><span>Age</span><b>{card.age || "-"}</b></div>
            <div className="rounded-md bg-emerald-50 py-2 text-center font-bold text-emerald-800 truncate px-2">Create by mandsitbd.com</div>
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-center rounded-lg border bg-emerald-50 p-6 text-emerald-950">
        <CheckCircle2 className="mb-3 size-8 text-emerald-600" />
        <h2 className="font-heading text-2xl font-black">{title}</h2>
        <p className="mt-2 text-sm text-emerald-900/70">{subtitle}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button className="inline-flex h-10 items-center gap-2 rounded-md bg-emerald-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-60" disabled={busy} onClick={downloadCard}>
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
            {busy ? "Generating..." : "Download card"}
          </button>
          <button className="inline-flex h-10 items-center gap-2 rounded-md border border-emerald-600 px-4 text-sm font-bold text-emerald-700 transition hover:bg-emerald-50 disabled:opacity-60" disabled={busy} onClick={shareCard}>
            <Share2 className="size-4" />
            Share post
          </button>
        </div>
      </div>
    </div>
  );
}

export function PlayerCardDialog({ isOpen, onClose, card }: { isOpen: boolean; onClose: () => void; card: CardData | null }) {
  if (!isOpen || !card) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in duration-200">
        <button onClick={onClose} className="absolute right-4 top-4 z-10 rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors">
          <X className="size-5" />
        </button>
        <div className="p-6 md:p-8">
          <PlayerCardPreview card={card} />
        </div>
      </div>
    </div>
  );
}
