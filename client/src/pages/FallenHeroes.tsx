import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SEO } from "@/components/SEO";
import { format, differenceInYears, parseISO } from "date-fns";
import type { FallenHero } from "@shared/schema";
import { Flame, Heart, Upload, MapPin, Calendar, User, ImagePlus } from "lucide-react";
import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

function calculateAge(dob: string, dod: string): number | null {
  try {
    return differenceInYears(parseISO(dod), parseISO(dob));
  } catch {
    return null;
  }
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  try {
    return format(parseISO(dateStr), "MMMM d, yyyy");
  } catch {
    return dateStr;
  }
}

export default function FallenHeroes() {
  const { toast } = useToast();
  const { data: heroes, isLoading } = useQuery<FallenHero[]>({
    queryKey: ["/api/fallen-heroes"],
  });
  const [showSubmitForm, setShowSubmitForm] = useState(false);

  const submitMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch("/api/fallen-heroes/submit", { method: "POST", body: formData });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Submission failed");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Submission Received", description: "Thank you. Your loved one's memorial will be reviewed and added to the page." });
      setShowSubmitForm(false);
      queryClient.invalidateQueries({ queryKey: ["/api/fallen-heroes"] });
    },
    onError: (error: Error) => {
      toast({ title: "Submission Failed", description: error.message, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    submitMutation.mutate(new FormData(e.currentTarget));
  };

  return (
    <div className="min-h-screen">
      <SEO
        title="In Eternal Memory — Our Fallen Heroes | NUP Diaspora"
        description="Honoring the brave men and women who gave their lives in the struggle for freedom, democracy, and justice in Uganda. Their sacrifice will never be forgotten."
        keywords="NUP fallen heroes, Uganda martyrs, People Power heroes, NUP memorial, Uganda freedom fighters"
      />

      <section className="relative py-28 md:py-36 overflow-hidden bg-black">
        <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/70 to-black/90" />
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 50% 50%, rgba(220,38,38,0.3) 0%, transparent 70%)" }} />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <Flame className="w-16 h-16 mx-auto mb-6 text-red-500 animate-pulse" />
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4" data-testid="text-fallen-heroes-heading">
            In Eternal Memory
          </h1>
          <p className="text-xl md:text-2xl text-red-300 font-semibold mb-4">Our Fallen Heroes</p>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto mb-8">
            We honor the brave men and women who made the ultimate sacrifice in the struggle for freedom,
            democracy, and justice in Uganda. Their courage lives on in every step we take toward liberation.
          </p>
          <Button
            size="lg"
            variant="outline"
            className="border-red-500 text-red-300 hover:bg-red-500/20 hover:text-white"
            onClick={() => setShowSubmitForm(true)}
            data-testid="button-submit-hero"
          >
            <Heart className="w-5 h-5 mr-2" /> Honor a Loved One
          </Button>
        </div>
      </section>

      <section className="py-12 md:py-20 bg-gradient-to-b from-black to-background">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12">
            <p className="text-muted-foreground italic text-lg max-w-2xl mx-auto">
              "The heroes of yesterday are the foundation of tomorrow. We shall never forget their sacrifice."
            </p>
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 gap-8">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-72 rounded-2xl" />
              ))}
            </div>
          ) : heroes && heroes.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-8">
              {heroes.map(hero => {
                const age = hero.dateOfBirth && hero.dateOfDeath ? calculateAge(hero.dateOfBirth, hero.dateOfDeath) : null;
                return (
                  <Card key={hero.id} className="overflow-hidden border-0 shadow-xl bg-card/80 backdrop-blur" data-testid={`card-fallen-hero-${hero.id}`}>
                    <CardContent className="p-0">
                      <div className="flex flex-col sm:flex-row">
                        {hero.photoUrl ? (
                          <div className="sm:w-48 h-56 sm:h-auto shrink-0">
                            <img
                              src={hero.photoUrl}
                              alt={hero.fullName}
                              className="w-full h-full object-cover"
                              data-testid={`img-fallen-hero-${hero.id}`}
                            />
                          </div>
                        ) : (
                          <div className="sm:w-48 h-56 sm:h-auto shrink-0 bg-gradient-to-br from-red-900/30 to-black flex items-center justify-center">
                            <Flame className="w-16 h-16 text-red-500/50" />
                          </div>
                        )}
                        <div className="p-6 flex-1">
                          <h3 className="text-xl font-bold mb-1" data-testid={`text-hero-name-${hero.id}`}>
                            {hero.fullName}
                          </h3>
                          {age !== null && (
                            <p className="text-sm text-muted-foreground mb-2">Age {age}</p>
                          )}
                          <div className="space-y-1 mb-3">
                            {hero.dateOfBirth && (
                              <p className="text-sm">
                                <span className="text-muted-foreground">Born:</span>{" "}
                                <span className="font-medium">{formatDate(hero.dateOfBirth)}</span>
                              </p>
                            )}
                            {hero.dateOfDeath && (
                              <p className="text-sm">
                                <span className="text-muted-foreground">Died:</span>{" "}
                                <span className="font-medium text-red-500">{formatDate(hero.dateOfDeath)}</span>
                              </p>
                            )}
                            {hero.location && (
                              <p className="text-sm">
                                <span className="text-muted-foreground">From:</span>{" "}
                                <span className="font-medium">{hero.location}</span>
                              </p>
                            )}
                            {hero.causeOfDeath && (
                              <p className="text-sm">
                                <span className="text-muted-foreground">Cause:</span>{" "}
                                <span className="font-medium">{hero.causeOfDeath}</span>
                              </p>
                            )}
                          </div>
                          {hero.biography && (
                            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">
                              {hero.biography}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20">
              <Flame className="w-16 h-16 mx-auto mb-4 text-red-500/30" />
              <h3 className="text-xl font-semibold mb-2 text-muted-foreground">Memorial Under Construction</h3>
              <p className="text-muted-foreground mb-6">Help us build this memorial. Submit the names and stories of loved ones lost in the struggle.</p>
              <Button onClick={() => setShowSubmitForm(true)} data-testid="button-submit-hero-empty">
                <Heart className="w-4 h-4 mr-2" /> Honor a Loved One
              </Button>
            </div>
          )}

          {heroes && heroes.length > 0 && (
            <div className="mt-16 text-center">
              <div className="w-24 h-px bg-red-500/50 mx-auto mb-6" />
              <p className="text-red-400 font-semibold text-lg mb-2">Rest In Power</p>
              <p className="text-muted-foreground mb-6">
                Their sacrifice fuels our determination. The struggle continues until Uganda is free.
              </p>
              <Button variant="outline" onClick={() => setShowSubmitForm(true)} data-testid="button-submit-hero-bottom">
                <Heart className="w-4 h-4 mr-2" /> Know someone we missed? Help us honor them.
              </Button>
            </div>
          )}
        </div>
      </section>

      <Dialog open={showSubmitForm} onOpenChange={setShowSubmitForm}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500" /> Honor a Fallen Hero
            </DialogTitle>
          </DialogHeader>
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-4">
            <p className="text-xs text-amber-800 dark:text-amber-200">
              Help us remember those who gave their lives for freedom. Your submission will be reviewed by our team before being added to the memorial.
              Your contact information is kept confidential and never displayed publicly.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4" data-testid="form-submit-hero">
            <div className="border-b pb-4">
              <p className="text-sm font-medium mb-3">About the Hero:</p>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="hero-fullName">Full Name *</Label>
                  <Input id="hero-fullName" name="fullName" required placeholder="Full name of the fallen hero" data-testid="input-submit-hero-name" />
                </div>
                <div>
                  <Label htmlFor="hero-photo">Photo</Label>
                  <Input
                    id="hero-photo"
                    name="photo"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif"
                    data-testid="input-submit-hero-photo"
                    className="cursor-pointer"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">JPEG, PNG, WebP, or GIF — max 10MB</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="hero-dob">Date of Birth</Label>
                    <Input id="hero-dob" name="dateOfBirth" type="date" data-testid="input-submit-hero-dob" />
                  </div>
                  <div>
                    <Label htmlFor="hero-dod">Date of Death</Label>
                    <Input id="hero-dod" name="dateOfDeath" type="date" data-testid="input-submit-hero-dod" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="hero-location">Hometown / Location</Label>
                  <Input id="hero-location" name="location" placeholder="e.g. Kampala, Uganda" data-testid="input-submit-hero-location" />
                </div>
                <div>
                  <Label htmlFor="hero-cause">Cause / Circumstances of Death</Label>
                  <Input id="hero-cause" name="causeOfDeath" placeholder="How they lost their life" data-testid="input-submit-hero-cause" />
                </div>
                <div>
                  <Label htmlFor="hero-biography">Biography / Story</Label>
                  <Textarea id="hero-biography" name="biography" rows={4} placeholder="Tell us about this hero — who they were, what they stood for, and how they contributed to the struggle..." data-testid="input-submit-hero-biography" />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <p className="text-sm font-medium mb-3">Your Information (kept confidential):</p>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="hero-submitterName">Your Name *</Label>
                  <Input id="hero-submitterName" name="submitterName" required placeholder="Your full name" data-testid="input-submit-hero-submitter-name" />
                </div>
                <div>
                  <Label htmlFor="hero-submitterEmail">Your Email *</Label>
                  <Input id="hero-submitterEmail" name="submitterEmail" type="email" required placeholder="your@email.com" data-testid="input-submit-hero-submitter-email" />
                </div>
                <div>
                  <Label htmlFor="hero-submitterPhone">Your Phone (optional)</Label>
                  <Input id="hero-submitterPhone" name="submitterPhone" type="tel" placeholder="+256..." data-testid="input-submit-hero-submitter-phone" />
                </div>
                <div>
                  <Label htmlFor="hero-submitterRelationship">Relationship to the Hero</Label>
                  <Input id="hero-submitterRelationship" name="submitterRelationship" placeholder="e.g. Family member, Friend, Community member" data-testid="input-submit-hero-relationship" />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white"
              disabled={submitMutation.isPending}
              data-testid="button-submit-hero-form"
            >
              {submitMutation.isPending ? "Submitting..." : <><Heart className="w-4 h-4 mr-2" /> Submit Memorial for Review</>}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
