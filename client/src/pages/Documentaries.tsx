import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { SEO } from "@/components/SEO";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Film, Play, Clock, Calendar, ExternalLink, Star, Eye, Upload, AlertTriangle, CheckCircle, Video, MapPin } from "lucide-react";
import type { Documentary } from "@shared/schema";
import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

function getVimeoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(\d+)/);
  return match ? match[1] : null;
}

function getEmbedUrl(url: string): string | null {
  const ytId = getYouTubeId(url);
  if (ytId) return `https://www.youtube.com/embed/${ytId}`;
  const vimeoId = getVimeoId(url);
  if (vimeoId) return `https://player.vimeo.com/video/${vimeoId}`;
  return null;
}

function getThumbnail(doc: Documentary): string {
  if (doc.thumbnailUrl) return doc.thumbnailUrl;
  const ytId = getYouTubeId(doc.videoUrl);
  if (ytId) return `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
  return "";
}

const categoryLabels: Record<string, string> = {
  general: "General",
  elections: "Elections & Democracy",
  protests: "Protests & Resistance",
  human_rights: "Human Rights",
  political_prisoners: "Political Prisoners",
  history: "History",
  interviews: "Interviews & Testimonies",
};

interface WitnessVideoPublic {
  id: string;
  title: string;
  description: string | null;
  videoUrl: string;
  thumbnailUrl: string | null;
  location: string | null;
  incidentDate: string | null;
  submitterName: string;
  status: string;
  createdAt: string;
}

export default function Documentaries() {
  const { toast } = useToast();
  const { data: docs, isLoading } = useQuery<Documentary[]>({
    queryKey: ["/api/documentaries"],
  });
  const { data: witnessVideos, isLoading: witnessLoading } = useQuery<WitnessVideoPublic[]>({
    queryKey: ["/api/witness-videos"],
  });
  const [activeVideo, setActiveVideo] = useState<Documentary | null>(null);
  const [activeWitness, setActiveWitness] = useState<WitnessVideoPublic | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const submitMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      setUploadProgress(true);
      const res = await fetch("/api/witness-videos", { method: "POST", body: formData });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Submission failed");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Video Submitted", description: "Your video has been submitted for review. It will appear once approved by our team." });
      setShowSubmitForm(false);
      setUploadProgress(false);
      queryClient.invalidateQueries({ queryKey: ["/api/witness-videos"] });
    },
    onError: (error: Error) => {
      toast({ title: "Submission Failed", description: error.message, variant: "destructive" });
      setUploadProgress(false);
    },
  });

  const handleWitnessSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    submitMutation.mutate(fd);
  };

  const categories = docs
    ? ["all", ...Array.from(new Set(docs.map(d => d.category || "general")))]
    : ["all"];

  const filtered = docs?.filter(d =>
    selectedCategory === "all" || (d.category || "general") === selectedCategory
  ) || [];

  const featured = filtered.filter(d => d.isFeatured);
  const regular = filtered.filter(d => !d.isFeatured);

  return (
    <div className="min-h-screen py-8">
      <SEO
        title="Documentaries - Truth & Justice"
        description="Watch documentaries about the struggle for democracy in Uganda. Historical footage, testimonies, and investigative reports on human rights and political resistance."
        keywords="Uganda documentaries, NUP documentary, Bobi Wine documentary, Uganda human rights, Uganda democracy, Uganda atrocities, People Power documentary"
      />
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            <Film className="w-3 h-3 mr-1" /> Truth & Justice
          </Badge>
          <h1 className="text-4xl font-bold mb-4" data-testid="text-documentaries-title">
            Documentaries
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Important documentaries capturing the struggle for democracy, human rights, and justice in Uganda.
            Watch, learn, and share these stories with the world.
          </p>
        </div>

        {categories.length > 2 && (
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {categories.map(cat => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
                data-testid={`button-category-${cat}`}
              >
                {cat === "all" ? "All" : categoryLabels[cat] || cat}
              </Button>
            ))}
          </div>
        )}

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Skeleton key={i} className="aspect-video rounded-lg" />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <>
            {featured.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" /> Featured
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {featured.map(doc => (
                    <DocumentaryCard key={doc.id} doc={doc} onPlay={setActiveVideo} large />
                  ))}
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regular.map(doc => (
                <DocumentaryCard key={doc.id} doc={doc} onPlay={setActiveVideo} />
              ))}
            </div>
          </>
        ) : (
          <Card className="p-12 text-center border-dashed">
            <Film className="w-16 h-16 mx-auto mb-4 text-muted-foreground/40" />
            <h3 className="text-xl font-semibold mb-2">No Documentaries Yet</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Documentaries about the struggle for democracy and human rights in Uganda will be available here soon.
            </p>
          </Card>
        )}

        {/* When You See, Speak Section */}
        <div className="mt-20 border-t pt-16">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
              <Eye className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-3xl font-bold mb-3" data-testid="text-witness-title">When You See, Speak</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
              Witnessed an abduction, arrest, or human rights violation? Upload your video evidence here.
              All submissions are reviewed by our team before being published to protect both witnesses and victims.
            </p>
            <Button
              size="lg"
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => setShowSubmitForm(true)}
              data-testid="button-submit-witness-video"
            >
              <Upload className="w-5 h-5 mr-2" /> Submit Video Evidence
            </Button>
          </div>

          {witnessLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => <Skeleton key={i} className="aspect-video rounded-lg" />)}
            </div>
          ) : witnessVideos && witnessVideos.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {witnessVideos.map(wv => (
                <Card
                  key={wv.id}
                  className="overflow-hidden hover-elevate cursor-pointer group"
                  onClick={() => setActiveWitness(wv)}
                  data-testid={`card-witness-video-${wv.id}`}
                >
                  <div className="relative aspect-video bg-black overflow-hidden">
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-900/40 to-black">
                      <Video className="w-12 h-12 text-white/40" />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-red-600/90 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="w-6 h-6 ml-0.5" />
                      </div>
                    </div>
                    <Badge className="absolute top-2 left-2 bg-red-600/90 text-white text-[10px]">
                      <AlertTriangle className="w-3 h-3 mr-0.5" /> Witness Report
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold line-clamp-2 mb-1 group-hover:text-red-600 transition-colors" data-testid={`text-witness-title-${wv.id}`}>
                      {wv.title}
                    </h3>
                    {wv.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{wv.description}</p>
                    )}
                    <div className="flex flex-wrap gap-2 text-[10px] text-muted-foreground">
                      {wv.location && (
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {wv.location}</span>
                      )}
                      {wv.incidentDate && (
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {wv.incidentDate}</span>
                      )}
                      <span>By: {wv.submitterName}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center border-dashed">
              <Video className="w-12 h-12 mx-auto mb-3 text-muted-foreground/40" />
              <h3 className="text-lg font-semibold mb-1">No Approved Videos Yet</h3>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                Be the first to submit video evidence. All videos go through review before being published.
              </p>
            </Card>
          )}
        </div>
      </div>

      <Dialog open={!!activeVideo} onOpenChange={() => setActiveVideo(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          {activeVideo && (
            <div>
              <div className="aspect-video">
                {getEmbedUrl(activeVideo.videoUrl) ? (
                  <iframe
                    src={getEmbedUrl(activeVideo.videoUrl)!}
                    className="w-full h-full"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    title={activeVideo.title}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-black">
                    <a href={activeVideo.videoUrl} target="_blank" rel="noopener noreferrer" className="text-white flex items-center gap-2">
                      <ExternalLink className="w-5 h-5" /> Open Video
                    </a>
                  </div>
                )}
              </div>
              <div className="p-5">
                <h3 className="text-lg font-semibold mb-2">{activeVideo.title}</h3>
                {activeVideo.description && (
                  <p className="text-sm text-muted-foreground">{activeVideo.description}</p>
                )}
                <div className="flex flex-wrap gap-3 mt-3 text-xs text-muted-foreground">
                  {activeVideo.year && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {activeVideo.year}</span>}
                  {activeVideo.duration && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {activeVideo.duration}</span>}
                  {activeVideo.source && <span>Source: {activeVideo.source}</span>}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Witness Video Player Dialog */}
      <Dialog open={!!activeWitness} onOpenChange={() => setActiveWitness(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          {activeWitness && (
            <div>
              <div className="aspect-video bg-black">
                <video
                  src={activeWitness.videoUrl}
                  controls
                  className="w-full h-full"
                  autoPlay
                  playsInline
                />
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="destructive" className="text-[10px]">
                    <AlertTriangle className="w-3 h-3 mr-0.5" /> Witness Report
                  </Badge>
                </div>
                <h3 className="text-lg font-semibold mb-2">{activeWitness.title}</h3>
                {activeWitness.description && (
                  <p className="text-sm text-muted-foreground mb-3">{activeWitness.description}</p>
                )}
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                  {activeWitness.location && (
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {activeWitness.location}</span>
                  )}
                  {activeWitness.incidentDate && (
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {activeWitness.incidentDate}</span>
                  )}
                  <span>Submitted by: {activeWitness.submitterName}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Submit Witness Video Form Dialog */}
      <Dialog open={showSubmitForm} onOpenChange={setShowSubmitForm}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-red-600" /> When You See, Speak
            </DialogTitle>
          </DialogHeader>
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-4">
            <p className="text-xs text-amber-800 dark:text-amber-200">
              <AlertTriangle className="w-3.5 h-3.5 inline mr-1" />
              <strong>Important:</strong> Your video will be reviewed before being made public. Upload clear, high-resolution video.
              Accepted formats: MP4, MOV, AVI, WebM, MKV (up to 500MB).
              Your contact information is kept confidential and never displayed publicly.
            </p>
          </div>
          <form onSubmit={handleWitnessSubmit} className="space-y-4" data-testid="form-witness-video">
            <div>
              <Label htmlFor="wv-title">Title *</Label>
              <Input id="wv-title" name="title" required placeholder="Brief title describing the incident" data-testid="input-witness-title" />
            </div>
            <div>
              <Label htmlFor="wv-description">Description</Label>
              <Textarea id="wv-description" name="description" rows={3} placeholder="Describe what happened, when, and where..." data-testid="input-witness-description" />
            </div>
            <div>
              <Label htmlFor="wv-video">Video File *</Label>
              <Input
                id="wv-video"
                name="video"
                type="file"
                required
                ref={fileInputRef}
                accept="video/mp4,video/quicktime,video/x-msvideo,video/webm,video/x-matroska,.mp4,.mov,.avi,.webm,.mkv"
                data-testid="input-witness-video-file"
                className="cursor-pointer"
              />
              <p className="text-[10px] text-muted-foreground mt-1">MP4, MOV, AVI, WebM, or MKV — max 500MB. High resolution preferred.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="wv-location">Location</Label>
                <Input id="wv-location" name="location" placeholder="City, Region" data-testid="input-witness-location" />
              </div>
              <div>
                <Label htmlFor="wv-date">Incident Date</Label>
                <Input id="wv-date" name="incidentDate" type="date" data-testid="input-witness-date" />
              </div>
            </div>
            <div className="border-t pt-4">
              <p className="text-xs text-muted-foreground mb-3">Your contact info (kept confidential):</p>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="wv-name">Your Name *</Label>
                  <Input id="wv-name" name="submitterName" required placeholder="Your full name" data-testid="input-witness-name" />
                </div>
                <div>
                  <Label htmlFor="wv-email">Email *</Label>
                  <Input id="wv-email" name="submitterEmail" type="email" required placeholder="your@email.com" data-testid="input-witness-email" />
                </div>
                <div>
                  <Label htmlFor="wv-phone">Phone (optional)</Label>
                  <Input id="wv-phone" name="submitterPhone" type="tel" placeholder="+256..." data-testid="input-witness-phone" />
                </div>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white"
              disabled={uploadProgress}
              data-testid="button-submit-witness-form"
            >
              {uploadProgress ? (
                <>Uploading Video...</>
              ) : (
                <><Upload className="w-4 h-4 mr-2" /> Submit Video for Review</>
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DocumentaryCard({ doc, onPlay, large }: { doc: Documentary; onPlay: (d: Documentary) => void; large?: boolean }) {
  const thumb = getThumbnail(doc);
  const catLabel = categoryLabels[doc.category || "general"] || doc.category;

  return (
    <Card
      className="overflow-hidden hover-elevate cursor-pointer group"
      onClick={() => onPlay(doc)}
      data-testid={`card-documentary-${doc.id}`}
    >
      <div className={`relative ${large ? "aspect-video" : "aspect-video"} bg-black overflow-hidden`}>
        {thumb ? (
          <img src={thumb} alt={doc.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80 group-hover:opacity-100" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-background">
            <Film className="w-12 h-12 text-muted-foreground/40" />
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
            <Play className="w-6 h-6 ml-0.5" />
          </div>
        </div>
        {doc.duration && (
          <span className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] px-2 py-0.5 rounded font-medium">
            {doc.duration}
          </span>
        )}
        {doc.isFeatured && (
          <Badge className="absolute top-2 left-2 bg-yellow-500/90 text-black text-[10px]">
            <Star className="w-3 h-3 mr-0.5" /> Featured
          </Badge>
        )}
      </div>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          {catLabel && <Badge variant="outline" className="text-[10px]">{catLabel}</Badge>}
          {doc.year && <span className="text-[10px] text-muted-foreground">{doc.year}</span>}
        </div>
        <h3 className="font-semibold line-clamp-2 mb-1 group-hover:text-primary transition-colors" data-testid={`text-documentary-title-${doc.id}`}>
          {doc.title}
        </h3>
        {doc.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">{doc.description}</p>
        )}
        {doc.source && (
          <p className="text-[10px] text-muted-foreground mt-2">Source: {doc.source}</p>
        )}
      </CardContent>
    </Card>
  );
}
