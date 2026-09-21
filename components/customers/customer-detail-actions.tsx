"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CustomerFormModal, type CustomerFormValues } from "./customer-form";

export function EditCustomerButton({ customer }: { customer: CustomerFormValues }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
        <Pencil className="h-4 w-4" />
        Edit
      </Button>
      <CustomerFormModal
        open={open}
        onClose={() => {
          setOpen(false);
          router.refresh();
        }}
        customer={customer}
      />
    </>
  );
}