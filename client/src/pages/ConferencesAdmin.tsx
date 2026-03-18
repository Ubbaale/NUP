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
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import {
  CalendarDays, Plus, MapPin, Trash2, Edit, ArrowLeft, Users,
} from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import type { Conference } from "@shared/schema";

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
});

type ConferenceFormData = z.infer<typeof conferenceFormSchema>;

function getDefaults(c?: Conference): ConferenceFormData {
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
      const res = await apiRequest("POST", "/api/conferences", { ...data, year: Number(data.year) });
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
      const res = await apiRequest("PATCH", `/api/conferences/${id}`, { ...data, year: Number(data.year) });
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

  function ConferenceForm({ form, onSubmit, isPending, label }: {
    form: ReturnType<typeof useForm<ConferenceFormData>>;
    onSubmit: (d: ConferenceFormData) => void;
    isPending: boolean;
    label: string;
  }) {
    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="title" render={({ field }) => (
              <FormItem><FormLabel>Title</FormLabel><FormControl><Input data-testid="input-conf-title" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="slug" render={({ field }) => (
              <FormItem><FormLabel>Slug</FormLabel><FormControl><Input data-testid="input-conf-slug" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <div className="grid grid-cols-3 gap-4">
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
            <FormItem><FormLabel>Venue / Location</FormLabel><FormControl><Input data-testid="input-conf-location" {...field} /></FormControl><FormMessage /></FormItem>
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
            <FormItem><FormLabel>Theme (optional)</FormLabel><FormControl><Input data-testid="input-conf-theme" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="description" render={({ field }) => (
            <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea rows={3} data-testid="input-conf-description" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="registrationUrl" render={({ field }) => (
            <FormItem><FormLabel>Registration URL (optional)</FormLabel><FormControl><Input data-testid="input-conf-reg-url" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="imageUrl" render={({ field }) => (
            <FormItem><FormLabel>Image URL (optional)</FormLabel><FormControl><Input data-testid="input-conf-image" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="speakers" render={({ field }) => (
            <FormItem><FormLabel>Speakers (comma-separated, optional)</FormLabel><FormControl><Textarea rows={2} data-testid="input-conf-speakers" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="isUpcoming" render={({ field }) => (
            <FormItem className="flex items-center gap-3">
              <FormLabel>Upcoming</FormLabel>
              <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-conf-upcoming" /></FormControl>
            </FormItem>
          )} />
          <Button type="submit" disabled={isPending} className="w-full" data-testid="button-conf-submit">{isPending ? "Saving..." : label}</Button>
        </form>
      </Form>
    );
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
            {confs.map(c => (
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
                      {c.theme && <p className="text-sm mt-1 text-muted-foreground">{c.theme}</p>}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEdit(c)} data-testid={`button-edit-conf-${c.id}`}><Edit className="w-4 h-4" /></Button>
                      <Button variant="destructive" size="sm" onClick={() => { if (confirm("Delete this conference?")) deleteMutation.mutate(c.id); }} data-testid={`button-delete-conf-${c.id}`}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Add Conference</DialogTitle></DialogHeader>
            <ConferenceForm form={createForm} onSubmit={(d) => createMutation.mutate(d)} isPending={createMutation.isPending} label="Create Conference" />
          </DialogContent>
        </Dialog>

        {editConf && (
          <Dialog open={!!editConf} onOpenChange={(o) => !o && setEditConf(null)}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Edit: {editConf.title}</DialogTitle></DialogHeader>
              <ConferenceForm form={editForm} onSubmit={(d) => updateMutation.mutate({ id: editConf.id, data: d })} isPending={updateMutation.isPending} label="Save Changes" />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
