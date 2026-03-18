import { useState } from "react";
import { useRoute } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
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
  Globe2,
  Save,
  Users,
  Mail,
  Phone,
  Globe,
  Link as LinkIcon,
  CheckCircle,
  Facebook,
  Instagram,
  Youtube,
  MessageCircle,
  Upload,
} from "lucide-react";
import { SiX } from "react-icons/si";
import type { Region } from "@shared/schema";

function PhotoUpload({ currentUrl, onUploaded }: { currentUrl?: string; onUploaded: (url: string) => void }) {
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

  return (
    <div className="flex flex-col items-center gap-1">
      <label className="w-20 h-20 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center cursor-pointer overflow-hidden hover:border-primary transition-colors relative">
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
        <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleFile} data-testid="input-region-portal-leader-photo" />
      </label>
      <span className="text-xs text-muted-foreground">Coordinator Photo</span>
    </div>
  );
}

const accessFormSchema = z.object({
  accessCode: z.string().min(1, "Access code is required"),
});

const regionUpdateSchema = z.object({
  name: z.string().min(1, "Region name required"),
  description: z.string().optional(),
  leaderName: z.string().optional(),
  leaderTitle: z.string().optional(),
  leaderImage: z.string().optional(),
  leaderBio: z.string().optional(),
  contactEmail: z.string().email("Valid email required").or(z.literal("")).optional(),
  contactPhone: z.string().optional(),
  websiteUrl: z.string().optional(),
  facebookUrl: z.string().optional(),
  twitterUrl: z.string().optional(),
  whatsappLink: z.string().optional(),
  instagramUrl: z.string().optional(),
  youtubeUrl: z.string().optional(),
  memberCount: z.number().int().min(0).optional().or(z.literal("").transform(() => undefined)),
  foundedDate: z.string().optional(),
});

type RegionUpdateData = z.infer<typeof regionUpdateSchema>;

