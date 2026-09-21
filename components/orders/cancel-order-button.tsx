"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { updateOrderStatus } from "@/actions/orders";
import { useToast } from "@/components/ui/toast";

export function CancelOrderButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleConfirm() {
    setPending(true);
    const result = await updateOrderStatus(orderId, "Cancelled");
    setPending(false);
    setOpen(false);
    if (result.error) {
      toast(result.error, "error");
    } else {
      toast("Order cancelled.");
      router.refresh();
    }
  }

  return (
    <>
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
        <XCircle className="h-4 w-4" />
        Cancel Order
      </Button>
      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={handleConfirm}
        title="Cancel order?"
        description="This marks the order as cancelled. You can still view its details afterward, but it won't count toward revenue or upcoming deliveries."
        confirmLabel="Cancel Order"
        loading={pending}
      />
    </>
  );
}