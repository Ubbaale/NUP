import { useState, useCallback, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { SEO } from "@/components/SEO";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Image, X, ChevronLeft, ChevronRight, Star, Loader2 } from "lucide-react";
import type { GalleryPhoto } from "@shared/schema";

interface GalleryResponse {
  photos: GalleryPhoto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const CATEGORIES = [
  { value: "all", label: "All Photos" },
  { value: "events", label: "Event Photos" },
  { value: "advocacy", label: "Advocacy Photos" },
  { value: "conventions", label: "Convention Photos" },
  { value: "community", label: "Community Photos" },
  { value: "leadership", label: "Leadership Photos" },
];

const PAGE_SIZE = 50;

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

  return (
    <div className="min-h-screen" data-testid="gallery-page">
      <SEO
        title="Photo Gallery"
        description="Browse photos from NUP Diaspora events, conventions, advocacy actions, and community gatherings. See the People Power movement in action across the globe."
        keywords="NUP photos, People Power gallery, NUP diaspora events photos, Uganda advocacy photos, NUP convention photos, Bobi Wine rally photos, Uganda democracy photos"
      />
      <div className="bg-gradient-to-b from-red-900 to-red-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4" data-testid="text-gallery-title">Photo Gallery</h1>
          <p className="text-xl text-red-200 max-w-2xl mx-auto">
            Moments from our events, advocacy work, and community gatherings
          </p>
          {data && (
            <p className="text-sm text-red-300 mt-2">{data.total} photos in the collection</p>
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
                <img src={photo.thumbnailUrl || photo.imageUrl} alt={photo.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <p className="text-white text-sm font-medium truncate">{photo.title}</p>
                </div>
                <div className="absolute top-2 right-2">
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
          {filteredPhotos.length} photo{filteredPhotos.length !== 1 ? "s" : ""}
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
            <p className="text-lg">No photos available yet</p>
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
                  data-testid={`gallery-photo-${photo.id}`}
                >
                  <img
                    src={photo.thumbnailUrl || photo.imageUrl}
                    alt={photo.title}
                    className="w-full object-cover transition-transform group-hover:scale-105"
                    loading="lazy"
                  />
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
                    <span className="text-sm">Loading more photos...</span>
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
                <p className="font-medium">{currentPhoto.title}</p>
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
              <img
                src={currentPhoto.imageUrl}
                alt={currentPhoto.title}
                className="max-w-full max-h-full object-contain rounded"
              />
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
                {CATEGORIES.find(c => c.value === currentPhoto.category)?.label}
              </Badge>
              {currentPhoto.album && (
                <Badge variant="outline" className="text-xs text-white/70 border-white/30">{currentPhoto.album}</Badge>
              )}
              {currentPhoto.width && currentPhoto.height && (
                <span className="text-xs text-white/40">{currentPhoto.width}×{currentPhoto.height}</span>
              )}
              {currentPhoto.originalSize && currentPhoto.compressedSize && (
                <span className="text-xs text-white/40">
                  {formatSize(currentPhoto.originalSize)} → {formatSize(currentPhoto.compressedSize)}
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
