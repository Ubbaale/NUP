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
  Gavel, Plus, Trash2, Edit, ArrowLeft, Eye, DollarSign, Ticket,
} from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import type { AuctionItem, Bid, RaffleTicket } from "@shared/schema";

const auctionFormSchema = z.object({
  title: z.string().min(3),
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  startingBid: z.string().min(1),
  buyNowPrice: z.string().optional(),
  bidIncrement: z.string().min(1),
  ticketPrice: z.string().optional(),
  auctionType: z.string().min(1),
  startDate: z.string().optional(),
  endDate: z.string().min(1),
  isActive: z.boolean().default(true),
});

type AuctionFormData = z.infer<typeof auctionFormSchema>;

function getDefaults(a?: AuctionItem): AuctionFormData {
  return {
    title: a?.title || "",
    slug: a?.slug || "",
    description: a?.description || "",
    imageUrl: a?.imageUrl || "",
    startingBid: a?.startingBid ? String(a.startingBid) : "10",
    buyNowPrice: a?.buyNowPrice ? String(a.buyNowPrice) : "",
    bidIncrement: a?.bidIncrement ? String(a.bidIncrement) : "5",
    ticketPrice: a?.ticketPrice ? String(a.ticketPrice) : "5",
    auctionType: a?.auctionType || "auction",
    startDate: a?.startDate ? new Date(a.startDate).toISOString().slice(0, 16) : "",
    endDate: a?.endDate ? new Date(a.endDate).toISOString().slice(0, 16) : "",
    isActive: a?.isActive ?? true,
  };
}

