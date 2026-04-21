import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import {
  CalendarDays, Plus, MapPin, Trash2, Edit, ArrowLeft, Users,
  Hotel, Ship, DollarSign, Mail, Phone, Clock, UserCheck,
} from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import type { Conference } from "@shared/schema";

interface ScheduleEvent {
  time: string;
  title: string;
  desc: string;
}

interface ScheduleDay {
  day: string;
  title: string;
  events: ScheduleEvent[];
}

interface SpeakerDetail {
  name: string;
  role?: string;
  desc?: string;
  photoUrl?: string;
}

interface ConventionMetadata {
  earlyBirdPrice?: string;
  installmentPrice?: string;
  installmentUrl?: string;
  boatCruisePrice?: string;
  boatCruiseUrl?: string;
  hotelBookingUrl?: string;
  hotelName?: string;
  hotelAddress?: string;
  hotelPhone?: string;
  hotelRate1?: string;
  hotelRate1Desc?: string;
  hotelRate2?: string;
  hotelRate2Desc?: string;
  contactEmail?: string;
  contactEmail2?: string;
  contactPhone?: string;
  conventionChairman?: string;
  altPaymentName?: string;
  altPaymentAddress?: string;
  altPaymentPhone?: string;
  altPaymentEmail?: string;
  schedule?: ScheduleDay[];

  // Images
  logoUrl?: string;
  chairmanPhotoUrl?: string;
  heroImages?: string[];
  boatCruiseImages?: string[];
  boatCruiseVideoUrl?: string;
  speakersDetail?: SpeakerDetail[];

  // Section headings & copy (all optional — fall back to defaults on the page)
  descriptionHeading?: string;
  hotelHeading?: string;
  hotelSubtitle?: string;
  speakersHeading?: string;
  speakersSubtitle?: string;
  boatCruiseHeading?: string;
  boatCruiseSubtitle?: string;
  boatCruiseTitle?: string;
  boatCruiseTime?: string;
  boatCruiseDescription?: string;
  scheduleHeading?: string;
  scheduleSubtitle?: string;
  chairmanHeading?: string;
  chairmanSubtitle?: string;
  chairmanQuote?: string;
  chairmanMessage?: string;
  chairmanSignoff?: string;
  delegatesHeading?: string;
  delegatesSubtitle?: string;
  travelInfoTitle?: string;
  travelInfoItems?: string[];
  altPaymentTitle?: string;
  altPaymentDescription?: string;
  ctaHeading?: string;
  ctaDescription?: string;
}

const conferenceFormSchema = z.object({
  title: z.string().min(3),
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/),
  year: z.string().min(4),
  location: z.string().min(3),
  city: z.string().min(2),
  country: z.string().min(2),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  description: z.string().optional(),
  theme: z.string().optional(),
  registrationUrl: z.string().optional(),
  imageUrl: z.string().optional(),
  isUpcoming: z.boolean().default(false),
  speakers: z.string().optional(),
  earlyBirdPrice: z.string().optional(),
  installmentPrice: z.string().optional(),
  installmentUrl: z.string().optional(),
  boatCruisePrice: z.string().optional(),
  boatCruiseUrl: z.string().optional(),
  hotelBookingUrl: z.string().optional(),
  hotelName: z.string().optional(),
  hotelAddress: z.string().optional(),
  hotelPhone: z.string().optional(),
  hotelRate1: z.string().optional(),
  hotelRate1Desc: z.string().optional(),
  hotelRate2: z.string().optional(),
  hotelRate2Desc: z.string().optional(),
  contactEmail: z.string().optional(),
  contactEmail2: z.string().optional(),
  contactPhone: z.string().optional(),
  conventionChairman: z.string().optional(),
  altPaymentName: z.string().optional(),
  altPaymentAddress: z.string().optional(),
  altPaymentPhone: z.string().optional(),
  altPaymentEmail: z.string().optional(),
  scheduleJson: z.string().optional(),

  // Images
  logoUrl: z.string().optional(),
  chairmanPhotoUrl: z.string().optional(),
  heroImagesText: z.string().optional(),
  boatCruiseImagesText: z.string().optional(),
  boatCruiseVideoUrl: z.string().optional(),
  speakersDetailJson: z.string().optional(),

  // Section copy
  descriptionHeading: z.string().optional(),
  hotelHeading: z.string().optional(),
  hotelSubtitle: z.string().optional(),
  speakersHeading: z.string().optional(),
  speakersSubtitle: z.string().optional(),
  boatCruiseHeading: z.string().optional(),
  boatCruiseSubtitle: z.string().optional(),
  boatCruiseTitle: z.string().optional(),
  boatCruiseTime: z.string().optional(),
  boatCruiseDescription: z.string().optional(),
  scheduleHeading: z.string().optional(),
  scheduleSubtitle: z.string().optional(),
  chairmanHeading: z.string().optional(),
  chairmanSubtitle: z.string().optional(),
  chairmanQuote: z.string().optional(),
  chairmanMessage: z.string().optional(),
  chairmanSignoff: z.string().optional(),
  delegatesHeading: z.string().optional(),
  delegatesSubtitle: z.string().optional(),
  travelInfoTitle: z.string().optional(),
  travelInfoItemsText: z.string().optional(),
  altPaymentTitle: z.string().optional(),
  altPaymentDescription: z.string().optional(),
  ctaHeading: z.string().optional(),
  ctaDescription: z.string().optional(),
});

