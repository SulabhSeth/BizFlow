import { z } from "zod";
import { paymentMethods } from "@/lib/validations/order";

export const paymentSchema = z.object({
  amount: z.coerce.number({ message: "Enter an amount" }).positive("Amount must be greater than 0"),
  method: z.enum(paymentMethods, { message: "Choose a payment method" }),
  paymentDate: z.string().min(1, "Choose a date"),
  notes: z.string().trim().optional().or(z.literal("")),
});

export type PaymentInput = z.infer<typeof paymentSchema>;