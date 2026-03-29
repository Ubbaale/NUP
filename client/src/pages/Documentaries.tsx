import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { SEO } from "@/components/SEO";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Film, Play, Clock, Calendar, ExternalLink, Star } from "lucide-react";
import type { Documentary } from "@shared/schema";
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

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

export default function Documentaries() {
  const { data: docs, isLoading } = useQuery<Documentary[]>({
    queryKey: ["/api/documentaries"],
  });
  const [activeVideo, setActiveVideo] = useState<Documentary | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

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
