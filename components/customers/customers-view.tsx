"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Search, Pencil, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { CustomerFormModal, type CustomerFormValues } from "./customer-form";
import { deleteCustomer } from "@/actions/customers";
import { useToast } from "@/components/ui/toast";
import { formatCurrency, formatDate } from "@/lib/format";

export interface CustomerRow extends CustomerFormValues {
  orderCount: number;
  totalSpent: number;
  pendingAmount: number;
  lastOrderDate: string | null;
}

export function CustomersView({ customers }: { customers: CustomerRow[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [formOpen, setFormOpen] = useState(() => searchParams.get("new") === "1");
  const [editing, setEditing] = useState<CustomerRow | null>(null);
  const [deleting, setDeleting] = useState<CustomerRow | null>(null);
  const [deletePending, setDeletePending] = useState(false);

  useEffect(() => {
    if (searchParams.get("new") === "1") {
      router.replace("/customers");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.phone ?? "").toLowerCase().includes(q) ||
        (c.email ?? "").toLowerCase().includes(q),
    );
  }, [customers, query]);

  async function handleDelete() {
    if (!deleting) return;
    setDeletePending(true);
    const result = await deleteCustomer(deleting.id);
    setDeletePending(false);
    setDeleting(null);
    if (result.error) {
      toast(result.error, "error");
    } else {
      toast("Customer deleted successfully.");
      router.refresh();
    }
  }

  return (
    <div className="px-6 py-8 md:px-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-display text-2xl text-charcoal">Customers</p>
          <p className="mt-1 text-sm text-charcoal-muted">
            {customers.length} customer{customers.length === 1 ? "" : "s"}
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Add Customer
        </Button>
      </div>

      <div className="relative mt-6 max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-muted" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, phone or email"
          className="pl-9"
        />
      </div>

      <div className="mt-6">
        {customers.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No customers yet"
            description="Add your first customer to start tracking their orders and payments."
            action={
              <Button onClick={() => setFormOpen(true)}>
                <Plus className="h-4 w-4" />
                Add Customer
              </Button>
            }
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No matches"
            description={`No customers match "${query}".`}
          />
        ) : (
          <>
            {/* Desktop / tablet table */}
            <div className="hidden md:block">
              <Table>
                <Thead>
                  <Tr>
                    <Th>Name</Th>
                    <Th>Phone</Th>
                    <Th>Email</Th>
                    <Th>Orders</Th>
                    <Th>Total spent</Th>
                    <Th>Pending</Th>
                    <Th>Last order</Th>
                    <Th className="text-right">Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filtered.map((c) => (
                    <Tr key={c.id}>
                      <Td>
                        <Link href={`/customers/${c.id}`} className="font-medium hover:text-terracotta">
                          {c.name}
                        </Link>
                      </Td>
                      <Td className="text-charcoal-muted">{c.phone ?? "—"}</Td>
                      <Td className="text-charcoal-muted">{c.email ?? "—"}</Td>
                      <Td>{c.orderCount}</Td>
                      <Td>{formatCurrency(c.totalSpent)}</Td>
                      <Td className={c.pendingAmount > 0 ? "text-danger" : "text-charcoal-muted"}>
                        {c.pendingAmount > 0 ? formatCurrency(c.pendingAmount) : "—"}
                      </Td>
                      <Td className="text-charcoal-muted">
                        {c.lastOrderDate ? formatDate(c.lastOrderDate) : "—"}
                      </Td>
                      <Td>
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => {
                              setEditing(c);
                              setFormOpen(true);
                            }}
                            aria-label={`Edit ${c.name}`}
                            className="rounded-[var(--radius-control)] p-2 text-charcoal-muted hover:bg-cream-soft hover:text-charcoal"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeleting(c)}
                            aria-label={`Delete ${c.name}`}
                            className="rounded-[var(--radius-control)] p-2 text-charcoal-muted hover:bg-danger-soft hover:text-danger"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </div>

            {/* Mobile stacked cards */}
            <div className="space-y-3 md:hidden">
              {filtered.map((c) => (
                <Link
                  key={c.id}
                  href={`/customers/${c.id}`}
                  className="block rounded-[var(--radius-card)] border border-border bg-surface p-4 shadow-[var(--shadow-card)]"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-charcoal">{c.name}</p>
                    {c.pendingAmount > 0 && (
                      <span className="text-sm font-medium text-danger">
                        {formatCurrency(c.pendingAmount)} pending
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-charcoal-muted">{c.phone ?? c.email ?? "No contact info"}</p>
                  <div className="mt-3 flex items-center justify-between text-sm text-charcoal-muted">
                    <span>
                      {c.orderCount} order{c.orderCount === 1 ? "" : "s"} · {formatCurrency(c.totalSpent)} spent
                    </span>
                    {c.lastOrderDate && <span>{formatDate(c.lastOrderDate)}</span>}
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>

      <CustomerFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          router.refresh();
        }}
        customer={editing ?? undefined}
      />

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="Delete customer?"
        description={`This will permanently remove ${deleting?.name ?? "this customer"}. This can't be undone.`}
        confirmLabel="Delete"
        loading={deletePending}
      />
    </div>
  );
}