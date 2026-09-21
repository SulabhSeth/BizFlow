import { z } from "zod";

// Loose but real validation: allows spaces/dashes/parens/+ and requires
// at least 7 digits, so both Indian mobile numbers and landlines pass.
const phoneRegex = /^[0-9+\-\s()]{7,20}$/;

export const customerSchema = z.object({
  name: z.string().trim().min(2, "Enter the customer's name"),
  phone: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine((val) => !val || phoneRegex.test(val), "Enter a valid phone number"),
  email: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine((val) => !val || z.string().email().safeParse(val).success, "Enter a valid email address"),
  address: z.string().trim().optional().or(z.literal("")),
  notes: z.string().trim().optional().or(z.literal("")),
});

export type CustomerInput = z.infer<typeof customerSchema>;