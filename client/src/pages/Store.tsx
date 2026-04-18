import { useQuery } from "@tanstack/react-query";
import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { ProductCard } from "@/components/ProductCard";
import { useCart } from "@/hooks/use-cart";
import { ShoppingBag, ShoppingCart, Trash2, Plus, Minus, Search, Package, Upload, Paintbrush, Image, X, Shield, Truck, RotateCcw } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@shared/schema";

const CUSTOM_PRODUCT_TYPES = [
  { value: "t-shirt", label: "T-Shirt", price: "29.99", sizes: ["S", "M", "L", "XL", "2XL", "3XL"] },
  { value: "hoodie", label: "Hoodie", price: "49.99", sizes: ["S", "M", "L", "XL", "2XL", "3XL"] },
  { value: "mug", label: "Mug", price: "14.99", sizes: [] },
  { value: "cap", label: "Cap / Hat", price: "19.99", sizes: ["One Size"] },
  { value: "tote-bag", label: "Tote Bag", price: "17.99", sizes: [] },
  { value: "poster", label: "Poster", price: "12.99", sizes: ["A3", "A2", "A1"] },
  { value: "sticker", label: "Sticker Pack", price: "7.99", sizes: [] },
  { value: "phone-case", label: "Phone Case", price: "19.99", sizes: ["iPhone", "Samsung", "Universal"] },
];

