import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  CheckCircle, XCircle, AlertCircle, Package, Link2, RefreshCw,
  ShoppingBag, DollarSign, Truck, ExternalLink, Info, Loader2
} from "lucide-react";
import type { Product } from "@shared/schema";

interface PrintfulStatus {
  connected: boolean;
  configured: boolean;
  storeName?: string;
  storeId?: number;
  error?: string;
}

interface PrintfulVariant {
  id: number;
  name: string;
  retailPrice: string;
}

interface PrintfulProduct {
  id: number;
  name: string;
  thumbnail: string;
  variantCount: number;
  variants: PrintfulVariant[];
}

interface PrintfulProductsResult {
  success: boolean;
  products?: PrintfulProduct[];
  error?: string;
}

function LinkProductDialog({ product, printfulProducts, onLinked }: {
  product: Product;
  printfulProducts: PrintfulProduct[];
  onLinked: () => void;
}) {
  const { toast } = useToast();
  const [selectedVariant, setSelectedVariant] = useState("");
  const [selectedPfProduct, setSelectedPfProduct] = useState("");
  const [baseCost, setBaseCost] = useState("");
  const [open, setOpen] = useState(false);

  const variants = printfulProducts.find(p => String(p.id) === selectedPfProduct)?.variants || [];

  const linkMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/printful/link-product", {
      productId: product.id,
      printfulSyncVariantId: selectedVariant,
      printfulProductId: selectedPfProduct,
      baseCost: baseCost || undefined,
    }),
    onSuccess: () => {
      toast({ title: "Product linked!", description: `${product.name} is now linked to Printful for automatic fulfillment.` });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setOpen(false);
      onLinked();
    },
    onError: (err: any) => {
      toast({ title: "Link failed", description: err.message || "Could not link product", variant: "destructive" });
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" data-testid={`button-link-${product.id}`}>
          <Link2 className="w-3 h-3 mr-1" /> Link to Printful
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Link "{product.name}" to Printful</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <Label className="mb-2 block">Select Printful Product</Label>
            <Select value={selectedPfProduct} onValueChange={v => { setSelectedPfProduct(v); setSelectedVariant(""); }}>
              <SelectTrigger data-testid="select-printful-product">
                <SelectValue placeholder="Choose a product from your Printful store" />
              </SelectTrigger>
              <SelectContent>
                {printfulProducts.map(p => (
                  <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {selectedPfProduct && (
            <div>
              <Label className="mb-2 block">Select Variant</Label>
              <Select value={selectedVariant} onValueChange={setSelectedVariant}>
                <SelectTrigger data-testid="select-printful-variant">
                  <SelectValue placeholder="Choose a variant (size/color)" />
                </SelectTrigger>
                <SelectContent>
                  {variants.map(v => (
                    <SelectItem key={v.id} value={String(v.id)}>
                      {v.name} {v.retailPrice ? `— Printful price: $${v.retailPrice}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div>
            <Label htmlFor="base-cost" className="mb-2 block">Your Cost from Printful (USD)</Label>
            <Input
              id="base-cost"
              type="number"
              step="0.01"
              placeholder="e.g. 12.50"
              value={baseCost}
              onChange={e => setBaseCost(e.target.value)}
              data-testid="input-base-cost"
            />
            {baseCost && (
              <p className="text-xs text-muted-foreground mt-1">
                Your profit per unit: <span className="text-green-600 font-semibold">${(Number(product.price) - Number(baseCost)).toFixed(2)}</span>
              </p>
            )}
          </div>
          <Button
            className="w-full"
            disabled={!selectedVariant || linkMutation.isPending}
            onClick={() => linkMutation.mutate()}
            data-testid="button-confirm-link"
          >
            {linkMutation.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Linking...</> : "Confirm Link"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function PrintfulAdmin() {
  const { toast } = useToast();

  const { data: status, isLoading: statusLoading, refetch: refetchStatus } = useQuery<PrintfulStatus>({
    queryKey: ["/api/printful/status"],
  });

  const { data: pfProducts, isLoading: pfLoading } = useQuery<PrintfulProductsResult>({
    queryKey: ["/api/printful/products"],
    enabled: status?.connected === true,
  });

  const { data: storeProducts, isLoading: storeLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const linkedCount = storeProducts?.filter(p => p.printfulSyncVariantId).length || 0;
  const unlinkedCount = (storeProducts?.length || 0) - linkedCount;

  const profitData = storeProducts?.filter(p => p.printfulSyncVariantId && p.baseCost).map(p => ({
    name: p.name,
    price: Number(p.price),
    cost: Number(p.baseCost),
    profit: Number(p.price) - Number(p.baseCost),
    margin: (((Number(p.price) - Number(p.baseCost)) / Number(p.price)) * 100).toFixed(1),
  })) || [];

  return (
    <div className="min-h-screen py-8 bg-muted/30">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="mb-8">
          <Badge variant="secondary" className="mb-2">Fulfillment Management</Badge>
          <h1 className="text-3xl font-bold">Printful Integration</h1>
          <p className="text-muted-foreground">Manage print-on-demand fulfillment for your NUP merchandise store</p>
        </div>

        {/* Connection Status */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Truck className="w-5 h-5" /> Connection Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statusLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" /> Checking connection...
              </div>
            ) : status?.connected ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                  <span className="font-semibold text-green-700 dark:text-green-400">Connected to Printful</span>
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Live</Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  Store: <span className="font-medium text-foreground">{status.storeName}</span>
                  {status.storeId && <span className="ml-2">(ID: {status.storeId})</span>}
                </div>
                <p className="text-sm text-green-700 dark:text-green-400">
                  Orders with linked products will be automatically sent to Printful for printing and shipping.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <XCircle className="w-5 h-5 text-muted-foreground" />
                  <span className="font-semibold text-muted-foreground">
                    {status?.configured ? "Connection failed" : "Not configured"}
                  </span>
                </div>
                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 space-y-3">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                    <div className="text-sm text-amber-800 dark:text-amber-200">
                      <p className="font-semibold mb-1">To connect Printful:</p>
                      <ol className="space-y-1 list-decimal ml-4">
                        <li>Create a free account at <a href="https://www.printful.com" target="_blank" rel="noopener noreferrer" className="underline font-medium">printful.com</a></li>
                        <li>Upload your NUP logos and designs to their catalog</li>
                        <li>Go to <strong>Settings → API</strong> and generate a new API token</li>
                        <li>Add it as <strong>PRINTFUL_API_KEY</strong> in your Replit Secrets</li>
                      </ol>
                    </div>
                  </div>
                  {status?.error && (
                    <p className="text-xs text-red-600 dark:text-red-400">Error: {status.error}</p>
                  )}
                </div>
                <Button variant="outline" size="sm" onClick={() => refetchStatus()} data-testid="button-retry-connection">
                  <RefreshCw className="w-4 h-4 mr-2" /> Retry Connection
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Store Products", value: storeProducts?.length || 0, icon: ShoppingBag, color: "text-blue-600" },
            { label: "Linked to Printful", value: linkedCount, icon: Link2, color: "text-green-600" },
            { label: "Awaiting Link", value: unlinkedCount, icon: AlertCircle, color: "text-amber-600" },
            { label: "Avg. Profit Margin", value: profitData.length > 0 ? `${(profitData.reduce((s, p) => s + Number(p.margin), 0) / profitData.length).toFixed(0)}%` : "—", icon: DollarSign, color: "text-primary" },
          ].map(stat => (
            <Card key={stat.label}>
              <CardContent className="pt-4">
                <stat.icon className={`w-6 h-6 mb-2 ${stat.color}`} />
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Product Linking */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Link Store Products to Printful</CardTitle>
            <CardDescription>
              Connect each NUP store product to its Printful variant. Once linked, orders are automatically sent to Printful for printing and worldwide shipping.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {storeLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground py-4">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading products...
              </div>
            ) : (
              <div className="space-y-3">
                {storeProducts?.map(product => (
                  <div key={product.id} className="flex items-center justify-between gap-4 p-3 rounded-lg border bg-background">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 bg-muted rounded-md shrink-0 overflow-hidden">
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <ShoppingBag className="w-5 h-5 m-2.5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Sale price: ${Number(product.price).toFixed(2)}
                          {product.baseCost && (
                            <span className="ml-2 text-green-600">
                              · Profit: ${(Number(product.price) - Number(product.baseCost)).toFixed(2)}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {product.printfulSyncVariantId ? (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs">
                          <CheckCircle className="w-3 h-3 mr-1" /> Linked
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs text-muted-foreground">
                          Not linked
                        </Badge>
                      )}
                      {status?.connected && pfProducts?.success && pfProducts.products && (
                        <LinkProductDialog
                          product={product}
                          printfulProducts={pfProducts.products}
                          onLinked={() => {}}
                        />
                      )}
                    </div>
                  </div>
                ))}
                {!status?.connected && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Connect to Printful first to link products.
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Profit Overview */}
        {profitData.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" /> Profit Overview
              </CardTitle>
              <CardDescription>Your earnings per item sold after Printful's base cost</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {profitData.map(p => (
                  <div key={p.name} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{p.name}</span>
                      <span className="text-green-600 font-semibold">+${p.profit.toFixed(2)} ({p.margin}%)</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${Math.min(100, Number(p.margin))}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Cost: ${p.cost.toFixed(2)}</span>
                      <span>Sale: ${p.price.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Printful Store Products */}
        {status?.connected && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="w-5 h-5" /> Your Printful Catalog
              </CardTitle>
              <CardDescription>Products currently set up in your Printful store</CardDescription>
            </CardHeader>
            <CardContent>
              {pfLoading ? (
                <div className="flex items-center gap-2 text-muted-foreground py-4">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading Printful products...
                </div>
              ) : pfProducts?.success && pfProducts.products && pfProducts.products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {pfProducts.products.map(p => (
                    <div key={p.id} className="flex gap-3 p-3 border rounded-lg bg-background">
                      {p.thumbnail && (
                        <img src={p.thumbnail} alt={p.name} className="w-14 h-14 object-cover rounded-md shrink-0" />
                      )}
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.variantCount} variant{p.variantCount !== 1 ? "s" : ""}</p>
                        <p className="text-xs text-muted-foreground">ID: {p.id}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="w-10 h-10 mx-auto mb-3 opacity-40" />
                  <p className="text-sm">No products found in your Printful store.</p>
                  <a
                    href="https://www.printful.com/dashboard/products"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-primary underline mt-2"
                  >
                    Add products in Printful <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
