import Link from "next/link";
import { ClipboardList } from "lucide-react";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { Badge, orderStatusTone, paymentStatusTone } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Card } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/format";
import type { RecentOrderRow } from "@/lib/dashboard";

export function RecentOrders({ orders }: { orders: RecentOrderRow[] }) {
  return (
    <div>
      <p className="mb-3 font-medium text-charcoal">Recent Orders</p>
      {orders.length === 0 ? (
        <Card>
          <EmptyState
            icon={ClipboardList}
            title="No orders yet"
            description="Orders you create will show up here, with their payment and delivery status."
          />
        </Card>
      ) : (
        <Table>
          <Thead>
            <Tr>
              <Th>Order #</Th>
              <Th>Customer</Th>
              <Th>Items</Th>
              <Th>Total</Th>
              <Th>Payment</Th>
              <Th>Delivery date</Th>
              <Th>Status</Th>
            </Tr>
          </Thead>
          <Tbody>
            {orders.map((order) => (
              <Tr key={order.id}>
                <Td>
                  <Link href={`/orders/${order.id}`} className="font-medium hover:text-terracotta">
                    {order.orderNumber}
                  </Link>
                </Td>
                <Td>{order.customerName}</Td>
                <Td className="text-charcoal-muted">{order.itemsSummary}</Td>
                <Td>{formatCurrency(order.total)}</Td>
                <Td>
                  <Badge tone={paymentStatusTone(order.paymentStatus)}>{order.paymentStatus}</Badge>
                </Td>
                <Td className="text-charcoal-muted">{formatDate(order.deliveryDate)}</Td>
                <Td>
                  <Badge tone={orderStatusTone(order.status)}>{order.status}</Badge>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </div>
  );
}