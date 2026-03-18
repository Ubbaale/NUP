import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Package, Search, Truck, Eye, ArrowLeft, RotateCcw, CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";
import type { Order } from "@shared/schema";

interface ReturnRequest {
  id: string;
  orderId: string;
  email: string;
  fullName: string;
  reason: string;
  items: string;
  status: string;
  adminNotes: string | null;
  createdAt: string;
  resolvedAt: string | null;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  processing: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  shipped: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  out_for_delivery: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  delivered: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

const FULFILLMENT_COLORS: Record<string, string> = {
  submitted: "bg-blue-100 text-blue-800",
  shipped: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  not_configured: "bg-gray-100 text-gray-800",
};

const RETURN_STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  denied: "bg-red-100 text-red-800",
};

export default function OrdersAdmin() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editStatus, setEditStatus] = useState("");
  const [editTracking, setEditTracking] = useState("");
  const [editCarrier, setEditCarrier] = useState("");
  const [editEstDelivery, setEditEstDelivery] = useState("");
  const [returnAdminNotes, setReturnAdminNotes] = useState("");

  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ["/api/admin/orders"],
  });

  const { data: returnRequests = [] } = useQuery<ReturnRequest[]>({
    queryKey: ["/api/admin/returns"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status, trackingNumber, shippingCarrier, estimatedDelivery }: {
      orderId: string; status: string; trackingNumber?: string; shippingCarrier?: string; estimatedDelivery?: string;
    }) => {
      return apiRequest("PATCH", `/api/orders/${orderId}/status`, {
        status, trackingNumber, shippingCarrier, estimatedDelivery,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      toast({ title: "Order updated", description: "Order status has been updated." });
      setSelectedOrder(null);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update order status.", variant: "destructive" });
    },
  });

  const updateReturnMutation = useMutation({
    mutationFn: async ({ id, status, adminNotes }: { id: string; status: string; adminNotes?: string }) => {
      return apiRequest("PATCH", `/api/returns/${id}`, { status, adminNotes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/returns"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      toast({ title: "Return updated", description: "Return request has been updated." });
      setReturnAdminNotes("");
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update return request.", variant: "destructive" });
    },
  });

  const filteredOrders = orders.filter(order => {
    const matchesSearch = searchQuery === "" ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const orderStats = {
    total: orders.length,
    pending: orders.filter(o => o.status === "pending").length,
    processing: orders.filter(o => o.status === "processing").length,
    shipped: orders.filter(o => o.status === "shipped").length,
    delivered: orders.filter(o => o.status === "delivered").length,
    cancelled: orders.filter(o => o.status === "cancelled").length,
  };

  const pendingReturns = returnRequests.filter(r => r.status === "pending").length;

  const openOrderDetail = (order: Order) => {
    setSelectedOrder(order);
    setEditStatus(order.status || "pending");
    setEditTracking(order.trackingNumber || "");
    setEditCarrier(order.shippingCarrier || "");
    setEditEstDelivery(order.estimatedDelivery || "");
  };

  const parseItems = (items: string) => {
    try { return JSON.parse(items); } catch { return []; }
  };

  const getOrderReturns = (orderId: string) => returnRequests.filter(r => r.orderId === orderId);

  if (selectedOrder) {
    const orderReturns = getOrderReturns(selectedOrder.id);
    const items = parseItems(selectedOrder.items);
    return (
      <div className="p-6 max-w-4xl mx-auto" data-testid="order-detail-view">
        <Button variant="ghost" onClick={() => setSelectedOrder(null)} className="mb-4" data-testid="button-back-to-orders">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Orders
        </Button>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Order #{selectedOrder.id.slice(0, 8)}</CardTitle>
                <Badge className={STATUS_COLORS[selectedOrder.status || "pending"]} data-testid="badge-order-status">
                  {selectedOrder.status || "pending"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Customer</p>
                  <p className="font-medium" data-testid="text-customer-name">{selectedOrder.fullName}</p>
                  <p className="text-sm" data-testid="text-customer-email">{selectedOrder.email}</p>
                  {selectedOrder.phone && <p className="text-sm">{selectedOrder.phone}</p>}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Shipping Address</p>
                  <p className="text-sm">{selectedOrder.address}</p>
                  <p className="text-sm">{selectedOrder.city}, {selectedOrder.state} {selectedOrder.postalCode}</p>
                  <p className="text-sm">{selectedOrder.country}</p>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-sm text-muted-foreground mb-2">Items</p>
                {items.map((item: any, i: number) => (
                  <div key={i} className="flex justify-between py-1">
                    <span>{item.productName} × {item.quantity}{item.size ? ` (${item.size})` : ""}</span>
                    <span className="font-medium">${parseFloat(item.price).toFixed(2)}</span>
                  </div>
                ))}
                <Separator className="my-2" />
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span data-testid="text-order-total">${parseFloat(selectedOrder.totalAmount).toFixed(2)}</span>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-sm text-muted-foreground mb-2">Fulfillment</p>
                <div className="flex items-center gap-2">
                  <Badge className={FULFILLMENT_COLORS[selectedOrder.fulfillmentStatus || ""] || "bg-gray-100"}>
                    {selectedOrder.fulfillmentStatus || "N/A"}
                  </Badge>
                  {selectedOrder.printfulOrderId && (
                    <span className="text-xs text-muted-foreground">Printful: {selectedOrder.printfulOrderId}</span>
                  )}
                </div>
                {selectedOrder.trackingNumber && (
                  <p className="text-sm mt-1">Tracking: <span className="font-mono">{selectedOrder.trackingNumber}</span> ({selectedOrder.shippingCarrier})</p>
                )}
              </div>

              <Separator />

              <div className="space-y-3">
                <p className="font-medium">Update Order</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Status</Label>
                    <Select value={editStatus} onValueChange={setEditStatus}>
                      <SelectTrigger data-testid="select-order-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Carrier</Label>
                    <Input value={editCarrier} onChange={(e) => setEditCarrier(e.target.value)} placeholder="USPS, UPS, FedEx..." data-testid="input-carrier" />
                  </div>
                  <div>
                    <Label>Tracking Number</Label>
                    <Input value={editTracking} onChange={(e) => setEditTracking(e.target.value)} placeholder="Tracking number" data-testid="input-tracking" />
                  </div>
                  <div>
                    <Label>Estimated Delivery</Label>
                    <Input value={editEstDelivery} onChange={(e) => setEditEstDelivery(e.target.value)} placeholder="YYYY-MM-DD" data-testid="input-est-delivery" />
                  </div>
                </div>
                <Button
                  onClick={() => updateStatusMutation.mutate({
                    orderId: selectedOrder.id,
                    status: editStatus,
                    trackingNumber: editTracking || undefined,
                    shippingCarrier: editCarrier || undefined,
                    estimatedDelivery: editEstDelivery || undefined,
                  })}
                  disabled={updateStatusMutation.isPending}
                  data-testid="button-save-order"
                >
                  {updateStatusMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {orderReturns.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <RotateCcw className="w-5 h-5" />
                  Return Requests ({orderReturns.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {orderReturns.map(ret => (
                  <div key={ret.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge className={RETURN_STATUS_COLORS[ret.status] || ""} data-testid={`badge-return-status-${ret.id}`}>
                        {ret.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(ret.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Reason:</p>
                      <p className="text-sm">{ret.reason}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Items:</p>
                      <p className="text-sm">{ret.items}</p>
                    </div>
                    {ret.adminNotes && (
                      <div>
                        <p className="text-sm font-medium">Admin Notes:</p>
                        <p className="text-sm">{ret.adminNotes}</p>
                      </div>
                    )}
                    {ret.status === "pending" && (
                      <div className="space-y-2">
                        <Textarea
                          placeholder="Admin notes (optional)"
                          value={returnAdminNotes}
                          onChange={(e) => setReturnAdminNotes(e.target.value)}
                          data-testid={`input-return-notes-${ret.id}`}
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => updateReturnMutation.mutate({ id: ret.id, status: "approved", adminNotes: returnAdminNotes })}
                            disabled={updateReturnMutation.isPending}
                            data-testid={`button-approve-return-${ret.id}`}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" /> Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => updateReturnMutation.mutate({ id: ret.id, status: "denied", adminNotes: returnAdminNotes })}
                            disabled={updateReturnMutation.isPending}
                            data-testid={`button-deny-return-${ret.id}`}
                          >
                            <XCircle className="w-4 h-4 mr-1" /> Deny
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto" data-testid="orders-admin-page">
      <div className="flex items-center gap-3 mb-6">
        <Package className="w-8 h-8 text-red-600" />
        <div>
          <h1 className="text-2xl font-bold">Order Management</h1>
          <p className="text-muted-foreground">View and manage all store orders</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
        <Card className="cursor-pointer hover:shadow-md transition" onClick={() => setStatusFilter("all")} data-testid="stat-total">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{orderStats.total}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition" onClick={() => setStatusFilter("pending")} data-testid="stat-pending">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">{orderStats.pending}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition" onClick={() => setStatusFilter("processing")} data-testid="stat-processing">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{orderStats.processing}</p>
            <p className="text-xs text-muted-foreground">Processing</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition" onClick={() => setStatusFilter("shipped")} data-testid="stat-shipped">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-purple-600">{orderStats.shipped}</p>
            <p className="text-xs text-muted-foreground">Shipped</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition" onClick={() => setStatusFilter("delivered")} data-testid="stat-delivered">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{orderStats.delivered}</p>
            <p className="text-xs text-muted-foreground">Delivered</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition" onClick={() => setStatusFilter("cancelled")} data-testid="stat-cancelled">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{orderStats.cancelled}</p>
            <p className="text-xs text-muted-foreground">Cancelled</p>
          </CardContent>
        </Card>
      </div>

      {pendingReturns > 0 && (
        <Card className="mb-6 border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-700">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <span className="font-medium">{pendingReturns} pending return request{pendingReturns > 1 ? "s" : ""} need attention</span>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by order ID, name, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search-orders"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40" data-testid="select-status-filter">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading orders...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p>No orders found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredOrders.map(order => {
            const orderReturns = getOrderReturns(order.id);
            const hasPendingReturn = orderReturns.some(r => r.status === "pending");
            return (
              <Card
                key={order.id}
                className={`cursor-pointer hover:shadow-md transition ${hasPendingReturn ? "border-yellow-400" : ""}`}
                onClick={() => openOrderDetail(order)}
                data-testid={`card-order-${order.id}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-mono text-sm font-medium">#{order.id.slice(0, 8)}</p>
                        <p className="text-sm text-muted-foreground">{order.fullName}</p>
                      </div>
                      <div className="hidden md:block">
                        <p className="text-sm text-muted-foreground">{order.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {hasPendingReturn && (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          <RotateCcw className="w-3 h-3 mr-1" /> Return
                        </Badge>
                      )}
                      {order.trackingNumber && (
                        <div className="hidden md:flex items-center gap-1 text-xs text-muted-foreground">
                          <Truck className="w-3 h-3" />
                          <span className="font-mono">{order.trackingNumber}</span>
                        </div>
                      )}
                      <Badge className={STATUS_COLORS[order.status || "pending"]}>
                        {order.status || "pending"}
                      </Badge>
                      <span className="font-bold">${parseFloat(order.totalAmount).toFixed(2)}</span>
                      <span className="text-xs text-muted-foreground">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : ""}
                      </span>
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
