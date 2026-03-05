import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, Upload, Package, Star, ArrowLeft, Image as ImageIcon } from "lucide-react";
import type { Product } from "@shared/schema";

function autoSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const CATEGORIES = ["Apparel", "Accessories", "Merchandise"];

interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  price: string;
  category: string;
  imageUrl: string;
  sizes: string;
  colors: string;
  inStock: boolean;
  featured: boolean;
}

const defaultFormData: ProductFormData = {
  name: "",
  slug: "",
  description: "",
  price: "50.00",
  category: "Apparel",
  imageUrl: "",
  sizes: "",
  colors: "",
  inStock: true,
  featured: false,
};

function ProductFormDialog({
  open,
  onOpenChange,
  editProduct,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editProduct?: Product | null;
}) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const isEdit = !!editProduct;

  const [form, setForm] = useState<ProductFormData>(() => {
    if (editProduct) {
      let sizesStr = "";
      try {
        const arr = editProduct.sizes ? JSON.parse(editProduct.sizes) : [];
        sizesStr = arr.join(", ");
      } catch {}
      let colorsStr = "";
      try {
        const arr = editProduct.colors ? JSON.parse(editProduct.colors) : [];
        colorsStr = arr.join(", ");
      } catch {}
      return {
        name: editProduct.name,
        slug: editProduct.slug,
        description: editProduct.description || "",
        price: editProduct.price,
        category: editProduct.category || "Apparel",
        imageUrl: editProduct.imageUrl || "",
        sizes: sizesStr,
        colors: colorsStr,
        inStock: editProduct.inStock ?? true,
        featured: editProduct.featured ?? false,
      };
    }
    return { ...defaultFormData };
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/products", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: "Product created" });
      onOpenChange(false);
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("PATCH", `/api/products/${editProduct!.id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: "Product updated" });
      onOpenChange(false);
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch("/api/upload/product-image", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setForm((f) => ({ ...f, imageUrl: data.imageUrl }));
      toast({ title: "Image uploaded" });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = () => {
    if (!form.name.trim() || !form.slug.trim() || !form.price.trim()) {
      toast({ title: "Name, slug, and price are required", variant: "destructive" });
      return;
    }
    const payload: any = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      description: form.description.trim() || null,
      price: form.price.trim(),
      category: form.category,
      imageUrl: form.imageUrl || null,
      inStock: form.inStock,
      featured: form.featured,
      sizes: form.sizes.trim()
        ? JSON.stringify(form.sizes.split(",").map((s) => s.trim()).filter(Boolean))
        : null,
      colors: form.colors.trim()
        ? JSON.stringify(form.colors.split(",").map((s) => s.trim()).filter(Boolean))
        : null,
    };

    if (isEdit) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle data-testid="text-dialog-title">
            {isEdit ? "Edit Product" : "Add New Product"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Product Image</Label>
            <div className="mt-2 flex items-center gap-4">
              {form.imageUrl ? (
                <img
                  src={form.imageUrl}
                  alt="Preview"
                  className="w-20 h-20 object-cover rounded-lg border"
                  data-testid="img-product-preview"
                />
              ) : (
                <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center border">
                  <ImageIcon className="w-8 h-8 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  data-testid="button-upload-image"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {uploading ? "Uploading..." : "Upload Image"}
                </Button>
                {form.imageUrl && (
                  <p className="text-xs text-muted-foreground mt-1 truncate max-w-[200px]">
                    {form.imageUrl}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div>
            <Label>Name</Label>
            <Input
              value={form.name}
              onChange={(e) => {
                const name = e.target.value;
                setForm((f) => ({
                  ...f,
                  name,
                  slug: isEdit ? f.slug : autoSlug(name),
                }));
              }}
              placeholder="Product name"
              data-testid="input-product-name"
            />
          </div>

          <div>
            <Label>Slug</Label>
            <Input
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              placeholder="product-slug"
              data-testid="input-product-slug"
            />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Product description"
              rows={3}
              data-testid="input-product-description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Price ($)</Label>
              <Input
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                placeholder="50.00"
                type="number"
                step="0.01"
                min="0"
                data-testid="input-product-price"
              />
            </div>
            <div>
              <Label>Category</Label>
              <Select
                value={form.category}
                onValueChange={(val) => setForm((f) => ({ ...f, category: val }))}
              >
                <SelectTrigger data-testid="select-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Sizes (comma-separated)</Label>
            <Input
              value={form.sizes}
              onChange={(e) => setForm((f) => ({ ...f, sizes: e.target.value }))}
              placeholder="S, M, L, XL, 2XL"
              data-testid="input-product-sizes"
            />
          </div>

          <div>
            <Label>Colors (comma-separated)</Label>
            <Input
              value={form.colors}
              onChange={(e) => setForm((f) => ({ ...f, colors: e.target.value }))}
              placeholder="Red, Black, White"
              data-testid="input-product-colors"
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch
                checked={form.inStock}
                onCheckedChange={(val) => setForm((f) => ({ ...f, inStock: val }))}
                data-testid="switch-in-stock"
              />
              <Label>In Stock</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={form.featured}
                onCheckedChange={(val) => setForm((f) => ({ ...f, featured: val }))}
                data-testid="switch-featured"
              />
              <Label>Featured</Label>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="button-cancel">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isPending} data-testid="button-save-product">
            {isPending ? "Saving..." : isEdit ? "Save Changes" : "Add Product"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function StoreAdmin() {
  const { toast } = useToast();
  const [createOpen, setCreateOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);
  const [search, setSearch] = useState("");

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: "Product deleted" });
      setDeleteProduct(null);
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const toggleStock = useMutation({
    mutationFn: async ({ id, inStock }: { id: string; inStock: boolean }) => {
      await apiRequest("PATCH", `/api/products/${id}`, { inStock });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    },
  });

  const toggleFeatured = useMutation({
    mutationFn: async ({ id, featured }: { id: string; featured: boolean }) => {
      await apiRequest("PATCH", `/api/products/${id}`, { featured });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    },
  });

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => window.history.back()} data-testid="button-back">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3" data-testid="text-page-title">
              <Package className="w-8 h-8 text-primary" />
              Store Management
            </h1>
            <p className="text-muted-foreground mt-1">
              {products.length} product{products.length !== 1 ? "s" : ""} in store
            </p>
          </div>
          <Button onClick={() => setCreateOpen(true)} data-testid="button-add-product">
            <Plus className="w-4 h-4 mr-2" /> Add Product
          </Button>
        </div>

        <div className="mb-6">
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
            data-testid="input-search"
          />
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading products...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {search ? "No products match your search." : "No products yet. Add your first product!"}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((product) => (
              <Card key={product.id} data-testid={`card-product-${product.id}`}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold truncate" data-testid={`text-product-name-${product.id}`}>
                          {product.name}
                        </h3>
                        <Badge variant="outline" className="text-xs">
                          {product.category}
                        </Badge>
                        {product.featured && (
                          <Badge className="text-xs">
                            <Star className="w-3 h-3 mr-1" /> Featured
                          </Badge>
                        )}
                        {!product.inStock && (
                          <Badge variant="secondary" className="text-xs">Out of Stock</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        ${Number(product.price).toFixed(2)} · {product.slug}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="hidden sm:flex items-center gap-3 mr-2">
                        <div className="flex items-center gap-1.5">
                          <Switch
                            checked={product.inStock ?? true}
                            onCheckedChange={(val) => toggleStock.mutate({ id: product.id, inStock: val })}
                            data-testid={`switch-stock-${product.id}`}
                          />
                          <span className="text-xs text-muted-foreground">Stock</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Switch
                            checked={product.featured ?? false}
                            onCheckedChange={(val) => toggleFeatured.mutate({ id: product.id, featured: val })}
                            data-testid={`switch-featured-${product.id}`}
                          />
                          <span className="text-xs text-muted-foreground">Featured</span>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setEditProduct(product)}
                        data-testid={`button-edit-${product.id}`}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setDeleteProduct(product)}
                        data-testid={`button-delete-${product.id}`}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {createOpen && (
          <ProductFormDialog
            open={createOpen}
            onOpenChange={(open) => {
              setCreateOpen(open);
            }}
          />
        )}

        {editProduct && (
          <ProductFormDialog
            key={editProduct.id}
            open={!!editProduct}
            onOpenChange={(open) => {
              if (!open) setEditProduct(null);
            }}
            editProduct={editProduct}
          />
        )}

        <AlertDialog open={!!deleteProduct} onOpenChange={(open) => !open && setDeleteProduct(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Product</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{deleteProduct?.name}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteProduct && deleteMutation.mutate(deleteProduct.id)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                data-testid="button-confirm-delete"
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
