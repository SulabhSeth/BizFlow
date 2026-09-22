import { createClient } from "@/lib/supabase/server";
import { InvoicesView, type InvoiceRow } from "@/components/invoices/invoices-view";
import type { InvoiceableOrder } from "@/components/invoices/create-invoice-picker";

export default async function InvoicesPage() {
  const supabase = await createClient();

  const [{ data: invoices }, { data: orders }, { data: customers }] = await Promise.all([
    supabase
      .from("invoices")
      .select("id, invoice_number, customer_id, order_id, total, issue_date, status")
      .order("issue_date", { ascending: false }),
    supabase
      .from("orders")
      .select("id, order_number, customer_id, total, delivery_date, status")
      .neq("status", "Cancelled")
      .order("created_at", { ascending: false }),
    supabase.from("customers").select("id, name"),
  ]);

  const customerNameById = new Map((customers ?? []).map((c) => [c.id, c.name]));
  const orderById = new Map((orders ?? []).map((o) => [o.id, o]));
  const invoicedOrderIds = new Set((invoices ?? []).map((inv) => inv.order_id));

  const invoiceRows: InvoiceRow[] = (invoices ?? []).map((inv) => ({
    id: inv.id,
    invoiceNumber: inv.invoice_number,
    customerName: customerNameById.get(inv.customer_id) ?? "Unknown customer",
    orderNumber: orderById.get(inv.order_id)?.order_number ?? "—",
    total: inv.total,
    issueDate: inv.issue_date,
    status: inv.status ?? "Draft",
  }));

  const invoiceableOrders: InvoiceableOrder[] = (orders ?? [])
    .filter((o) => !invoicedOrderIds.has(o.id))
    .map((o) => ({
      id: o.id,
      orderNumber: o.order_number,
      customerName: customerNameById.get(o.customer_id) ?? "Unknown customer",
      total: o.total,
      deliveryDate: o.delivery_date,
    }));

  return <InvoicesView invoices={invoiceRows} invoiceableOrders={invoiceableOrders} />;
}