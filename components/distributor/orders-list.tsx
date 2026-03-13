"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Eye, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface OrderItem {
  id: number
  medicine_id: number
  name: string
  generic_name: string
  quantity: number
  unit_price: number
  total_price: number
}

interface Order {
  id: number
  order_number: string
  customer_name: string
  customer_email: string
  pharmacy_name: string
  total_amount: number
  status: string
  payment_status: string
  item_count: number
  total_items: number
  created_at: string
  updated_at: string
  items: OrderItem[]
}

export function OrdersList() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/distributor/orders")
      const data = await response.json()

      if (!response.ok) {
        toast({
          title: "Error",
          description: data.error || "Failed to load orders",
          variant: "destructive",
        })
        return
      }

      setOrders(data.orders || [])
    } catch (error) {
      console.error("Error fetching orders:", error)
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-100 text-amber-800"
      case "confirmed":
        return "bg-blue-100 text-blue-800"
      case "processing":
        return "bg-purple-100 text-purple-800"
      case "shipped":
        return "bg-cyan-100 text-cyan-800"
      case "delivered":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-100 text-amber-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground">Loading orders...</p>
        </div>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground mb-2">No orders yet</p>
        <p className="text-sm text-muted-foreground">
          Orders containing your medicines will appear here
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Orders Table */}
      <div className="overflow-x-auto border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Order #</TableHead>
              <TableHead className="font-semibold">Pharmacy</TableHead>
              <TableHead className="font-semibold">Items</TableHead>
              <TableHead className="font-semibold">Amount</TableHead>
              <TableHead className="font-semibold">Order Status</TableHead>
              <TableHead className="font-semibold">Payment</TableHead>
              <TableHead className="font-semibold">Date</TableHead>
              <TableHead className="font-semibold">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id} className="hover:bg-muted/50">
                <TableCell>
                  <p className="font-medium text-sm">{order.order_number}</p>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium text-sm">{order.pharmacy_name}</p>
                    <p className="text-xs text-muted-foreground">{order.customer_email}</p>
                  </div>
                </TableCell>
                <TableCell className="font-medium text-sm">{order.total_items}</TableCell>
                <TableCell className="font-medium">₹{order.total_amount.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge
                    className={`text-xs capitalize ${getStatusColor(order.status)}`}
                    variant="secondary"
                  >
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    className={`text-xs capitalize ${getPaymentStatusColor(order.payment_status)}`}
                    variant="secondary"
                  >
                    {order.payment_status}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(order.created_at).toLocaleDateString("en-IN")}
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <Card className="p-6 border-2 border-primary/20">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Order Details</h3>
            <button
              onClick={() => setSelectedOrder(null)}
              className="text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b">
            <div>
              <p className="text-sm text-muted-foreground">Order Number</p>
              <p className="font-medium">{selectedOrder.order_number}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Order Date</p>
              <p className="font-medium">
                {new Date(selectedOrder.created_at).toLocaleDateString("en-IN")}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pharmacy</p>
              <p className="font-medium">{selectedOrder.pharmacy_name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Customer</p>
              <p className="font-medium">{selectedOrder.customer_name}</p>
            </div>
          </div>

          {/* Items */}
          <div className="mb-6">
            <h4 className="font-semibold mb-4">Order Items</h4>
            <div className="space-y-3">
              {selectedOrder.items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-start p-3 bg-muted/50 rounded"
                >
                  <div>
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.generic_name}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Qty: {item.quantity} × ₹{item.unit_price.toFixed(2)}
                    </p>
                  </div>
                  <p className="font-semibold">₹{item.total_price.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="space-y-2 mb-6 pb-6 border-b">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>₹{selectedOrder.total_amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold text-lg pt-2">
              <span>Total</span>
              <span>₹{selectedOrder.total_amount.toFixed(2)}</span>
            </div>
          </div>

          {/* Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Order Status</p>
              <Badge
                className={`text-xs capitalize ${getStatusColor(selectedOrder.status)}`}
              >
                {selectedOrder.status}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Payment Status</p>
              <Badge
                className={`text-xs capitalize ${getPaymentStatusColor(selectedOrder.payment_status)}`}
              >
                {selectedOrder.payment_status}
              </Badge>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