export default function Store() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const { cart, addToCart, addCustomDesignToCart, updateQuantity, removeFromCart, removeCustomDesign, cartTotal, cartCount } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [cartOpen, setCartOpen] = useState(false);

  const [customProductType, setCustomProductType] = useState("");
  const [customSize, setCustomSize] = useState("");
  const [customNotes, setCustomNotes] = useState("");
  const [designPreview, setDesignPreview] = useState<string | null>(null);
  const [designUrl, setDesignUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const categories = products
    ? Array.from(new Set(products.map(p => p.category)))
    : [];

  const filteredProducts = products?.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    toast({ title: "Added to cart", description: `${product.name} added to your cart` });
  };

  const handleCheckout = () => {
    setCartOpen(false);
    navigate("/checkout");
  };

  const handleDesignUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => setDesignPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("design", file);
      const res = await fetch("/api/upload/custom-design", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setDesignUrl(data.designUrl);
      toast({ title: "Design uploaded", description: "Your design has been uploaded successfully" });
    } catch {
      toast({ title: "Upload failed", description: "Could not upload your design. Please try again.", variant: "destructive" });
      setDesignPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleAddCustomToCart = () => {
    if (!designUrl || !customProductType) {
      toast({ title: "Missing information", description: "Please upload a design and select a product type", variant: "destructive" });
      return;
    }

    const productType = CUSTOM_PRODUCT_TYPES.find(t => t.value === customProductType);
    if (!productType) return;

    if (productType.sizes.length > 0 && !customSize) {
      toast({ title: "Select a size", description: "Please select a size for your custom product", variant: "destructive" });
      return;
    }

    const customProduct: Product = {
      id: `custom-${Date.now()}`,
      name: `Custom ${productType.label}`,
      slug: `custom-${productType.value}-${Date.now()}`,
      description: `Custom design printed on ${productType.label}`,
      price: productType.price,
      category: "Custom Design",
      imageUrl: designUrl,
      sizes: productType.sizes.length > 0 ? productType.sizes : null,
      colors: null,
      inStock: true,
      featured: false,
      printfulSyncVariantId: null,
      printfulProductId: null,
      baseCost: null,
    };

    addCustomDesignToCart(customProduct, designUrl, customNotes, customSize || undefined);
    toast({ title: "Custom design added!", description: `Your custom ${productType.label} has been added to cart` });

    setCustomProductType("");
    setCustomSize("");
    setCustomNotes("");
    setDesignPreview(null);
    setDesignUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const selectedProductType = CUSTOM_PRODUCT_TYPES.find(t => t.value === customProductType);

  return (
    <div className="min-h-screen py-8">
      <SEO
        title="Party Store"
        description="Shop official NUP merchandise - t-shirts, caps, hoodies, flags, posters, and more. Show your support for the National Unity Platform and People Power movement. Custom design printing available."
        keywords="NUP merchandise, People Power store, NUP t-shirt, Bobi Wine merchandise, Uganda democracy merch, NUP cap, NUP hoodie, NUP flag, People Power clothing, custom NUP design"
      />
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <Badge variant="secondary" className="mb-2">Official Merchandise</Badge>
            <h1 className="text-4xl font-bold" data-testid="text-store-title">NUP Store</h1>
            <p className="text-muted-foreground">Show your support with official NUP merchandise</p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate("/order-tracking")} data-testid="button-track-orders">
              <Package className="w-4 h-4 mr-2" /> Track Orders
            </Button>

            <Sheet open={cartOpen} onOpenChange={setCartOpen}>
              <SheetTrigger asChild>
                <Button className="relative" data-testid="button-open-cart">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Cart
                  {cartCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center text-xs">
                      {cartCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-md flex flex-col">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    Your Cart ({cartCount} items)
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-6 flex flex-col flex-1 overflow-hidden">
                  {cart.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center">
                        <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground">Your cart is empty</p>
                        <p className="text-sm text-muted-foreground mt-1">Add items from the store to get started</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                        {cart.map((item, idx) => (
                          <div key={idx} className="flex gap-3 p-3 bg-muted/50 rounded-md">
                            <div className="w-14 h-14 bg-muted rounded-md flex items-center justify-center shrink-0 overflow-hidden">
                              {item.customDesignUrl ? (
                                <img src={item.customDesignUrl} alt="Custom design" className="w-full h-full object-cover rounded-md" />
                              ) : item.product.imageUrl ? (
                                <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover rounded-md" />
                              ) : (
                                <ShoppingBag className="w-5 h-5 text-muted-foreground" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm truncate">
                                {item.product.name}
                                {item.isCustomDesign && <Badge variant="outline" className="ml-1 text-[10px]">Custom</Badge>}
                              </h4>
                              <div className="flex gap-1 mt-0.5 flex-wrap">
                                {item.selectedSize && <span className="text-xs text-muted-foreground">{item.selectedSize}</span>}
                                {item.selectedColor && <span className="text-xs text-muted-foreground">{item.selectedColor}</span>}
                              </div>
                              <p className="text-sm text-muted-foreground">${Number(item.product.price).toFixed(2)}</p>
                              <div className="flex items-center gap-2 mt-1.5">
                                {!item.isCustomDesign && (
                                  <>
                                    <Button
                                      size="icon"
                                      variant="outline"
                                      className="w-6 h-6"
                                      onClick={() => updateQuantity(item.product.id, -1, item.selectedSize, item.selectedColor)}
                                      data-testid={`button-decrease-${item.product.id}`}
                                    >
                                      <Minus className="w-3 h-3" />
                                    </Button>
                                    <span className="text-sm w-6 text-center font-medium">{item.quantity}</span>
                                    <Button
                                      size="icon"
                                      variant="outline"
                                      className="w-6 h-6"
                                      onClick={() => updateQuantity(item.product.id, 1, item.selectedSize, item.selectedColor)}
                                      data-testid={`button-increase-${item.product.id}`}
                                    >
                                      <Plus className="w-3 h-3" />
                                    </Button>
                                  </>
                                )}
                                {item.isCustomDesign && <span className="text-sm w-6 text-center font-medium">1</span>}
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="w-6 h-6 ml-auto text-destructive"
                                  onClick={() => item.isCustomDesign ? removeCustomDesign(idx) : removeFromCart(item.product.id, item.selectedSize, item.selectedColor)}
                                  data-testid={`button-remove-${idx}`}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="border-t pt-4 mt-4 space-y-3">
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Subtotal</span>
                          <span>${cartTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Shipping</span>
                          <span>Calculated at checkout</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg">
                          <span>Estimated Total</span>
                          <span>${cartTotal.toFixed(2)}</span>
                        </div>
                        <Button className="w-full" onClick={handleCheckout} data-testid="button-checkout">
                          Proceed to Checkout →
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <Card className="mb-10 border-primary/20 bg-gradient-to-r from-primary/5 to-transparent" data-testid="card-custom-design">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Paintbrush className="w-5 h-5 text-primary" />
              Custom Design - Print Your Own
            </CardTitle>
            <p className="text-sm text-muted-foreground">Upload your own image or design and we'll print it on the product of your choice</p>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="mb-2 block">Upload Your Design</Label>
                  <div
                    className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors relative"
                    onClick={() => fileInputRef.current?.click()}
                    data-testid="upload-design-area"
                  >
                    {designPreview ? (
                      <div className="relative">
                        <img src={designPreview} alt="Design preview" className="max-h-48 mx-auto rounded-md object-contain" />
                        <Button
                          size="icon"
                          variant="destructive"
                          className="absolute top-0 right-0 w-6 h-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDesignPreview(null);
                            setDesignUrl(null);
                            if (fileInputRef.current) fileInputRef.current.value = "";
                          }}
                          data-testid="button-remove-design"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                        {uploading && (
                          <div className="absolute inset-0 bg-black/40 rounded-md flex items-center justify-center">
                            <span className="text-white text-sm font-medium">Uploading...</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <>
                        <Upload className="w-10 h-10 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm font-medium">Click to upload your design</p>
                        <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WebP, GIF, PDF — Max 20MB</p>
                      </>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={handleDesignUpload}
                    data-testid="input-design-file"
                  />
                </div>

                <div>
                  <Label htmlFor="custom-notes" className="mb-2 block">Design Notes (optional)</Label>
                  <Textarea
                    id="custom-notes"
                    placeholder="Any special instructions for printing? (e.g., placement, color preferences, text to add)"
                    value={customNotes}
                    onChange={(e) => setCustomNotes(e.target.value)}
                    className="resize-none"
                    rows={3}
                    data-testid="input-custom-notes"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="mb-2 block">Product Type</Label>
                  <Select value={customProductType} onValueChange={(v) => { setCustomProductType(v); setCustomSize(""); }} data-testid="select-custom-product-type">
                    <SelectTrigger data-testid="select-trigger-product-type">
                      <SelectValue placeholder="Select a product" />
                    </SelectTrigger>
                    <SelectContent>
                      {CUSTOM_PRODUCT_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label} — ${type.price}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedProductType && selectedProductType.sizes.length > 0 && (
                  <div>
                    <Label className="mb-2 block">Size</Label>
                    <Select value={customSize} onValueChange={setCustomSize} data-testid="select-custom-size">
                      <SelectTrigger data-testid="select-trigger-size">
                        <SelectValue placeholder="Select a size" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedProductType.sizes.map(size => (
                          <SelectItem key={size} value={size}>{size}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {selectedProductType && (
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Image className="w-5 h-5 text-primary" />
                      <span className="font-medium">{selectedProductType.label}</span>
                    </div>
                    <p className="text-2xl font-bold text-primary">${selectedProductType.price}</p>
                    <p className="text-xs text-muted-foreground mt-1">Your design printed on high-quality {selectedProductType.label.toLowerCase()}</p>
                  </div>
                )}

                <Button
                  className="w-full"
                  size="lg"
                  disabled={!designUrl || !customProductType || uploading}
                  onClick={handleAddCustomToCart}
                  data-testid="button-add-custom-to-cart"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Add Custom Design to Cart
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator className="mb-8" />

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-products"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-48" data-testid="select-category">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <Skeleton key={i} className="aspect-square rounded-lg" />
            ))}
          </div>
        ) : filteredProducts && filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {filteredProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No Products Found</h3>
            <p className="text-muted-foreground">
              {searchQuery || categoryFilter !== "all"
                ? "Try adjusting your search or filter criteria"
                : "Products will be displayed here once available"}
            </p>
          </Card>
        )}

        <div className="mt-12 p-6 rounded-lg bg-muted/50 border text-center" data-testid="section-store-policies-link">
          <h3 className="font-semibold mb-2">Quality Guaranteed</h3>
          <p className="text-sm text-muted-foreground mb-4">
            We stand behind every product. Free returns within 30 days, worldwide shipping, and rigorous quality checks.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/store/policies#quality" className="flex items-center gap-1.5 text-sm text-primary hover:underline" data-testid="link-quality-policy">
              <Shield className="w-4 h-4" /> Quality Guarantee
            </Link>
            <Link href="/store/policies#shipping" className="flex items-center gap-1.5 text-sm text-primary hover:underline" data-testid="link-shipping-policy">
              <Truck className="w-4 h-4" /> Shipping Info
            </Link>
            <Link href="/store/policies#returns" className="flex items-center gap-1.5 text-sm text-primary hover:underline" data-testid="link-returns-policy">
              <RotateCcw className="w-4 h-4" /> Return Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
