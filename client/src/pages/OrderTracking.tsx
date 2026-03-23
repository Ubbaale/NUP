import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { SEO } from "@/components/SEO";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, Search, CheckCircle, Clock, Truck, MapPin, Star, ShoppingBag, AlertCircle, RotateCcw } from "lucide-react";
import type { Order, ProductRating } from "@shared/schema";

interface OrderItem {
  productId: string;
  productName: string;
  price: string;
  quantity: number;
  size?: string;
  color?: string;
}

const STATUS_STEPS = [
  { key: "pending", label: "Order Placed", icon: CheckCircle, description: "We received your order" },
  { key: "processing", label: "Processing", icon: Package, description: "We're preparing your items" },
  { key: "shipped", label: "Shipped", icon: Truck, description: "Your order is on its way" },
  { key: "out_for_delivery", label: "Out for Delivery", icon: MapPin, description: "Your order is nearby" },
  { key: "delivered", label: "Delivered", icon: CheckCircle, description: "Package delivered!" },
];

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  processing: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  shipped: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  out_for_delivery: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  delivered: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

function StarRating({ value, onChange, readonly = false }: { value: number; onChange?: (v: number) => void; readonly?: boolean }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className={`transition-colors ${readonly ? "cursor-default" : "cursor-pointer hover:scale-110"}`}
          data-testid={`star-${star}`}
        >
          <Star
            className={`w-6 h-6 ${(hovered || value) >= star ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
          />
        </button>
      ))}
    </div>
  );
}

function RateProductDialog({ item, orderId, orderEmail, onRated }: {
  item: OrderItem;
  orderId: string;
  orderEmail: string;
  onRated: () => void;
}) {
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [open, setOpen] = useState(false);

  const ratingMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/ratings", {
      productId: item.productId,
      orderId,
      rating,
      review: review || undefined,
      reviewerName: "NUP Member",
      reviewerEmail: orderEmail,
    }),
    onSuccess: () => {
      toast({ title: "Rating submitted!", description: "Thank you for your feedback." });
      setOpen(false);
      onRated();
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message || "Failed to submit rating", variant: "destructive" });
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="text-xs" data-testid={`button-rate-${item.productId}`}>
          <Star className="w-3 h-3 mr-1" /> Rate Product
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rate {item.productName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <Label className="mb-2 block">Your Rating</Label>
            <StarRating value={rating} onChange={setRating} />
          </div>
          <div>
            <Label htmlFor="review" className="mb-2 block">Review (optional)</Label>
            <Textarea
              id="review"
              placeholder="Share your experience with this product..."
              value={review}
              onChange={e => setReview(e.target.value)}
              rows={3}
              data-testid="input-review"
            />
          </div>
          <Button
            className="w-full"
            disabled={rating === 0 || ratingMutation.isPending}
            onClick={() => ratingMutation.mutate()}
            data-testid="button-submit-rating"
          >
            {ratingMutation.isPending ? "Submitting..." : "Submit Rating"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface ReturnRequestData {
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

const RETURN_REASONS = [
  "Wrong size",
  "Defective/damaged item",
  "Not as described",
  "Changed my mind",
  "Received wrong item",
  "Other",
];

function ReturnRequestSection({ order }: { order: Order }) {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const items: OrderItem[] = (() => { try { return JSON.parse(order.items); } catch { return []; } })();

  const { data: returnRequests = [], isLoading } = useQuery<ReturnRequestData[]>({
    queryKey: ["/api/returns", order.id],
    queryFn: async () => {
      const res = await fetch(`/api/returns/${order.id}?email=${encodeURIComponent(order.email)}`);
      if (!res.ok) return [];
      return res.json();
    },
  });

  const submitReturnMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/returns", {
      orderId: order.id,
      email: order.email,
      fullName: order.fullName,
      reason: `${reason}${details ? ": " + details : ""}`,
      items: selectedItems.length > 0 ? selectedItems.join(", ") : "All items",
      status: "pending",
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/returns", order.id] });
      toast({ title: "Return request submitted", description: "We'll review your request and get back to you." });
      setShowForm(false);
      setReason("");
      setDetails("");
      setSelectedItems([]);
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message || "Failed to submit return request", variant: "destructive" });
    },
  });

  const canRequestReturn = (order.status === "delivered" || order.status === "shipped") && !returnRequests.some(r => r.status === "pending");

  return (
    <div className="space-y-3">
      <Separator />
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-sm flex items-center gap-2">
          <RotateCcw className="w-4 h-4" /> Returns
        </h4>
        {canRequestReturn && !showForm && (
          <Button size="sm" variant="outline" onClick={() => setShowForm(true)} data-testid="button-request-return">
            Request Return
          </Button>
        )}
      </div>

      {returnRequests.map(ret => (
        <div key={ret.id} className="bg-muted/50 rounded-lg p-3 text-sm space-y-1" data-testid={`return-request-${ret.id}`}>
          <div className="flex items-center justify-between">
            <Badge className={ret.status === "approved" ? "bg-green-100 text-green-800" : ret.status === "denied" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"}>
              {ret.status}
            </Badge>
            <span className="text-xs text-muted-foreground">{new Date(ret.createdAt).toLocaleDateString()}</span>
          </div>
          <p><span className="font-medium">Reason:</span> {ret.reason}</p>
          <p><span className="font-medium">Items:</span> {ret.items}</p>
          {ret.adminNotes && <p><span className="font-medium">Response:</span> {ret.adminNotes}</p>}
        </div>
      ))}

      {showForm && (
        <div className="border rounded-lg p-4 space-y-3" data-testid="return-request-form">
          <div>
            <Label className="mb-1 block">Reason for return</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger data-testid="select-return-reason">
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {RETURN_REASONS.map(r => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-1 block">Additional details (optional)</Label>
            <Textarea value={details} onChange={e => setDetails(e.target.value)} placeholder="Tell us more..." rows={2} data-testid="input-return-details" />
          </div>
          <div>
            <Label className="mb-1 block">Which items? (select applicable)</Label>
            <div className="space-y-1">
              {items.map((item, i) => (
                <label key={i} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.productName)}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedItems(prev => [...prev, item.productName]);
                      else setSelectedItems(prev => prev.filter(n => n !== item.productName));
                    }}
                    data-testid={`checkbox-return-item-${i}`}
                  />
                  {item.productName}
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              disabled={!reason || submitReturnMutation.isPending}
              onClick={() => submitReturnMutation.mutate()}
              data-testid="button-submit-return"
            >
              {submitReturnMutation.isPending ? "Submitting..." : "Submit Return Request"}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowForm(false)} data-testid="button-cancel-return">
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function OrderCard({ order, onRefresh }: { order: Order; onRefresh: () => void }) {
  const items: OrderItem[] = (() => {
    try { return JSON.parse(order.items); } catch { return []; }
  })();

  const statusIndex = STATUS_STEPS.findIndex(s => s.key === order.status);
  const isDelivered = order.status === "delivered";

  const { data: ratings } = useQuery<ProductRating[]>({
    queryKey: ["/api/ratings/order", order.id],
    queryFn: async () => {
      const results: ProductRating[] = [];
      for (const item of items) {
        try {
          const res = await fetch(`/api/products/${item.productId}/ratings`);
          if (res.ok) {
            const arr: ProductRating[] = await res.json();
            results.push(...arr.filter(r => r.orderId === order.id));
          }
        } catch {}
      }
      return results;
    },
    enabled: isDelivered,
  });

  const ratedProductIds = new Set(ratings?.map(r => r.productId) ?? []);

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-bold">Order #{order.id.slice(0, 8).toUpperCase()}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Placed {order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : ""}
            </p>
          </div>
          <Badge className={STATUS_COLORS[order.status] || STATUS_COLORS.pending}>
            {order.status.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="overflow-x-auto pb-2">
          <div className="flex items-center min-w-max gap-0">
            {STATUS_STEPS.map((s, idx) => {
              const isActive = idx <= statusIndex;
              const isCurrent = idx === statusIndex;
              const Icon = s.icon;
              return (
                <div key={s.key} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${isCurrent ? "bg-primary border-primary text-white" : isActive ? "bg-primary/20 border-primary text-primary" : "border-muted text-muted-foreground"}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className={`text-xs mt-1 text-center w-16 ${isActive ? "text-foreground font-medium" : "text-muted-foreground"}`}>{s.label}</span>
                  </div>
                  {idx < STATUS_STEPS.length - 1 && (
                    <div className={`h-0.5 w-8 mx-1 mb-5 transition-colors ${idx < statusIndex ? "bg-primary" : "bg-muted"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {(order.trackingNumber || order.shippingCarrier || order.estimatedDelivery) && (
          <div className="bg-muted/50 rounded-lg p-4 text-sm space-y-2">
            {order.shippingCarrier && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Carrier</span>
                <span className="font-medium">{order.shippingCarrier}</span>
              </div>
            )}
            {order.trackingNumber && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tracking #</span>
                <span className="font-mono text-xs font-medium">{order.trackingNumber}</span>
              </div>
            )}
            {order.estimatedDelivery && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Est. Delivery</span>
                <span className="font-medium">{order.estimatedDelivery}</span>
              </div>
            )}
          </div>
        )}

        <div>
          <h4 className="font-semibold text-sm mb-3">Items Ordered</h4>
          <div className="space-y-3">
            {items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between gap-3 py-2 border-b last:border-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 bg-muted rounded-md flex items-center justify-center shrink-0">
                    <ShoppingBag className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{item.productName}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.size && `Size: ${item.size}`} {item.color && `· Color: ${item.color}`} · Qty: {item.quantity}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-semibold">${(Number(item.price) * item.quantity).toFixed(2)}</span>
                  {isDelivered && !ratedProductIds.has(item.productId) && (
                    <RateProductDialog item={item} orderId={order.id} orderEmail={order.email} onRated={onRefresh} />
                  )}
                  {isDelivered && ratedProductIds.has(item.productId) && (
                    <Badge variant="secondary" className="text-xs">Rated</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator />
        <div className="flex flex-col sm:flex-row gap-4 justify-between text-sm">
          <div>
            <p className="font-semibold mb-1">Ship To</p>
            <p className="text-muted-foreground">{order.fullName}</p>
            <p className="text-muted-foreground">{order.address}</p>
            <p className="text-muted-foreground">{order.city}{order.state ? `, ${order.state}` : ""} {order.postalCode}</p>
            <p className="text-muted-foreground">{order.country}</p>
          </div>
          <div className="text-right">
            <p className="font-semibold mb-1">Order Total</p>
            <p className="text-2xl font-bold text-primary">${Number(order.totalAmount).toFixed(2)}</p>
          </div>
        </div>

        <ReturnRequestSection order={order} />
      </CardContent>
    </Card>
  );
}

