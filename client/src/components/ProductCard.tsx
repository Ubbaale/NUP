import type { Product } from "@shared/schema";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [, navigate] = useLocation();

  const handleCardClick = () => {
    navigate(`/store/${product.slug}`);
  };

  return (
    <Card className="overflow-hidden hover-elevate group cursor-pointer" data-testid={`product-card-${product.id}`} onClick={handleCardClick}>
      <div className="aspect-square overflow-hidden bg-muted relative">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-primary font-bold text-sm">NUP</span>
            </div>
          </div>
        )}
        {product.featured && (
          <Badge className="absolute top-1 right-1 text-[10px] px-1.5 py-0">Featured</Badge>
        )}
        {!product.inStock && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <Badge variant="secondary" className="text-xs">Out of Stock</Badge>
          </div>
        )}
      </div>
      <CardContent className="p-2">
        <Badge variant="outline" className="mb-1 text-[10px] px-1.5 py-0">{product.category}</Badge>
        <h3 className="font-semibold text-xs mb-1 line-clamp-1">{product.name}</h3>
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold">${Number(product.price).toFixed(2)}</span>
          <Button
            size="sm"
            className="h-7 px-2 text-xs"
            disabled={!product.inStock}
            onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
            data-testid={`add-to-cart-${product.id}`}
          >
            <ShoppingCart className="w-3 h-3 mr-1" />
            Add
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