export default function RegionPortal() {
  const [, params] = useRoute("/portal/region/:slug");
  const slug = params?.slug || "";
  const { toast } = useToast();
  const [verified, setVerified] = useState(false);
  const [storedCode, setStoredCode] = useState("");
  const [regionData, setRegionData] = useState<Omit<Region, "accessCode"> | null>(null);

  const accessForm = useForm<z.infer<typeof accessFormSchema>>({
    resolver: zodResolver(accessFormSchema),
    defaultValues: { accessCode: "" },
  });

  const updateForm = useForm<RegionUpdateData>({
    resolver: zodResolver(regionUpdateSchema),
  });

  const verifyMutation = useMutation({
    mutationFn: async (data: { accessCode: string }) => {
      const res = await apiRequest("POST", `/api/portal/region/${slug}/verify`, data);
      return res.json();
    },
    onSuccess: (data) => {
      setVerified(true);
      setStoredCode(accessForm.getValues("accessCode"));
      setRegionData(data.region);
      const r = data.region;
      updateForm.reset({
        name: r.name || "",
        description: r.description || "",
        leaderName: r.leaderName || "",
        leaderTitle: r.leaderTitle || "",
        leaderImage: r.leaderImage || "",
        leaderBio: r.leaderBio || "",
        contactEmail: r.contactEmail || "",
        contactPhone: r.contactPhone || "",
        websiteUrl: r.websiteUrl || "",
        facebookUrl: r.facebookUrl || "",
        twitterUrl: r.twitterUrl || "",
        whatsappLink: r.whatsappLink || "",
        instagramUrl: r.instagramUrl || "",
        youtubeUrl: r.youtubeUrl || "",
        memberCount: r.memberCount || undefined,
        foundedDate: r.foundedDate || "",
      });
      toast({ title: "Access Granted", description: `Welcome to ${r.name} portal` });
    },
    onError: (err: any) => {
      toast({ title: "Access Denied", description: err.message, variant: "destructive" });
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: RegionUpdateData) => {
      const res = await apiRequest("PATCH", `/api/portal/region/${slug}/update`, {
        ...data,
        accessCode: storedCode,
        memberCount: data.memberCount !== undefined && data.memberCount !== "" ? Number(data.memberCount) : null,
      });
      return res.json();
    },
    onSuccess: (data) => {
      setRegionData(data);
      toast({ title: "Saved!", description: "Region information updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/regions", slug] });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  if (!verified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl" data-testid="text-region-portal-title">Region Portal</CardTitle>
            <p className="text-muted-foreground mt-2">
              Enter your region access code to manage <strong>{slug.replace(/-/g, " ")}</strong>
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
                        data-testid="input-region-access-code"
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
                  data-testid="button-verify-region"
                >
                  {verifyMutation.isPending ? "Verifying..." : "Access Portal"}
                </Button>
              </form>
            </Form>
            <p className="text-xs text-muted-foreground text-center mt-4">
              Don't have an access code? Contact the admin team.
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
              <Globe2 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold" data-testid="text-region-portal-name">
                {regionData?.name}
              </h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="outline" className="text-xs">
                  <CheckCircle className="w-3 h-3 mr-1" /> Authenticated
                </Badge>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setVerified(false); setStoredCode(""); setRegionData(null); }}
            data-testid="button-logout-region-portal"
          >
            <Lock className="w-3.5 h-3.5 mr-1" /> Lock
          </Button>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full" data-testid="tabs-region-portal">
            <TabsTrigger value="general" data-testid="tab-region-general">General</TabsTrigger>
            <TabsTrigger value="contact" data-testid="tab-region-contact">Contact</TabsTrigger>
            <TabsTrigger value="social" data-testid="tab-region-social">Social</TabsTrigger>
          </TabsList>

          <Form {...updateForm}>
            <form onSubmit={updateForm.handleSubmit((data) => saveMutation.mutate(data))}>
              <TabsContent value="general">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe2 className="w-5 h-5" /> General Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField control={updateForm.control} name="name" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Region Name</FormLabel>
                        <FormControl><Input {...field} data-testid="input-region-portal-name" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={updateForm.control} name="description" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl><Textarea {...field} rows={4} placeholder="Describe your region's mission and activities..." data-testid="input-region-portal-description" /></FormControl>
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
                              data-testid="input-region-portal-member-count"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={updateForm.control} name="foundedDate" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Founded Date</FormLabel>
                          <FormControl><Input type="date" {...field} data-testid="input-region-portal-founded" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                    <Button type="submit" disabled={saveMutation.isPending} className="w-full" data-testid="button-save-region-general">
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
                      <Mail className="w-5 h-5" /> Contact & Coordinator
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <h4 className="font-semibold text-sm">Regional Coordinator</h4>
                    <div className="flex gap-4">
                      <PhotoUpload
                        currentUrl={updateForm.getValues("leaderImage") || undefined}
                        onUploaded={(url) => updateForm.setValue("leaderImage", url)}
                      />
                      <div className="flex-1 grid grid-cols-2 gap-4">
                        <FormField control={updateForm.control} name="leaderName" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Coordinator Name</FormLabel>
                            <FormControl><Input {...field} data-testid="input-region-portal-leader-name" /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={updateForm.control} name="leaderTitle" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl><Input {...field} placeholder="Regional Coordinator" data-testid="input-region-portal-leader-title" /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>
                    </div>
                    <FormField control={updateForm.control} name="leaderBio" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Coordinator Bio</FormLabel>
                        <FormControl><Textarea {...field} rows={3} data-testid="input-region-portal-leader-bio" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <Separator />
                    <h4 className="font-semibold text-sm">Contact Information</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField control={updateForm.control} name="contactEmail" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Email</FormLabel>
                          <FormControl><Input type="email" {...field} data-testid="input-region-portal-email" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={updateForm.control} name="contactPhone" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl><Input {...field} placeholder="+1 (555) 123-4567" data-testid="input-region-portal-phone" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                    <Button type="submit" disabled={saveMutation.isPending} className="w-full" data-testid="button-save-region-contact">
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
                        <FormControl><Input {...field} placeholder="https://your-region-website.com" data-testid="input-region-portal-website" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={updateForm.control} name="facebookUrl" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2"><Facebook className="w-4 h-4" /> Facebook</FormLabel>
                        <FormControl><Input {...field} placeholder="https://facebook.com/your-region" data-testid="input-region-portal-facebook" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={updateForm.control} name="twitterUrl" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2"><SiX className="w-4 h-4" /> X (Twitter)</FormLabel>
                        <FormControl><Input {...field} placeholder="https://x.com/your-region" data-testid="input-region-portal-twitter" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={updateForm.control} name="instagramUrl" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2"><Instagram className="w-4 h-4" /> Instagram</FormLabel>
                        <FormControl><Input {...field} placeholder="https://instagram.com/your-region" data-testid="input-region-portal-instagram" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={updateForm.control} name="youtubeUrl" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2"><Youtube className="w-4 h-4" /> YouTube</FormLabel>
                        <FormControl><Input {...field} placeholder="https://youtube.com/@your-region" data-testid="input-region-portal-youtube" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={updateForm.control} name="whatsappLink" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2"><MessageCircle className="w-4 h-4" /> WhatsApp Group Link</FormLabel>
                        <FormControl><Input {...field} placeholder="https://chat.whatsapp.com/..." data-testid="input-region-portal-whatsapp" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <Button type="submit" disabled={saveMutation.isPending} className="w-full" data-testid="button-save-region-social">
                      <Save className="w-4 h-4 mr-2" />
                      {saveMutation.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </form>
          </Form>
        </Tabs>
      </div>
    </div>
  );
}
