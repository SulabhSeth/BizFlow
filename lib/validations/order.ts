import { z } from "zod";

export const orderItemSchema = z.object({
  productId: z.string().uuid().nullable(),
  name: z.string().trim().min(1, "Item name is required"),
  quantity: z.coerce.number().int("Quantity must be a whole number").positive("Quantity must be at least 1"),
  unitPrice: z.coerce.number().min(0, "Price can't be negative"),
});

export const paymentMethods = ["Cash", "UPI", "Bank Transfer", "Card", "Other"] as const;

export const orderSchema = z
  .object({
    customerId: z.string().uuid("Select a customer"),
    deliveryDate: z.string().min(1, "Choose a delivery date"),
    deliveryTime: z.string().trim().optional().or(z.literal("")),
    customerNotes: z.string().trim().optional().or(z.literal("")),
    internalNotes: z.string().trim().optional().or(z.literal("")),
    discount: z.coerce.number().min(0, "Discount can't be negative").default(0),
    deliveryFee: z.coerce.number().min(0, "Delivery fee can't be negative").default(0),
    advancePaid: z.coerce.number().min(0, "Amount can't be negative").default(0),
    paymentMethod: z.enum(paymentMethods).optional(),
    items: z.array(orderItemSchema).min(1, "Add at least one item"),
  })
  .refine((data) => data.advancePaid === 0 || !!data.paymentMethod, {
    message: "Choose a payment method",
    path: ["paymentMethod"],
  });

export type OrderInput = z.infer<typeof orderSchema>;