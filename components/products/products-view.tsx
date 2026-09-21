"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Search, Pencil, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ProductFormModal, type ProductFormValues } from "./product-form";
import { productCategories } from "@/lib/validations/product";
import { setProductActive } from "@/actions/products";
import { useToast } from "@/components/ui/toast";
import { formatCurrency } from "@/lib/format";

export interface ProductRow extends ProductFormValues {
  isActive: boolean;
}

type ActiveFilter = "all" | "active" | "inactive";

export function ProductsView({ products }: { products: ProductRow[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("all");
  const [formOpen, setFormOpen] = useState(() => searchParams.get("new") === "1");
  const [editing, setEditing] = useState<ProductRow | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get("new") === "1") {
      router.replace("/products");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      if (q && !p.name.toLowerCase().includes(q)) return false;
      if (category !== "all" && p.category !== category) return false;
      if (activeFilter === "active" && !p.isActive) return false;
      if (activeFilter === "inactive" && p.isActive) return false;
      return true;
    });
  }, [products, query, category, activeFilter]);

  function handleToggle(product: ProductRow) {
    setTogglingId(product.id);
    startTransition(async () => {
      const result = await setProductActive(product.id, !product.isActive);
      setTogglingId(null);
      if (result.error) {
        toast(result.error, "error");
      } else {
        toast(product.isActive ? "Product deactivated." : "Product activated.");
        router.refresh();
      }
    });
  }

  return (
    <div className="px-6 py-8 md:px-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-display text-2xl text-charcoal">Products</p>
          <p className="mt-1 text-sm text-charcoal-muted">
            {products.length} product{products.length === 1 ? "" : "s"}
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-muted" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products"
            className="pl-9"
          />
        </div>
        <Select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="sm:w-44"
        >
          <option value="all">All categories</option>
          {productCategories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
        <Select
          value={activeFilter}
          onChange={(e) => setActiveFilter(e.target.value as ActiveFilter)}
          className="sm:w-40"
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </Select>
      </div>

      <div className="mt-6">
        {products.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No products yet"
            description="Add your bakery's cakes, cookies and other items to start creating orders."
            action={
              <Button onClick={() => setFormOpen(true)}>
                <Plus className="h-4 w-4" />
                Add Product
              </Button>
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
                    <Th>Name</Th>
                    <Th>Category</Th>
                    <Th>Price</Th>
                    <Th>Status</Th>
                    <Th className="text-right">Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filtered.map((p) => (
                    <Tr key={p.id} className={p.isActive ? "" : "opacity-60"}>
                      <Td>
                        <p className="font-medium text-charcoal">{p.name}</p>
                        {p.description && (
                          <p className="mt-0.5 line-clamp-1 text-xs text-charcoal-muted">{p.description}</p>
                        )}
                      </Td>
                      <Td className="text-charcoal-muted">{p.category}</Td>
                      <Td>{formatCurrency(p.price)}</Td>
                      <Td>
                        <Badge tone={p.isActive ? "success" : "neutral"}>
                          {p.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </Td>
                      <Td>
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditing(p);
                              setFormOpen(true);
                            }}
                            aria-label={`Edit ${p.name}`}
                            className="rounded-[var(--radius-control)] p-2 text-charcoal-muted hover:bg-cream-soft hover:text-charcoal"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <Button
                            variant="secondary"
                            size="sm"
                            loading={isPending && togglingId === p.id}
                            onClick={() => handleToggle(p)}
                          >
                            {p.isActive ? "Deactivate" : "Activate"}
                          </Button>
                        </div>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </div>

            <div className="space-y-3 md:hidden">
              {filtered.map((p) => (
                <div
                  key={p.id}
                  className={`rounded-[var(--radius-card)] border border-border bg-surface p-4 shadow-[var(--shadow-card)] ${
                    p.isActive ? "" : "opacity-60"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-charcoal">{p.name}</p>
                      <p className="text-xs text-charcoal-muted">{p.category}</p>
                    </div>
                    <Badge tone={p.isActive ? "success" : "neutral"}>
                      {p.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <p className="font-medium text-charcoal">{formatCurrency(p.price)}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditing(p);
                          setFormOpen(true);
                        }}
                        className="rounded-[var(--radius-control)] border border-border-strong px-3 py-1.5 text-sm text-charcoal-muted"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleToggle(p)}
                        className="rounded-[var(--radius-control)] border border-border-strong px-3 py-1.5 text-sm text-charcoal-muted"
                      >
                        {p.isActive ? "Deactivate" : "Activate"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <ProductFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          router.refresh();
        }}
        product={editing ?? undefined}
      />
    </div>
  );
}