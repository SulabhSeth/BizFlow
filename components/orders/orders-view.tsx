"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Search, ClipboardList } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { Badge, orderStatusTone, paymentStatusTone } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { orderStatuses } from "@/lib/validations/order";
import { formatCurrency, formatDate } from "@/lib/format";

const paymentStatuses = ["Paid", "Partially Paid", "Pending"] as const;

export interface OrderRow {
  id: string;
  orderNumber: string;
  customerName: string;
  itemsSummary: string;
  total: number;
  paid: number;
  balance: number;
  paymentStatus: "Paid" | "Partially Paid" | "Pending";
  deliveryDate: string;
  status: string;
}

// const orderStatuses = ["New", "Confirmed", "Preparing", "Ready", "Delivered", "Cancelled"] as const;
// const paymentStatuses = ["Paid", "Partially Paid", "Pending"] as const;

export function OrdersView({ orders }: { orders: OrderRow[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [paymentStatus, setPaymentStatus] = useState("all");
  const [date, setDate] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((o) => {
      if (q && !o.orderNumber.toLowerCase().includes(q) && !o.customerName.toLowerCase().includes(q)) {
        return false;
      }
      if (status !== "all" && o.status !== status) return false;
      if (paymentStatus !== "all" && o.paymentStatus !== paymentStatus) return false;
      if (date && o.deliveryDate !== date) return false;
      return true;
    });
  }, [orders, query, status, paymentStatus, date]);

  return (
    <div className="px-6 py-8 md:px-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-display text-2xl text-charcoal">Orders</p>
          <p className="mt-1 text-sm text-charcoal-muted">
            {orders.length} order{orders.length === 1 ? "" : "s"}
          </p>
        </div>
        <Link
          href="/orders/new"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-[var(--radius-control)] bg-terracotta px-4 text-sm font-medium text-white transition-colors hover:bg-[#a4502f]"
        >
          <Plus className="h-4 w-4" />
          New Order
        </Link>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-muted" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search order # or customer"
            className="pl-9"
          />
        </div>
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="sm:w-44">
          <option value="all">All statuses</option>
          {orderStatuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
        <Select
          value={paymentStatus}
          onChange={(e) => setPaymentStatus(e.target.value)}
          className="sm:w-44"
        >
          <option value="all">All payments</option>
          {paymentStatuses.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </Select>
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="sm:w-44"
          aria-label="Filter by delivery date"
        />
        {(query || status !== "all" || paymentStatus !== "all" || date) && (
          <button
            onClick={() => {
              setQuery("");
              setStatus("all");
              setPaymentStatus("all");
              setDate("");
            }}
            className="text-sm text-charcoal-muted underline hover:text-charcoal"
          >
            Clear filters
          </button>
        )}
      </div>

      <div className="mt-6">
        {orders.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No orders yet"
            description="Create your first order to start tracking your bakery sales."
            action={
              <Link
                href="/orders/new"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-[var(--radius-control)] bg-terracotta px-4 text-sm font-medium text-white transition-colors hover:bg-[#a4502f]"
              >
                <Plus className="h-4 w-4" />
                New Order
              </Link>
            }
          />
        ) : filtered.length === 0 ? (
          <EmptyState icon={Search} title="No matches" description="Try a different search or filter." />
        ) : (
          <>
            <div className="hidden md:block">
              <Table>
                <Thead>
                  <Tr>
                    <Th>Order #</Th>
                    <Th>Customer</Th>
                    <Th>Items</Th>
                    <Th>Total</Th>
                    <Th>Paid</Th>
                    <Th>Balance</Th>
                    <Th>Delivery date</Th>
                    <Th>Status</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filtered.map((o) => (
                    <Tr key={o.id}>
                      <Td>
                        <Link href={`/orders/${o.id}`} className="font-medium hover:text-terracotta">
                          {o.orderNumber}
                        </Link>
                      </Td>
                      <Td>{o.customerName}</Td>
                      <Td className="text-charcoal-muted">{o.itemsSummary}</Td>
                      <Td>{formatCurrency(o.total)}</Td>
                      <Td className="text-charcoal-muted">{formatCurrency(o.paid)}</Td>
                      <Td className={o.balance > 0 ? "text-danger" : "text-charcoal-muted"}>
                        {o.balance > 0 ? formatCurrency(o.balance) : "—"}
                      </Td>
                      <Td className="text-charcoal-muted">{formatDate(o.deliveryDate)}</Td>
                      <Td>
                        <Badge tone={orderStatusTone(o.status)}>{o.status}</Badge>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </div>

            <div className="space-y-3 md:hidden">
              {filtered.map((o) => (
                <Link
                  key={o.id}
                  href={`/orders/${o.id}`}
                  className="block rounded-[var(--radius-card)] border border-border bg-surface p-4 shadow-[var(--shadow-card)]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-charcoal">{o.orderNumber}</p>
                      <p className="text-sm text-charcoal-muted">{o.customerName}</p>
                    </div>
                    <Badge tone={orderStatusTone(o.status)}>{o.status}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-charcoal-muted">{o.itemsSummary}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm text-charcoal-muted">{formatDate(o.deliveryDate)}</span>
                    <div className="flex items-center gap-2">
                      <Badge tone={paymentStatusTone(o.paymentStatus)}>{o.paymentStatus}</Badge>
                      <span className="font-medium text-charcoal">{formatCurrency(o.total)}</span>
                    </div>
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