import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  ArrowLeft, Plus, Pencil, Trash2, Flame, Calendar,
  CheckCircle, XCircle, Clock, User, Mail, Phone, Heart,
  ChevronDown, ChevronUp, Eye
} from "lucide-react";
import type { FallenHero } from "@shared/schema";

export default function FallenHeroesAdmin() {
  const { toast } = useToast();
  const [editHero, setEditHero] = useState<FallenHero | undefined>();
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});

  const { data: heroes, isLoading } = useQuery<FallenHero[]>({
    queryKey: ["/api/admin/fallen-heroes"],
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<FallenHero> }) => {
      const res = await apiRequest("PATCH", `/api/fallen-heroes/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/fallen-heroes"] });
      toast({ title: "Hero Updated" });
    },
    onError: () => toast({ title: "Update Failed", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/fallen-heroes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/fallen-heroes"] });
      toast({ title: "Removed from memorial" });
    },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
  });

  const createMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch("/api/fallen-heroes", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/fallen-heroes"] });
      toast({ title: "Hero added to memorial" });
      setShowForm(false);
    },
    onError: () => toast({ title: "Failed to create", variant: "destructive" }),
  });

  const handleAdminCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    createMutation.mutate(new FormData(e.currentTarget));
  };

  const filtered = heroes?.filter(h => filter === "all" || h.status === filter) || [];
  const pendingCount = heroes?.filter(h => h.status === "pending").length || 0;
  const approvedCount = heroes?.filter(h => h.status === "approved").length || 0;
  const rejectedCount = heroes?.filter(h => h.status === "rejected").length || 0;

  const statusColor: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    approved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Flame className="w-8 h-8 text-red-500" />
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-admin-fallen-heroes-title">Fallen Heroes Memorial</h1>
            <p className="text-muted-foreground">Honor, review and manage memorial submissions</p>
          </div>
        </div>
        <Button onClick={() => { setEditHero(undefined); setShowForm(true); }} data-testid="button-add-hero">
          <Plus className="w-4 h-4 mr-2" /> Add Hero
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:border-primary" onClick={() => setFilter("all")} data-testid="card-hero-filter-all">
          <CardContent className="p-4 text-center">
            <Flame className="w-6 h-6 mx-auto mb-1 text-muted-foreground" />
            <p className="text-2xl font-bold">{heroes?.length || 0}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-yellow-500" onClick={() => setFilter("pending")} data-testid="card-hero-filter-pending">
          <CardContent className="p-4 text-center">
            <Clock className="w-6 h-6 mx-auto mb-1 text-yellow-500" />
            <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
            <p className="text-xs text-muted-foreground">Pending Review</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-green-500" onClick={() => setFilter("approved")} data-testid="card-hero-filter-approved">
          <CardContent className="p-4 text-center">
            <CheckCircle className="w-6 h-6 mx-auto mb-1 text-green-500" />
            <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
            <p className="text-xs text-muted-foreground">On Memorial</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-red-500" onClick={() => setFilter("rejected")} data-testid="card-hero-filter-rejected">
          <CardContent className="p-4 text-center">
            <XCircle className="w-6 h-6 mx-auto mb-1 text-red-500" />
            <p className="text-2xl font-bold text-red-600">{rejectedCount}</p>
            <p className="text-xs text-muted-foreground">Rejected</p>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <Flame className="w-16 h-16 mx-auto mb-4 text-red-500/30" />
          <h3 className="font-semibold text-lg mb-2">No Heroes {filter !== "all" ? `(${filter})` : ""}</h3>
          <p className="text-muted-foreground">Click "Add Hero" to add someone to the memorial, or wait for public submissions.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map(hero => (
            <Card key={hero.id} className="overflow-hidden" data-testid={`admin-hero-${hero.id}`}>
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  {hero.photoUrl ? (
                    <div className="md:w-32 h-32 md:h-auto shrink-0">
                      <img src={hero.photoUrl} alt={hero.fullName} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="md:w-32 h-32 md:h-auto shrink-0 bg-red-900/20 flex items-center justify-center">
                      <Flame className="w-10 h-10 text-red-500/40" />
                    </div>
                  )}
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h3 className="font-bold text-lg">{hero.fullName}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={`text-[10px] ${statusColor[hero.status] || ""}`}>
                            {hero.status === "pending" && <Clock className="w-3 h-3 mr-0.5" />}
                            {hero.status === "approved" && <CheckCircle className="w-3 h-3 mr-0.5" />}
                            {hero.status === "rejected" && <XCircle className="w-3 h-3 mr-0.5" />}
                            {hero.status.charAt(0).toUpperCase() + hero.status.slice(1)}
                          </Badge>
                          {hero.submitterName && (
                            <Badge variant="outline" className="text-[10px]">Public Submission</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        {hero.status !== "approved" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 hover:bg-green-50"
                            onClick={() => updateMutation.mutate({ id: hero.id, data: { status: "approved" } })}
                            data-testid={`button-approve-hero-${hero.id}`}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" /> Approve
                          </Button>
                        )}
                        {hero.status !== "rejected" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => updateMutation.mutate({ id: hero.id, data: { status: "rejected" } })}
                            data-testid={`button-reject-hero-${hero.id}`}
                          >
                            <XCircle className="w-4 h-4 mr-1" /> Reject
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            if (confirm(`Permanently remove ${hero.fullName} from the memorial?`)) {
                              deleteMutation.mutate(hero.id);
                            }
                          }}
                          data-testid={`button-delete-hero-${hero.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-2">
                      {hero.dateOfBirth && (
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Born: {hero.dateOfBirth}</span>
                      )}
                      {hero.dateOfDeath && (
                        <span className="flex items-center gap-1 text-red-500"><Calendar className="w-3 h-3" /> Died: {hero.dateOfDeath}</span>
                      )}
                      {hero.location && <span>{hero.location}</span>}
                      {hero.causeOfDeath && <span>Cause: {hero.causeOfDeath}</span>}
                    </div>
                    {hero.biography && <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{hero.biography}</p>}

                    {hero.submitterName && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs"
                        onClick={() => setExpandedId(expandedId === hero.id ? null : hero.id)}
                        data-testid={`button-details-hero-${hero.id}`}
                      >
                        {expandedId === hero.id ? <ChevronUp className="w-3 h-3 mr-1" /> : <ChevronDown className="w-3 h-3 mr-1" />}
                        Submitter Details & Notes
                      </Button>
                    )}

                    {expandedId === hero.id && hero.submitterName && (
                      <div className="mt-3 p-3 bg-muted/50 rounded-lg space-y-3">
                        <div className="flex flex-wrap gap-4 text-sm">
                          <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> {hero.submitterName}</span>
                          {hero.submitterEmail && <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {hero.submitterEmail}</span>}
                          {hero.submitterPhone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {hero.submitterPhone}</span>}
                          {hero.submitterRelationship && <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" /> {hero.submitterRelationship}</span>}
                        </div>
                        <div>
                          <label className="text-xs font-medium mb-1 block">Admin Notes:</label>
                          <Textarea
                            rows={2}
                            value={adminNotes[hero.id] ?? hero.adminNotes ?? ""}
                            onChange={(e) => setAdminNotes({ ...adminNotes, [hero.id]: e.target.value })}
                            placeholder="Internal notes about this submission..."
                            data-testid={`input-hero-admin-notes-${hero.id}`}
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            className="mt-2"
                            onClick={() => updateMutation.mutate({ id: hero.id, data: { adminNotes: adminNotes[hero.id] ?? hero.adminNotes ?? "" } })}
                            data-testid={`button-save-hero-notes-${hero.id}`}
                          >
                            Save Notes
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={(open) => { setShowForm(open); if (!open) setEditHero(undefined); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Fallen Hero (Admin)</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdminCreate} className="space-y-4" data-testid="form-admin-hero">
            <div>
              <Label htmlFor="admin-hero-name">Full Name *</Label>
              <Input id="admin-hero-name" name="fullName" required placeholder="Full name" data-testid="input-admin-hero-name" />
            </div>
            <div>
              <Label htmlFor="admin-hero-photo">Photo</Label>
              <Input
                id="admin-hero-photo"
                name="photo"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                data-testid="input-admin-hero-photo"
                className="cursor-pointer"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="admin-hero-dob">Date of Birth</Label>
                <Input id="admin-hero-dob" name="dateOfBirth" type="date" data-testid="input-admin-hero-dob" />
              </div>
              <div>
                <Label htmlFor="admin-hero-dod">Date of Death</Label>
                <Input id="admin-hero-dod" name="dateOfDeath" type="date" data-testid="input-admin-hero-dod" />
              </div>
            </div>
            <div>
              <Label htmlFor="admin-hero-location">Location</Label>
              <Input id="admin-hero-location" name="location" placeholder="e.g. Kampala" data-testid="input-admin-hero-location" />
            </div>
            <div>
              <Label htmlFor="admin-hero-cause">Cause / Circumstances</Label>
              <Input id="admin-hero-cause" name="causeOfDeath" placeholder="How they lost their life" data-testid="input-admin-hero-cause" />
            </div>
            <div>
              <Label htmlFor="admin-hero-bio">Biography</Label>
              <Textarea id="admin-hero-bio" name="biography" rows={4} placeholder="Their story..." data-testid="input-admin-hero-biography" />
            </div>
            <div>
              <Label htmlFor="admin-hero-sort">Sort Order</Label>
              <Input id="admin-hero-sort" name="sortOrder" type="number" defaultValue={0} data-testid="input-admin-hero-sort" />
            </div>
            <Button type="submit" className="w-full" disabled={createMutation.isPending} data-testid="button-save-hero">
              {createMutation.isPending ? "Saving..." : "Add to Memorial (Approved)"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
