import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { SEO } from "@/components/SEO";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Image, X, ChevronLeft, ChevronRight, Star, Loader2, Play, Video } from "lucide-react";
import type { GalleryPhoto } from "@shared/schema";

interface GalleryResponse {
  photos: GalleryPhoto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const CATEGORIES = [
  { value: "all", label: "All Media" },
  { value: "rallies", label: "Rallies" },
  { value: "demonstrations", label: "Demonstrations" },
  { value: "advocacy", label: "Advocacy" },
  { value: "conventions", label: "Conventions" },
  { value: "community", label: "Community" },
  { value: "leadership", label: "Leadership" },
  { value: "events", label: "Events" },
];

const PAGE_SIZE = 50;

function isVideo(item: GalleryPhoto) {
  return item.mediaType === "video";
}

function isYouTubeUrl(url: string) {
  return url.includes("youtube.com") || url.includes("youtu.be");
}

function isVimeoUrl(url: string) {
  return url.includes("vimeo.com");
}

function getYouTubeEmbedUrl(url: string) {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : url;
}

function getVimeoEmbedUrl(url: string) {
  const match = url.match(/vimeo\.com\/(\d+)/);
  return match ? `https://player.vimeo.com/video/${match[1]}` : url;
}

function getYouTubeThumbnail(url: string) {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : null;
}

export default function Gallery() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [activeAlbum, setActiveAlbum] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [allPhotos, setAllPhotos] = useState<GalleryPhoto[]>([]);
  const [hasMore, setHasMore] = useState(true);

  const categoryParam = activeCategory !== "all" ? `&category=${activeCategory}` : "";
  const queryKey = ["/api/gallery", activeCategory, page];

  const { data, isLoading, isFetching } = useQuery<GalleryResponse>({
    queryKey,
    queryFn: async () => {
      const res = await fetch(`/api/gallery?page=${page}&limit=${PAGE_SIZE}${categoryParam}`);
      if (!res.ok) throw new Error("Failed to fetch gallery");
      return res.json();
    },
  });

  useEffect(() => {
    if (data) {
      if (page === 1) {
        setAllPhotos(data.photos);
      } else {
        setAllPhotos(prev => {
          const existingIds = new Set(prev.map(p => p.id));
          const newPhotos = data.photos.filter(p => !existingIds.has(p.id));
          return [...prev, ...newPhotos];
        });
      }
      setHasMore(page < data.totalPages);
    }
  }, [data, page]);

  useEffect(() => {
    setPage(1);
    setAllPhotos([]);
    setHasMore(true);
  }, [activeCategory]);

  useEffect(() => {
    if (!sentinelRef.current || !hasMore || isFetching) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isFetching) {
          setPage(p => p + 1);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, isFetching]);

  const filteredPhotos = allPhotos.filter(p => {
    if (activeAlbum && p.album !== activeAlbum) return false;
    return true;
  });

  const albums = [...new Set(allPhotos.map(p => p.album).filter(Boolean))] as string[];
  const featuredPhotos = allPhotos.filter(p => p.featured);

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const nextPhoto = () => {
    if (lightboxIndex !== null && lightboxIndex < filteredPhotos.length - 1) {
      setLightboxIndex(lightboxIndex + 1);
    }
  };
  const prevPhoto = () => {
    if (lightboxIndex !== null && lightboxIndex > 0) {
      setLightboxIndex(lightboxIndex - 1);
    }
  };

  const currentPhoto = lightboxIndex !== null ? filteredPhotos[lightboxIndex] : null;

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const videoCount = allPhotos.filter(p => isVideo(p)).length;
  const photoCount = allPhotos.filter(p => !isVideo(p)).length;

