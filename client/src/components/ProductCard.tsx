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
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-primary font-bold text-xl">NUP</span>
            </div>
          </div>
        )}
        {product.featured && (
          <Badge className="absolute top-2 right-2">Featured</Badge>
        )}
        {!product.inStock && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <Badge variant="secondary">Out of Stock</Badge>
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <Badge variant="outline" className="mb-2 text-xs">{product.category}</Badge>
        <h3 className="font-semibold mb-1 line-clamp-1">{product.name}</h3>
        {product.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{product.description}</p>
        )}
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold">${Number(product.price).toFixed(2)}</span>
          <Button
            size="sm"
            disabled={!product.inStock}
            onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
            data-testid={`add-to-cart-${product.id}`}
          >
            <ShoppingCart className="w-4 h-4 mr-1" />
            Add
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