type ConferenceFormData = z.infer<typeof conferenceFormSchema>;

function parseMetadata(metaStr?: string | null): ConventionMetadata {
  if (!metaStr) return {};
  try { return JSON.parse(metaStr); } catch { return {}; }
}

function getDefaults(c?: Conference): ConferenceFormData {
  const meta = parseMetadata(c?.metadata);
  return {
    title: c?.title || "",
    slug: c?.slug || "",
    year: c?.year ? String(c.year) : String(new Date().getFullYear()),
    location: c?.location || "",
    city: c?.city || "",
    country: c?.country || "",
    startDate: c?.startDate ? new Date(c.startDate).toISOString().slice(0, 16) : "",
    endDate: c?.endDate ? new Date(c.endDate).toISOString().slice(0, 16) : "",
    description: c?.description || "",
    theme: c?.theme || "",
    registrationUrl: c?.registrationUrl || "",
    imageUrl: c?.imageUrl || "",
    isUpcoming: c?.isUpcoming ?? false,
    speakers: c?.speakers || "",
    earlyBirdPrice: meta.earlyBirdPrice || "",
    installmentPrice: meta.installmentPrice || "",
    installmentUrl: meta.installmentUrl || "",
    boatCruisePrice: meta.boatCruisePrice || "",
    boatCruiseUrl: meta.boatCruiseUrl || "",
    hotelBookingUrl: meta.hotelBookingUrl || "",
    hotelName: meta.hotelName || "",
    hotelAddress: meta.hotelAddress || "",
    hotelPhone: meta.hotelPhone || "",
    hotelRate1: meta.hotelRate1 || "",
    hotelRate1Desc: meta.hotelRate1Desc || "",
    hotelRate2: meta.hotelRate2 || "",
    hotelRate2Desc: meta.hotelRate2Desc || "",
    contactEmail: meta.contactEmail || "",
    contactEmail2: meta.contactEmail2 || "",
    contactPhone: meta.contactPhone || "",
    conventionChairman: meta.conventionChairman || "",
    altPaymentName: meta.altPaymentName || "",
    altPaymentAddress: meta.altPaymentAddress || "",
    altPaymentPhone: meta.altPaymentPhone || "",
    altPaymentEmail: meta.altPaymentEmail || "",
    scheduleJson: meta.schedule ? JSON.stringify(meta.schedule, null, 2) : "",

    logoUrl: meta.logoUrl || "",
    chairmanPhotoUrl: meta.chairmanPhotoUrl || "",
    heroImagesText: meta.heroImages?.join("\n") || "",
    boatCruiseImagesText: meta.boatCruiseImages?.join("\n") || "",
    boatCruiseVideoUrl: meta.boatCruiseVideoUrl || "",
    speakersDetailJson: meta.speakersDetail ? JSON.stringify(meta.speakersDetail, null, 2) : "",

    descriptionHeading: meta.descriptionHeading || "",
    hotelHeading: meta.hotelHeading || "",
    hotelSubtitle: meta.hotelSubtitle || "",
    speakersHeading: meta.speakersHeading || "",
    speakersSubtitle: meta.speakersSubtitle || "",
    boatCruiseHeading: meta.boatCruiseHeading || "",
    boatCruiseSubtitle: meta.boatCruiseSubtitle || "",
    boatCruiseTitle: meta.boatCruiseTitle || "",
    boatCruiseTime: meta.boatCruiseTime || "",
    boatCruiseDescription: meta.boatCruiseDescription || "",
    scheduleHeading: meta.scheduleHeading || "",
    scheduleSubtitle: meta.scheduleSubtitle || "",
    chairmanHeading: meta.chairmanHeading || "",
    chairmanSubtitle: meta.chairmanSubtitle || "",
    chairmanQuote: meta.chairmanQuote || "",
    chairmanMessage: meta.chairmanMessage || "",
    chairmanSignoff: meta.chairmanSignoff || "",
    delegatesHeading: meta.delegatesHeading || "",
    delegatesSubtitle: meta.delegatesSubtitle || "",
    travelInfoTitle: meta.travelInfoTitle || "",
    travelInfoItemsText: meta.travelInfoItems?.join("\n") || "",
    altPaymentTitle: meta.altPaymentTitle || "",
    altPaymentDescription: meta.altPaymentDescription || "",
    ctaHeading: meta.ctaHeading || "",
    ctaDescription: meta.ctaDescription || "",
  };
}

