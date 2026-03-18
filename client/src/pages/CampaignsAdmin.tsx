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
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Target, Plus, Trash2, Edit, ArrowLeft, DollarSign, Users, Eye,
} from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import type { Campaign, CampaignDonation } from "@shared/schema";

const campaignFormSchema = z.object({
  title: z.string().min(3),
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  goalAmount: z.string().min(1),
  category: z.string().min(1),
  imageUrl: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  isActive: z.boolean().default(true),
});

type CampaignFormData = z.infer<typeof campaignFormSchema>;

function getDefaults(c?: Campaign): CampaignFormData {
  return {
    title: c?.title || "",
    slug: c?.slug || "",
    description: c?.description || "",
    goalAmount: c?.goalAmount ? String(c.goalAmount) : "",
    category: c?.category || "general",
    imageUrl: c?.imageUrl || "",
    startDate: c?.startDate ? new Date(c.startDate).toISOString().slice(0, 16) : "",
    endDate: c?.endDate ? new Date(c.endDate).toISOString().slice(0, 16) : "",
    isActive: c?.isActive ?? true,
  };
}

export default function CampaignsAdmin() {
  const { toast } = useToast();
  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<Campaign | null>(null);
  const [viewDonations, setViewDonations] = useState<Campaign | null>(null);

  const { data: items, isLoading } = useQuery<Campaign[]>({ queryKey: ["/api/admin/campaigns"] });

  const createForm = useForm<CampaignFormData>({ resolver: zodResolver(campaignFormSchema), defaultValues: getDefaults() });
  const editForm = useForm<CampaignFormData>({ resolver: zodResolver(campaignFormSchema), defaultValues: getDefaults() });

  const { data: donations } = useQuery<CampaignDonation[]>({
    queryKey: ["/api/campaigns", viewDonations?.slug, "donations"],
    enabled: !!viewDonations,
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/campaigns/${viewDonations!.slug}/donations`);
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: CampaignFormData) => {
      const res = await apiRequest("POST", "/api/campaigns", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/campaigns"] });
      setCreateOpen(false);
      createForm.reset(getDefaults());
      toast({ title: "Campaign Created" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: CampaignFormData }) => {
      const res = await apiRequest("PATCH", `/api/campaigns/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/campaigns"] });
      setEditItem(null);
      toast({ title: "Campaign Updated" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { await apiRequest("DELETE", `/api/campaigns/${id}`); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/campaigns"] });
      toast({ title: "Campaign Deleted" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  function openEdit(c: Campaign) { setEditItem(c); editForm.reset(getDefaults(c)); }

  function CampaignForm({ form, onSubmit, isPending, label }: {
    form: ReturnType<typeof useForm<CampaignFormData>>; onSubmit: (d: CampaignFormData) => void; isPending: boolean; label: string;
  }) {
    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="title" render={({ field }) => (
              <FormItem><FormLabel>Title</FormLabel><FormControl><Input data-testid="input-campaign-title" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="slug" render={({ field }) => (
              <FormItem><FormLabel>Slug</FormLabel><FormControl><Input data-testid="input-campaign-slug" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="goalAmount" render={({ field }) => (
              <FormItem><FormLabel>Goal Amount ($)</FormLabel><FormControl><Input type="number" step="0.01" data-testid="input-campaign-goal" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="category" render={({ field }) => (
              <FormItem><FormLabel>Category</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl><SelectTrigger data-testid="select-campaign-category"><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="infrastructure">Infrastructure</SelectItem>
                    <SelectItem value="legal">Legal</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select><FormMessage />
              </FormItem>
            )} />
          </div>
          <FormField control={form.control} name="description" render={({ field }) => (
            <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea rows={3} data-testid="input-campaign-desc" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="imageUrl" render={({ field }) => (
            <FormItem><FormLabel>Image URL (optional)</FormLabel><FormControl><Input data-testid="input-campaign-image" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="startDate" render={({ field }) => (
              <FormItem><FormLabel>Start Date</FormLabel><FormControl><Input type="datetime-local" data-testid="input-campaign-start" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="endDate" render={({ field }) => (
              <FormItem><FormLabel>End Date</FormLabel><FormControl><Input type="datetime-local" data-testid="input-campaign-end" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <FormField control={form.control} name="isActive" render={({ field }) => (
            <FormItem className="flex items-center gap-3"><FormLabel>Active</FormLabel><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-campaign-active" /></FormControl></FormItem>
          )} />
          <Button type="submit" disabled={isPending} className="w-full" data-testid="button-campaign-submit">{isPending ? "Saving..." : label}</Button>
        </form>
      </Form>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/admin"><Button variant="ghost" size="icon" data-testid="button-back"><ArrowLeft className="w-5 h-5" /></Button></Link>
          <Target className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold" data-testid="text-campaigns-admin-title">Fundraising Campaigns</h1>
          <div className="ml-auto"><Button onClick={() => setCreateOpen(true)} data-testid="button-create-campaign"><Plus className="w-4 h-4 mr-2" />Add Campaign</Button></div>
        </div>

        {isLoading ? (
          <div className="space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-24 w-full" />)}</div>
        ) : !items?.length ? (
          <Card><CardContent className="p-8 text-center text-muted-foreground">No campaigns yet</CardContent></Card>
        ) : (
          <div className="space-y-3">
            {items.map(c => {
              const pct = c.goalAmount && Number(c.goalAmount) > 0 ? Math.min(100, Math.round((Number(c.raisedAmount) / Number(c.goalAmount)) * 100)) : 0;
              return (
                <Card key={c.id} data-testid={`card-campaign-${c.id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold" data-testid={`text-campaign-title-${c.id}`}>{c.title}</h3>
                          <Badge variant={c.isActive ? "default" : "secondary"}>{c.isActive ? "Active" : "Ended"}</Badge>
                          <Badge variant="outline">{c.category}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />${Number(c.raisedAmount).toLocaleString()} / ${Number(c.goalAmount).toLocaleString()} ({pct}%)</span>
                          <span className="flex items-center gap-1"><Users className="w-3 h-3" />{c.donorCount} donors</span>
                        </div>
                        <div className="mt-2 w-full bg-muted rounded-full h-2">
                          <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button variant="outline" size="sm" onClick={() => setViewDonations(c)} data-testid={`button-view-donations-${c.id}`}><Eye className="w-4 h-4" /></Button>
                        <Button variant="outline" size="sm" onClick={() => openEdit(c)} data-testid={`button-edit-campaign-${c.id}`}><Edit className="w-4 h-4" /></Button>
                        <Button variant="destructive" size="sm" onClick={() => { if (confirm("Delete this campaign and all its donations?")) deleteMutation.mutate(c.id); }} data-testid={`button-delete-campaign-${c.id}`}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Create Campaign</DialogTitle></DialogHeader>
            <CampaignForm form={createForm} onSubmit={(d) => createMutation.mutate(d)} isPending={createMutation.isPending} label="Create Campaign" />
          </DialogContent>
        </Dialog>

        {editItem && (
          <Dialog open={!!editItem} onOpenChange={(o) => !o && setEditItem(null)}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Edit: {editItem.title}</DialogTitle></DialogHeader>
              <CampaignForm form={editForm} onSubmit={(d) => updateMutation.mutate({ id: editItem.id, data: d })} isPending={updateMutation.isPending} label="Save Changes" />
            </DialogContent>
          </Dialog>
        )}

        {viewDonations && (
          <Dialog open={!!viewDonations} onOpenChange={(o) => !o && setViewDonations(null)}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Donations: {viewDonations.title}</DialogTitle></DialogHeader>
              {!donations?.length ? (
                <p className="text-center text-muted-foreground py-4">No donations yet</p>
              ) : (
                <div className="space-y-2">
                  {donations.map(d => (
                    <div key={d.id} className="flex justify-between items-center p-3 border rounded-lg" data-testid={`donation-${d.id}`}>
                      <div>
                        <p className="font-medium">{d.isAnonymous ? "Anonymous" : d.donorName}</p>
                        <p className="text-xs text-muted-foreground">{d.createdAt ? format(new Date(d.createdAt), "MMM d, yyyy") : ""}</p>
                        {d.message && <p className="text-sm text-muted-foreground mt-1">{d.message}</p>}
                      </div>
                      <span className="font-semibold text-green-600">${Number(d.amount).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
