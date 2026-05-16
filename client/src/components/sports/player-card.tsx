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

function proxiedImageUrl(src: string) {
  if (!src || src.startsWith("blob:") || src.startsWith("data:")) return src;
  return `/api/image-proxy?url=${encodeURIComponent(src)}`;
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
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  ctx.fillStyle = "#071c18";
  ctx.fillRect(0, 0, 1080, 1350);

  const glow = ctx.createRadialGradient(840, 180, 40, 840, 180, 720);
  glow.addColorStop(0, "rgba(34,197,94,0.7)");
  glow.addColorStop(1, "rgba(34,197,94,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, 1080, 1350);

  ctx.fillStyle = "#f8fafc";
  ctx.roundRect(86, 86, 908, 1178, 42);
  ctx.fill();
  ctx.strokeStyle = "#bbf7d0";
  ctx.lineWidth = 5;
  ctx.stroke();

  ctx.fillStyle = "#052e2b";
  ctx.roundRect(126, 126, 828, 132, 30);
  ctx.fill();
  ctx.fillStyle = "#dcfce7";
  ctx.font = "900 48px Arial";
  ctx.textAlign = "left";
  ctx.fillText("PLAYER REGISTRATION", 166, 204);

  ctx.fillStyle = "#86efac";
  ctx.font = "700 26px Arial";
  ctx.fillText(card.tournamentName, 166, 240, 760);

  const x = 250;
  const y = 318;
  const size = 580;
  if (card.photoUrl || imageElement) {
    try {
      let image: HTMLImageElement;
      if (card.photoUrl) {
        image = await loadImage(card.photoUrl);
      } else if (imageElement && imageElement.complete && imageElement.naturalWidth > 0) {
        image = imageElement;
      } else {
        throw new Error("Photo is not ready");
      }

      if ("decode" in image) await image.decode().catch(() => undefined);
      const imageRatio = image.naturalWidth / image.naturalHeight;
      const frameRatio = 1;
      const sourceWidth = imageRatio > frameRatio ? image.naturalHeight * frameRatio : image.naturalWidth;
      const sourceHeight = imageRatio > frameRatio ? image.naturalHeight : image.naturalWidth / frameRatio;
      const sourceX = (image.naturalWidth - sourceWidth) / 2;
      const sourceY = (image.naturalHeight - sourceHeight) / 2;

      ctx.save();
      ctx.beginPath();
      ctx.roundRect(x, y, size, size, 38);
      ctx.clip();
      ctx.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, x, y, size, size);
      ctx.restore();
      ctx.strokeStyle = "#16a34a";
      ctx.lineWidth = 8;
      ctx.roundRect(x, y, size, size, 38);
      ctx.stroke();
    } catch (err) {
      console.error("Canvas draw error:", err);
      ctx.fillStyle = "#ecfdf5";
      ctx.roundRect(x, y, size, size, 38);
      ctx.fill();
    }
  } else {
    ctx.fillStyle = "#ecfdf5";
    ctx.roundRect(x, y, size, size, 38);
    ctx.fill();
  }

  // Improved text readability for dark background
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 74px Arial";
  ctx.textAlign = "center";
  ctx.fillText(card.name, 540, 990, 830);

  ctx.fillStyle = "#bbf7d0";
  ctx.font = "900 44px Arial";
  ctx.fillText(card.role, 540, 1056, 820);

  ctx.fillStyle = "#f1f5f9";
  ctx.font = "700 32px Arial";
  ctx.fillText(`Age: ${card.age || "-"}`, 540, 1112);

  ctx.fillStyle = "#dcfce7";
  ctx.roundRect(146, 1160, 788, 92, 24);
  ctx.fill();
  ctx.fillStyle = "#064e3b";
  ctx.font = "900 32px Arial";
  ctx.fillText("OFFICIAL REGISTRATION CARD", 540, 1218, 740);

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
    <div className="grid gap-5 md:grid-cols-[380px_1fr]">
      <div className="overflow-hidden rounded-lg border border-emerald-100 bg-white shadow-sm">
        <div className="bg-emerald-950 p-4 text-white">
          <p className="text-[10px] font-black uppercase tracking-widest text-lime-200">Official Player Card</p>
          <h2 className="mt-1 font-heading text-lg font-black truncate">{card.name}</h2>
        </div>
        <div className="p-4">
          <div className="aspect-[4/5] overflow-hidden rounded-lg bg-emerald-50 ring-1 ring-emerald-100">
            {card.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img ref={imgRef} src={previewPhotoUrl} alt={card.name} className="h-full w-full object-cover" />
            ) : (
              <div className="grid h-full place-items-center text-xs font-bold text-emerald-700">No Photo</div>
            )}
          </div>
          <div className="mt-3 grid gap-1.5 text-[13px]">
            <div className="flex justify-between rounded-md bg-slate-50 px-3 py-2"><span>Role</span><b>{card.role}</b></div>
            <div className="flex justify-between rounded-md bg-slate-50 px-3 py-2"><span>Age</span><b>{card.age || "-"}</b></div>
            <div className="rounded-md bg-emerald-50 py-2 text-center font-bold text-emerald-800 truncate px-2">{card.tournamentName}</div>
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
