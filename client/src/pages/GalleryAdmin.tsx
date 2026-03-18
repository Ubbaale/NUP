import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Image, Plus, Trash2, Edit, Star, Search, FileDown } from "lucide-react";
import type { GalleryPhoto } from "@shared/schema";

const CATEGORIES = [
  { value: "events", label: "Event Photos" },
  { value: "advocacy", label: "Advocacy Photos" },
  { value: "conventions", label: "Convention Photos" },
  { value: "community", label: "Community Photos" },
  { value: "leadership", label: "Leadership Photos" },
];

export default function GalleryAdmin() {
  const { toast } = useToast();
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editPhoto, setEditPhoto] = useState<GalleryPhoto | null>(null);

  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formCategory, setFormCategory] = useState("events");
  const [formAlbum, setFormAlbum] = useState("");
  const [formTags, setFormTags] = useState("");
  const [formSortOrder, setFormSortOrder] = useState("0");
  const [formFeatured, setFormFeatured] = useState(false);
  const [formFile, setFormFile] = useState<File | null>(null);
  const [formImageUrl, setFormImageUrl] = useState("");

  const { data: galleryData, isLoading } = useQuery<{ photos: GalleryPhoto[]; total: number }>({
    queryKey: ["/api/gallery", categoryFilter],
    queryFn: async () => {
      const url = categoryFilter !== "all" ? `/api/gallery?category=${categoryFilter}&limit=200` : "/api/gallery?limit=200";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });
  const photos = galleryData?.photos || [];

  const createMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append("title", formTitle);
      formData.append("description", formDescription);
      formData.append("category", formCategory);
      formData.append("album", formAlbum);
      formData.append("tags", formTags);
      formData.append("sortOrder", formSortOrder);
      formData.append("featured", String(formFeatured));
      if (formFile) {
        formData.append("image", formFile);
      } else if (formImageUrl) {
        formData.append("imageUrl", formImageUrl);
      }
      const res = await fetch("/api/gallery", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to upload");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gallery"] });
      toast({ title: "Photo added", description: "Gallery photo has been uploaded." });
      resetForm();
      setShowAddDialog(false);
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, any> }) => {
      const res = await fetch(`/api/gallery/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gallery"] });
      toast({ title: "Photo updated" });
      setEditPhoto(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/gallery/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gallery"] });
      toast({ title: "Photo deleted" });
    },
  });

  const resetForm = () => {
    setFormTitle("");
    setFormDescription("");
    setFormCategory("events");
    setFormAlbum("");
    setFormTags("");
    setFormSortOrder("0");
    setFormFeatured(false);
    setFormFile(null);
    setFormImageUrl("");
  };

  const openEdit = (photo: GalleryPhoto) => {
    setEditPhoto(photo);
    setFormTitle(photo.title);
    setFormDescription(photo.description || "");
    setFormCategory(photo.category);
    setFormAlbum(photo.album || "");
    setFormTags(photo.tags || "");
    setFormSortOrder(String(photo.sortOrder || 0));
    setFormFeatured(photo.featured || false);
  };

  const filteredPhotos = photos.filter(p =>
    searchQuery === "" ||
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.album || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.tags || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categoryLabel = (cat: string) => CATEGORIES.find(c => c.value === cat)?.label || cat;
  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="p-6 max-w-6xl mx-auto" data-testid="gallery-admin-page">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Image className="w-8 h-8 text-red-600" />
          <div>
            <h1 className="text-2xl font-bold">Gallery Management</h1>
            <p className="text-muted-foreground">Upload and manage event & advocacy photos</p>
          </div>
        </div>
        <Dialog open={showAddDialog} onOpenChange={(open) => { setShowAddDialog(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-photo">
              <Plus className="w-4 h-4 mr-2" /> Add Photo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Gallery Photo</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label>Title *</Label>
                <Input value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder="Photo title" data-testid="input-photo-title" />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={formDescription} onChange={e => setFormDescription(e.target.value)} placeholder="Photo description" rows={2} data-testid="input-photo-description" />
              </div>
              <div>
                <Label>Category *</Label>
                <Select value={formCategory} onValueChange={setFormCategory}>
                  <SelectTrigger data-testid="select-photo-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(c => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Album</Label>
                <Input value={formAlbum} onChange={e => setFormAlbum(e.target.value)} placeholder="e.g. Convention 2025, March for Freedom" data-testid="input-photo-album" />
              </div>
              <div>
                <Label>Tags (comma-separated)</Label>
                <Input value={formTags} onChange={e => setFormTags(e.target.value)} placeholder="bobi wine, rally, convention" data-testid="input-photo-tags" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Sort Order</Label>
                  <Input type="number" value={formSortOrder} onChange={e => setFormSortOrder(e.target.value)} data-testid="input-photo-sort" />
                </div>
                <div className="flex items-end gap-2 pb-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formFeatured} onChange={e => setFormFeatured(e.target.checked)} data-testid="checkbox-featured" />
                    <span className="text-sm">Featured Photo</span>
                  </label>
                </div>
              </div>
              <div>
                <Label>Upload Image (up to 50MB — auto-compressed)</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={e => { setFormFile(e.target.files?.[0] || null); setFormImageUrl(""); }}
                  data-testid="input-photo-file"
                />
                <p className="text-xs text-muted-foreground mt-1">Photos are automatically compressed to WebP format while maintaining quality</p>
              </div>
              <div>
                <Label>Or paste Image URL</Label>
                <Input
                  value={formImageUrl}
                  onChange={e => { setFormImageUrl(e.target.value); setFormFile(null); }}
                  placeholder="https://..."
                  data-testid="input-photo-url"
                />
              </div>
              <Button
                className="w-full"
                disabled={!formTitle || (!formFile && !formImageUrl) || createMutation.isPending}
                onClick={() => createMutation.mutate()}
                data-testid="button-submit-photo"
              >
                {createMutation.isPending ? "Uploading..." : "Upload Photo"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by title, album, or tags..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search-gallery"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48" data-testid="select-filter-category">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map(c => (
              <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="text-sm text-muted-foreground mb-4">
        {filteredPhotos.length} photo{filteredPhotos.length !== 1 ? "s" : ""}
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading gallery...</div>
      ) : filteredPhotos.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Image className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p>No photos yet. Click "Add Photo" to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredPhotos.map(photo => (
            <Card key={photo.id} className="overflow-hidden group" data-testid={`card-gallery-${photo.id}`}>
              <div className="aspect-square relative overflow-hidden bg-muted">
                <img
                  src={photo.thumbnailUrl || photo.imageUrl}
                  alt={photo.title}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  loading="lazy"
                />
                {photo.featured && (
                  <div className="absolute top-2 left-2">
                    <Badge className="bg-yellow-500 text-white"><Star className="w-3 h-3 mr-1" /> Featured</Badge>
                  </div>
                )}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <Button size="icon" variant="secondary" className="w-8 h-8" onClick={() => openEdit(photo)} data-testid={`button-edit-photo-${photo.id}`}>
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button
                    size="icon"
                    variant="destructive"
                    className="w-8 h-8"
                    onClick={() => { if (confirm("Delete this photo?")) deleteMutation.mutate(photo.id); }}
                    data-testid={`button-delete-photo-${photo.id}`}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              <CardContent className="p-3">
                <p className="font-medium text-sm truncate">{photo.title}</p>
                <div className="flex items-center justify-between mt-1">
                  <Badge variant="secondary" className="text-xs">{categoryLabel(photo.category)}</Badge>
                  {photo.album && <span className="text-xs text-muted-foreground truncate ml-2">{photo.album}</span>}
                </div>
                {photo.originalSize && photo.compressedSize && (
                  <div className="flex items-center gap-1 mt-1.5 text-xs text-muted-foreground">
                    <FileDown className="w-3 h-3" />
                    <span>{formatBytes(photo.originalSize)} → {formatBytes(photo.compressedSize)}</span>
                    <span className="text-green-600 font-medium">({Math.round((1 - photo.compressedSize / photo.originalSize) * 100)}% saved)</span>
                  </div>
                )}
                {photo.width && photo.height && (
                  <p className="text-xs text-muted-foreground mt-0.5">{photo.width}×{photo.height}px</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {editPhoto && (
        <Dialog open={!!editPhoto} onOpenChange={open => { if (!open) setEditPhoto(null); }}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Photo</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="aspect-video relative overflow-hidden rounded bg-muted">
                <img src={editPhoto.imageUrl} alt={editPhoto.title} className="w-full h-full object-cover" />
              </div>
              <div>
                <Label>Title</Label>
                <Input value={formTitle} onChange={e => setFormTitle(e.target.value)} data-testid="input-edit-title" />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={formDescription} onChange={e => setFormDescription(e.target.value)} rows={2} data-testid="input-edit-description" />
              </div>
              <div>
                <Label>Category</Label>
                <Select value={formCategory} onValueChange={setFormCategory}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(c => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Album</Label>
                <Input value={formAlbum} onChange={e => setFormAlbum(e.target.value)} data-testid="input-edit-album" />
              </div>
              <div>
                <Label>Tags</Label>
                <Input value={formTags} onChange={e => setFormTags(e.target.value)} data-testid="input-edit-tags" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Sort Order</Label>
                  <Input type="number" value={formSortOrder} onChange={e => setFormSortOrder(e.target.value)} />
                </div>
                <div className="flex items-end gap-2 pb-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formFeatured} onChange={e => setFormFeatured(e.target.checked)} />
                    <span className="text-sm">Featured</span>
                  </label>
                </div>
              </div>
              <Button
                className="w-full"
                disabled={updateMutation.isPending}
                onClick={() => updateMutation.mutate({
                  id: editPhoto.id,
                  data: {
                    title: formTitle,
                    description: formDescription,
                    category: formCategory,
                    album: formAlbum,
                    tags: formTags,
                    sortOrder: formSortOrder,
                    featured: formFeatured,
                  },
                })}
                data-testid="button-save-edit"
              >
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
