import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Plus, Trash2, UserX, Calendar,
  CheckCircle, XCircle, Clock, User, Mail, Phone,
  ChevronDown, ChevronUp, MapPin, AlertTriangle, Lock
} from "lucide-react";
import type { MissingPerson } from "@shared/schema";

export default function MissingPersonsAdmin() {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});

  const { data: persons, isLoading } = useQuery<MissingPerson[]>({
    queryKey: ["/api/admin/missing-persons"],
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<MissingPerson> }) => {
      const res = await apiRequest("PATCH", `/api/missing-persons/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/missing-persons"] });
      toast({ title: "Updated" });
    },
    onError: () => toast({ title: "Update Failed", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/missing-persons/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/missing-persons"] });
      toast({ title: "Entry removed" });
    },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
  });

  const createMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch("/api/missing-persons", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/missing-persons"] });
      toast({ title: "Person added to the list" });
      setShowForm(false);
    },
    onError: () => toast({ title: "Failed to create", variant: "destructive" }),
  });

  const handleAdminCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    createMutation.mutate(new FormData(e.currentTarget));
  };

  const filtered = persons?.filter(p => filter === "all" || p.status === filter) || [];
  const pendingCount = persons?.filter(p => p.status === "pending").length || 0;
  const approvedCount = persons?.filter(p => p.status === "approved").length || 0;
  const rejectedCount = persons?.filter(p => p.status === "rejected").length || 0;

  const statusColor: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    approved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  };

  const categoryColor: Record<string, string> = {
    missing: "bg-red-600",
    prisoner: "bg-orange-600",
    abducted: "bg-purple-600",
    detained: "bg-blue-600",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <UserX className="w-8 h-8 text-red-500" />
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-admin-missing-persons-title">Missing Persons & Prisoners</h1>
            <p className="text-muted-foreground">Review and manage public reports</p>
          </div>
        </div>
        <Button onClick={() => setShowForm(true)} data-testid="button-add-missing-person">
          <Plus className="w-4 h-4 mr-2" /> Add Person
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:border-primary" onClick={() => setFilter("all")} data-testid="card-mp-filter-all">
          <CardContent className="p-4 text-center">
            <UserX className="w-6 h-6 mx-auto mb-1 text-muted-foreground" />
            <p className="text-2xl font-bold">{persons?.length || 0}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-yellow-500" onClick={() => setFilter("pending")} data-testid="card-mp-filter-pending">
          <CardContent className="p-4 text-center">
            <Clock className="w-6 h-6 mx-auto mb-1 text-yellow-500" />
            <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
            <p className="text-xs text-muted-foreground">Pending Review</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-green-500" onClick={() => setFilter("approved")} data-testid="card-mp-filter-approved">
          <CardContent className="p-4 text-center">
            <CheckCircle className="w-6 h-6 mx-auto mb-1 text-green-500" />
            <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
            <p className="text-xs text-muted-foreground">Published</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-red-500" onClick={() => setFilter("rejected")} data-testid="card-mp-filter-rejected">
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
          <UserX className="w-16 h-16 mx-auto mb-4 text-red-500/30" />
          <h3 className="font-semibold text-lg mb-2">No Entries {filter !== "all" ? `(${filter})` : ""}</h3>
          <p className="text-muted-foreground">Add entries or wait for public submissions.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map(person => (
            <Card key={person.id} className="overflow-hidden" data-testid={`admin-mp-${person.id}`}>
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  {person.photoUrl ? (
                    <div className="md:w-32 h-32 md:h-auto shrink-0">
                      <img src={person.photoUrl} alt={person.fullName} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="md:w-32 h-32 md:h-auto shrink-0 bg-red-900/20 flex items-center justify-center">
                      <UserX className="w-10 h-10 text-red-500/40" />
                    </div>
                  )}
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h3 className="font-bold text-lg">{person.fullName}</h3>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <Badge className={`text-[10px] ${statusColor[person.status] || ""}`}>
                            {person.status === "pending" && <Clock className="w-3 h-3 mr-0.5" />}
                            {person.status === "approved" && <CheckCircle className="w-3 h-3 mr-0.5" />}
                            {person.status === "rejected" && <XCircle className="w-3 h-3 mr-0.5" />}
                            {person.status.charAt(0).toUpperCase() + person.status.slice(1)}
                          </Badge>
                          <Badge className={`text-[10px] text-white border-0 ${categoryColor[person.category] || "bg-gray-600"}`}>
                            {person.category.charAt(0).toUpperCase() + person.category.slice(1)}
                          </Badge>
                          {person.submitterName && person.submitterName !== "Admin" && (
                            <Badge variant="outline" className="text-[10px]">Public Submission</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        {person.status !== "approved" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 hover:bg-green-50"
                            onClick={() => updateMutation.mutate({ id: person.id, data: { status: "approved" } })}
                            data-testid={`button-approve-mp-${person.id}`}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" /> Approve
                          </Button>
                        )}
                        {person.status !== "rejected" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => updateMutation.mutate({ id: person.id, data: { status: "rejected" } })}
                            data-testid={`button-reject-mp-${person.id}`}
                          >
                            <XCircle className="w-4 h-4 mr-1" /> Reject
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            if (confirm(`Remove ${person.fullName}?`)) deleteMutation.mutate(person.id);
                          }}
                          data-testid={`button-delete-mp-${person.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-2">
                      {person.age && <span>Age: {person.age}</span>}
                      {person.gender && <span>{person.gender}</span>}
                      {person.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {person.location}</span>}
                      {person.dateMissing && <span className="flex items-center gap-1 text-red-500"><Calendar className="w-3 h-3" /> {person.dateMissing}</span>}
                      {person.lastSeenLocation && <span>Last seen: {person.lastSeenLocation}</span>}
                    </div>
                    {person.description && <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{person.description}</p>}

                    {person.submitterName && person.submitterName !== "Admin" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs"
                        onClick={() => setExpandedId(expandedId === person.id ? null : person.id)}
                        data-testid={`button-details-mp-${person.id}`}
                      >
                        {expandedId === person.id ? <ChevronUp className="w-3 h-3 mr-1" /> : <ChevronDown className="w-3 h-3 mr-1" />}
                        Submitter Details & Notes
                      </Button>
                    )}

                    {expandedId === person.id && person.submitterName && person.submitterName !== "Admin" && (
                      <div className="mt-3 p-3 bg-muted/50 rounded-lg space-y-3">
                        <div className="flex flex-wrap gap-4 text-sm">
                          <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> {person.submitterName}</span>
                          {person.submitterEmail && <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {person.submitterEmail}</span>}
                          {person.submitterPhone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {person.submitterPhone}</span>}
                          {person.submitterRelationship && <span className="flex items-center gap-1"><Lock className="w-3.5 h-3.5" /> {person.submitterRelationship}</span>}
                        </div>
                        <div>
                          <label className="text-xs font-medium mb-1 block">Admin Notes:</label>
                          <Textarea
                            rows={2}
                            value={adminNotes[person.id] ?? person.adminNotes ?? ""}
                            onChange={(e) => setAdminNotes({ ...adminNotes, [person.id]: e.target.value })}
                            placeholder="Internal notes..."
                            data-testid={`input-mp-admin-notes-${person.id}`}
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            className="mt-2"
                            onClick={() => updateMutation.mutate({ id: person.id, data: { adminNotes: adminNotes[person.id] ?? person.adminNotes ?? "" } })}
                            data-testid={`button-save-mp-notes-${person.id}`}
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

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Missing Person / Prisoner (Admin)</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdminCreate} className="space-y-4" data-testid="form-admin-mp">
            <div>
              <Label htmlFor="admin-mp-name">Full Name *</Label>
              <Input id="admin-mp-name" name="fullName" required placeholder="Full name" data-testid="input-admin-mp-name" />
            </div>
            <div>
              <Label htmlFor="admin-mp-photo">Photo</Label>
              <Input id="admin-mp-photo" name="photo" type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="cursor-pointer" data-testid="input-admin-mp-photo" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="admin-mp-age">Age</Label>
                <Input id="admin-mp-age" name="age" placeholder="e.g. 32" data-testid="input-admin-mp-age" />
              </div>
              <div>
                <Label htmlFor="admin-mp-gender">Gender</Label>
                <Select name="gender" defaultValue="">
                  <SelectTrigger id="admin-mp-gender" data-testid="input-admin-mp-gender">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="admin-mp-category">Category</Label>
              <Select name="category" defaultValue="missing">
                <SelectTrigger id="admin-mp-category" data-testid="input-admin-mp-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="missing">Missing Person</SelectItem>
                  <SelectItem value="prisoner">Political Prisoner</SelectItem>
                  <SelectItem value="abducted">Abducted</SelectItem>
                  <SelectItem value="detained">Detained</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="admin-mp-location">Location</Label>
              <Input id="admin-mp-location" name="location" placeholder="e.g. Kampala" data-testid="input-admin-mp-location" />
            </div>
            <div>
              <Label htmlFor="admin-mp-date">Date Missing / Arrested</Label>
              <Input id="admin-mp-date" name="dateMissing" placeholder="e.g. November 18, 2020" data-testid="input-admin-mp-date" />
            </div>
            <div>
              <Label htmlFor="admin-mp-lastseen">Last Seen Location</Label>
              <Input id="admin-mp-lastseen" name="lastSeenLocation" placeholder="Where last seen" data-testid="input-admin-mp-lastseen" />
            </div>
            <div>
              <Label htmlFor="admin-mp-desc">Description</Label>
              <Textarea id="admin-mp-desc" name="description" rows={3} placeholder="Details..." data-testid="input-admin-mp-description" />
            </div>
            <Button type="submit" className="w-full" disabled={createMutation.isPending} data-testid="button-save-mp">
              {createMutation.isPending ? "Saving..." : "Add (Auto-Approved)"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