function buildPayload(data: ConferenceFormData) {
  const metadata: ConventionMetadata = {};
  if (data.earlyBirdPrice) metadata.earlyBirdPrice = data.earlyBirdPrice;
  if (data.installmentPrice) metadata.installmentPrice = data.installmentPrice;
  if (data.installmentUrl) metadata.installmentUrl = data.installmentUrl;
  if (data.boatCruisePrice) metadata.boatCruisePrice = data.boatCruisePrice;
  if (data.boatCruiseUrl) metadata.boatCruiseUrl = data.boatCruiseUrl;
  if (data.hotelBookingUrl) metadata.hotelBookingUrl = data.hotelBookingUrl;
  if (data.hotelName) metadata.hotelName = data.hotelName;
  if (data.hotelAddress) metadata.hotelAddress = data.hotelAddress;
  if (data.hotelPhone) metadata.hotelPhone = data.hotelPhone;
  if (data.hotelRate1) metadata.hotelRate1 = data.hotelRate1;
  if (data.hotelRate1Desc) metadata.hotelRate1Desc = data.hotelRate1Desc;
  if (data.hotelRate2) metadata.hotelRate2 = data.hotelRate2;
  if (data.hotelRate2Desc) metadata.hotelRate2Desc = data.hotelRate2Desc;
  if (data.contactEmail) metadata.contactEmail = data.contactEmail;
  if (data.contactEmail2) metadata.contactEmail2 = data.contactEmail2;
  if (data.contactPhone) metadata.contactPhone = data.contactPhone;
  if (data.conventionChairman) metadata.conventionChairman = data.conventionChairman;
  if (data.altPaymentName) metadata.altPaymentName = data.altPaymentName;
  if (data.altPaymentAddress) metadata.altPaymentAddress = data.altPaymentAddress;
  if (data.altPaymentPhone) metadata.altPaymentPhone = data.altPaymentPhone;
  if (data.altPaymentEmail) metadata.altPaymentEmail = data.altPaymentEmail;
  if (data.scheduleJson) {
    try { metadata.schedule = JSON.parse(data.scheduleJson); } catch {}
  }

  if (data.logoUrl) metadata.logoUrl = data.logoUrl;
  if (data.chairmanPhotoUrl) metadata.chairmanPhotoUrl = data.chairmanPhotoUrl;
  if (data.heroImagesText) {
    const arr = data.heroImagesText.split("\n").map(s => s.trim()).filter(Boolean);
    if (arr.length > 0) metadata.heroImages = arr;
  }
  if (data.boatCruiseImagesText) {
    const arr = data.boatCruiseImagesText.split("\n").map(s => s.trim()).filter(Boolean);
    if (arr.length > 0) metadata.boatCruiseImages = arr;
  }
  if (data.boatCruiseVideoUrl) metadata.boatCruiseVideoUrl = data.boatCruiseVideoUrl;
  if (data.speakersDetailJson) {
    try { metadata.speakersDetail = JSON.parse(data.speakersDetailJson); } catch {}
  }

  if (data.descriptionHeading) metadata.descriptionHeading = data.descriptionHeading;
  if (data.hotelHeading) metadata.hotelHeading = data.hotelHeading;
  if (data.hotelSubtitle) metadata.hotelSubtitle = data.hotelSubtitle;
  if (data.speakersHeading) metadata.speakersHeading = data.speakersHeading;
  if (data.speakersSubtitle) metadata.speakersSubtitle = data.speakersSubtitle;
  if (data.boatCruiseHeading) metadata.boatCruiseHeading = data.boatCruiseHeading;
  if (data.boatCruiseSubtitle) metadata.boatCruiseSubtitle = data.boatCruiseSubtitle;
  if (data.boatCruiseTitle) metadata.boatCruiseTitle = data.boatCruiseTitle;
  if (data.boatCruiseTime) metadata.boatCruiseTime = data.boatCruiseTime;
  if (data.boatCruiseDescription) metadata.boatCruiseDescription = data.boatCruiseDescription;
  if (data.scheduleHeading) metadata.scheduleHeading = data.scheduleHeading;
  if (data.scheduleSubtitle) metadata.scheduleSubtitle = data.scheduleSubtitle;
  if (data.chairmanHeading) metadata.chairmanHeading = data.chairmanHeading;
  if (data.chairmanSubtitle) metadata.chairmanSubtitle = data.chairmanSubtitle;
  if (data.chairmanQuote) metadata.chairmanQuote = data.chairmanQuote;
  if (data.chairmanMessage) metadata.chairmanMessage = data.chairmanMessage;
  if (data.chairmanSignoff) metadata.chairmanSignoff = data.chairmanSignoff;
  if (data.delegatesHeading) metadata.delegatesHeading = data.delegatesHeading;
  if (data.delegatesSubtitle) metadata.delegatesSubtitle = data.delegatesSubtitle;
  if (data.travelInfoTitle) metadata.travelInfoTitle = data.travelInfoTitle;
  if (data.travelInfoItemsText) {
    const arr = data.travelInfoItemsText.split("\n").map(s => s.trim()).filter(Boolean);
    if (arr.length > 0) metadata.travelInfoItems = arr;
  }
  if (data.altPaymentTitle) metadata.altPaymentTitle = data.altPaymentTitle;
  if (data.altPaymentDescription) metadata.altPaymentDescription = data.altPaymentDescription;
  if (data.ctaHeading) metadata.ctaHeading = data.ctaHeading;
  if (data.ctaDescription) metadata.ctaDescription = data.ctaDescription;

  return {
    title: data.title,
    slug: data.slug,
    year: Number(data.year),
    location: data.location,
    city: data.city,
    country: data.country,
    startDate: data.startDate,
    endDate: data.endDate,
    description: data.description || null,
    theme: data.theme || null,
    registrationUrl: data.registrationUrl || null,
    imageUrl: data.imageUrl || null,
    isUpcoming: data.isUpcoming,
    speakers: data.speakers || null,
    metadata: Object.keys(metadata).length > 0 ? JSON.stringify(metadata) : null,
  };
}

