import { useState } from "react";
import { useRoute, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  Lock,
  Building,
  Save,
  MapPin,
  Users,
  Mail,
  Phone,
  Globe,
  Calendar,
  Link as LinkIcon,
  CheckCircle,
  AlertCircle,
  Facebook,
  Instagram,
  Youtube,
  MessageCircle,
  UserPlus,
  X,
  Camera,
} from "lucide-react";
import { SiX } from "react-icons/si";
import type { Chapter, ChapterLeader } from "@shared/schema";

const accessFormSchema = z.object({
  accessCode: z.string().min(1, "Access code is required"),
});

const chapterUpdateSchema = z.object({
  name: z.string().min(2, "Chapter name required"),
  city: z.string().min(1, "City required"),
  country: z.string().min(1, "Country required"),
  description: z.string().optional(),
  iconEmoji: z.string().optional(),
  leaderName: z.string().optional(),
  leaderTitle: z.string().optional(),
  leaderBio: z.string().optional(),
  contactEmail: z.string().email("Valid email required").or(z.literal("")).optional(),
  contactPhone: z.string().optional(),
  meetingSchedule: z.string().optional(),
  address: z.string().optional(),
  websiteUrl: z.string().optional(),
  facebookUrl: z.string().optional(),
  twitterUrl: z.string().optional(),
  whatsappLink: z.string().optional(),
  instagramUrl: z.string().optional(),
  youtubeUrl: z.string().optional(),
  memberCount: z.number().int().min(0).optional().or(z.literal("").transform(() => undefined)),
  foundedDate: z.string().optional(),
});

type ChapterUpdateData = z.infer<typeof chapterUpdateSchema>;

const leaderFormSchema = z.object({
  name: z.string().min(1, "Name required"),
  title: z.string().min(1, "Title required"),
  bio: z.string().optional(),
  email: z.string().optional(),
  displayOrder: z.number().default(0),
});

type LeaderFormData = z.infer<typeof leaderFormSchema>;

function PhotoUpload({
  currentUrl,
  onUploaded,
}: {
  currentUrl?: string;
  onUploaded: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(currentUrl);
  const { toast } = useToast();

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch("/api/upload/leader-image", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setPreviewUrl(data.imageUrl);
      onUploaded(data.imageUrl);
    } catch (err: any) {
      toast({ title: "Upload Failed", description: err.message, variant: "destructive" });
      setPreviewUrl(currentUrl);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <label className="w-24 h-24 rounded-xl border-2 border-dashed border-muted-foreground/30 relative overflow-hidden cursor-pointer group transition-colors hover:border-primary/50">
        {previewUrl ? (
          <>
            <img src={previewUrl} alt="Photo" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="w-5 h-5 text-white" />
            </div>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
            <Camera className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">{uploading ? "Uploading..." : "Add Photo"}</span>
          </div>
        )}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFile}
          data-testid="input-portal-leader-photo"
        />
      </label>
    </div>
  );
}

