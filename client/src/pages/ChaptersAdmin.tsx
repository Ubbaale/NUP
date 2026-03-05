import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Switch } from "@/components/ui/switch";
import {
  Plus,
  MapPin,
  Users,
  Globe2,
  Pencil,
  Trash2,
  UserPlus,
  ChevronDown,
  ChevronUp,
  Building,
  Search,
} from "lucide-react";
import { useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Chapter, Region, ChapterLeader } from "@shared/schema";

const chapterFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  slug: z.string().min(3, "Slug must be at least 3 characters").regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, and hyphens only"),
  regionId: z.string().min(1, "Region is required"),
  city: z.string().min(1, "City is required"),
  country: z.string().min(1, "Country is required"),
  description: z.string().optional(),
  iconEmoji: z.string().optional(),
  leaderName: z.string().optional(),
  leaderTitle: z.string().optional(),
  leaderBio: z.string().optional(),
  contactEmail: z.string().email("Invalid email").or(z.literal("")).optional(),
  contactPhone: z.string().optional(),
  meetingSchedule: z.string().optional(),
  address: z.string().optional(),
  isActive: z.boolean().default(true),
});

type ChapterFormData = z.infer<typeof chapterFormSchema>;

const leaderFormSchema = z.object({
  name: z.string().min(2, "Name is required"),
  title: z.string().min(2, "Title is required"),
  bio: z.string().optional(),
  email: z.string().email("Invalid email").or(z.literal("")).optional(),
  phone: z.string().optional(),
  displayOrder: z.number().int().min(0).default(0),
});

type LeaderFormData = z.infer<typeof leaderFormSchema>;

function autoSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export default function ChaptersAdmin() {
  const { toast } = useToast();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editChapter, setEditChapter] = useState<Chapter | null>(null);
  const [leaderDialogChapter, setLeaderDialogChapter] = useState<Chapter | null>(null);
  const [expandedChapter, setExpandedChapter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRegion, setFilterRegion] = useState<string>("all");

  const { data: allChapters, isLoading } = useQuery<Chapter[]>({
    queryKey: ["/api/chapters"],
  });

  const { data: regions } = useQuery<Region[]>({
    queryKey: ["/api/regions"],
  });

  const chapters = allChapters?.filter(ch => {
    const matchesSearch = !searchQuery || 
      ch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ch.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ch.country.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRegion = filterRegion === "all" || ch.regionId === filterRegion;
    return matchesSearch && matchesRegion;
  }) || [];

  const regionMap = regions?.reduce((acc, r) => ({ ...acc, [r.id]: r }), {} as Record<string, Region>) || {};

  const form = useForm<ChapterFormData>({
    resolver: zodResolver(chapterFormSchema),
    defaultValues: {
      name: "", slug: "", regionId: "", city: "", country: "",
      description: "", iconEmoji: "", leaderName: "", leaderTitle: "",
      leaderBio: "", contactEmail: "", contactPhone: "",
      meetingSchedule: "", address: "", isActive: true,
    },
  });

  const editForm = useForm<ChapterFormData>({
    resolver: zodResolver(chapterFormSchema),
    defaultValues: {
      name: "", slug: "", regionId: "", city: "", country: "",
      description: "", iconEmoji: "", leaderName: "", leaderTitle: "",
      leaderBio: "", contactEmail: "", contactPhone: "",
      meetingSchedule: "", address: "", isActive: true,
    },
  });

  const leaderForm = useForm<LeaderFormData>({
    resolver: zodResolver(leaderFormSchema),
    defaultValues: { name: "", title: "", bio: "", email: "", phone: "", displayOrder: 0 },
  });

  const createMutation = useMutation({
    mutationFn: async (data: ChapterFormData) => {
      const res = await apiRequest("POST", "/api/chapters", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chapters"] });
      setCreateDialogOpen(false);
      form.reset();
      toast({ title: "Chapter Created", description: "The chapter has been created successfully." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ChapterFormData> }) => {
      const res = await apiRequest("PATCH", `/api/chapters/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chapters"] });
      setEditChapter(null);
      toast({ title: "Chapter Updated", description: "Changes saved successfully." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/chapters/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chapters"] });
      toast({ title: "Chapter Deleted", description: "The chapter has been removed." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const addLeaderMutation = useMutation({
    mutationFn: async ({ chapterId, chapterSlug, data }: { chapterId: string; chapterSlug: string; data: LeaderFormData }) => {
      const res = await apiRequest("POST", `/api/chapters/${chapterId}/leaders`, data);
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/chapters", variables.chapterSlug, "leaders"] });
      leaderForm.reset();
      toast({ title: "Leader Added", description: "Leadership member added successfully." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteLeaderMutation = useMutation({
    mutationFn: async ({ id, chapterSlug }: { id: string; chapterSlug: string }) => {
      const res = await apiRequest("DELETE", `/api/chapter-leaders/${id}`);
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/chapters", variables.chapterSlug, "leaders"] });
      toast({ title: "Leader Removed" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  function openEditDialog(chapter: Chapter) {
    setEditChapter(chapter);
    editForm.reset({
      name: chapter.name,
      slug: chapter.slug,
      regionId: chapter.regionId,
      city: chapter.city,
      country: chapter.country,
      description: chapter.description || "",
      iconEmoji: chapter.iconEmoji || "",
      leaderName: chapter.leaderName || "",
      leaderTitle: chapter.leaderTitle || "",
      leaderBio: chapter.leaderBio || "",
      contactEmail: chapter.contactEmail || "",
      contactPhone: chapter.contactPhone || "",
      meetingSchedule: chapter.meetingSchedule || "",
      address: chapter.address || "",
      isActive: chapter.isActive,
    });
  }

  const activeCount = allChapters?.filter(c => c.isActive).length || 0;
  const regionCounts = allChapters?.reduce((acc, ch) => {
    const regionName = regionMap[ch.regionId]?.name || "Unknown";
    acc[regionName] = (acc[regionName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold" data-testid="text-admin-chapters-title">Chapters Administration</h1>
            <p className="text-muted-foreground mt-1">Create and manage chapters across all regions</p>
          </div>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-chapter">
                <Plus className="w-4 h-4 mr-2" />
                Create Chapter
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Chapter</DialogTitle>
              </DialogHeader>
              <ChapterFormComponent
                form={form}
                regions={regions || []}
                onSubmit={(data) => createMutation.mutate(data)}
                isPending={createMutation.isPending}
                submitLabel="Create Chapter"
              />
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <Building className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold" data-testid="text-total-chapters">{allChapters?.length || 0}</p>
              <p className="text-xs text-muted-foreground">Total Chapters</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="w-8 h-8 mx-auto mb-2 text-green-500" />
              <p className="text-2xl font-bold">{activeCount}</p>
              <p className="text-xs text-muted-foreground">Active</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Globe2 className="w-8 h-8 mx-auto mb-2 text-blue-500" />
              <p className="text-2xl font-bold">{regions?.length || 0}</p>
              <p className="text-xs text-muted-foreground">Regions</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <MapPin className="w-8 h-8 mx-auto mb-2 text-orange-500" />
              <p className="text-2xl font-bold">{Object.keys(regionCounts).length}</p>
              <p className="text-xs text-muted-foreground">Regions with Chapters</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search chapters by name, city, or country..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-chapters"
            />
          </div>
          <Select value={filterRegion} onValueChange={setFilterRegion}>
            <SelectTrigger className="w-full sm:w-[200px]" data-testid="select-filter-region">
              <SelectValue placeholder="All Regions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regions</SelectItem>
              {regions?.map((r) => (
                <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-lg" />)}
          </div>
        ) : chapters.length === 0 ? (
          <Card className="p-8 text-center">
            <Building className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground">
              {searchQuery || filterRegion !== "all" ? "No chapters match your filters." : "No chapters yet. Create one to get started."}
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {chapters.map((chapter) => (
              <ChapterRow
                key={chapter.id}
                chapter={chapter}
                region={regionMap[chapter.regionId]}
                isExpanded={expandedChapter === chapter.id}
                onToggleExpand={() => setExpandedChapter(expandedChapter === chapter.id ? null : chapter.id)}
                onEdit={() => openEditDialog(chapter)}
                onDelete={() => deleteMutation.mutate(chapter.id)}
                onAddLeader={() => {
                  setLeaderDialogChapter(chapter);
                  leaderForm.reset();
                }}
                onDeleteLeader={(id) => deleteLeaderMutation.mutate({ id, chapterSlug: chapter.slug })}
              />
            ))}
          </div>
        )}

        {editChapter && (
          <Dialog open={!!editChapter} onOpenChange={(open) => !open && setEditChapter(null)}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Chapter: {editChapter.name}</DialogTitle>
              </DialogHeader>
              <ChapterFormComponent
                form={editForm}
                regions={regions || []}
                onSubmit={(data) => updateMutation.mutate({ id: editChapter.id, data })}
                isPending={updateMutation.isPending}
                submitLabel="Save Changes"
              />
            </DialogContent>
          </Dialog>
        )}

        {leaderDialogChapter && (
          <Dialog open={!!leaderDialogChapter} onOpenChange={(open) => !open && setLeaderDialogChapter(null)}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add Leader to {leaderDialogChapter.name}</DialogTitle>
              </DialogHeader>
              <Form {...leaderForm}>
                <form onSubmit={leaderForm.handleSubmit((data) => addLeaderMutation.mutate({ chapterId: leaderDialogChapter.id, chapterSlug: leaderDialogChapter.slug, data }))} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={leaderForm.control} name="name" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl><Input placeholder="Jane Doe" data-testid="input-leader-name" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={leaderForm.control} name="title" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title / Role</FormLabel>
                        <FormControl><Input placeholder="Chapter Coordinator" data-testid="input-leader-title" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <FormField control={leaderForm.control} name="bio" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio (optional)</FormLabel>
                      <FormControl><Textarea rows={3} placeholder="Brief biography..." data-testid="input-leader-bio" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={leaderForm.control} name="email" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email (optional)</FormLabel>
                        <FormControl><Input placeholder="email@example.com" data-testid="input-leader-email" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={leaderForm.control} name="phone" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone (optional)</FormLabel>
                        <FormControl><Input placeholder="+1 555-0123" data-testid="input-leader-phone" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <FormField control={leaderForm.control} name="displayOrder" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Order</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          data-testid="input-leader-order"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <Button type="submit" className="w-full" disabled={addLeaderMutation.isPending} data-testid="button-submit-leader">
                    {addLeaderMutation.isPending ? "Adding..." : "Add Leader"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}

function ChapterFormComponent({
  form,
  regions,
  onSubmit,
  isPending,
  submitLabel,
}: {
  form: ReturnType<typeof useForm<ChapterFormData>>;
  regions: Region[];
  onSubmit: (data: ChapterFormData) => void;
  isPending: boolean;
  submitLabel: string;
}) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem>
            <FormLabel>Chapter Name</FormLabel>
            <FormControl>
              <Input
                placeholder="e.g., NUP Boston Chapter"
                data-testid="input-chapter-name"
                {...field}
                onChange={(e) => {
                  field.onChange(e);
                  const currentSlug = form.getValues("slug");
                  if (!currentSlug || currentSlug === autoSlug(field.value)) {
                    form.setValue("slug", autoSlug(e.target.value));
                  }
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="slug" render={({ field }) => (
          <FormItem>
            <FormLabel>URL Slug</FormLabel>
            <FormControl><Input placeholder="nup-boston-chapter" data-testid="input-chapter-slug" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="regionId" render={({ field }) => (
          <FormItem>
            <FormLabel>Region</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger data-testid="select-chapter-region">
                  <SelectValue placeholder="Select a region" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {regions.map((r) => (
                  <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />

        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="city" render={({ field }) => (
            <FormItem>
              <FormLabel>City</FormLabel>
              <FormControl><Input placeholder="Boston" data-testid="input-chapter-city" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="country" render={({ field }) => (
            <FormItem>
              <FormLabel>Country</FormLabel>
              <FormControl><Input placeholder="USA" data-testid="input-chapter-country" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <FormField control={form.control} name="iconEmoji" render={({ field }) => (
          <FormItem>
            <FormLabel>Icon Emoji (optional)</FormLabel>
            <FormControl><Input placeholder="🏛️" data-testid="input-chapter-emoji" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem>
            <FormLabel>Introduction / Description</FormLabel>
            <FormControl><Textarea rows={4} placeholder="Describe the chapter, its history, and activities..." data-testid="input-chapter-description" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <div className="border-t pt-4 mt-4">
          <h3 className="font-semibold mb-3">Primary Leader</h3>
          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="leaderName" render={({ field }) => (
              <FormItem>
                <FormLabel>Leader Name</FormLabel>
                <FormControl><Input placeholder="John Doe" data-testid="input-chapter-leader-name" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="leaderTitle" render={({ field }) => (
              <FormItem>
                <FormLabel>Leader Title</FormLabel>
                <FormControl><Input placeholder="Chapter Coordinator" data-testid="input-chapter-leader-title" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <FormField control={form.control} name="leaderBio" render={({ field }) => (
            <FormItem>
              <FormLabel>Leader Bio (optional)</FormLabel>
              <FormControl><Textarea rows={2} placeholder="Brief bio..." data-testid="input-chapter-leader-bio" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <div className="border-t pt-4 mt-4">
          <h3 className="font-semibold mb-3">Contact & Meetings</h3>
          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="contactEmail" render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Email</FormLabel>
                <FormControl><Input placeholder="chapter@nup.org" data-testid="input-chapter-email" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="contactPhone" render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Phone</FormLabel>
                <FormControl><Input placeholder="+1 555-0123" data-testid="input-chapter-phone" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <FormField control={form.control} name="meetingSchedule" render={({ field }) => (
            <FormItem>
              <FormLabel>Meeting Schedule</FormLabel>
              <FormControl><Input placeholder="First Sunday of each month at 2 PM" data-testid="input-chapter-schedule" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="address" render={({ field }) => (
            <FormItem>
              <FormLabel>Address (optional)</FormLabel>
              <FormControl><Input placeholder="Meeting location address" data-testid="input-chapter-address" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <FormField control={form.control} name="isActive" render={({ field }) => (
          <FormItem className="flex items-center gap-2 border-t pt-4">
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-chapter-active" />
            </FormControl>
            <FormLabel className="!mt-0">Active Chapter</FormLabel>
          </FormItem>
        )} />

        <Button type="submit" className="w-full" disabled={isPending} data-testid="button-submit-chapter">
          {isPending ? "Saving..." : submitLabel}
        </Button>
      </form>
    </Form>
  );
}

function ChapterRow({
  chapter,
  region,
  isExpanded,
  onToggleExpand,
  onEdit,
  onDelete,
  onAddLeader,
  onDeleteLeader,
}: {
  chapter: Chapter;
  region?: Region;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddLeader: () => void;
  onDeleteLeader: (id: string) => void;
}) {
  const { data: leaders } = useQuery<ChapterLeader[]>({
    queryKey: ["/api/chapters", chapter.slug, "leaders"],
    enabled: isExpanded,
  });

  return (
    <Card data-testid={`card-admin-chapter-${chapter.id}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer" onClick={onToggleExpand}>
            {chapter.iconEmoji && (
              <span className="text-2xl flex-shrink-0">{chapter.iconEmoji}</span>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold truncate" data-testid={`text-chapter-name-${chapter.id}`}>{chapter.name}</h3>
                {chapter.isActive ? (
                  <Badge variant="default" className="text-xs">Active</Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs">Inactive</Badge>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {chapter.city}, {chapter.country}
                </span>
                {region && (
                  <span className="flex items-center gap-1">
                    <Globe2 className="w-3 h-3" />
                    {region.name}
                  </span>
                )}
                {chapter.leaderName && (
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {chapter.leaderName}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            <Button variant="ghost" size="sm" onClick={onAddLeader} data-testid={`button-add-leader-${chapter.id}`}>
              <UserPlus className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onEdit} data-testid={`button-edit-chapter-${chapter.id}`}>
              <Pencil className="w-4 h-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" data-testid={`button-delete-chapter-${chapter.id}`}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Chapter</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{chapter.name}"? This will also remove all associated leaders and activities. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" data-testid="button-confirm-delete">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button variant="ghost" size="sm" onClick={onToggleExpand}>
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-4 pt-4 border-t space-y-4">
            {chapter.description && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Introduction</h4>
                <p className="text-sm whitespace-pre-line">{chapter.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              {chapter.contactEmail && (
                <div>
                  <span className="text-muted-foreground">Email:</span>{" "}
                  <span>{chapter.contactEmail}</span>
                </div>
              )}
              {chapter.contactPhone && (
                <div>
                  <span className="text-muted-foreground">Phone:</span>{" "}
                  <span>{chapter.contactPhone}</span>
                </div>
              )}
              {chapter.meetingSchedule && (
                <div>
                  <span className="text-muted-foreground">Meetings:</span>{" "}
                  <span>{chapter.meetingSchedule}</span>
                </div>
              )}
              {chapter.address && (
                <div>
                  <span className="text-muted-foreground">Address:</span>{" "}
                  <span>{chapter.address}</span>
                </div>
              )}
            </div>

            {chapter.leaderName && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Primary Leader</h4>
                <p className="text-sm font-medium">{chapter.leaderName} {chapter.leaderTitle && `— ${chapter.leaderTitle}`}</p>
                {chapter.leaderBio && <p className="text-sm text-muted-foreground mt-1">{chapter.leaderBio}</p>}
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-muted-foreground">Leadership Team</h4>
                <Button variant="outline" size="sm" onClick={onAddLeader}>
                  <UserPlus className="w-3 h-3 mr-1" />
                  Add Member
                </Button>
              </div>
              {leaders && leaders.length > 0 ? (
                <div className="space-y-2">
                  {leaders.map((leader) => (
                    <div key={leader.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg" data-testid={`leader-row-${leader.id}`}>
                      <div>
                        <p className="text-sm font-medium">{leader.name}</p>
                        <p className="text-xs text-muted-foreground">{leader.title}</p>
                        {leader.email && <p className="text-xs text-muted-foreground">{leader.email}</p>}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => onDeleteLeader(leader.id)}
                        data-testid={`button-delete-leader-${leader.id}`}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">No additional leadership members added yet.</p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
