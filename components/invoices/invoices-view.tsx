"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { Badge, invoiceStatusTone } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { CreateInvoicePicker, type InvoiceableOrder } from "./create-invoice-picker";
import { formatCurrency, formatDate } from "@/lib/format";

export interface InvoiceRow {
  id: string;
  invoiceNumber: string;
  customerName: string;
  orderNumber: string;
  total: number;
  issueDate: string;
  status: string;
}

const invoiceStatuses = ["Draft", "Issued", "Paid", "Partially Paid"] as const;

export function InvoicesView({
  invoices,
  invoiceableOrders,
}: {
  invoices: InvoiceRow[];
  invoiceableOrders: InvoiceableOrder[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const autoOpen = searchParams.get("new") === "1";

  useEffect(() => {
    if (autoOpen) {
      router.replace("/invoices");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return invoices.filter((inv) => {
      if (
        q &&
        !inv.invoiceNumber.toLowerCase().includes(q) &&
        !inv.customerName.toLowerCase().includes(q) &&
        !inv.orderNumber.toLowerCase().includes(q)
      ) {
        return false;
      }
      if (status !== "all" && inv.status !== status) return false;
      return true;
    });
  }, [invoices, query, status]);

  return (
    <div className="px-6 py-8 md:px-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-display text-2xl text-charcoal">Invoices</p>
          <p className="mt-1 text-sm text-charcoal-muted">
            {invoices.length} invoice{invoices.length === 1 ? "" : "s"}
          </p>
        </div>
        <CreateInvoicePicker orders={invoiceableOrders} autoOpen={autoOpen} />
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-muted" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search invoice #, customer or order #"
            className="pl-9"
          />
        </div>
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="sm:w-44">
          <option value="all">All statuses</option>
          {invoiceStatuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
      </div>

      <div className="mt-6">
        {invoices.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No invoices yet"
            description="Generate an invoice from any order to send a professional bill to your customer."
            action={<CreateInvoicePicker orders={invoiceableOrders} autoOpen={autoOpen} />}
          />
        ) : filtered.length === 0 ? (
          <EmptyState icon={Search} title="No matches" description="Try a different search or filter." />
        ) : (
          <>
            <div className="hidden md:block">
              <Table>
                <Thead>
                  <Tr>
                    <Th>Invoice #</Th>
                    <Th>Customer</Th>
                    <Th>Order #</Th>
                    <Th>Amount</Th>
                    <Th>Date</Th>
                    <Th>Status</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filtered.map((inv) => (
                    <Tr key={inv.id}>
                      <Td>
                        <Link href={`/invoices/${inv.id}`} className="font-medium hover:text-terracotta">
                          {inv.invoiceNumber}
                        </Link>
                      </Td>
                      <Td>{inv.customerName}</Td>
                      <Td className="text-charcoal-muted">{inv.orderNumber}</Td>
                      <Td>{formatCurrency(inv.total)}</Td>
                      <Td className="text-charcoal-muted">{formatDate(inv.issueDate)}</Td>
                      <Td>
                        <Badge tone={invoiceStatusTone(inv.status)}>{inv.status}</Badge>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </div>

            <div className="space-y-3 md:hidden">
              {filtered.map((inv) => (
                <Link
                  key={inv.id}
                  href={`/invoices/${inv.id}`}
                  className="block rounded-[var(--radius-card)] border border-border bg-surface p-4 shadow-[var(--shadow-card)]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-charcoal">{inv.invoiceNumber}</p>
                      <p className="text-sm text-charcoal-muted">{inv.customerName}</p>
                    </div>
                    <Badge tone={invoiceStatusTone(inv.status)}>{inv.status}</Badge>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-charcoal-muted">{formatDate(inv.issueDate)}</span>
                    <span className="font-medium text-charcoal">{formatCurrency(inv.total)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}