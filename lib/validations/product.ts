import { z } from "zod";

export const productCategories = [
  "Cakes",
  "Cupcakes",
  "Cookies",
  "Brownies",
  "Breads",
  "Other",
] as const;

export const productSchema = z.object({
  name: z.string().trim().min(2, "Enter the product's name"),
  category: z.enum(productCategories, { message: "Choose a category" }),
  description: z.string().trim().optional().or(z.literal("")),
  price: z.coerce
    .number({ message: "Enter a price" })
    .positive("Price must be greater than 0"),
});

export type ProductInput = z.infer<typeof productSchema>;