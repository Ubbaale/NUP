import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ArrowLeft, Plus, Pencil, Trash2, Flame, Calendar } from "lucide-react";
import type { FallenHero } from "@shared/schema";

function HeroForm({ hero, onClose }: { hero?: FallenHero; onClose: () => void }) {
  const { toast } = useToast();
  const [fullName, setFullName] = useState(hero?.fullName || "");
  const [photoUrl, setPhotoUrl] = useState(hero?.photoUrl || "");
  const [dateOfBirth, setDateOfBirth] = useState(hero?.dateOfBirth || "");
  const [dateOfDeath, setDateOfDeath] = useState(hero?.dateOfDeath || "");
  const [biography, setBiography] = useState(hero?.biography || "");
  const [location, setLocation] = useState(hero?.location || "");
  const [causeOfDeath, setCauseOfDeath] = useState(hero?.causeOfDeath || "");
  const [sortOrder, setSortOrder] = useState(hero?.sortOrder ?? 0);

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/fallen-heroes", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fallen-heroes"] });
      toast({ title: "Hero added to memorial" });
      onClose();
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => apiRequest("PATCH", `/api/fallen-heroes/${hero!.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fallen-heroes"] });
      toast({ title: "Memorial updated" });
      onClose();
    },
    onError: () => toast({ title: "Failed to update", variant: "destructive" }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      fullName,
      photoUrl: photoUrl || null,
      dateOfBirth: dateOfBirth || null,
      dateOfDeath: dateOfDeath || null,
      biography: biography || null,
      location: location || null,
      causeOfDeath: causeOfDeath || null,
      sortOrder,
      featured: false,
    };
    if (hero) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="fullName">Full Name *</Label>
        <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required placeholder="e.g. John Doe" data-testid="input-hero-name" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="dateOfBirth">Date of Birth</Label>
          <Input id="dateOfBirth" type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} data-testid="input-hero-dob" />
        </div>
        <div>
          <Label htmlFor="dateOfDeath">Date of Death</Label>
          <Input id="dateOfDeath" type="date" value={dateOfDeath} onChange={(e) => setDateOfDeath(e.target.value)} data-testid="input-hero-dod" />
        </div>
      </div>
      <div>
        <Label htmlFor="location">Location / Hometown</Label>
        <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Kampala, Uganda" data-testid="input-hero-location" />
      </div>
      <div>
        <Label htmlFor="photoUrl">Photo URL</Label>
        <Input id="photoUrl" value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} placeholder="https://..." data-testid="input-hero-photo" />
      </div>
      <div>
        <Label htmlFor="causeOfDeath">Cause / Circumstances</Label>
        <Input id="causeOfDeath" value={causeOfDeath} onChange={(e) => setCauseOfDeath(e.target.value)} placeholder="Optional" data-testid="input-hero-cause" />
      </div>
      <div>
        <Label htmlFor="biography">Biography</Label>
        <Textarea id="biography" value={biography} onChange={(e) => setBiography(e.target.value)} rows={5} placeholder="Write about this hero's life, contributions, and legacy..." data-testid="input-hero-biography" />
      </div>
      <div>
        <Label htmlFor="sortOrder">Display Order</Label>
        <Input id="sortOrder" type="number" value={sortOrder} onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)} data-testid="input-hero-sort" />
      </div>
      <Button type="submit" disabled={isPending} className="w-full" data-testid="button-save-hero">
        {isPending ? "Saving..." : hero ? "Update Memorial" : "Add to Memorial"}
      </Button>
    </form>
  );
}

export default function FallenHeroesAdmin() {
  const { toast } = useToast();
  const [editHero, setEditHero] = useState<FallenHero | undefined>();
  const [showForm, setShowForm] = useState(false);

  const { data: heroes, isLoading } = useQuery<FallenHero[]>({
    queryKey: ["/api/fallen-heroes"],
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/fallen-heroes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fallen-heroes"] });
      toast({ title: "Removed from memorial" });
    },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
  });

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link href="/admin">
          <Button variant="ghost" className="mb-6" data-testid="button-back-admin">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Admin
          </Button>
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Flame className="w-8 h-8 text-red-500" />
            <div>
              <h1 className="text-3xl font-bold" data-testid="text-admin-fallen-heroes-title">Fallen Heroes Memorial</h1>
              <p className="text-muted-foreground">Honor and remember those who made the ultimate sacrifice</p>
            </div>
          </div>
          <Dialog open={showForm} onOpenChange={(open) => { setShowForm(open); if (!open) setEditHero(undefined); }}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditHero(undefined); setShowForm(true); }} data-testid="button-add-hero">
                <Plus className="w-4 h-4 mr-2" />
                Add Hero
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editHero ? "Edit Memorial" : "Add Fallen Hero"}</DialogTitle>
              </DialogHeader>
              <HeroForm hero={editHero} onClose={() => { setShowForm(false); setEditHero(undefined); }} />
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
          </div>
        ) : heroes && heroes.length > 0 ? (
          <div className="space-y-4">
            {heroes.map(hero => (
              <Card key={hero.id} className="overflow-hidden" data-testid={`admin-hero-${hero.id}`}>
                <CardContent className="p-0">
                  <div className="flex items-center">
                    {hero.photoUrl ? (
                      <div className="w-24 h-24 shrink-0">
                        <img src={hero.photoUrl} alt={hero.fullName} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-24 h-24 shrink-0 bg-red-900/20 flex items-center justify-center">
                        <Flame className="w-8 h-8 text-red-500/40" />
                      </div>
                    )}
                    <div className="flex-1 px-4 py-3">
                      <h3 className="font-bold text-lg">{hero.fullName}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {hero.dateOfBirth && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Born: {hero.dateOfBirth}
                          </span>
                        )}
                        {hero.dateOfDeath && (
                          <span className="flex items-center gap-1 text-red-500">
                            <Calendar className="w-3 h-3" />
                            Died: {hero.dateOfDeath}
                          </span>
                        )}
                        {hero.location && <span>{hero.location}</span>}
                      </div>
                      {hero.biography && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{hero.biography}</p>}
                    </div>
                    <div className="flex gap-2 pr-4">
                      <Button variant="outline" size="sm" onClick={() => { setEditHero(hero); setShowForm(true); }} data-testid={`button-edit-hero-${hero.id}`}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => { if (confirm(`Remove ${hero.fullName} from the memorial?`)) deleteMutation.mutate(hero.id); }} data-testid={`button-delete-hero-${hero.id}`}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <Flame className="w-16 h-16 mx-auto mb-4 text-red-500/30" />
            <h3 className="font-semibold text-lg mb-2">No Heroes Added Yet</h3>
            <p className="text-muted-foreground mb-4">Click "Add Hero" to begin building the memorial.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
