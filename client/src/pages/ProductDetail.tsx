import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { ShoppingCart, ArrowLeft, Star, ShoppingBag, Package, Shield, Truck } from "lucide-react";
import type { Product, ProductRating } from "@shared/schema";

function StarDisplay({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            className={`w-4 h-4 ${rating >= star ? "fill-yellow-400 text-yellow-400" : rating >= star - 0.5 ? "fill-yellow-400/50 text-yellow-400" : "text-muted-foreground"}`}
          />
        ))}
      </div>
      <span className="text-sm text-muted-foreground">
        {rating.toFixed(1)} ({count} {count === 1 ? "review" : "reviews"})
      </span>
    </div>
  );
}

export default function ProductDetail() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [matched, params] = useRoute("/store/:slug");
  const { addToCart } = useCart();

  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");

  const slug = params?.slug || "";

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ["/api/products", slug],
    enabled: !!slug,
  });

  const { data: ratings } = useQuery<ProductRating[]>({
    queryKey: ["/api/products", slug, "ratings"],
    queryFn: async () => {
      const res = await fetch(`/api/products/${slug}/ratings`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!slug,
  });

  const sizes: string[] = (() => {
    try {
      return product?.sizes ? JSON.parse(product.sizes) : [];
    } catch {
      return [];
    }
  })();

  const colors: string[] = (() => {
    try {
      return product?.colors ? JSON.parse(product.colors) : [];
    } catch {
      return [];
    }
  })();

  const avgRating = ratings && ratings.length > 0
    ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
    : 0;

  const handleAddToCart = () => {
    if (!product) return;
    if (sizes.length > 0 && !selectedSize) {
      toast({ title: "Please select a size", variant: "destructive" });
      return;
    }
    if (colors.length > 0 && !selectedColor) {
      toast({ title: "Please select a color", variant: "destructive" });
      return;
    }
    addToCart(product, selectedSize || undefined, selectedColor || undefined);
    toast({ title: "Added to cart", description: `${product.name} added to your cart` });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4 max-w-5xl">
          <Skeleton className="h-8 w-32 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Skeleton className="aspect-square rounded-lg" />
            <div className="space-y-4">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4 max-w-5xl text-center py-16">
          <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
          <p className="text-muted-foreground mb-6">The product you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate("/store")} data-testid="button-back-to-store">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Store
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/store")}
          className="mb-6"
          data-testid="button-back-to-store"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Store
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="aspect-square overflow-hidden bg-muted rounded-lg relative">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover rounded-lg"
                data-testid="img-product"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary font-bold text-3xl">NUP</span>
                </div>
              </div>
            )}
            {product.featured && (
              <Badge className="absolute top-3 right-3">Featured</Badge>
            )}
            {!product.inStock && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-lg">
                <Badge variant="secondary">Out of Stock</Badge>
              </div>
            )}
          </div>

          <div className="space-y-5">
            <div>
              <Badge variant="outline" className="mb-3" data-testid="text-category">{product.category}</Badge>
              <h1 className="text-3xl font-bold mb-2" data-testid="text-product-name">{product.name}</h1>
              {ratings && ratings.length > 0 && (
                <StarDisplay rating={avgRating} count={ratings.length} />
              )}
            </div>

            <p className="text-3xl font-bold" data-testid="text-price">
              ${Number(product.price).toFixed(2)}
            </p>

            {product.description && (
              <p className="text-muted-foreground leading-relaxed" data-testid="text-description">
                {product.description}
              </p>
            )}

            <Separator />

            {sizes.length > 0 && (
              <div>
                <label className="text-sm font-medium mb-2 block">Size</label>
                <Select value={selectedSize} onValueChange={setSelectedSize}>
                  <SelectTrigger className="w-full" data-testid="select-size">
                    <SelectValue placeholder="Select a size" />
                  </SelectTrigger>
                  <SelectContent>
                    {sizes.map(size => (
                      <SelectItem key={size} value={size}>{size}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {colors.length > 0 && (
              <div>
                <label className="text-sm font-medium mb-2 block">Color</label>
                <Select value={selectedColor} onValueChange={setSelectedColor}>
                  <SelectTrigger className="w-full" data-testid="select-color">
                    <SelectValue placeholder="Select a color" />
                  </SelectTrigger>
                  <SelectContent>
                    {colors.map(color => (
                      <SelectItem key={color} value={color}>{color}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button
              className="w-full"
              size="lg"
              disabled={!product.inStock}
              onClick={handleAddToCart}
              data-testid="button-add-to-cart"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              {product.inStock ? "Add to Cart" : "Out of Stock"}
            </Button>

            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Truck, label: "Free Shipping", sub: "On orders $50+" },
                { icon: Shield, label: "Secure Payment", sub: "SSL encrypted" },
                { icon: Package, label: "Easy Returns", sub: "30-day policy" },
              ].map(item => (
                <div key={item.label} className="text-center p-3 bg-muted/50 rounded-lg">
                  <item.icon className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-xs font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {ratings && ratings.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
            <div className="space-y-4">
              {ratings.map(rating => (
                <Card key={rating.id} data-testid={`review-card-${rating.id}`}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${rating.rating >= star ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
                            />
                          ))}
                        </div>
                        <span className="font-medium text-sm">{rating.reviewerName}</span>
                      </div>
                      {rating.createdAt && (
                        <span className="text-xs text-muted-foreground">
                          {new Date(rating.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                        </span>
                      )}
                    </div>
                    {rating.review && (
                      <p className="text-sm text-muted-foreground">{rating.review}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}