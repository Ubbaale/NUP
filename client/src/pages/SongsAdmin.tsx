import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  Music, Upload, Trash2, Eye, EyeOff, Image, Loader2,
  Play, Download, FileAudio
} from "lucide-react";
import type { RevolutionarySong } from "@shared/schema";

export default function SongsAdmin() {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const { data: songs, isLoading } = useQuery<RevolutionarySong[]>({
    queryKey: ["/api/songs/all"],
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/songs/${id}`),
    onSuccess: () => {
      toast({ title: "Song deleted" });
      queryClient.invalidateQueries({ queryKey: ["/api/songs/all"] });
      queryClient.invalidateQueries({ queryKey: ["/api/songs"] });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      apiRequest("PATCH", `/api/songs/${id}`, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/songs/all"] });
      queryClient.invalidateQueries({ queryKey: ["/api/songs"] });
    },
  });

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploading(true);
    const formData = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/songs", { method: "POST", body: formData });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Upload failed");
      }
      toast({ title: "Song uploaded!", description: "The revolutionary song has been added." });
      queryClient.invalidateQueries({ queryKey: ["/api/songs/all"] });
      queryClient.invalidateQueries({ queryKey: ["/api/songs"] });
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleCoverUpload = async (songId: string, file: File) => {
    const formData = new FormData();
    formData.append("coverImage", file);
    try {
      const res = await fetch(`/api/songs/${songId}/cover`, { method: "POST", body: formData });
      if (!res.ok) throw new Error("Failed to upload cover");
      toast({ title: "Cover image updated" });
      queryClient.invalidateQueries({ queryKey: ["/api/songs/all"] });
      queryClient.invalidateQueries({ queryKey: ["/api/songs"] });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen py-8 bg-muted/30">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <Badge variant="secondary" className="mb-2">Content Management</Badge>
          <h1 className="text-3xl font-bold" data-testid="text-songs-admin-title">Revolutionary Songs Manager</h1>
          <p className="text-muted-foreground">Upload and manage revolutionary songs for the donation page</p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Upload className="w-5 h-5" /> Upload New Song
            </CardTitle>
            <CardDescription>
              Upload MP4, MP3, or other audio files. Songs are gated behind a minimum $20 donation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpload} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Song Title</Label>
                  <Input id="title" name="title" placeholder="e.g. Freedom" required data-testid="input-song-title" />
                </div>
                <div>
                  <Label htmlFor="artist">Artist</Label>
                  <Input id="artist" name="artist" placeholder="e.g. Bobi Wine" required data-testid="input-song-artist" />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea id="description" name="description" placeholder="Brief description of the song..." data-testid="input-song-description" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="songFile">Song File (MP4, MP3, M4A, WAV)</Label>
                  <Input id="songFile" name="songFile" type="file" accept=".mp4,.mp3,.m4a,.wav,.ogg,.aac" required data-testid="input-song-file" />
                </div>
                <div>
                  <Label htmlFor="price">Per-Song Price ($)</Label>
                  <Input id="price" name="price" type="number" step="0.01" defaultValue="5.00" min="0" data-testid="input-song-price" />
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="isFree" name="isFree" className="w-4 h-4" data-testid="checkbox-is-free" />
                  <Label htmlFor="isFree" className="text-sm cursor-pointer">Make this song free (no payment needed)</Label>
                </div>
              </div>
              <Button type="submit" disabled={uploading} data-testid="button-upload-song">
                {uploading ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading...</>
                ) : (
                  <><FileAudio className="w-4 h-4 mr-2" /> Upload Song</>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Music className="w-5 h-5" /> Uploaded Songs ({songs?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground py-4">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading songs...
              </div>
            ) : songs && songs.length > 0 ? (
              <div className="space-y-4">
                {songs.map((song) => (
                  <div key={song.id} className="flex items-center gap-4 p-4 rounded-lg border bg-background" data-testid={`song-admin-${song.id}`}>
                    <div className="w-14 h-14 bg-muted rounded-lg shrink-0 overflow-hidden flex items-center justify-center">
                      {song.coverImageUrl ? (
                        <img src={song.coverImageUrl} alt={song.title} className="w-full h-full object-cover" />
                      ) : (
                        <Music className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{song.title}</p>
                      <p className="text-sm text-muted-foreground">{song.artist}</p>
                      <div className="flex gap-3 text-xs text-muted-foreground mt-1 flex-wrap">
                        <span className="flex items-center gap-1"><Play className="w-3 h-3" /> {song.playCount || 0} plays</span>
                        <span className="flex items-center gap-1"><Download className="w-3 h-3" /> {song.downloadCount || 0} downloads</span>
                        {song.isFree ? (
                          <span className="text-green-600 font-medium">FREE</span>
                        ) : (
                          <span>Price: ${Number(song.price || 5).toFixed(2)}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant={song.isActive ? "default" : "secondary"} className="text-xs">
                        {song.isActive ? "Active" : "Hidden"}
                      </Badge>
                      <label className="relative cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={(e) => {
                            if (e.target.files?.[0]) handleCoverUpload(song.id, e.target.files[0]);
                          }}
                        />
                        <div className="p-2 rounded-md hover:bg-muted transition-colors" title="Upload cover image">
                          <Image className="w-4 h-4" />
                        </div>
                      </label>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => toggleMutation.mutate({ id: song.id, isActive: !song.isActive })}
                        title={song.isActive ? "Hide song" : "Show song"}
                        data-testid={`button-toggle-${song.id}`}
                      >
                        {song.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => {
                          if (confirm("Delete this song permanently?")) {
                            deleteMutation.mutate(song.id);
                          }
                        }}
                        data-testid={`button-delete-${song.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Music className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p>No songs uploaded yet. Use the form above to add revolutionary songs.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
