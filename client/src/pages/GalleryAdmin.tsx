import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Image, Plus, Trash2, Edit, Star, Search, FileDown, Video, Play } from "lucide-react";
import type { GalleryPhoto } from "@shared/schema";

const CATEGORIES = [
  { value: "rallies", label: "Rallies" },
  { value: "demonstrations", label: "Demonstrations" },
  { value: "advocacy", label: "Advocacy" },
  { value: "conventions", label: "Conventions" },
  { value: "community", label: "Community" },
  { value: "leadership", label: "Leadership" },
  { value: "events", label: "Events" },
];

function isVideoItem(item: GalleryPhoto) {
  return item.mediaType === "video";
}

export default function GalleryAdmin() {
  const { toast } = useToast();
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editPhoto, setEditPhoto] = useState<GalleryPhoto | null>(null);

  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formCategory, setFormCategory] = useState("rallies");
  const [formAlbum, setFormAlbum] = useState("");
  const [formTags, setFormTags] = useState("");
  const [formSortOrder, setFormSortOrder] = useState("0");
  const [formFeatured, setFormFeatured] = useState(false);
  const [formFile, setFormFile] = useState<File | null>(null);
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formMediaType, setFormMediaType] = useState<"image" | "video">("image");

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
      formData.append("mediaType", formMediaType);
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
        const contentType = res.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          const err = await res.json();
          throw new Error(err.error || "Failed to upload");
        }
        if (res.status === 413) {
          throw new Error("Upload failed. Please try again.");
        }
        throw new Error(`Upload failed (${res.status}). Please try again or use a video URL instead.`);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gallery"] });
      toast({ title: "Media added", description: `${formMediaType === "video" ? "Video" : "Photo"} has been uploaded.` });
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
      toast({ title: "Item updated" });
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
      toast({ title: "Item deleted" });
    },
  });

  const resetForm = () => {
    setFormTitle("");
    setFormDescription("");
    setFormCategory("rallies");
    setFormAlbum("");
    setFormTags("");
    setFormSortOrder("0");
    setFormFeatured(false);
    setFormFile(null);
    setFormImageUrl("");
    setFormMediaType("image");
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

  const videoCount = photos.filter(p => isVideoItem(p)).length;
  const photoCount = photos.filter(p => !isVideoItem(p)).length;

  const handleFileChange = (file: File | null) => {
    setFormFile(file);
    setFormImageUrl("");
    if (file) {
      const ext = file.name.toLowerCase();
      if (ext.endsWith(".mp4") || ext.endsWith(".mov") || ext.endsWith(".webm") || ext.endsWith(".avi")) {
        setFormMediaType("video");
      } else {
        setFormMediaType("image");
      }
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto" data-testid="gallery-admin-page">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Video className="w-8 h-8 text-red-600" />
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-admin-title">Advocacy Rally Demonstrations</h1>
            <p className="text-muted-foreground">Upload and manage rally photos &amp; videos — auto-compressed with thumbnails</p>
          </div>
        </div>
        <Dialog open={showAddDialog} onOpenChange={(open) => { setShowAddDialog(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-media">
              <Plus className="w-4 h-4 mr-2" /> Add Media
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Photo or Video</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="flex gap-2">
                <Button
                  variant={formMediaType === "image" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFormMediaType("image")}
                  data-testid="button-type-image"
                >
                  <Image className="w-4 h-4 mr-1" /> Photo
                </Button>
                <Button
                  variant={formMediaType === "video" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFormMediaType("video")}
                  data-testid="button-type-video"
                >
                  <Video className="w-4 h-4 mr-1" /> Video
                </Button>
              </div>
              <div>
                <Label>Title *</Label>
                <Input value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder="Title" data-testid="input-media-title" />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={formDescription} onChange={e => setFormDescription(e.target.value)} placeholder="Description" rows={2} data-testid="input-media-description" />
              </div>
              <div>
                <Label>Category *</Label>
                <Select value={formCategory} onValueChange={setFormCategory}>
                  <SelectTrigger data-testid="select-media-category">
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
                <Input value={formAlbum} onChange={e => setFormAlbum(e.target.value)} placeholder="e.g. March for Freedom 2025" data-testid="input-media-album" />
              </div>
              <div>
                <Label>Tags (comma-separated)</Label>
                <Input value={formTags} onChange={e => setFormTags(e.target.value)} placeholder="rally, demonstration, advocacy" data-testid="input-media-tags" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Sort Order</Label>
                  <Input type="number" value={formSortOrder} onChange={e => setFormSortOrder(e.target.value)} data-testid="input-media-sort" />
                </div>
                <div className="flex items-end gap-2 pb-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formFeatured} onChange={e => setFormFeatured(e.target.checked)} data-testid="checkbox-featured" />
                    <span className="text-sm">Featured</span>
                  </label>
                </div>
              </div>
              <div>
                <Label>
                  {formMediaType === "video"
                    ? "Upload Video (MP4, MOV, WebM, AVI — any size)"
                    : "Upload Image (any size — auto-optimized)"}
                </Label>
                <Input
                  type="file"
                  accept={formMediaType === "video" ? "video/mp4,video/quicktime,video/webm,video/x-msvideo,.mp4,.mov,.webm,.avi" : "image/*"}
                  onChange={e => handleFileChange(e.target.files?.[0] || null)}
                  data-testid="input-media-file"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {formMediaType === "video"
                    ? "Videos are automatically optimized to 720p H.264 with thumbnail generation. Upload any size — the system compresses in the background."
                    : "Photos are automatically compressed to WebP format"}
                </p>
              </div>
              <div>
                <Label>Or paste {formMediaType === "video" ? "Video" : "Image"} URL {formMediaType === "video" && "(YouTube, Vimeo, or direct link)"}</Label>
                <Input
                  value={formImageUrl}
                  onChange={e => { setFormImageUrl(e.target.value); setFormFile(null); }}
                  placeholder={formMediaType === "video" ? "https://youtube.com/watch?v=..." : "https://..."}
                  data-testid="input-media-url"
                />
              </div>
              <Button
                className="w-full"
                disabled={!formTitle || (!formFile && !formImageUrl) || createMutation.isPending}
                onClick={() => createMutation.mutate()}
                data-testid="button-submit-media"
              >
                {createMutation.isPending ? "Uploading..." : `Upload ${formMediaType === "video" ? "Video" : "Photo"}`}
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
        {filteredPhotos.length} item{filteredPhotos.length !== 1 ? "s" : ""} ({photoCount} photo{photoCount !== 1 ? "s" : ""}, {videoCount} video{videoCount !== 1 ? "s" : ""})
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading gallery...</div>
      ) : filteredPhotos.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Image className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p>No media yet. Click "Add Media" to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredPhotos.map(photo => (
            <Card key={photo.id} className="overflow-hidden group" data-testid={`card-gallery-${photo.id}`}>
              <div className="aspect-square relative overflow-hidden bg-muted">
                {isVideoItem(photo) ? (
                  <>
                    {photo.thumbnailUrl ? (
                      <img src={photo.thumbnailUrl} alt={photo.title} className="w-full h-full object-cover" loading="lazy" />
                    ) : photo.imageUrl.includes("youtube.com") || photo.imageUrl.includes("youtu.be") ? (
                      <img
                        src={`https://img.youtube.com/vi/${photo.imageUrl.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/)?.[1]}/hqdefault.jpg`}
                        alt={photo.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <video src={photo.imageUrl} className="w-full h-full object-cover" muted preload="metadata" />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center">
                        <Play className="w-5 h-5 text-white fill-white" />
                      </div>
                    </div>
                  </>
                ) : (
                  <img
                    src={photo.thumbnailUrl || photo.imageUrl}
                    alt={photo.title}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    loading="lazy"
                  />
                )}
                {photo.featured && (
                  <div className="absolute top-2 left-2">
                    <Badge className="bg-yellow-500 text-white"><Star className="w-3 h-3 mr-1" /> Featured</Badge>
                  </div>
                )}
                {isVideoItem(photo) && (
                  <div className="absolute top-2 left-2">
                    <Badge className="bg-red-600 text-white text-xs"><Video className="w-3 h-3 mr-1" /> Video</Badge>
                  </div>
                )}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <Button size="icon" variant="secondary" className="w-8 h-8" onClick={() => openEdit(photo)} data-testid={`button-edit-${photo.id}`}>
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button
                    size="icon"
                    variant="destructive"
                    className="w-8 h-8"
                    onClick={() => { if (confirm("Delete this item?")) deleteMutation.mutate(photo.id); }}
                    data-testid={`button-delete-${photo.id}`}
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
                    <span>{formatBytes(photo.originalSize)}{!isVideoItem(photo) && photo.compressedSize !== photo.originalSize ? ` → ${formatBytes(photo.compressedSize)}` : ""}</span>
                    {!isVideoItem(photo) && photo.compressedSize !== photo.originalSize && (
                      <span className="text-green-600 font-medium">({Math.round((1 - photo.compressedSize / photo.originalSize) * 100)}% saved)</span>
                    )}
                  </div>
                )}
                {!isVideoItem(photo) && photo.width && photo.height && (
                  <p className="text-xs text-muted-foreground mt-0.5">{photo.width}x{photo.height}px</p>
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
              <DialogTitle>Edit {isVideoItem(editPhoto) ? "Video" : "Photo"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="aspect-video relative overflow-hidden rounded bg-muted">
                {isVideoItem(editPhoto) ? (
                  <video src={editPhoto.imageUrl} className="w-full h-full object-cover" muted preload="metadata" />
                ) : (
                  <img src={editPhoto.imageUrl} alt={editPhoto.title} className="w-full h-full object-cover" />
                )}
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
