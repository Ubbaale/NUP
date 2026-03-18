import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  ArrowLeft,
  Globe2,
  MapPin,
  Users,
  Pencil,
  Trash2,
  Plus,
  Save,
  Building,
  ChevronDown,
  ChevronUp,
  UserPlus,
  Mail,
  Phone,
  X,
  Upload,
} from "lucide-react";
import type { Region, Chapter, ChapterLeader } from "@shared/schema";

function PhotoUpload({ currentUrl, onUploaded, size = "md", testId }: { currentUrl?: string; onUploaded: (url: string) => void; size?: "sm" | "md"; testId?: string }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | undefined>(currentUrl);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch("/api/upload/leader-image", { method: "POST", body: formData, credentials: "include" });
      if (!res.ok) throw new Error("Upload failed");
      const { imageUrl } = await res.json();
      setPreview(imageUrl);
      onUploaded(imageUrl);
    } catch { /* ignore */ } finally { setUploading(false); }
  }

  const dim = size === "sm" ? "w-14 h-14" : "w-20 h-20";

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
        <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleFile} data-testid={testId || "input-leader-photo"} />
      </label>
      <span className="text-xs text-muted-foreground">Photo</span>
    </div>
  );
}

const regionFormSchema = z.object({
  name: z.string().min(1, "Name required"),
  description: z.string().optional(),
  leaderName: z.string().min(1, "Leader name required"),
  leaderTitle: z.string().optional(),
  leaderImage: z.string().optional(),
  leaderBio: z.string().optional(),
  contactEmail: z.string().email("Valid email required").or(z.literal("")),
  contactPhone: z.string().optional(),
  accessCode: z.string().optional(),
  websiteUrl: z.string().optional(),
  facebookUrl: z.string().optional(),
  twitterUrl: z.string().optional(),
  whatsappLink: z.string().optional(),
  instagramUrl: z.string().optional(),
  youtubeUrl: z.string().optional(),
  memberCount: z.number().int().min(0).optional().or(z.literal("").transform(() => undefined)),
  foundedDate: z.string().optional(),
});

type RegionFormData = z.infer<typeof regionFormSchema>;

const chapterFormSchema = z.object({
  name: z.string().min(2, "Chapter name required"),
  slug: z.string().min(2, "Slug required"),
  city: z.string().min(1, "City required"),
  country: z.string().min(1, "Country required"),
  iconEmoji: z.string().optional(),
  description: z.string().optional(),
  leaderName: z.string().optional(),
  leaderTitle: z.string().optional(),
  contactEmail: z.string().optional(),
  meetingSchedule: z.string().optional(),
  isActive: z.boolean().default(true),
});

type ChapterFormData = z.infer<typeof chapterFormSchema>;

const leaderFormSchema = z.object({
  name: z.string().min(1, "Name required"),
  title: z.string().min(1, "Title required"),
  image: z.string().optional(),
  bio: z.string().optional(),
  email: z.string().optional(),
  displayOrder: z.number().default(0),
});

type LeaderFormData = z.infer<typeof leaderFormSchema>;

function autoSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function ChapterSection({ chapter, onRefresh }: { chapter: Chapter; onRefresh: () => void }) {
  const { toast } = useToast();
  const [expanded, setExpanded] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [addLeaderOpen, setAddLeaderOpen] = useState(false);

  const { data: leaders } = useQuery<ChapterLeader[]>({
    queryKey: ["/api/chapters", chapter.slug, "leaders"],
    queryFn: async () => {
      const res = await fetch(`/api/chapters/${chapter.slug}/leaders`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: expanded,
  });

  const editForm = useForm<ChapterFormData>({
    resolver: zodResolver(chapterFormSchema),
    values: {
      name: chapter.name,
      slug: chapter.slug,
      city: chapter.city,
      country: chapter.country,
      iconEmoji: chapter.iconEmoji || "",
      description: chapter.description || "",
      leaderName: chapter.leaderName || "",
      leaderTitle: chapter.leaderTitle || "",
      contactEmail: chapter.contactEmail || "",
      meetingSchedule: chapter.meetingSchedule || "",
      isActive: chapter.isActive,
    },
  });

  const leaderForm = useForm<LeaderFormData>({
    resolver: zodResolver(leaderFormSchema),
    defaultValues: { name: "", title: "", image: "", bio: "", email: "", displayOrder: 0 },
  });

  const updateChapter = useMutation({
    mutationFn: async (data: ChapterFormData) => {
      const res = await apiRequest("PATCH", `/api/chapters/${chapter.id}`, data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Chapter updated" });
      setEditOpen(false);
      onRefresh();
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const deleteChapter = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/chapters/${chapter.id}`);
    },
    onSuccess: () => {
      toast({ title: "Chapter deleted" });
      onRefresh();
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const addLeader = useMutation({
    mutationFn: async (data: LeaderFormData) => {
      const res = await apiRequest("POST", `/api/chapters/${chapter.id}/leaders`, data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Leader added" });
      setAddLeaderOpen(false);
      leaderForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/chapters", chapter.slug, "leaders"] });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const deleteLeader = useMutation({
    mutationFn: async (leaderId: string) => {
      await apiRequest("DELETE", `/api/chapter-leaders/${leaderId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chapters", chapter.slug, "leaders"] });
      toast({ title: "Leader removed" });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  return (
    <Card className="overflow-hidden" data-testid={`chapter-card-${chapter.slug}`}>
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-2xl">{chapter.iconEmoji || "📍"}</span>
          <div className="min-w-0">
            <h4 className="font-semibold truncate">{chapter.name}</h4>
            <p className="text-sm text-muted-foreground">
              {chapter.city}, {chapter.country}
              {chapter.leaderName && ` · ${chapter.leaderName}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge variant={chapter.isActive ? "default" : "secondary"} className="text-xs">
            {chapter.isActive ? "Active" : "Inactive"}
          </Badge>
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t pt-4">
          <div className="flex gap-2 flex-wrap">
            <Button size="sm" variant="outline" onClick={() => setEditOpen(true)} data-testid={`button-edit-chapter-${chapter.slug}`}>
              <Pencil className="w-3 h-3 mr-1" /> Edit
            </Button>
            <Button size="sm" variant="outline" onClick={() => setAddLeaderOpen(true)} data-testid={`button-add-leader-${chapter.slug}`}>
              <UserPlus className="w-3 h-3 mr-1" /> Add Leader
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="destructive" data-testid={`button-delete-chapter-${chapter.slug}`}>
                  <Trash2 className="w-3 h-3 mr-1" /> Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete {chapter.name}?</AlertDialogTitle>
                  <AlertDialogDescription>This will also remove all leaders and activities.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => deleteChapter.mutate()}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          {chapter.description && (
            <p className="text-sm text-muted-foreground">{chapter.description}</p>
          )}

          {leaders && leaders.length > 0 && (
            <div>
              <h5 className="text-sm font-semibold mb-2">Leadership Team</h5>
              <div className="space-y-2">
                {leaders.map((leader) => (
                  <div key={leader.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {leader.image ? (
                        <img src={leader.image} alt={leader.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm flex-shrink-0">
                          {leader.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium">{leader.name}</p>
                        <p className="text-xs text-muted-foreground">{leader.title}</p>
                      </div>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="w-7 h-7 text-destructive"
                      onClick={() => deleteLeader.mutate(leader.id)}
                      data-testid={`button-remove-leader-${leader.id}`}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit {chapter.name}</DialogTitle>
              </DialogHeader>
              <Form {...editForm}>
                <form onSubmit={editForm.handleSubmit((data) => updateChapter.mutate(data))} className="space-y-4">
                  <FormField control={editForm.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chapter Name</FormLabel>
                      <FormControl><Input {...field} data-testid="input-chapter-name" onChange={(e) => { field.onChange(e); editForm.setValue("slug", autoSlug(e.target.value)); }} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={editForm.control} name="slug" render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL Slug</FormLabel>
                      <FormControl><Input {...field} data-testid="input-chapter-slug" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div className="grid grid-cols-2 gap-3">
                    <FormField control={editForm.control} name="city" render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl><Input {...field} data-testid="input-chapter-city" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={editForm.control} name="country" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <FormControl><Input {...field} data-testid="input-chapter-country" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <FormField control={editForm.control} name="iconEmoji" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Icon Emoji</FormLabel>
                      <FormControl><Input {...field} placeholder="🗽" data-testid="input-chapter-emoji" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={editForm.control} name="description" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl><Textarea {...field} data-testid="input-chapter-description" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div className="grid grid-cols-2 gap-3">
                    <FormField control={editForm.control} name="leaderName" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Leader Name</FormLabel>
                        <FormControl><Input {...field} data-testid="input-chapter-leader" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={editForm.control} name="leaderTitle" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Leader Title</FormLabel>
                        <FormControl><Input {...field} data-testid="input-chapter-leader-title" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <FormField control={editForm.control} name="contactEmail" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Email</FormLabel>
                      <FormControl><Input {...field} data-testid="input-chapter-email" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={editForm.control} name="meetingSchedule" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meeting Schedule</FormLabel>
                      <FormControl><Input {...field} placeholder="Every Sunday at 2 PM" data-testid="input-chapter-schedule" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={editForm.control} name="isActive" render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-chapter-active" /></FormControl>
                      <FormLabel className="!mt-0">Active</FormLabel>
                    </FormItem>
                  )} />
                  <Button type="submit" className="w-full" disabled={updateChapter.isPending} data-testid="button-save-chapter">
                    {updateChapter.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          <Dialog open={addLeaderOpen} onOpenChange={setAddLeaderOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Leader to {chapter.name}</DialogTitle>
              </DialogHeader>
              <Form {...leaderForm}>
                <form onSubmit={leaderForm.handleSubmit((data) => addLeader.mutate(data))} className="space-y-4">
                  <div className="flex gap-4">
                    <PhotoUpload
                      currentUrl={leaderForm.getValues("image") || undefined}
                      onUploaded={(url) => leaderForm.setValue("image", url)}
                      size="sm"
                      testId="input-new-leader-photo"
                    />
                    <div className="flex-1 space-y-3">
                      <FormField control={leaderForm.control} name="name" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl><Input {...field} data-testid="input-leader-name" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={leaderForm.control} name="title" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title / Role</FormLabel>
                          <FormControl><Input {...field} placeholder="Chapter President" data-testid="input-leader-title" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                  </div>
                  <FormField control={leaderForm.control} name="bio" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl><Textarea {...field} data-testid="input-leader-bio" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={leaderForm.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl><Input {...field} data-testid="input-leader-email" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <Button type="submit" className="w-full" disabled={addLeader.isPending} data-testid="button-save-leader">
                    {addLeader.isPending ? "Adding..." : "Add Leader"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </Card>
  );
}

export default function RegionDetailAdmin() {
  const { toast } = useToast();
  const [, params] = useRoute("/admin/regions/:slug");
  const slug = params?.slug || "";

  const [editRegion, setEditRegion] = useState(false);
  const [createChapterOpen, setCreateChapterOpen] = useState(false);

  const { data: region, isLoading: regionLoading } = useQuery<Region>({
    queryKey: ["/api/regions", slug],
    enabled: !!slug,
  });

  const { data: chapters, isLoading: chaptersLoading, refetch: refetchChapters } = useQuery<Chapter[]>({
    queryKey: ["/api/regions", slug, "chapters"],
    queryFn: async () => {
      const res = await fetch(`/api/regions/${slug}/chapters`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!slug,
  });

  const regionForm = useForm<RegionFormData>({
    resolver: zodResolver(regionFormSchema),
    values: region ? {
      name: region.name,
      description: region.description || "",
      leaderName: region.leaderName || "",
      leaderTitle: region.leaderTitle || "",
      leaderImage: region.leaderImage || "",
      leaderBio: region.leaderBio || "",
      contactEmail: region.contactEmail || "",
      contactPhone: region.contactPhone || "",
      accessCode: region.accessCode || "",
      websiteUrl: region.websiteUrl || "",
      facebookUrl: region.facebookUrl || "",
      twitterUrl: region.twitterUrl || "",
      whatsappLink: region.whatsappLink || "",
      instagramUrl: region.instagramUrl || "",
      youtubeUrl: region.youtubeUrl || "",
      memberCount: region.memberCount || undefined,
      foundedDate: region.foundedDate || "",
    } : undefined,
  });

  const chapterForm = useForm<ChapterFormData>({
    resolver: zodResolver(chapterFormSchema),
    defaultValues: {
      name: "",
      slug: "",
      city: "",
      country: "",
      iconEmoji: "",
      description: "",
      leaderName: "",
      leaderTitle: "",
      contactEmail: "",
      meetingSchedule: "",
      isActive: true,
    },
  });

  const updateRegion = useMutation({
    mutationFn: async (data: RegionFormData) => {
      if (!region) return;
      const res = await apiRequest("PATCH", `/api/regions/${region.id}`, data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Region updated" });
      setEditRegion(false);
      queryClient.invalidateQueries({ queryKey: ["/api/regions", slug] });
      queryClient.invalidateQueries({ queryKey: ["/api/regions"] });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const createChapter = useMutation({
    mutationFn: async (data: ChapterFormData) => {
      if (!region) return;
      const res = await apiRequest("POST", "/api/chapters", { ...data, regionId: region.id });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Chapter created" });
      setCreateChapterOpen(false);
      chapterForm.reset();
      refetchChapters();
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  if (regionLoading) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4 max-w-5xl space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 rounded-lg" />
          <Skeleton className="h-48 rounded-lg" />
        </div>
      </div>
    );
  }

  if (!region) {
    return (
      <div className="min-h-screen py-8 text-center">
        <p className="text-xl text-muted-foreground">Region not found</p>
        <Link href="/admin/regions">
          <Button className="mt-4">Back to Regions</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 bg-muted/30">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/admin/regions">
            <Button variant="ghost" size="sm" data-testid="button-back-regions">
              <ArrowLeft className="w-4 h-4 mr-2" /> All Regions
            </Button>
          </Link>
        </div>

        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe2 className="w-6 h-6 text-primary" />
              <CardTitle data-testid="text-region-name">{region.name}</CardTitle>
            </div>
            <Button
              variant={editRegion ? "secondary" : "outline"}
              size="sm"
              onClick={() => setEditRegion(!editRegion)}
              data-testid="button-edit-region"
            >
              {editRegion ? <><X className="w-3 h-3 mr-1" /> Cancel</> : <><Pencil className="w-3 h-3 mr-1" /> Edit Region</>}
            </Button>
          </CardHeader>
          <CardContent>
            {editRegion ? (
              <Form {...regionForm}>
                <form onSubmit={regionForm.handleSubmit((data) => updateRegion.mutate(data))} className="space-y-4">
                  <FormField control={regionForm.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Region Name</FormLabel>
                      <FormControl><Input {...field} data-testid="input-region-name" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={regionForm.control} name="description" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl><Textarea {...field} data-testid="input-region-description" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <Separator />
                  <h4 className="text-sm font-semibold">Regional Coordinator</h4>
                  <div className="flex gap-4">
                    <PhotoUpload
                      currentUrl={regionForm.getValues("leaderImage") || undefined}
                      onUploaded={(url) => regionForm.setValue("leaderImage", url)}
                      testId="input-region-coordinator-photo"
                    />
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <FormField control={regionForm.control} name="leaderName" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Coordinator Name</FormLabel>
                          <FormControl><Input {...field} data-testid="input-region-leader-name" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={regionForm.control} name="leaderTitle" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl><Input {...field} data-testid="input-region-leader-title" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                  </div>
                  <FormField control={regionForm.control} name="leaderBio" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl><Textarea {...field} data-testid="input-region-leader-bio" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FormField control={regionForm.control} name="contactEmail" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Email</FormLabel>
                        <FormControl><Input {...field} data-testid="input-region-email" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={regionForm.control} name="contactPhone" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Phone</FormLabel>
                        <FormControl><Input {...field} data-testid="input-region-phone" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <Separator />
                  <h4 className="text-sm font-semibold">Portal Access Code</h4>
                  <p className="text-xs text-muted-foreground">Set an access code so the regional coordinator can update their own info via the self-service portal.</p>
                  <FormField control={regionForm.control} name="accessCode" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Access Code</FormLabel>
                      <FormControl><Input {...field} placeholder="Set a unique access code" data-testid="input-region-access-code" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  {region.accessCode && (
                    <div className="p-3 bg-muted/50 rounded-lg text-sm">
                      <p className="font-medium mb-1">Portal Link:</p>
                      <code className="text-xs break-all text-primary">{window.location.origin}/portal/region/{region.slug}</code>
                    </div>
                  )}
                  <Separator />
                  <h4 className="text-sm font-semibold">Social Media & Links</h4>
                  <FormField control={regionForm.control} name="websiteUrl" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl><Input {...field} placeholder="https://" data-testid="input-region-website" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FormField control={regionForm.control} name="facebookUrl" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Facebook</FormLabel>
                        <FormControl><Input {...field} data-testid="input-region-facebook" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={regionForm.control} name="twitterUrl" render={({ field }) => (
                      <FormItem>
                        <FormLabel>X (Twitter)</FormLabel>
                        <FormControl><Input {...field} data-testid="input-region-twitter" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={regionForm.control} name="instagramUrl" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Instagram</FormLabel>
                        <FormControl><Input {...field} data-testid="input-region-instagram" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={regionForm.control} name="youtubeUrl" render={({ field }) => (
                      <FormItem>
                        <FormLabel>YouTube</FormLabel>
                        <FormControl><Input {...field} data-testid="input-region-youtube" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <FormField control={regionForm.control} name="whatsappLink" render={({ field }) => (
                    <FormItem>
                      <FormLabel>WhatsApp Group Link</FormLabel>
                      <FormControl><Input {...field} placeholder="https://chat.whatsapp.com/..." data-testid="input-region-whatsapp" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <Separator />
                  <h4 className="text-sm font-semibold">Additional Info</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FormField control={regionForm.control} name="memberCount" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Member Count</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            {...field}
                            value={field.value ?? ""}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : "")}
                            data-testid="input-region-member-count"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={regionForm.control} name="foundedDate" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Founded Date</FormLabel>
                        <FormControl><Input type="date" {...field} data-testid="input-region-founded" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <Button type="submit" className="w-full" disabled={updateRegion.isPending} data-testid="button-save-region">
                    <Save className="w-4 h-4 mr-2" /> {updateRegion.isPending ? "Saving..." : "Save Region"}
                  </Button>
                </form>
              </Form>
            ) : (
              <div className="space-y-4">
                {region.description && (
                  <p className="text-muted-foreground">{region.description}</p>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    {region.leaderImage ? (
                      <img src={region.leaderImage} alt={region.leaderName || ""} className="w-14 h-14 rounded-full object-cover flex-shrink-0" data-testid="img-region-leader" />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold flex-shrink-0">
                        {region.leaderName ? region.leaderName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : <Users className="w-5 h-5" />}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold">{region.leaderName}</p>
                      <p className="text-sm text-muted-foreground">{region.leaderTitle}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {region.contactEmail && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span>{region.contactEmail}</span>
                      </div>
                    )}
                    {region.contactPhone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span>{region.contactPhone}</span>
                      </div>
                    )}
                  </div>
                </div>
                {region.leaderBio && (
                  <p className="text-sm text-muted-foreground">{region.leaderBio}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold" data-testid="text-chapters-heading">
              Chapters ({chapters?.length || 0})
            </h2>
          </div>
          <Button onClick={() => setCreateChapterOpen(true)} data-testid="button-create-chapter">
            <Plus className="w-4 h-4 mr-2" /> New Chapter
          </Button>
        </div>

        {chaptersLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-lg" />
            ))}
          </div>
        ) : chapters && chapters.length > 0 ? (
          <div className="space-y-3">
            {chapters.map((chapter) => (
              <ChapterSection key={chapter.id} chapter={chapter} onRefresh={refetchChapters} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Building className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">No chapters in this region yet</p>
              <Button className="mt-4" onClick={() => setCreateChapterOpen(true)} data-testid="button-create-first-chapter">
                <Plus className="w-4 h-4 mr-2" /> Create First Chapter
              </Button>
            </CardContent>
          </Card>
        )}

        <Dialog open={createChapterOpen} onOpenChange={setCreateChapterOpen}>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Chapter in {region.name}</DialogTitle>
            </DialogHeader>
            <Form {...chapterForm}>
              <form onSubmit={chapterForm.handleSubmit((data) => createChapter.mutate(data))} className="space-y-4">
                <FormField control={chapterForm.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chapter Name</FormLabel>
                    <FormControl><Input {...field} placeholder="New York Chapter" data-testid="input-new-chapter-name" onChange={(e) => { field.onChange(e); chapterForm.setValue("slug", autoSlug(e.target.value)); }} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={chapterForm.control} name="slug" render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL Slug</FormLabel>
                    <FormControl><Input {...field} data-testid="input-new-chapter-slug" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="grid grid-cols-2 gap-3">
                  <FormField control={chapterForm.control} name="city" render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl><Input {...field} data-testid="input-new-chapter-city" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={chapterForm.control} name="country" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl><Input {...field} data-testid="input-new-chapter-country" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <FormField control={chapterForm.control} name="iconEmoji" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Landmark Icon (Emoji)</FormLabel>
                    <FormControl><Input {...field} placeholder="🗽" data-testid="input-new-chapter-emoji" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={chapterForm.control} name="description" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl><Textarea {...field} data-testid="input-new-chapter-description" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="grid grid-cols-2 gap-3">
                  <FormField control={chapterForm.control} name="leaderName" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Leader Name</FormLabel>
                      <FormControl><Input {...field} data-testid="input-new-chapter-leader" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={chapterForm.control} name="leaderTitle" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Leader Title</FormLabel>
                      <FormControl><Input {...field} data-testid="input-new-chapter-leader-title" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <FormField control={chapterForm.control} name="contactEmail" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Email</FormLabel>
                    <FormControl><Input {...field} data-testid="input-new-chapter-email" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={chapterForm.control} name="meetingSchedule" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meeting Schedule</FormLabel>
                    <FormControl><Input {...field} placeholder="Every Sunday at 2 PM" data-testid="input-new-chapter-schedule" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <Button type="submit" className="w-full" disabled={createChapter.isPending} data-testid="button-submit-new-chapter">
                  {createChapter.isPending ? "Creating..." : "Create Chapter"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
