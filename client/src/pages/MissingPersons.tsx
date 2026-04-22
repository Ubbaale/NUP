import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SEO } from "@/components/SEO";
import type { MissingPerson } from "@shared/schema";
import { Search, UserX, AlertTriangle, MapPin, Calendar, Upload, Users, ChevronLeft, ChevronRight, Lock } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import heroImg1 from "@assets/pp001pix-data_1775065332030.jpg";
import heroImg2 from "@assets/nup-supporters1_1775065371716.jpg";
import heroImg3 from "@assets/NUP-supportrs-being-arrested_1775065518887.jpg";
import heroImg4 from "@assets/police-900x570_1775065543588.jpg";

const slides = [
  { src: heroImg1, caption: "Families demand answers — #BringBackOurPeople" },
  { src: heroImg2, caption: "NUP supporters detained and transported by military" },
  { src: heroImg3, caption: "Peaceful supporters arrested during rallies" },
  { src: heroImg4, caption: "Citizens brutalized by security forces" },
];

function HeroSlideshow() {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => setCurrent(c => (c + 1) % slides.length), []);
  const prev = useCallback(() => setCurrent(c => (c - 1 + slides.length) % slides.length), []);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <div className="relative w-full h-full" data-testid="slideshow-missing-persons">
      {slides.map((slide, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-1000 ${i === current ? "opacity-100" : "opacity-0"}`}
        >
          <img src={slide.src} alt={slide.caption} className="w-full h-full object-cover" />
        </div>
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/60" />
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
        data-testid="button-slide-prev"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
        data-testid="button-slide-next"
      >
        <ChevronRight className="w-6 h-6" />
      </button>
      <div className="absolute bottom-6 left-0 right-0 z-20 text-center">
        <p className="text-white/90 text-sm md:text-base font-medium px-4">{slides[current].caption}</p>
        <div className="flex justify-center gap-2 mt-3">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${i === current ? "bg-red-500" : "bg-white/40 hover:bg-white/60"}`}
              data-testid={`button-slide-dot-${i}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function MissingPersons() {
  const { toast } = useToast();
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: persons, isLoading } = useQuery<MissingPerson[]>({
    queryKey: ["/api/missing-persons"],
  });

  const submitMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch("/api/missing-persons/submit", { method: "POST", body: formData });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Submission failed");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Report Submitted", description: "Thank you. Your report will be reviewed by our team before being published." });
      setShowSubmitForm(false);
      queryClient.invalidateQueries({ queryKey: ["/api/missing-persons"] });
    },
    onError: (error: Error) => {
      toast({ title: "Submission Failed", description: error.message, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    submitMutation.mutate(new FormData(e.currentTarget));
  };

  const filtered = persons?.filter(p => {
    const matchesCategory = filterCategory === "all" || p.category === filterCategory;
    const matchesSearch = !searchTerm || p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.location && p.location.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  }) || [];

  const missingCount = persons?.filter(p => p.category === "missing").length || 0;
  const prisonerCount = persons?.filter(p => p.category === "prisoner").length || 0;

  return (
    <div className="min-h-screen">
      <SEO
        title="Missing Persons & Political Prisoners | NUP Diaspora"
        description="Help us find our missing loved ones and bring attention to political prisoners in Uganda. Report missing persons and detained supporters of the struggle."
        keywords="NUP missing persons, Uganda political prisoners, disappeared Ugandans, People Power prisoners, Uganda abductions"
      />

      <section className="relative h-[70vh] md:h-[80vh] overflow-hidden">
        <HeroSlideshow />
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <div className="text-center px-4 max-w-4xl">
            <AlertTriangle className="w-16 h-16 mx-auto mb-6 text-red-500 animate-pulse" />
            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4" data-testid="text-missing-persons-heading">
              Missing Persons & Prisoners
            </h1>
            <p className="text-xl md:text-2xl text-red-300 font-semibold mb-4">#BringBackOurPeople</p>
            <p className="text-lg text-gray-200 max-w-3xl mx-auto mb-8">
              Thousands of Ugandans have been abducted, detained, or imprisoned for exercising their democratic rights.
              Help us bring attention to their cases and demand their freedom.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={() => setShowSubmitForm(true)}
                data-testid="button-report-missing"
              >
                <UserX className="w-5 h-5 mr-2" /> Report Missing Person
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/20"
                onClick={() => document.getElementById("listings")?.scrollIntoView({ behavior: "smooth" })}
                data-testid="button-view-listings"
              >
                <Search className="w-5 h-5 mr-2" /> View All Cases
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-red-700 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-3xl md:text-4xl font-extrabold">{persons?.length || 0}</p>
              <p className="text-red-200 text-sm">Total Cases Reported</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-extrabold">{missingCount}</p>
              <p className="text-red-200 text-sm">Missing Persons</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-extrabold">{prisonerCount}</p>
              <p className="text-red-200 text-sm">Political Prisoners</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-extrabold">∞</p>
              <p className="text-red-200 text-sm">Families Affected</p>
            </div>
          </div>
        </div>
      </section>

      <section id="listings" className="py-12 md:py-20 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Reported Cases</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Each face represents a life, a family waiting, and a story that must be told. Help us find them.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-center items-center">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-missing"
              />
            </div>
            <div className="flex gap-2">
              {[
                { value: "all", label: "All" },
                { value: "missing", label: "Missing" },
                { value: "prisoner", label: "Prisoners" },
                { value: "abducted", label: "Abducted" },
                { value: "detained", label: "Detained" },
              ].map(cat => (
                <Button
                  key={cat.value}
                  variant={filterCategory === cat.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterCategory(cat.value)}
                  data-testid={`button-filter-${cat.value}`}
                >
                  {cat.label}
                </Button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-80 rounded-xl" />)}
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filtered.map(person => (
                <Card key={person.id} className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow" data-testid={`card-missing-person-${person.id}`}>
                  <CardContent className="p-0">
                    {person.photoUrl ? (
                      <div className="h-56 relative">
                        <img
                          src={person.photoUrl}
                          alt={person.fullName}
                          className="w-full h-full object-cover"
                          data-testid={`img-missing-person-${person.id}`}
                        />
                        <Badge className={`absolute top-3 right-3 ${person.category === "prisoner" ? "bg-orange-600" : person.category === "abducted" ? "bg-purple-600" : person.category === "detained" ? "bg-blue-600" : "bg-red-600"} text-white border-0`}>
                          {person.category.charAt(0).toUpperCase() + person.category.slice(1)}
                        </Badge>
                      </div>
                    ) : (
                      <div className="h-56 bg-gradient-to-br from-red-900/30 to-black flex items-center justify-center relative">
                        <UserX className="w-20 h-20 text-red-500/40" />
                        <Badge className={`absolute top-3 right-3 ${person.category === "prisoner" ? "bg-orange-600" : person.category === "abducted" ? "bg-purple-600" : person.category === "detained" ? "bg-blue-600" : "bg-red-600"} text-white border-0`}>
                          {person.category.charAt(0).toUpperCase() + person.category.slice(1)}
                        </Badge>
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="font-bold text-lg mb-1" data-testid={`text-person-name-${person.id}`}>
                        {person.fullName}
                      </h3>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        {person.age && person.gender && (
                          <p>{person.gender}, {person.age} years</p>
                        )}
                        {person.age && !person.gender && <p>Age: {person.age}</p>}
                        {!person.age && person.gender && <p>{person.gender}</p>}
                        {person.location && (
                          <p className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" /> {person.location}
                          </p>
                        )}
                        {person.dateMissing && (
                          <p className="flex items-center gap-1 text-red-500">
                            <Calendar className="w-3.5 h-3.5" /> {person.dateMissing}
                          </p>
                        )}
                        {person.lastSeenLocation && (
                          <p className="text-xs">Last seen: {person.lastSeenLocation}</p>
                        )}
                      </div>
                      {person.description && (
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-3">{person.description}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <UserX className="w-16 h-16 mx-auto mb-4 text-red-500/30" />
              <h3 className="text-xl font-semibold mb-2 text-muted-foreground">
                {searchTerm || filterCategory !== "all" ? "No matching cases found" : "No cases reported yet"}
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm || filterCategory !== "all"
                  ? "Try adjusting your search or filter."
                  : "Help us document the missing and detained. Your report could help bring someone home."}
              </p>
              {!searchTerm && filterCategory === "all" && (
                <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white text-lg px-8 py-6" onClick={() => setShowSubmitForm(true)} data-testid="button-report-missing-empty">
                  <UserX className="w-5 h-5 mr-2" /> Report a Missing Person
                </Button>
              )}
            </div>
          )}

          <div className="mt-16 text-center">
            <div className="w-24 h-px bg-red-500/50 mx-auto mb-6" />
            <p className="text-red-500 font-semibold text-lg mb-2">#BringBackOurPeople</p>
            <p className="text-muted-foreground mb-6">
              Every report matters. Help us keep the pressure on by reporting missing persons and political prisoners.
            </p>
            <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={() => setShowSubmitForm(true)} data-testid="button-report-missing-bottom">
              <UserX className="w-4 h-4 mr-2" /> Report a Missing Person or Prisoner
            </Button>
          </div>
        </div>
      </section>

      <Dialog open={showSubmitForm} onOpenChange={setShowSubmitForm}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" /> Report Missing Person / Prisoner
            </DialogTitle>
          </DialogHeader>
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-4">
            <p className="text-xs text-amber-800 dark:text-amber-200">
              Your report will be reviewed by our team before being published.
              Your personal information (email, phone) is kept strictly confidential and never displayed publicly.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4" data-testid="form-submit-missing">
            <div className="border-b pb-4">
              <p className="text-sm font-medium mb-3">About the Missing Person / Prisoner:</p>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="mp-fullName">Full Name *</Label>
                  <Input id="mp-fullName" name="fullName" required placeholder="Full name of the person" data-testid="input-mp-name" />
                </div>
                <div>
                  <Label htmlFor="mp-photo">Photo</Label>
                  <Input
                    id="mp-photo"
                    name="photo"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif"
                    data-testid="input-mp-photo"
                    className="cursor-pointer"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">JPEG, PNG, WebP, or GIF — max 10MB</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="mp-age">Age</Label>
                    <Input id="mp-age" name="age" placeholder="e.g. 32" data-testid="input-mp-age" />
                  </div>
                  <div>
                    <Label htmlFor="mp-gender">Gender</Label>
                    <Select name="gender" defaultValue="">
                      <SelectTrigger id="mp-gender" data-testid="input-mp-gender">
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
                  <Label htmlFor="mp-category">Category *</Label>
                  <Select name="category" defaultValue="missing">
                    <SelectTrigger id="mp-category" data-testid="input-mp-category">
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
                  <Label htmlFor="mp-location">Hometown / District</Label>
                  <Input id="mp-location" name="location" placeholder="e.g. Kampala, Uganda" data-testid="input-mp-location" />
                </div>
                <div>
                  <Label htmlFor="mp-dateMissing">Date Missing / Arrested (include year)</Label>
                  <Input id="mp-dateMissing" name="dateMissing" placeholder="e.g. November 18, 2020" data-testid="input-mp-date" />
                </div>
                <div>
                  <Label htmlFor="mp-lastSeen">Last Seen Location</Label>
                  <Input id="mp-lastSeen" name="lastSeenLocation" placeholder="Where they were last seen" data-testid="input-mp-lastseen" />
                </div>
                <div>
                  <Label htmlFor="mp-description">Description / Details</Label>
                  <Textarea id="mp-description" name="description" rows={4} placeholder="Please provide any details that might help — physical description, circumstances of disappearance, known detention facility, etc." data-testid="input-mp-description" />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <p className="text-sm font-medium mb-1 flex items-center gap-1">
                Your Information <Lock className="w-3.5 h-3.5 text-muted-foreground" />
              </p>
              <p className="text-[10px] text-muted-foreground mb-3">Kept strictly confidential — never displayed publicly</p>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="mp-submitterName">Your Name *</Label>
                  <Input id="mp-submitterName" name="submitterName" required placeholder="Your full name" data-testid="input-mp-submitter-name" />
                </div>
                <div>
                  <Label htmlFor="mp-submitterEmail">Your Email *</Label>
                  <Input id="mp-submitterEmail" name="submitterEmail" type="email" required placeholder="your@email.com" data-testid="input-mp-submitter-email" />
                </div>
                <div>
                  <Label htmlFor="mp-submitterPhone">Your Phone (optional)</Label>
                  <Input id="mp-submitterPhone" name="submitterPhone" type="tel" placeholder="+256..." data-testid="input-mp-submitter-phone" />
                </div>
                <div>
                  <Label htmlFor="mp-relationship">Relationship to the Person</Label>
                  <Input id="mp-relationship" name="submitterRelationship" placeholder="e.g. Family member, Friend, Witness" data-testid="input-mp-relationship" />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white"
              disabled={submitMutation.isPending}
              data-testid="button-submit-mp-form"
            >
              {submitMutation.isPending ? "Submitting..." : <><AlertTriangle className="w-4 h-4 mr-2" /> Submit Report for Review</>}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
