"use client";

import { useActionState, useEffect } from "react";
import { createProduct, updateProduct, type ProductFormState } from "@/actions/products";
import { productCategories } from "@/lib/validations/product";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";

export interface ProductFormValues {
  id: string;
  name: string;
  category: string;
  description: string | null;
  price: number;
}

interface ProductFormModalProps {
  open: boolean;
  onClose: () => void;
  /** Omit to create a new product; pass an existing product to edit it. */
  product?: ProductFormValues;
}

const initialState: ProductFormState = {};

export function ProductFormModal({ open, onClose, product }: ProductFormModalProps) {
  const toast = useToast();
  const action = product ? updateProduct.bind(null, product.id) : createProduct;
  const [state, formAction, pending] = useActionState(action, initialState);

  useEffect(() => {
    if (state.success) {
      toast(product ? "Product updated successfully." : "Product added successfully.");
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.success]);

  return (
    <Modal open={open} onClose={onClose} title={product ? "Edit product" : "Add product"}>
      {state.error && (
        <p className="mb-4 rounded-[var(--radius-control)] bg-danger-soft px-3 py-2 text-sm text-danger">
          {state.error}
        </p>
      )}
      <form action={formAction} className="space-y-4">
        <FormField label="Name" htmlFor="name" error={state.fieldErrors?.name}>
          <Input id="name" name="name" defaultValue={product?.name} placeholder="Chocolate Truffle Cake" />
        </FormField>
        <FormField label="Category" htmlFor="category" error={state.fieldErrors?.category}>
          <Select id="category" name="category" defaultValue={product?.category ?? "Cakes"}>
            {productCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Price (₹)" htmlFor="price" error={state.fieldErrors?.price}>
          <Input
            id="price"
            name="price"
            type="number"
            min="0"
            step="1"
            defaultValue={product?.price}
            placeholder="1200"
          />
        </FormField>
        <FormField label="Description" htmlFor="description" error={state.fieldErrors?.description}>
          <Textarea
            id="description"
            name="description"
            defaultValue={product?.description ?? ""}
            placeholder="Rich chocolate sponge with truffle ganache"
          />
        </FormField>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={pending}>
            {product ? "Save changes" : "Add product"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}