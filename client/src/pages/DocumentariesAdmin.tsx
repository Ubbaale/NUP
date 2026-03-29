import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Film, Plus, Pencil, Trash2, Star, Eye, EyeOff, ExternalLink } from "lucide-react";
import type { Documentary, InsertDocumentary } from "@shared/schema";

const categories = [
  { value: "general", label: "General" },
  { value: "elections", label: "Elections & Democracy" },
  { value: "protests", label: "Protests & Resistance" },
  { value: "human_rights", label: "Human Rights" },
  { value: "political_prisoners", label: "Political Prisoners" },
  { value: "history", label: "History" },
  { value: "interviews", label: "Interviews & Testimonies" },
];

function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

export default function DocumentariesAdmin() {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Documentary | null>(null);
  const [formActive, setFormActive] = useState(true);
  const [formFeatured, setFormFeatured] = useState(false);

  const { data: docs, isLoading } = useQuery<Documentary[]>({
    queryKey: ["/api/admin/documentaries"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: Partial<InsertDocumentary>) => {
      await apiRequest("POST", "/api/admin/documentaries", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/documentaries"] });
      toast({ title: "Documentary added" });
      setShowForm(false);
    },
    onError: (err: any) => {
      toast({ title: "Failed to add", description: err.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertDocumentary> }) => {
      await apiRequest("PATCH", `/api/admin/documentaries/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/documentaries"] });
      toast({ title: "Documentary updated" });
      setEditing(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/documentaries/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/documentaries"] });
      toast({ title: "Documentary deleted" });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data: any = {
      title: fd.get("title") as string,
      description: fd.get("description") as string || null,
      videoUrl: fd.get("videoUrl") as string,
      thumbnailUrl: fd.get("thumbnailUrl") as string || null,
      category: fd.get("category") as string || "general",
      year: fd.get("year") as string || null,
      duration: fd.get("duration") as string || null,
      source: fd.get("source") as string || null,
      isActive: formActive,
      isFeatured: formFeatured,
      sortOrder: parseInt(fd.get("sortOrder") as string) || 0,
    };
    if (editing) {
      updateMutation.mutate({ id: editing.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const activeCount = docs?.filter(d => d.isActive).length || 0;
  const featuredCount = docs?.filter(d => d.isFeatured).length || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-documentaries-admin-title">Documentaries</h1>
          <p className="text-muted-foreground">Manage documentaries about the struggle for democracy and human rights.</p>
        </div>
        <Button onClick={() => { setEditing(null); setFormActive(true); setFormFeatured(false); setShowForm(true); }} data-testid="button-add-documentary">
          <Plus className="w-4 h-4 mr-2" /> Add Documentary
        </Button>
      </div>

      <div className="flex gap-4">
        <Card className="flex-1"><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{docs?.length || 0}</p><p className="text-xs text-muted-foreground">Total</p></CardContent></Card>
        <Card className="flex-1"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-green-600">{activeCount}</p><p className="text-xs text-muted-foreground">Active</p></CardContent></Card>
        <Card className="flex-1"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-yellow-600">{featuredCount}</p><p className="text-xs text-muted-foreground">Featured</p></CardContent></Card>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24" />)}</div>
      ) : docs && docs.length > 0 ? (
        <div className="space-y-3">
          {docs.map(doc => {
            const ytId = getYouTubeId(doc.videoUrl);
            const thumb = doc.thumbnailUrl || (ytId ? `https://img.youtube.com/vi/${ytId}/default.jpg` : null);
            return (
              <Card key={doc.id} className={!doc.isActive ? "opacity-60" : ""} data-testid={`card-admin-documentary-${doc.id}`}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {thumb && (
                      <img src={thumb} alt={doc.title} className="w-28 h-20 object-cover rounded flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="font-semibold">{doc.title}</h3>
                            <Badge variant={doc.isActive ? "default" : "secondary"}>{doc.isActive ? "Active" : "Hidden"}</Badge>
                            {doc.isFeatured && <Badge className="bg-yellow-500/90 text-black"><Star className="w-3 h-3 mr-0.5" /> Featured</Badge>}
                          </div>
                          {doc.description && <p className="text-sm text-muted-foreground line-clamp-1 mb-1">{doc.description}</p>}
                          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                            {doc.category && <Badge variant="outline" className="text-[10px]">{categories.find(c => c.value === doc.category)?.label || doc.category}</Badge>}
                            {doc.year && <span>{doc.year}</span>}
                            {doc.duration && <span>{doc.duration}</span>}
                            {doc.source && <span>Source: {doc.source}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Button variant="outline" size="sm" onClick={() => { setEditing(doc); setFormActive(doc.isActive); setFormFeatured(doc.isFeatured); setShowForm(true); }} data-testid={`button-edit-documentary-${doc.id}`}>
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateMutation.mutate({ id: doc.id, data: { isActive: !doc.isActive } })}
                            data-testid={`button-toggle-documentary-${doc.id}`}
                          >
                            {doc.isActive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm" data-testid={`button-delete-documentary-${doc.id}`}><Trash2 className="w-3.5 h-3.5" /></Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Documentary?</AlertDialogTitle>
                                <AlertDialogDescription>This will permanently remove "{doc.title}". This cannot be undone.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteMutation.mutate(doc.id)}>Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-8 text-center border-dashed">
          <Film className="w-12 h-12 mx-auto mb-3 text-muted-foreground/40" />
          <h3 className="font-semibold mb-2">No Documentaries</h3>
          <p className="text-sm text-muted-foreground mb-4">Add documentaries to share with the community.</p>
          <Button onClick={() => setShowForm(true)} variant="outline"><Plus className="w-4 h-4 mr-2" /> Add First Documentary</Button>
        </Card>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Documentary" : "Add Documentary"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4" data-testid="form-documentary">
            <div>
              <Label htmlFor="doc-title">Title *</Label>
              <Input id="doc-title" name="title" required defaultValue={editing?.title || ""} placeholder="Documentary title" data-testid="input-documentary-title" />
            </div>
            <div>
              <Label htmlFor="doc-description">Description</Label>
              <Textarea id="doc-description" name="description" rows={3} defaultValue={editing?.description || ""} placeholder="Brief description of the documentary..." data-testid="input-documentary-description" />
            </div>
            <div>
              <Label htmlFor="doc-videoUrl">Video URL * (YouTube, Vimeo, or direct link)</Label>
              <Input id="doc-videoUrl" name="videoUrl" required defaultValue={editing?.videoUrl || ""} placeholder="https://youtube.com/watch?v=..." data-testid="input-documentary-video-url" />
            </div>
            <div>
              <Label htmlFor="doc-thumbnailUrl">Custom Thumbnail URL (optional - auto-detected for YouTube)</Label>
              <Input id="doc-thumbnailUrl" name="thumbnailUrl" defaultValue={editing?.thumbnailUrl || ""} placeholder="https://..." data-testid="input-documentary-thumbnail" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="doc-category">Category</Label>
                <Select name="category" defaultValue={editing?.category || "general"}>
                  <SelectTrigger data-testid="select-documentary-category"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categories.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="doc-year">Year</Label>
                <Input id="doc-year" name="year" defaultValue={editing?.year || ""} placeholder="e.g. 2021" data-testid="input-documentary-year" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="doc-duration">Duration</Label>
                <Input id="doc-duration" name="duration" defaultValue={editing?.duration || ""} placeholder="e.g. 1h 23m" data-testid="input-documentary-duration" />
              </div>
              <div>
                <Label htmlFor="doc-source">Source</Label>
                <Input id="doc-source" name="source" defaultValue={editing?.source || ""} placeholder="e.g. BBC, Al Jazeera" data-testid="input-documentary-source" />
              </div>
            </div>
            <div>
              <Label htmlFor="doc-sortOrder">Sort Order</Label>
              <Input id="doc-sortOrder" name="sortOrder" type="number" defaultValue={editing?.sortOrder || 0} data-testid="input-documentary-sort" />
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <Switch checked={formActive} onCheckedChange={setFormActive} />
                <span className="text-sm">Active</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Switch checked={formFeatured} onCheckedChange={setFormFeatured} />
                <span className="text-sm">Featured</span>
              </label>
            </div>
            <Button type="submit" className="w-full" disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-submit-documentary">
              {editing ? "Update Documentary" : "Add Documentary"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
