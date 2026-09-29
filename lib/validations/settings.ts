import { z } from "zod";

const phoneRegex = /^[0-9+\-\s()]{7,20}$/;
const optionalText = (max: number) => z.string().trim().max(max, `Keep this under ${max} characters`).optional().or(z.literal(""));

export const settingsSchema = z.object({
  name: z.string().trim().min(2, "Enter your bakery's name").max(100),
  ownerName: optionalText(100),
  phone: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine((v) => !v || phoneRegex.test(v), "Enter a valid phone number"),
  email: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine((v) => !v || z.string().email().safeParse(v).success, "Enter a valid email address"),
  address: optionalText(300),
  website: optionalText(200),
  instagram: optionalText(100),
  gstin: z
    .string()
    .trim()
    .toUpperCase()
    .optional()
    .or(z.literal(""))
    .refine((v) => !v || /^[0-9A-Z]{15}$/.test(v), "GSTIN should be 15 letters/numbers"),
  invoicePrefix: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9]{2,10}$/, "Use 2–10 letters or numbers"),
  description: optionalText(500),
  // A small data URL produced by the logo uploader (already resized client-side), or "" to remove.
  logoUrl: z
    .string()
    .max(500_000, "That logo is too large. Try a smaller image.")
    .refine((v) => !v || v.startsWith("data:image/"), "Logo must be an image")
    .optional(),
});