export default function ChapterPortal() {
  const [, params] = useRoute("/portal/chapter/:slug");
  const slug = params?.slug || "";
  const { toast } = useToast();
  const [verified, setVerified] = useState(false);
  const [storedCode, setStoredCode] = useState("");
  const [chapterData, setChapterData] = useState<Omit<Chapter, "accessCode"> | null>(null);
  const [addLeaderOpen, setAddLeaderOpen] = useState(false);

  const accessForm = useForm<z.infer<typeof accessFormSchema>>({
    resolver: zodResolver(accessFormSchema),
    defaultValues: { accessCode: "" },
  });

  const updateForm = useForm<ChapterUpdateData>({
    resolver: zodResolver(chapterUpdateSchema),
  });

  const leaderForm = useForm<LeaderFormData>({
    resolver: zodResolver(leaderFormSchema),
    defaultValues: { name: "", title: "", bio: "", email: "", displayOrder: 0 },
  });

  const { data: leaders, refetch: refetchLeaders } = useQuery<ChapterLeader[]>({
    queryKey: ["/api/chapters", slug, "leaders"],
    queryFn: async () => {
      const res = await fetch(`/api/chapters/${slug}/leaders`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: verified,
  });

  const verifyMutation = useMutation({
    mutationFn: async (data: { accessCode: string }) => {
      const res = await apiRequest("POST", `/api/portal/chapter/${slug}/verify`, data);
      return res.json();
    },
    onSuccess: (data) => {
      setVerified(true);
      setStoredCode(accessForm.getValues("accessCode"));
      setChapterData(data.chapter);
      const ch = data.chapter;
      updateForm.reset({
        name: ch.name || "",
        city: ch.city || "",
        country: ch.country || "",
        description: ch.description || "",
        iconEmoji: ch.iconEmoji || "",
        leaderName: ch.leaderName || "",
        leaderTitle: ch.leaderTitle || "",
        leaderBio: ch.leaderBio || "",
        contactEmail: ch.contactEmail || "",
        contactPhone: ch.contactPhone || "",
        meetingSchedule: ch.meetingSchedule || "",
        address: ch.address || "",
        websiteUrl: ch.websiteUrl || "",
        facebookUrl: ch.facebookUrl || "",
        twitterUrl: ch.twitterUrl || "",
        whatsappLink: ch.whatsappLink || "",
        instagramUrl: ch.instagramUrl || "",
        youtubeUrl: ch.youtubeUrl || "",
        memberCount: ch.memberCount || undefined,
        foundedDate: ch.foundedDate || "",
      });
      toast({ title: "Access Granted", description: `Welcome to ${ch.name} portal` });
    },
    onError: (err: any) => {
      toast({ title: "Access Denied", description: err.message, variant: "destructive" });
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: ChapterUpdateData) => {
      const res = await apiRequest("PATCH", `/api/portal/chapter/${slug}/update`, {
        ...data,
        accessCode: storedCode,
        memberCount: data.memberCount !== undefined && data.memberCount !== "" ? Number(data.memberCount) : null,
      });
      return res.json();
    },
    onSuccess: (data) => {
      setChapterData(data);
      toast({ title: "Saved!", description: "Chapter information updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/chapters", slug] });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const addLeader = useMutation({
    mutationFn: async (data: LeaderFormData) => {
      if (!chapterData) return;
      const res = await apiRequest("POST", `/api/chapters/${chapterData.id}/leaders`, data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Leader added" });
      setAddLeaderOpen(false);
      leaderForm.reset();
      refetchLeaders();
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const deleteLeader = useMutation({
    mutationFn: async (leaderId: string) => {
      await apiRequest("DELETE", `/api/chapter-leaders/${leaderId}`);
    },
    onSuccess: () => {
      refetchLeaders();
      toast({ title: "Leader removed" });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  if (!verified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl" data-testid="text-chapter-portal-title">Chapter Portal</CardTitle>
            <p className="text-muted-foreground mt-2">
              Enter your chapter access code to manage <strong>{slug.replace(/-/g, " ")}</strong>
            </p>
          </CardHeader>
          <CardContent>
            <Form {...accessForm}>
              <form onSubmit={accessForm.handleSubmit((data) => verifyMutation.mutate(data))} className="space-y-4">
                <FormField control={accessForm.control} name="accessCode" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Access Code</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter your access code"
                        data-testid="input-chapter-access-code"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={verifyMutation.isPending}
                  data-testid="button-verify-chapter"
                >
                  {verifyMutation.isPending ? "Verifying..." : "Access Portal"}
                </Button>
              </form>
            </Form>
            <p className="text-xs text-muted-foreground text-center mt-4">
              Don't have an access code? Contact your regional coordinator or the admin team.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 bg-muted/30">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Building className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold" data-testid="text-chapter-portal-name">
                {chapterData?.name}
              </h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-3.5 h-3.5" />
                <span>{chapterData?.city}, {chapterData?.country}</span>
                <Badge variant="outline" className="text-xs">
                  <CheckCircle className="w-3 h-3 mr-1" /> Authenticated
                </Badge>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setVerified(false); setStoredCode(""); setChapterData(null); }}
            data-testid="button-logout-portal"
          >
            <Lock className="w-3.5 h-3.5 mr-1" /> Lock
          </Button>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full" data-testid="tabs-chapter-portal">
            <TabsTrigger value="general" data-testid="tab-general">General</TabsTrigger>
            <TabsTrigger value="contact" data-testid="tab-contact">Contact</TabsTrigger>
            <TabsTrigger value="social" data-testid="tab-social">Social</TabsTrigger>
            <TabsTrigger value="leadership" data-testid="tab-leadership">Leadership</TabsTrigger>
          </TabsList>

          <Form {...updateForm}>
            <form onSubmit={updateForm.handleSubmit((data) => saveMutation.mutate(data))}>
              <TabsContent value="general">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building className="w-5 h-5" /> General Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField control={updateForm.control} name="name" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Chapter Name</FormLabel>
                        <FormControl><Input {...field} data-testid="input-portal-name" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField control={updateForm.control} name="city" render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl><Input {...field} data-testid="input-portal-city" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={updateForm.control} name="country" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country</FormLabel>
                          <FormControl><Input {...field} data-testid="input-portal-country" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                    <FormField control={updateForm.control} name="iconEmoji" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Icon Emoji</FormLabel>
                        <FormControl><Input {...field} placeholder="e.g. 🗽" data-testid="input-portal-emoji" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={updateForm.control} name="description" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl><Textarea {...field} rows={4} placeholder="Tell people about your chapter..." data-testid="input-portal-description" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField control={updateForm.control} name="memberCount" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Member Count</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              {...field}
                              value={field.value ?? ""}
                              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : "")}
                              data-testid="input-portal-member-count"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={updateForm.control} name="foundedDate" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Founded Date</FormLabel>
                          <FormControl><Input type="date" {...field} data-testid="input-portal-founded" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                    <FormField control={updateForm.control} name="meetingSchedule" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meeting Schedule</FormLabel>
                        <FormControl><Input {...field} placeholder="e.g. Every Sunday at 2 PM EST" data-testid="input-portal-schedule" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={updateForm.control} name="address" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meeting Address</FormLabel>
                        <FormControl><Input {...field} placeholder="Meeting location address" data-testid="input-portal-address" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <Button type="submit" disabled={saveMutation.isPending} className="w-full" data-testid="button-save-general">
                      <Save className="w-4 h-4 mr-2" />
                      {saveMutation.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="contact">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Mail className="w-5 h-5" /> Contact & Leadership
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Separator />
                    <h4 className="font-semibold text-sm">Primary Leader</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField control={updateForm.control} name="leaderName" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Leader Name</FormLabel>
                          <FormControl><Input {...field} data-testid="input-portal-leader-name" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={updateForm.control} name="leaderTitle" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Leader Title</FormLabel>
                          <FormControl><Input {...field} placeholder="Chapter President" data-testid="input-portal-leader-title" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                    <FormField control={updateForm.control} name="leaderBio" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Leader Bio</FormLabel>
                        <FormControl><Textarea {...field} rows={3} data-testid="input-portal-leader-bio" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <Separator />
                    <h4 className="font-semibold text-sm">Contact Information</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField control={updateForm.control} name="contactEmail" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Email</FormLabel>
                          <FormControl><Input type="email" {...field} data-testid="input-portal-email" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={updateForm.control} name="contactPhone" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl><Input {...field} placeholder="+1 (555) 123-4567" data-testid="input-portal-phone" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                    <Button type="submit" disabled={saveMutation.isPending} className="w-full" data-testid="button-save-contact">
                      <Save className="w-4 h-4 mr-2" />
                      {saveMutation.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="social">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="w-5 h-5" /> Social Media & Links
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField control={updateForm.control} name="websiteUrl" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2"><LinkIcon className="w-4 h-4" /> Website</FormLabel>
                        <FormControl><Input {...field} placeholder="https://your-chapter-website.com" data-testid="input-portal-website" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={updateForm.control} name="facebookUrl" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2"><Facebook className="w-4 h-4" /> Facebook</FormLabel>
                        <FormControl><Input {...field} placeholder="https://facebook.com/your-chapter" data-testid="input-portal-facebook" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={updateForm.control} name="twitterUrl" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2"><SiX className="w-4 h-4" /> X (Twitter)</FormLabel>
                        <FormControl><Input {...field} placeholder="https://x.com/your-chapter" data-testid="input-portal-twitter" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={updateForm.control} name="instagramUrl" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2"><Instagram className="w-4 h-4" /> Instagram</FormLabel>
                        <FormControl><Input {...field} placeholder="https://instagram.com/your-chapter" data-testid="input-portal-instagram" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={updateForm.control} name="youtubeUrl" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2"><Youtube className="w-4 h-4" /> YouTube</FormLabel>
                        <FormControl><Input {...field} placeholder="https://youtube.com/@your-chapter" data-testid="input-portal-youtube" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={updateForm.control} name="whatsappLink" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2"><MessageCircle className="w-4 h-4" /> WhatsApp Group Link</FormLabel>
                        <FormControl><Input {...field} placeholder="https://chat.whatsapp.com/..." data-testid="input-portal-whatsapp" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <Button type="submit" disabled={saveMutation.isPending} className="w-full" data-testid="button-save-social">
                      <Save className="w-4 h-4 mr-2" />
                      {saveMutation.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </form>
          </Form>

          <TabsContent value="leadership">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" /> Leadership Team
                </CardTitle>
                <Button
                  size="sm"
                  onClick={() => { setAddLeaderOpen(true); leaderForm.reset(); }}
                  data-testid="button-portal-add-leader"
                >
                  <UserPlus className="w-4 h-4 mr-1" /> Add Leader
                </Button>
              </CardHeader>
              <CardContent>
                {leaders && leaders.length > 0 ? (
                  <div className="space-y-3">
                    {leaders.map((leader) => (
                      <div key={leader.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          {leader.image ? (
                            <img src={leader.image} alt={leader.name} className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                              {leader.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-sm">{leader.name}</p>
                            <p className="text-xs text-muted-foreground">{leader.title}</p>
                            {leader.email && <p className="text-xs text-muted-foreground">{leader.email}</p>}
                          </div>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="w-8 h-8 text-destructive hover:text-destructive"
                          onClick={() => deleteLeader.mutate(leader.id)}
                          data-testid={`button-remove-leader-${leader.id}`}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p>No leadership team members yet</p>
                    <p className="text-xs mt-1">Add your chapter's leaders above</p>
                  </div>
                )}

                {addLeaderOpen && (
                  <div className="mt-6 border-t pt-6">
                    <h4 className="font-semibold mb-4">Add New Leader</h4>
                    <Form {...leaderForm}>
                      <form onSubmit={leaderForm.handleSubmit((data) => addLeader.mutate(data))} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <FormField control={leaderForm.control} name="name" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl><Input {...field} data-testid="input-portal-new-leader-name" /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={leaderForm.control} name="title" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Title / Role</FormLabel>
                              <FormControl><Input {...field} placeholder="Vice President" data-testid="input-portal-new-leader-title" /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                        </div>
                        <FormField control={leaderForm.control} name="bio" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bio</FormLabel>
                            <FormControl><Textarea {...field} rows={2} data-testid="input-portal-new-leader-bio" /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={leaderForm.control} name="email" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl><Input {...field} data-testid="input-portal-new-leader-email" /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <div className="flex gap-2">
                          <Button type="submit" disabled={addLeader.isPending} data-testid="button-portal-save-leader">
                            {addLeader.isPending ? "Adding..." : "Add Leader"}
                          </Button>
                          <Button type="button" variant="outline" onClick={() => setAddLeaderOpen(false)}>
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