export default function AuctionsAdmin() {
  const { toast } = useToast();
  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<AuctionItem | null>(null);
  const [viewDetails, setViewDetails] = useState<AuctionItem | null>(null);

  const { data: items, isLoading } = useQuery<AuctionItem[]>({ queryKey: ["/api/admin/auctions"] });

  const { data: bidsData } = useQuery<Bid[]>({
    queryKey: ["/api/auctions", viewDetails?.slug, "bids"],
    enabled: !!viewDetails && viewDetails.auctionType === "auction",
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/auctions/${viewDetails!.slug}/bids`);
      return res.json();
    },
  });

  const createForm = useForm<AuctionFormData>({ resolver: zodResolver(auctionFormSchema), defaultValues: getDefaults() });
  const editForm = useForm<AuctionFormData>({ resolver: zodResolver(auctionFormSchema), defaultValues: getDefaults() });

  const createMutation = useMutation({
    mutationFn: async (data: AuctionFormData) => {
      const res = await apiRequest("POST", "/api/auctions", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/auctions"] });
      setCreateOpen(false);
      createForm.reset(getDefaults());
      toast({ title: "Auction Item Created" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: AuctionFormData }) => {
      const res = await apiRequest("PATCH", `/api/auctions/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/auctions"] });
      setEditItem(null);
      toast({ title: "Auction Item Updated" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { await apiRequest("DELETE", `/api/auctions/${id}`); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/auctions"] });
      toast({ title: "Auction Item Deleted" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  function openEdit(a: AuctionItem) { setEditItem(a); editForm.reset(getDefaults(a)); }

  function AuctionForm({ form, onSubmit, isPending, label }: {
    form: ReturnType<typeof useForm<AuctionFormData>>; onSubmit: (d: AuctionFormData) => void; isPending: boolean; label: string;
  }) {
    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="title" render={({ field }) => (
              <FormItem><FormLabel>Title</FormLabel><FormControl><Input data-testid="input-auction-title" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="slug" render={({ field }) => (
              <FormItem><FormLabel>Slug</FormLabel><FormControl><Input data-testid="input-auction-slug" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <FormField control={form.control} name="auctionType" render={({ field }) => (
            <FormItem><FormLabel>Type</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl><SelectTrigger data-testid="select-auction-type"><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="auction">Auction</SelectItem>
                  <SelectItem value="raffle">Raffle</SelectItem>
                </SelectContent>
              </Select><FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="description" render={({ field }) => (
            <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea rows={3} data-testid="input-auction-desc" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="imageUrl" render={({ field }) => (
            <FormItem><FormLabel>Image URL (optional)</FormLabel><FormControl><Input data-testid="input-auction-image" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <div className="grid grid-cols-3 gap-4">
            <FormField control={form.control} name="startingBid" render={({ field }) => (
              <FormItem><FormLabel>Starting Bid ($)</FormLabel><FormControl><Input type="number" step="0.01" data-testid="input-auction-starting-bid" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="bidIncrement" render={({ field }) => (
              <FormItem><FormLabel>Bid Increment ($)</FormLabel><FormControl><Input type="number" step="0.01" data-testid="input-auction-increment" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="buyNowPrice" render={({ field }) => (
              <FormItem><FormLabel>Buy Now Price ($)</FormLabel><FormControl><Input type="number" step="0.01" data-testid="input-auction-buy-now" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <FormField control={form.control} name="ticketPrice" render={({ field }) => (
            <FormItem><FormLabel>Raffle Ticket Price ($)</FormLabel><FormControl><Input type="number" step="0.01" data-testid="input-auction-ticket-price" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="startDate" render={({ field }) => (
              <FormItem><FormLabel>Start Date</FormLabel><FormControl><Input type="datetime-local" data-testid="input-auction-start" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="endDate" render={({ field }) => (
              <FormItem><FormLabel>End Date</FormLabel><FormControl><Input type="datetime-local" data-testid="input-auction-end" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <FormField control={form.control} name="isActive" render={({ field }) => (
            <FormItem className="flex items-center gap-3"><FormLabel>Active</FormLabel><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-auction-active" /></FormControl></FormItem>
          )} />
          <Button type="submit" disabled={isPending} className="w-full" data-testid="button-auction-submit">{isPending ? "Saving..." : label}</Button>
        </form>
      </Form>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/admin"><Button variant="ghost" size="icon" data-testid="button-back"><ArrowLeft className="w-5 h-5" /></Button></Link>
          <Gavel className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold" data-testid="text-auctions-admin-title">Auctions & Raffles</h1>
          <div className="ml-auto"><Button onClick={() => setCreateOpen(true)} data-testid="button-create-auction"><Plus className="w-4 h-4 mr-2" />Add Item</Button></div>
        </div>

        {isLoading ? (
          <div className="space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-24 w-full" />)}</div>
        ) : !items?.length ? (
          <Card><CardContent className="p-8 text-center text-muted-foreground">No auction items yet</CardContent></Card>
        ) : (
          <div className="space-y-3">
            {items.map(a => (
              <Card key={a.id} data-testid={`card-auction-${a.id}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold" data-testid={`text-auction-title-${a.id}`}>{a.title}</h3>
                        <Badge variant={a.isActive ? "default" : "secondary"}>{a.isActive ? "Active" : "Ended"}</Badge>
                        <Badge variant="outline">{a.auctionType === "auction" ? "Auction" : "Raffle"}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {a.auctionType === "auction" ? (
                          <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />Current Bid: ${Number(a.currentBid).toFixed(2)}</span>
                        ) : (
                          <span className="flex items-center gap-1"><Ticket className="w-3 h-3" />{a.totalTicketsSold} tickets sold</span>
                        )}
                        {a.endDate && <span>Ends: {format(new Date(a.endDate), "MMM d, yyyy")}</span>}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button variant="outline" size="sm" onClick={() => setViewDetails(a)} data-testid={`button-view-auction-${a.id}`}><Eye className="w-4 h-4" /></Button>
                      <Button variant="outline" size="sm" onClick={() => openEdit(a)} data-testid={`button-edit-auction-${a.id}`}><Edit className="w-4 h-4" /></Button>
                      <Button variant="destructive" size="sm" onClick={() => { if (confirm("Delete this item and all bids/tickets?")) deleteMutation.mutate(a.id); }} data-testid={`button-delete-auction-${a.id}`}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Add Auction/Raffle Item</DialogTitle></DialogHeader>
            <AuctionForm form={createForm} onSubmit={(d) => createMutation.mutate(d)} isPending={createMutation.isPending} label="Create Item" />
          </DialogContent>
        </Dialog>

        {editItem && (
          <Dialog open={!!editItem} onOpenChange={(o) => !o && setEditItem(null)}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Edit: {editItem.title}</DialogTitle></DialogHeader>
              <AuctionForm form={editForm} onSubmit={(d) => updateMutation.mutate({ id: editItem.id, data: d })} isPending={updateMutation.isPending} label="Save Changes" />
            </DialogContent>
          </Dialog>
        )}

        {viewDetails && (
          <Dialog open={!!viewDetails} onOpenChange={(o) => !o && setViewDetails(null)}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>{viewDetails.auctionType === "auction" ? "Bids" : "Details"}: {viewDetails.title}</DialogTitle></DialogHeader>
              {viewDetails.auctionType === "auction" ? (
                !bidsData?.length ? (
                  <p className="text-center text-muted-foreground py-4">No bids yet</p>
                ) : (
                  <div className="space-y-2">
                    {bidsData.map((b, i) => (
                      <div key={b.id} className="flex justify-between items-center p-3 border rounded-lg" data-testid={`bid-${b.id}`}>
                        <div>
                          <p className="font-medium">{i === 0 && "🏆 "}{b.bidderName}</p>
                          <p className="text-xs text-muted-foreground">{b.createdAt ? format(new Date(b.createdAt), "MMM d, yyyy h:mm a") : ""}</p>
                        </div>
                        <span className="font-semibold text-green-600">${Number(b.amount).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                <div className="space-y-3">
                  <p><strong>Ticket Price:</strong> ${Number(viewDetails.ticketPrice).toFixed(2)}</p>
                  <p><strong>Tickets Sold:</strong> {viewDetails.totalTicketsSold}</p>
                  <p><strong>Total Revenue:</strong> ${(Number(viewDetails.ticketPrice || 0) * (viewDetails.totalTicketsSold || 0)).toFixed(2)}</p>
                  {viewDetails.winnerName && <p><strong>Winner:</strong> {viewDetails.winnerName} ({viewDetails.winnerEmail})</p>}
                </div>
              )}
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
