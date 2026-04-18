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
  Crown, Plus, Trash2, Edit, ArrowLeft, DollarSign, Star,
} from "lucide-react";
import { useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import type { MembershipTier } from "@shared/schema";

const tierFormSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  price: z.string().min(1),
  interval: z.string().min(1),
  description: z.string().optional(),
  benefits: z.string().optional(),
  badgeColor: z.string().optional(),
  awardType: z.string().optional(),
  awardDescription: z.string().optional(),
  isPopular: z.boolean().default(false),
  isActive: z.boolean().default(true),
  displayOrder: z.string().default("0"),
});

type TierFormData = z.infer<typeof tierFormSchema>;

function getDefaults(t?: MembershipTier): TierFormData {
  return {
    name: t?.name || "",
    slug: t?.slug || "",
    price: t?.price ? String(t.price) : "",
    interval: t?.interval || "monthly",
    description: t?.description || "",
    benefits: t?.benefits || "",
    badgeColor: t?.badgeColor || "",
    awardType: t?.awardType || "",
    awardDescription: t?.awardDescription || "",
    isPopular: t?.isPopular ?? false,
    isActive: t?.isActive ?? true,
    displayOrder: t?.displayOrder !== undefined ? String(t.displayOrder) : "0",
  };
}

export default function MembershipTiersAdmin() {
  const { toast } = useToast();
  const [createOpen, setCreateOpen] = useState(false);
  const [editTier, setEditTier] = useState<MembershipTier | null>(null);

  const { data: tiers, isLoading } = useQuery<MembershipTier[]>({ queryKey: ["/api/admin/membership-tiers"] });

  const createForm = useForm<TierFormData>({ resolver: zodResolver(tierFormSchema), defaultValues: getDefaults() });
  const editForm = useForm<TierFormData>({ resolver: zodResolver(tierFormSchema), defaultValues: getDefaults() });

  const createMutation = useMutation({
    mutationFn: async (data: TierFormData) => {
      const res = await apiRequest("POST", "/api/membership-tiers", { ...data, displayOrder: Number(data.displayOrder) });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/membership-tiers"] });
      setCreateOpen(false);
      createForm.reset(getDefaults());
      toast({ title: "Tier Created" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: TierFormData }) => {
      const res = await apiRequest("PATCH", `/api/membership-tiers/${id}`, { ...data, displayOrder: Number(data.displayOrder) });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/membership-tiers"] });
      setEditTier(null);
      toast({ title: "Tier Updated" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { await apiRequest("DELETE", `/api/membership-tiers/${id}`); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/membership-tiers"] });
      toast({ title: "Tier Deleted" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  function openEdit(t: MembershipTier) { setEditTier(t); editForm.reset(getDefaults(t)); }

  function TierForm({ form, onSubmit, isPending, label }: {
    form: ReturnType<typeof useForm<TierFormData>>; onSubmit: (d: TierFormData) => void; isPending: boolean; label: string;
  }) {
    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem><FormLabel>Name</FormLabel><FormControl><Input placeholder="Gold" data-testid="input-tier-name" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="slug" render={({ field }) => (
              <FormItem><FormLabel>Slug</FormLabel><FormControl><Input placeholder="gold" data-testid="input-tier-slug" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField control={form.control} name="price" render={({ field }) => (
              <FormItem><FormLabel>Price ($)</FormLabel><FormControl><Input type="number" step="0.01" data-testid="input-tier-price" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="interval" render={({ field }) => (
              <FormItem><FormLabel>Interval</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl><SelectTrigger data-testid="select-tier-interval"><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select><FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="displayOrder" render={({ field }) => (
              <FormItem><FormLabel>Display Order</FormLabel><FormControl><Input type="number" data-testid="input-tier-order" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <FormField control={form.control} name="description" render={({ field }) => (
            <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea rows={2} data-testid="input-tier-desc" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="benefits" render={({ field }) => (
            <FormItem><FormLabel>Benefits (JSON array or comma-separated)</FormLabel><FormControl><Textarea rows={3} data-testid="input-tier-benefits" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="badgeColor" render={({ field }) => (
            <FormItem><FormLabel>Badge Color (optional)</FormLabel><FormControl><Input placeholder="#FFD700" data-testid="input-tier-badge-color" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="awardType" render={({ field }) => (
              <FormItem><FormLabel>Award Type (optional)</FormLabel>
                <Select value={field.value || "none"} onValueChange={(v) => field.onChange(v === "none" ? "" : v)}>
                  <FormControl><SelectTrigger data-testid="select-tier-award"><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="certificate">Certificate</SelectItem>
                    <SelectItem value="plaque">Plaque</SelectItem>
                    <SelectItem value="trophy">Trophy</SelectItem>
                    <SelectItem value="medal">Medal</SelectItem>
                  </SelectContent>
                </Select><FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="awardDescription" render={({ field }) => (
              <FormItem><FormLabel>Award Description</FormLabel><FormControl><Input data-testid="input-tier-award-desc" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <div className="flex gap-6">
            <FormField control={form.control} name="isPopular" render={({ field }) => (
              <FormItem className="flex items-center gap-3"><FormLabel>Popular</FormLabel><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-tier-popular" /></FormControl></FormItem>
            )} />
            <FormField control={form.control} name="isActive" render={({ field }) => (
              <FormItem className="flex items-center gap-3"><FormLabel>Active</FormLabel><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-tier-active" /></FormControl></FormItem>
            )} />
          </div>
          <Button type="submit" disabled={isPending} className="w-full" data-testid="button-tier-submit">{isPending ? "Saving..." : label}</Button>
        </form>
      </Form>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/admin"><Button variant="ghost" size="icon" data-testid="button-back"><ArrowLeft className="w-5 h-5" /></Button></Link>
          <Crown className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold" data-testid="text-tiers-admin-title">Membership Tiers</h1>
          <div className="ml-auto"><Button onClick={() => setCreateOpen(true)} data-testid="button-create-tier"><Plus className="w-4 h-4 mr-2" />Add Tier</Button></div>
        </div>

        {isLoading ? (
          <div className="space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-24 w-full" />)}</div>
        ) : !tiers?.length ? (
          <Card><CardContent className="p-8 text-center text-muted-foreground">No membership tiers yet</CardContent></Card>
        ) : (
          <div className="space-y-3">
            {tiers.map(t => (
              <Card key={t.id} data-testid={`card-tier-${t.id}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold" data-testid={`text-tier-name-${t.id}`}>{t.name}</h3>
                        <Badge variant={t.isActive ? "default" : "secondary"}>{t.isActive ? "Active" : "Inactive"}</Badge>
                        {t.isPopular && <Badge variant="outline" className="gap-1"><Star className="w-3 h-3" />Popular</Badge>}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />${Number(t.price).toFixed(2)} / {t.interval}</span>
                        {t.awardType && <span>Award: {t.awardType}</span>}
                        <span>Order: {t.displayOrder}</span>
                      </div>
                      {t.description && <p className="text-sm mt-1 text-muted-foreground line-clamp-1">{t.description}</p>}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button variant="outline" size="sm" onClick={() => openEdit(t)} data-testid={`button-edit-tier-${t.id}`}><Edit className="w-4 h-4" /></Button>
                      <Button variant="destructive" size="sm" onClick={() => { if (confirm("Delete this tier?")) deleteMutation.mutate(t.id); }} data-testid={`button-delete-tier-${t.id}`}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Create Membership Tier</DialogTitle></DialogHeader>
            <TierForm form={createForm} onSubmit={(d) => createMutation.mutate(d)} isPending={createMutation.isPending} label="Create Tier" />
          </DialogContent>
        </Dialog>

        {editTier && (
          <Dialog open={!!editTier} onOpenChange={(o) => !o && setEditTier(null)}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Edit: {editTier.name}</DialogTitle></DialogHeader>
              <TierForm form={editForm} onSubmit={(d) => updateMutation.mutate({ id: editTier.id, data: d })} isPending={updateMutation.isPending} label="Save Changes" />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
