"use client";

import { useRef, useState } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const MAX_DIMENSION = 256;

/** Shrinks the chosen image to a small data URL so it can be stored directly on the business row. */
async function fileToSmallDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

  const png = canvas.toDataURL("image/png");
  // Photos can make PNGs large; fall back to JPEG if so.
  return png.length > 350_000 ? canvas.toDataURL("image/jpeg", 0.85) : png;
}

export function LogoUpload({ initialLogo }: { initialLogo: string | null }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [logo, setLogo] = useState<string>(initialLogo ?? "");
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setError("Please choose a PNG, JPG or WebP image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("That image is over 5 MB. Please choose a smaller one.");
      return;
    }
    try {
      setLogo(await fileToSmallDataUrl(file));
    } catch {
      setError("Couldn't read that image. Please try another one.");
    }
  }

  return (
    <div>
      <input type="hidden" name="logoUrl" value={logo} />
      <div className="flex items-center gap-4">
        <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-[var(--radius-card)] border border-border bg-cream-soft">
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logo} alt="Business logo" className="h-full w-full object-cover" />
          ) : (
            <ImagePlus className="h-6 w-6 text-charcoal-muted" strokeWidth={1.5} />
          )}
        </div>
        <div className="flex flex-col items-start gap-2">
          <div className="flex gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => inputRef.current?.click()}>
              {logo ? "Change logo" : "Upload logo"}
            </Button>
            {logo && (
              <Button type="button" variant="ghost" size="sm" onClick={() => setLogo("")}>
                <Trash2 className="h-4 w-4" />
                Remove
              </Button>
            )}
          </div>
          <p className="text-xs text-charcoal-muted">PNG, JPG or WebP. Shown on your invoices.</p>
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      {error && <p className="mt-2 text-sm text-danger">{error}</p>}
    </div>
  );
}