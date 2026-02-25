import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ProductCard } from "@/components/ProductCard";
import { useCart } from "@/hooks/use-cart";
import { ShoppingBag, ShoppingCart, Trash2, Plus, Minus, Search, Star, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Product, ProductRating } from "@shared/schema";

export default function Store() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const { cart, addToCart, updateQuantity, removeFromCart, cartTotal, cartCount } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [cartOpen, setCartOpen] = useState(false);

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

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <Badge variant="secondary" className="mb-2">Official Merchandise</Badge>
            <h1 className="text-4xl font-bold">NUP Store</h1>
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
                              {item.product.imageUrl ? (
                                <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover rounded-md" />
                              ) : (
                                <ShoppingBag className="w-5 h-5 text-muted-foreground" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm truncate">{item.product.name}</h4>
                              <div className="flex gap-1 mt-0.5 flex-wrap">
                                {item.selectedSize && <span className="text-xs text-muted-foreground">{item.selectedSize}</span>}
                                {item.selectedColor && <span className="text-xs text-muted-foreground">{item.selectedColor}</span>}
                              </div>
                              <p className="text-sm text-muted-foreground">${Number(item.product.price).toFixed(2)}</p>
                              <div className="flex items-center gap-2 mt-1.5">
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
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="w-6 h-6 ml-auto text-destructive"
                                  onClick={() => removeFromCart(item.product.id, item.selectedSize, item.selectedColor)}
                                  data-testid={`button-remove-${item.product.id}`}
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <Skeleton key={i} className="aspect-square rounded-lg" />
            ))}
          </div>
        ) : filteredProducts && filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
      </div>
    </div>
  );
}