export default function ConferencesAdmin() {
  const { toast } = useToast();
  const [createOpen, setCreateOpen] = useState(false);
  const [editConf, setEditConf] = useState<Conference | null>(null);

  const { data: confs, isLoading } = useQuery<Conference[]>({ queryKey: ["/api/conferences"] });

  const createForm = useForm<ConferenceFormData>({
    resolver: zodResolver(conferenceFormSchema),
    defaultValues: getDefaults(),
  });
  const editForm = useForm<ConferenceFormData>({
    resolver: zodResolver(conferenceFormSchema),
    defaultValues: getDefaults(),
  });

  const createMutation = useMutation({
    mutationFn: async (data: ConferenceFormData) => {
      const res = await apiRequest("POST", "/api/conferences", buildPayload(data));
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conferences"] });
      setCreateOpen(false);
      createForm.reset(getDefaults());
      toast({ title: "Conference Created" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ConferenceFormData }) => {
      const res = await apiRequest("PATCH", `/api/conferences/${id}`, buildPayload(data));
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conferences"] });
      setEditConf(null);
      toast({ title: "Conference Updated" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/conferences/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conferences"] });
      toast({ title: "Conference Deleted" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  function openEdit(c: Conference) {
    setEditConf(c);
    editForm.reset(getDefaults(c));
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/admin"><Button variant="ghost" size="icon" data-testid="button-back"><ArrowLeft className="w-5 h-5" /></Button></Link>
          <CalendarDays className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold" data-testid="text-conferences-admin-title">Conferences & Conventions</h1>
          <div className="ml-auto">
            <Button onClick={() => setCreateOpen(true)} data-testid="button-create-conference"><Plus className="w-4 h-4 mr-2" />Add Conference</Button>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-24 w-full" />)}</div>
        ) : !confs?.length ? (
          <Card><CardContent className="p-8 text-center text-muted-foreground">No conferences yet</CardContent></Card>
        ) : (
          <div className="space-y-3">
            {confs.map(c => {
              const meta = parseMetadata(c.metadata);
              return (
                <Card key={c.id} data-testid={`card-conference-${c.id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold" data-testid={`text-conf-title-${c.id}`}>{c.title}</h3>
                          <Badge variant={c.isUpcoming ? "default" : "secondary"}>{c.isUpcoming ? "Upcoming" : "Past"}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{c.city}, {c.country}</span>
                          <span>{c.year}</span>
                          {c.startDate && <span>{format(new Date(c.startDate), "MMM d, yyyy")}</span>}
                        </div>
                        {c.theme && <p className="text-sm mt-1 text-muted-foreground italic">"{c.theme}"</p>}
                        <div className="flex flex-wrap gap-2 mt-2">
                          {meta.earlyBirdPrice && <Badge variant="outline" className="text-xs"><DollarSign className="w-3 h-3 mr-1" />Early Bird: ${meta.earlyBirdPrice}</Badge>}
                          {meta.hotelName && <Badge variant="outline" className="text-xs"><Hotel className="w-3 h-3 mr-1" />{meta.hotelName}</Badge>}
                          {meta.boatCruisePrice && <Badge variant="outline" className="text-xs"><Ship className="w-3 h-3 mr-1" />Cruise: ${meta.boatCruisePrice}</Badge>}
                          {meta.conventionChairman && <Badge variant="outline" className="text-xs"><UserCheck className="w-3 h-3 mr-1" />{meta.conventionChairman}</Badge>}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEdit(c)} data-testid={`button-edit-conf-${c.id}`}><Edit className="w-4 h-4" /></Button>
                        <Button variant="destructive" size="sm" onClick={() => { if (confirm("Delete this conference?")) deleteMutation.mutate(c.id); }} data-testid={`button-delete-conf-${c.id}`}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Add Conference</DialogTitle></DialogHeader>
            <ConferenceForm form={createForm} onSubmit={(d) => createMutation.mutate(d)} isPending={createMutation.isPending} label="Create Conference" />
          </DialogContent>
        </Dialog>

        {editConf && (
          <Dialog open={!!editConf} onOpenChange={(o) => !o && setEditConf(null)}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Edit: {editConf.title}</DialogTitle></DialogHeader>
              <ConferenceForm form={editForm} onSubmit={(d) => updateMutation.mutate({ id: editConf.id, data: d })} isPending={updateMutation.isPending} label="Save Changes" />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}

function ConferenceForm({ form, onSubmit, isPending, label }: {
  form: ReturnType<typeof useForm<ConferenceFormData>>;
  onSubmit: (d: ConferenceFormData) => void;
  isPending: boolean;
  label: string;
}) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <CalendarDays className="w-4 h-4" /> Basic Information
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem><FormLabel>Title</FormLabel><FormControl><Input data-testid="input-conf-title" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="slug" render={({ field }) => (
                <FormItem><FormLabel>Slug</FormLabel><FormControl><Input data-testid="input-conf-slug" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField control={form.control} name="year" render={({ field }) => (
                <FormItem><FormLabel>Year</FormLabel><FormControl><Input type="number" data-testid="input-conf-year" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="city" render={({ field }) => (
                <FormItem><FormLabel>City</FormLabel><FormControl><Input data-testid="input-conf-city" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="country" render={({ field }) => (
                <FormItem><FormLabel>Country</FormLabel><FormControl><Input data-testid="input-conf-country" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <FormField control={form.control} name="location" render={({ field }) => (
              <FormItem><FormLabel>Venue / Full Address</FormLabel><FormControl><Input data-testid="input-conf-location" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="startDate" render={({ field }) => (
                <FormItem><FormLabel>Start Date</FormLabel><FormControl><Input type="datetime-local" data-testid="input-conf-start" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="endDate" render={({ field }) => (
                <FormItem><FormLabel>End Date</FormLabel><FormControl><Input type="datetime-local" data-testid="input-conf-end" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <FormField control={form.control} name="theme" render={({ field }) => (
              <FormItem><FormLabel>Theme</FormLabel><FormControl><Input placeholder="e.g. Building a New Uganda Together" data-testid="input-conf-theme" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea rows={4} data-testid="input-conf-description" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="isUpcoming" render={({ field }) => (
              <FormItem className="flex items-center gap-3">
                <FormLabel>Upcoming Convention</FormLabel>
                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-conf-upcoming" /></FormControl>
              </FormItem>
            )} />
            <FormField control={form.control} name="imageUrl" render={({ field }) => (
              <FormItem><FormLabel>Cover Image URL</FormLabel><FormControl><Input placeholder="https://..." data-testid="input-conf-image" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="conventionChairman" render={({ field }) => (
              <FormItem><FormLabel>Convention Chairman</FormLabel><FormControl><Input placeholder="e.g. Joseph William Ssenkumba" data-testid="input-conf-chairman" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <Users className="w-4 h-4" /> Speakers
          </h3>
          <FormField control={form.control} name="speakers" render={({ field }) => (
            <FormItem><FormLabel>Speakers (JSON array)</FormLabel><FormControl><Textarea rows={3} placeholder='["Speaker One", "Speaker Two"]' data-testid="input-conf-speakers" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>

        <Separator />

        <div>
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <DollarSign className="w-4 h-4" /> Registration & Pricing
          </h3>
          <div className="space-y-4">
            <FormField control={form.control} name="registrationUrl" render={({ field }) => (
              <FormItem><FormLabel>Registration / Full Payment URL</FormLabel><FormControl><Input placeholder="https://buy.stripe.com/..." data-testid="input-conf-reg-url" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="earlyBirdPrice" render={({ field }) => (
                <FormItem><FormLabel>Early Bird Price ($)</FormLabel><FormControl><Input placeholder="280" data-testid="input-conf-earlybird" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="installmentPrice" render={({ field }) => (
                <FormItem><FormLabel>Installment Price ($, per payment)</FormLabel><FormControl><Input placeholder="150" data-testid="input-conf-installment" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <FormField control={form.control} name="installmentUrl" render={({ field }) => (
              <FormItem><FormLabel>Installment Payment URL</FormLabel><FormControl><Input placeholder="https://buy.stripe.com/..." data-testid="input-conf-installment-url" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <Ship className="w-4 h-4" /> Boat Cruise
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="boatCruisePrice" render={({ field }) => (
              <FormItem><FormLabel>Boat Cruise Price ($)</FormLabel><FormControl><Input placeholder="220" data-testid="input-conf-cruise-price" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="boatCruiseUrl" render={({ field }) => (
              <FormItem><FormLabel>Boat Cruise Ticket URL</FormLabel><FormControl><Input placeholder="https://buy.stripe.com/..." data-testid="input-conf-cruise-url" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <Hotel className="w-4 h-4" /> Hotel & Accommodation
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="hotelName" render={({ field }) => (
                <FormItem><FormLabel>Hotel Name</FormLabel><FormControl><Input placeholder="Hilton Los Angeles Airport Hotel" data-testid="input-conf-hotel-name" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="hotelPhone" render={({ field }) => (
                <FormItem><FormLabel>Hotel Phone</FormLabel><FormControl><Input placeholder="(310) 410-4000" data-testid="input-conf-hotel-phone" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <FormField control={form.control} name="hotelAddress" render={({ field }) => (
              <FormItem><FormLabel>Hotel Address</FormLabel><FormControl><Input placeholder="5711 West Century Boulevard, Los Angeles, CA 90045" data-testid="input-conf-hotel-address" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="hotelBookingUrl" render={({ field }) => (
              <FormItem><FormLabel>Hotel Booking URL</FormLabel><FormControl><Input placeholder="https://book.passkey.com/go/..." data-testid="input-conf-hotel-url" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <FormField control={form.control} name="hotelRate1" render={({ field }) => (
                  <FormItem><FormLabel>Room Rate 1 ($/night)</FormLabel><FormControl><Input placeholder="179" data-testid="input-conf-rate1" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="hotelRate1Desc" render={({ field }) => (
                  <FormItem><FormLabel>Rate 1 Description</FormLabel><FormControl><Input placeholder="Standard King — Breakfast for one" data-testid="input-conf-rate1-desc" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <div className="space-y-2">
                <FormField control={form.control} name="hotelRate2" render={({ field }) => (
                  <FormItem><FormLabel>Room Rate 2 ($/night)</FormLabel><FormControl><Input placeholder="189" data-testid="input-conf-rate2" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="hotelRate2Desc" render={({ field }) => (
                  <FormItem><FormLabel>Rate 2 Description</FormLabel><FormControl><Input placeholder="Standard King — Breakfast for two" data-testid="input-conf-rate2-desc" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <Mail className="w-4 h-4" /> Contact Information
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="contactEmail" render={({ field }) => (
                <FormItem><FormLabel>Primary Contact Email</FormLabel><FormControl><Input placeholder="conventions@diasporanup.org" data-testid="input-conf-email" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="contactEmail2" render={({ field }) => (
                <FormItem><FormLabel>Secondary Contact Email</FormLabel><FormControl><Input placeholder="info@diasporanup.org" data-testid="input-conf-email2" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <FormField control={form.control} name="contactPhone" render={({ field }) => (
              <FormItem><FormLabel>Contact Phone</FormLabel><FormControl><Input placeholder="651 278 6724" data-testid="input-conf-phone" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <DollarSign className="w-4 h-4" /> Alternative Payment (International Delegates)
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="altPaymentName" render={({ field }) => (
                <FormItem><FormLabel>Recipient Name</FormLabel><FormControl><Input placeholder="Elvis Balikalaba" data-testid="input-conf-alt-name" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="altPaymentPhone" render={({ field }) => (
                <FormItem><FormLabel>Recipient Phone</FormLabel><FormControl><Input placeholder="+1 651 208 3354" data-testid="input-conf-alt-phone" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <FormField control={form.control} name="altPaymentAddress" render={({ field }) => (
              <FormItem><FormLabel>Recipient Address</FormLabel><FormControl><Input placeholder="656 Weaver Blvd, Anoka, MN 55303" data-testid="input-conf-alt-address" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="altPaymentEmail" render={({ field }) => (
              <FormItem><FormLabel>Recipient Email</FormLabel><FormControl><Input placeholder="elvis100b@gmail.com" data-testid="input-conf-alt-email" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" /> Event Schedule (JSON)
          </h3>
          <FormField control={form.control} name="scheduleJson" render={({ field }) => (
            <FormItem>
              <FormLabel>Schedule Data</FormLabel>
              <FormControl>
                <Textarea
                  rows={10}
                  placeholder={`[\n  {\n    "day": "Thursday, August 13th",\n    "title": "Arrival & Leadership",\n    "events": [\n      { "time": "8:00 AM", "title": "Arrival", "desc": "Delegates arrive" }\n    ]\n  }\n]`}
                  className="font-mono text-xs"
                  data-testid="input-conf-schedule"
                  {...field}
                />
              </FormControl>
              <FormMessage />
              <p className="text-xs text-muted-foreground mt-1">
                JSON array of days. Each day has: day (display name), title (subtitle), events (array of time/title/desc objects).
              </p>
            </FormItem>
          )} />
        </div>

        <Separator />

        <div>
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <CalendarDays className="w-4 h-4" /> Images & Media
          </h3>
          <div className="space-y-4">
            <FormField control={form.control} name="logoUrl" render={({ field }) => (
              <FormItem><FormLabel>Convention Logo URL</FormLabel><FormControl><Input placeholder="https://... (round logo shown above the title)" data-testid="input-conf-logo-url" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="chairmanPhotoUrl" render={({ field }) => (
              <FormItem><FormLabel>Chairman Photo URL</FormLabel><FormControl><Input placeholder="https://..." data-testid="input-conf-chairman-photo" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="heroImagesText" render={({ field }) => (
              <FormItem>
                <FormLabel>Hero Slideshow Image URLs</FormLabel>
                <FormControl><Textarea rows={6} placeholder={"One URL per line — these rotate at the top of the page.\nhttps://...\nhttps://..."} className="font-mono text-xs" data-testid="input-conf-hero-images" {...field} /></FormControl>
                <FormMessage />
                <p className="text-xs text-muted-foreground mt-1">Paste one URL per line. Leave blank to keep the current built-in slideshow.</p>
              </FormItem>
            )} />
            <FormField control={form.control} name="boatCruiseImagesText" render={({ field }) => (
              <FormItem>
                <FormLabel>Boat Cruise Image URLs</FormLabel>
                <FormControl><Textarea rows={3} placeholder={"One URL per line\nhttps://...\nhttps://..."} className="font-mono text-xs" data-testid="input-conf-cruise-images" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="boatCruiseVideoUrl" render={({ field }) => (
              <FormItem><FormLabel>Boat Cruise Background Video URL (mp4)</FormLabel><FormControl><Input placeholder="/videos/ocean-cruise.mp4" data-testid="input-conf-cruise-video" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="speakersDetailJson" render={({ field }) => (
              <FormItem>
                <FormLabel>Speakers (with photos & bios)</FormLabel>
                <FormControl>
                  <Textarea
                    rows={10}
                    placeholder={`[\n  {\n    "name": "President Robert Kyagulanyi",\n    "role": "Keynote Speaker",\n    "desc": "Leader of NUP",\n    "photoUrl": "https://..."\n  }\n]`}
                    className="font-mono text-xs"
                    data-testid="input-conf-speakers-detail"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
                <p className="text-xs text-muted-foreground mt-1">JSON array. Each speaker: name, role, desc, photoUrl. If filled, this replaces the simple Speakers list above.</p>
              </FormItem>
            )} />
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <Edit className="w-4 h-4" /> Page Headings & Copy
          </h3>
          <p className="text-xs text-muted-foreground mb-4">All fields below are optional. Leave blank to keep the default wording shown on the live page.</p>
          <div className="space-y-4">
            <FormField control={form.control} name="descriptionHeading" render={({ field }) => (
              <FormItem><FormLabel>Description Section Heading</FormLabel><FormControl><Input placeholder="A Call to Unity and Purpose" data-testid="input-conf-desc-heading" {...field} /></FormControl><FormMessage /></FormItem>
            )} />

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="hotelHeading" render={({ field }) => (
                <FormItem><FormLabel>Hotel Section Heading</FormLabel><FormControl><Input placeholder="Hotel & Accommodation" data-testid="input-conf-hotel-heading" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="hotelSubtitle" render={({ field }) => (
                <FormItem><FormLabel>Hotel Subtitle</FormLabel><FormControl><Input placeholder="Special rates negotiated for convention delegates" data-testid="input-conf-hotel-subtitle" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="speakersHeading" render={({ field }) => (
                <FormItem><FormLabel>Speakers Section Heading</FormLabel><FormControl><Input placeholder="Featured Speakers" data-testid="input-conf-speakers-heading" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="speakersSubtitle" render={({ field }) => (
                <FormItem><FormLabel>Speakers Subtitle</FormLabel><FormControl><Input placeholder="Voices of Freedom and Justice" data-testid="input-conf-speakers-subtitle" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="boatCruiseHeading" render={({ field }) => (
                <FormItem><FormLabel>Boat Cruise Section Heading</FormLabel><FormControl><Input placeholder="Boat Cruise Experience" data-testid="input-conf-cruise-heading" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="boatCruiseSubtitle" render={({ field }) => (
                <FormItem><FormLabel>Boat Cruise Subtitle</FormLabel><FormControl><Input placeholder="An unforgettable evening on the coastline" data-testid="input-conf-cruise-subtitle" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="boatCruiseTitle" render={({ field }) => (
                <FormItem><FormLabel>Boat Cruise Card Title</FormLabel><FormControl><Input placeholder="Heroes Celebration on Waters" data-testid="input-conf-cruise-title" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="boatCruiseTime" render={({ field }) => (
                <FormItem><FormLabel>Boat Cruise Time Line</FormLabel><FormControl><Input placeholder="Saturday, August 15th · 7:00 PM – 11:00 PM" data-testid="input-conf-cruise-time" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>

            <FormField control={form.control} name="boatCruiseDescription" render={({ field }) => (
              <FormItem><FormLabel>Boat Cruise Description</FormLabel><FormControl><Textarea rows={3} placeholder="Join fellow Ugandans and friends of Uganda aboard a luxury City Cruises vessel..." data-testid="input-conf-cruise-desc" {...field} /></FormControl><FormMessage /></FormItem>
            )} />

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="scheduleHeading" render={({ field }) => (
                <FormItem><FormLabel>Schedule Section Heading</FormLabel><FormControl><Input placeholder="Event Schedule" data-testid="input-conf-sched-heading" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="scheduleSubtitle" render={({ field }) => (
                <FormItem><FormLabel>Schedule Subtitle</FormLabel><FormControl><Input placeholder="4 days of leadership, advocacy, and celebration" data-testid="input-conf-sched-subtitle" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>

            <Separator />

            <h4 className="font-semibold text-sm">Chairman's Welcome Message</h4>
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="chairmanHeading" render={({ field }) => (
                <FormItem><FormLabel>Section Heading</FormLabel><FormControl><Input placeholder="A Message from the Convention Chairman" data-testid="input-conf-chair-heading" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="chairmanSubtitle" render={({ field }) => (
                <FormItem><FormLabel>Subtitle</FormLabel><FormControl><Input placeholder="Welcome to the NUP Diaspora Convention 2026" data-testid="input-conf-chair-subtitle" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <FormField control={form.control} name="chairmanQuote" render={({ field }) => (
              <FormItem><FormLabel>Opening Greeting (italic)</FormLabel><FormControl><Input placeholder="Dear Delegates, Guests, and Friends," data-testid="input-conf-chair-quote" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="chairmanMessage" render={({ field }) => (
              <FormItem>
                <FormLabel>Welcome Message Body</FormLabel>
                <FormControl><Textarea rows={6} placeholder="It is my honor to welcome you to..." data-testid="input-conf-chair-message" {...field} /></FormControl>
                <FormMessage />
                <p className="text-xs text-muted-foreground mt-1">Separate paragraphs with a blank line.</p>
              </FormItem>
            )} />
            <FormField control={form.control} name="chairmanSignoff" render={({ field }) => (
              <FormItem><FormLabel>Sign-off</FormLabel><FormControl><Input placeholder="With unity," data-testid="input-conf-chair-signoff" {...field} /></FormControl><FormMessage /></FormItem>
            )} />

            <Separator />

            <h4 className="font-semibold text-sm">International Delegates</h4>
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="delegatesHeading" render={({ field }) => (
                <FormItem><FormLabel>Section Heading</FormLabel><FormControl><Input placeholder="International Delegates" data-testid="input-conf-deleg-heading" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="delegatesSubtitle" render={({ field }) => (
                <FormItem><FormLabel>Subtitle</FormLabel><FormControl><Input placeholder="Information for delegates traveling from Uganda and beyond" data-testid="input-conf-deleg-subtitle" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <FormField control={form.control} name="travelInfoTitle" render={({ field }) => (
              <FormItem><FormLabel>Travel Info Card Title</FormLabel><FormControl><Input placeholder="Travel Information" data-testid="input-conf-travel-title" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="travelInfoItemsText" render={({ field }) => (
              <FormItem>
                <FormLabel>Travel Info Bullet Points</FormLabel>
                <FormControl><Textarea rows={4} placeholder={"One bullet per line\nClosest Airport: LAX\nComplimentary airport shuttle every 30 minutes"} data-testid="input-conf-travel-items" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="altPaymentTitle" render={({ field }) => (
                <FormItem><FormLabel>Alt. Payment Card Title</FormLabel><FormControl><Input placeholder="Alternative Payment" data-testid="input-conf-altpay-title" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="altPaymentDescription" render={({ field }) => (
                <FormItem><FormLabel>Alt. Payment Description</FormLabel><FormControl><Input placeholder="For international delegates unable to pay online, use Western Union or MoneyGram:" data-testid="input-conf-altpay-desc" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>

            <Separator />

            <h4 className="font-semibold text-sm">Bottom Call-to-Action</h4>
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="ctaHeading" render={({ field }) => (
                <FormItem><FormLabel>CTA Heading</FormLabel><FormControl><Input placeholder="Join Us in Los Angeles (defaults to Join Us in {city})" data-testid="input-conf-cta-heading" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="ctaDescription" render={({ field }) => (
                <FormItem><FormLabel>CTA Description</FormLabel><FormControl><Input placeholder="Be part of this historic gathering. Register today and help build a New Uganda together." data-testid="input-conf-cta-desc" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
          </div>
        </div>

        <Button type="submit" disabled={isPending} className="w-full" data-testid="button-conf-submit">{isPending ? "Saving..." : label}</Button>
      </form>
    </Form>
  );
}