export default function OrderTracking() {
  const [, params] = useLocation();
  const urlParams = new URLSearchParams(window.location.search);
  const defaultOrderId = urlParams.get("orderId") || "";
  const defaultEmail = urlParams.get("email") || "";

  const [searchType, setSearchType] = useState<"orderId" | "email">(defaultOrderId ? "orderId" : "email");
  const [orderId, setOrderId] = useState(defaultOrderId);
  const [email, setEmail] = useState(defaultEmail);
  const [searched, setSearched] = useState(!!(defaultOrderId || defaultEmail));
  const [refreshKey, setRefreshKey] = useState(0);

  const { data: orders, isLoading, error, refetch } = useQuery<Order[]>({
    queryKey: ["/api/orders/track", searchType === "orderId" ? orderId : email, refreshKey],
    queryFn: async () => {
      const params = searchType === "orderId"
        ? `orderId=${encodeURIComponent(orderId)}`
        : `email=${encodeURIComponent(email)}`;
      const res = await fetch(`/api/orders/track?${params}`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Order not found");
      }
      return res.json();
    },
    enabled: searched && (searchType === "orderId" ? orderId.length > 0 : email.length > 0),
    retry: false,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearched(true);
    setRefreshKey(k => k + 1);
  };

  return (
    <div className="min-h-screen py-8 bg-muted/30">
      <SEO title="Order Tracking" noindex={true} />
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Package className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Track Your Order</h1>
          <p className="text-muted-foreground mt-2">Enter your order ID or email to see the status of your order</p>
        </div>

        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex gap-2 mb-4">
              <Button
                variant={searchType === "orderId" ? "default" : "outline"}
                size="sm"
                onClick={() => setSearchType("orderId")}
                data-testid="button-search-by-id"
              >
                By Order ID
              </Button>
              <Button
                variant={searchType === "email" ? "default" : "outline"}
                size="sm"
                onClick={() => setSearchType("email")}
                data-testid="button-search-by-email"
              >
                By Email
              </Button>
            </div>
            <form onSubmit={handleSearch} className="flex gap-2">
              {searchType === "orderId" ? (
                <Input
                  placeholder="Enter your Order ID (e.g. a1b2c3d4...)"
                  value={orderId}
                  onChange={e => setOrderId(e.target.value)}
                  className="flex-1 font-mono"
                  data-testid="input-order-id"
                />
              ) : (
                <Input
                  placeholder="Enter your email address"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="flex-1"
                  data-testid="input-email-track"
                />
              )}
              <Button type="submit" disabled={isLoading} data-testid="button-track">
                <Search className="w-4 h-4 mr-2" /> {isLoading ? "Searching..." : "Track"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {searched && error && (
          <div className="flex items-center gap-3 p-4 bg-destructive/10 text-destructive rounded-lg mb-6">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>{(error as Error).message || "No orders found. Please check your details and try again."}</p>
          </div>
        )}

        {searched && !isLoading && orders && orders.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p>No orders found for this {searchType === "orderId" ? "order ID" : "email"}.</p>
          </div>
        )}

        {orders && orders.map(order => (
          <OrderCard key={order.id} order={order} onRefresh={() => { setRefreshKey(k => k + 1); refetch(); }} />
        ))}

        {!searched && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            {[
              { icon: Clock, title: "Real-time Updates", desc: "Get live status updates for every stage of your delivery" },
              { icon: Truck, title: "Shipment Tracking", desc: "See carrier info and tracking numbers once shipped" },
              { icon: Star, title: "Rate & Review", desc: "Rate your products once delivered to help others shop" },
            ].map(item => (
              <Card key={item.title} className="text-center">
                <CardContent className="pt-6">
                  <item.icon className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <h3 className="font-semibold text-sm mb-1">{item.title}</h3>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
