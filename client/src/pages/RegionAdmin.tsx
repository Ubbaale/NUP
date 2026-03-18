import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ArrowLeft, Globe2, MapPin, Users, ChevronRight, Plus, Upload, X } from "lucide-react";
import type { Region } from "@shared/schema";

const createRegionSchema = z.object({
  name: z.string().min(1, "Name required"),
  slug: z.string().min(1, "Slug required"),
  description: z.string().optional(),
  leaderName: z.string().min(1, "Leader name required"),
  leaderTitle: z.string().optional(),
  leaderBio: z.string().optional(),
  leaderImage: z.string().optional(),
  contactEmail: z.string().email("Valid email required").or(z.literal("")),
  contactPhone: z.string().optional(),
});

type CreateRegionData = z.infer<typeof createRegionSchema>;

function autoSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function PhotoUpload({ currentUrl, onUploaded, size = "md" }: { currentUrl?: string; onUploaded: (url: string) => void; size?: "sm" | "md" }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | undefined>(currentUrl);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch("/api/upload/leader-image", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      const { imageUrl } = await res.json();
      setPreview(imageUrl);
      onUploaded(imageUrl);
    } catch {
      // ignore
    } finally {
      setUploading(false);
    }
  }

  const dim = size === "sm" ? "w-16 h-16" : "w-20 h-20";

  return (
    <div className="flex flex-col items-center gap-1">
      <label className={`${dim} rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center cursor-pointer overflow-hidden hover:border-primary transition-colors relative`}>
        {preview ? (
          <img src={preview} className="w-full h-full object-cover" alt="Leader" />
        ) : (
          <Upload className="w-5 h-5 text-muted-foreground" />
        )}
        {uploading && (
          <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleFile} data-testid="input-region-leader-photo" />
      </label>
      <span className="text-xs text-muted-foreground">Photo</span>
    </div>
  );
}

export default function RegionAdmin() {
  const { toast } = useToast();
  const [createOpen, setCreateOpen] = useState(false);

  const { data: regions, isLoading } = useQuery<Region[]>({
    queryKey: ["/api/regions"],
  });

  const form = useForm<CreateRegionData>({
    resolver: zodResolver(createRegionSchema),
    defaultValues: {
      name: "", slug: "", description: "", leaderName: "", leaderTitle: "",
      leaderBio: "", leaderImage: "", contactEmail: "", contactPhone: "",
    },
  });

  const createRegion = useMutation({
    mutationFn: async (data: CreateRegionData) => {
      const res = await apiRequest("POST", "/api/regions", data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Region created" });
      setCreateOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/regions"] });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  return (
    <div className="min-h-screen py-8 bg-muted/30">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/admin">
            <Button variant="ghost" size="sm" data-testid="button-back-admin">
              <ArrowLeft className="w-4 h-4 mr-2" /> Admin Dashboard
            </Button>
          </Link>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Globe2 className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold" data-testid="text-regions-admin-title">Manage Regions</h1>
              <p className="text-muted-foreground">Update region details, manage chapters and leadership</p>
            </div>
          </div>
          <Button onClick={() => setCreateOpen(true)} data-testid="button-create-region">
            <Plus className="w-4 h-4 mr-2" /> New Region
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {regions?.map((region) => (
              <Link key={region.id} href={`/admin/regions/${region.slug}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer group" data-testid={`card-region-${region.slug}`}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        {region.leaderImage ? (
                          <img src={region.leaderImage} alt={region.leaderName || ""} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold flex-shrink-0">
                            {region.leaderName ? region.leaderName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : <Globe2 className="w-5 h-5" />}
                          </div>
                        )}
                        <div className="min-w-0">
                          <h3 className="text-lg font-bold group-hover:text-primary transition-colors">{region.name}</h3>
                          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                            <Users className="w-3.5 h-3.5" />
                            <span>{region.leaderName}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                            <MapPin className="w-3.5 h-3.5" />
                            <span>{region.contactEmail}</span>
                          </div>
                          {region.leaderTitle && (
                            <Badge variant="outline" className="mt-2 text-xs">{region.leaderTitle}</Badge>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors mt-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Region</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => createRegion.mutate(data))} className="space-y-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Region Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. East Africa" data-testid="input-new-region-name"
                        onChange={(e) => { field.onChange(e); form.setValue("slug", autoSlug(e.target.value)); }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="slug" render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL Slug</FormLabel>
                    <FormControl><Input {...field} data-testid="input-new-region-slug" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl><Textarea {...field} data-testid="input-new-region-description" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="border-t pt-4 mt-4">
                  <h3 className="font-semibold mb-3">Regional Coordinator</h3>
                  <div className="flex gap-4">
                    <PhotoUpload
                      currentUrl={form.getValues("leaderImage") || undefined}
                      onUploaded={(url) => form.setValue("leaderImage", url)}
                    />
                    <div className="flex-1 space-y-3">
                      <FormField control={form.control} name="leaderName" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Coordinator Name</FormLabel>
                          <FormControl><Input {...field} data-testid="input-new-region-leader-name" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="leaderTitle" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl><Input {...field} placeholder="Regional Coordinator" data-testid="input-new-region-leader-title" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                  </div>
                  <FormField control={form.control} name="leaderBio" render={({ field }) => (
                    <FormItem className="mt-3">
                      <FormLabel>Bio</FormLabel>
                      <FormControl><Textarea {...field} data-testid="input-new-region-leader-bio" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <FormField control={form.control} name="contactEmail" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Email</FormLabel>
                      <FormControl><Input {...field} data-testid="input-new-region-email" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="contactPhone" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Phone</FormLabel>
                      <FormControl><Input {...field} data-testid="input-new-region-phone" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <Button type="submit" className="w-full" disabled={createRegion.isPending} data-testid="button-submit-new-region">
                  {createRegion.isPending ? "Creating..." : "Create Region"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