  return (
    <div className="min-h-screen" data-testid="gallery-page">
      <SEO
        title="Advocacy Rally Demonstrations"
        description="Browse photos and videos from NUP Diaspora advocacy rallies, demonstrations, conventions, and community gatherings. See the People Power movement in action across the globe."
        keywords="NUP rally, People Power demonstrations, NUP diaspora advocacy, Uganda advocacy rally, NUP convention, Bobi Wine rally, Uganda democracy, NUP protests"
      />
      <div className="bg-gradient-to-b from-red-900 to-red-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4" data-testid="text-gallery-title">Advocacy Rally Demonstrations</h1>
          <p className="text-xl text-red-200 max-w-2xl mx-auto">
            Photos and videos from our rallies, demonstrations, advocacy work, and community gatherings
          </p>
          {data && (
            <p className="text-sm text-red-300 mt-2">
              {photoCount} photo{photoCount !== 1 ? "s" : ""} &amp; {videoCount} video{videoCount !== 1 ? "s" : ""} in the collection
            </p>
          )}
        </div>
      </div>

      {featuredPhotos.length > 0 && (
        <div className="container mx-auto px-4 -mt-8 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {featuredPhotos.slice(0, 4).map((photo, idx) => (
              <div
                key={photo.id}
                className="relative aspect-[4/3] rounded-lg overflow-hidden shadow-lg cursor-pointer group"
                onClick={() => {
                  const mainIdx = filteredPhotos.findIndex(p => p.id === photo.id);
                  if (mainIdx >= 0) openLightbox(mainIdx);
                }}
                data-testid={`featured-photo-${idx}`}
              >
                {isVideo(photo) ? (
                  <>
                    {isYouTubeUrl(photo.imageUrl) ? (
                      <img src={getYouTubeThumbnail(photo.imageUrl) || ""} alt={photo.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                    ) : (
                      <video src={photo.imageUrl} className="w-full h-full object-cover" muted preload="metadata" />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-black/60 flex items-center justify-center">
                        <Play className="w-6 h-6 text-white fill-white" />
                      </div>
                    </div>
                  </>
                ) : (
                  <img src={photo.thumbnailUrl || photo.imageUrl} alt={photo.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <p className="text-white text-sm font-medium truncate">{photo.title}</p>
                </div>
                <div className="absolute top-2 right-2 flex items-center gap-1">
                  {isVideo(photo) && <Badge className="bg-red-600 text-white text-xs px-1.5 py-0.5"><Video className="w-3 h-3" /></Badge>}
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap gap-2 mb-6 justify-center">
          {CATEGORIES.map(cat => (
            <Button
              key={cat.value}
              variant={activeCategory === cat.value ? "default" : "outline"}
              size="sm"
              onClick={() => { setActiveCategory(cat.value); setActiveAlbum(null); }}
              data-testid={`button-category-${cat.value}`}
            >
              {cat.label}
            </Button>
          ))}
        </div>

        {albums.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6 justify-center">
            <Button
              variant={activeAlbum === null ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setActiveAlbum(null)}
            >
              All Albums
            </Button>
            {albums.map(album => (
              <Button
                key={album}
                variant={activeAlbum === album ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setActiveAlbum(album)}
                data-testid={`button-album-${album}`}
              >
                {album}
              </Button>
            ))}
          </div>
        )}

        <p className="text-sm text-muted-foreground mb-4 text-center">
          {filteredPhotos.length} item{filteredPhotos.length !== 1 ? "s" : ""}
          {data && data.total > filteredPhotos.length && ` of ${data.total} total`}
        </p>

        {isLoading && page === 1 ? (
          <div className="text-center py-16">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-muted-foreground">Loading gallery...</p>
          </div>
        ) : filteredPhotos.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Image className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg">No media available yet</p>
            <p className="text-sm mt-1">Check back soon for updates!</p>
          </div>
        ) : (
          <>
            <div className="columns-2 md:columns-3 lg:columns-4 gap-3 space-y-3">
              {filteredPhotos.map((photo, idx) => (
                <div
                  key={photo.id}
                  className="break-inside-avoid cursor-pointer group relative overflow-hidden rounded-lg"
                  onClick={() => openLightbox(idx)}
                  data-testid={`gallery-item-${photo.id}`}
                >
                  {isVideo(photo) ? (
                    <>
                      {photo.thumbnailUrl ? (
                        <img src={photo.thumbnailUrl} alt={photo.title} className="w-full object-cover transition-transform group-hover:scale-105" loading="lazy" />
                      ) : isYouTubeUrl(photo.imageUrl) ? (
                        <img src={getYouTubeThumbnail(photo.imageUrl) || ""} alt={photo.title} className="w-full object-cover transition-transform group-hover:scale-105" loading="lazy" />
                      ) : (
                        <video src={photo.imageUrl} className="w-full object-cover" muted preload="metadata" />
                      )}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-14 h-14 rounded-full bg-black/50 flex items-center justify-center group-hover:bg-red-600/80 transition-colors">
                          <Play className="w-7 h-7 text-white fill-white" />
                        </div>
                      </div>
                    </>
                  ) : (
                    <img
                      src={photo.thumbnailUrl || photo.imageUrl}
                      alt={photo.title}
                      className="w-full object-cover transition-transform group-hover:scale-105"
                      loading="lazy"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end">
                    <div className="p-3 translate-y-full group-hover:translate-y-0 transition-transform w-full">
                      <p className="text-white text-sm font-medium">{photo.title}</p>
                      {photo.description && (
                        <p className="text-white/80 text-xs mt-0.5 line-clamp-2">{photo.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs bg-white/20 text-white border-0">
                          {CATEGORIES.find(c => c.value === photo.category)?.label || photo.category}
                        </Badge>
                        {isVideo(photo) && (
                          <Badge className="text-xs bg-red-600/80 text-white border-0">
                            <Video className="w-3 h-3 mr-1" /> Video
                          </Badge>
                        )}
                        {photo.album && (
                          <span className="text-xs text-white/70">{photo.album}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {hasMore && (
              <div ref={sentinelRef} className="flex justify-center py-8">
                {isFetching && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="text-sm">Loading more...</span>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {currentPhoto && (
        <Dialog open={lightboxIndex !== null} onOpenChange={() => closeLightbox()}>
          <DialogContent className="max-w-5xl w-[95vw] h-[90vh] p-0 bg-black/95 border-none flex flex-col">
            <div className="flex items-center justify-between p-4">
              <div className="text-white">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{currentPhoto.title}</p>
                  {isVideo(currentPhoto) && <Badge className="bg-red-600 text-white text-xs"><Video className="w-3 h-3 mr-1" />Video</Badge>}
                </div>
                {currentPhoto.description && (
                  <p className="text-sm text-white/70 mt-0.5">{currentPhoto.description}</p>
                )}
              </div>
              <Button variant="ghost" size="icon" onClick={closeLightbox} className="text-white hover:bg-white/20" data-testid="button-close-lightbox">
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="flex-1 relative flex items-center justify-center px-12 pb-4">
              {lightboxIndex !== null && lightboxIndex > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 text-white hover:bg-white/20 z-10"
                  onClick={(e) => { e.stopPropagation(); prevPhoto(); }}
                  data-testid="button-prev-photo"
                >
                  <ChevronLeft className="w-8 h-8" />
                </Button>
              )}
              {isVideo(currentPhoto) ? (
                isYouTubeUrl(currentPhoto.imageUrl) ? (
                  <iframe
                    src={getYouTubeEmbedUrl(currentPhoto.imageUrl)}
                    className="w-full max-w-4xl aspect-video rounded"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                ) : isVimeoUrl(currentPhoto.imageUrl) ? (
                  <iframe
                    src={getVimeoEmbedUrl(currentPhoto.imageUrl)}
                    className="w-full max-w-4xl aspect-video rounded"
                    allowFullScreen
                  />
                ) : (
                  <video
                    src={currentPhoto.imageUrl}
                    controls
                    autoPlay
                    className="max-w-full max-h-full rounded"
                    data-testid="lightbox-video"
                  />
                )
              ) : (
                <img
                  src={currentPhoto.imageUrl}
                  alt={currentPhoto.title}
                  className="max-w-full max-h-full object-contain rounded"
                />
              )}
              {lightboxIndex !== null && lightboxIndex < filteredPhotos.length - 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 text-white hover:bg-white/20 z-10"
                  onClick={(e) => { e.stopPropagation(); nextPhoto(); }}
                  data-testid="button-next-photo"
                >
                  <ChevronRight className="w-8 h-8" />
                </Button>
              )}
            </div>
            <div className="p-3 flex items-center justify-center gap-2 flex-wrap">
              <Badge variant="secondary" className="text-xs">
                {CATEGORIES.find(c => c.value === currentPhoto.category)?.label || currentPhoto.category}
              </Badge>
              {currentPhoto.album && (
                <Badge variant="outline" className="text-xs text-white/70 border-white/30">{currentPhoto.album}</Badge>
              )}
              {!isVideo(currentPhoto) && currentPhoto.width && currentPhoto.height && (
                <span className="text-xs text-white/40">{currentPhoto.width}x{currentPhoto.height}</span>
              )}
              {currentPhoto.originalSize && currentPhoto.compressedSize && (
                <span className="text-xs text-white/40">
                  {formatSize(currentPhoto.originalSize)}{!isVideo(currentPhoto) && currentPhoto.compressedSize !== currentPhoto.originalSize ? ` → ${formatSize(currentPhoto.compressedSize)}` : ""}
                </span>
              )}
              <span className="text-xs text-white/50 ml-2">
                {(lightboxIndex || 0) + 1} / {filteredPhotos.length}
              </span>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
