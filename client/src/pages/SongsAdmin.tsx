import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Music, Upload, Trash2, Eye, EyeOff, Image, Loader2,
  Play, Download, FileAudio, DollarSign, Pencil, X, Check, ImagePlus
} from "lucide-react";
import type { RevolutionarySong } from "@shared/schema";

export default function SongsAdmin() {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [editingSong, setEditingSong] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editArtist, setEditArtist] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editIsFree, setEditIsFree] = useState(false);

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

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: string; title: string; artist: string; description: string; price: string; isFree: boolean }) =>
      apiRequest("PATCH", `/api/songs/${id}`, data),
    onSuccess: () => {
      toast({ title: "Song updated" });
      setEditingSong(null);
      queryClient.invalidateQueries({ queryKey: ["/api/songs/all"] });
      queryClient.invalidateQueries({ queryKey: ["/api/songs"] });
    },
    onError: (err: any) => {
      toast({ title: "Update failed", description: err.message, variant: "destructive" });
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

  const startEditing = (song: RevolutionarySong) => {
    setEditingSong(song.id);
    setEditTitle(song.title);
    setEditArtist(song.artist);
    setEditDescription(song.description || "");
    setEditPrice(String(song.price || "5.00"));
    setEditIsFree(song.isFree || false);
  };

  const saveEdit = () => {
    if (!editingSong) return;
    updateMutation.mutate({
      id: editingSong,
      title: editTitle,
      artist: editArtist,
      description: editDescription,
      price: editPrice,
      isFree: editIsFree,
    });
  };

  const totalPlays = songs?.reduce((sum, s) => sum + (s.playCount || 0), 0) || 0;
  const totalDownloads = songs?.reduce((sum, s) => sum + (s.downloadCount || 0), 0) || 0;
  const activeSongs = songs?.filter(s => s.isActive).length || 0;
  const freeSongs = songs?.filter(s => s.isFree).length || 0;

  return (
    <div className="min-h-screen py-8 bg-muted/30">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <Badge variant="secondary" className="mb-2">Content Management</Badge>
          <h1 className="text-3xl font-bold" data-testid="text-songs-admin-title">Revolutionary Songs Manager</h1>
          <p className="text-muted-foreground">Upload and manage revolutionary songs for the donation page</p>
        </div>

        {songs && songs.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold" data-testid="text-total-songs">{songs.length}</p>
                <p className="text-xs text-muted-foreground">Total Songs</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-green-600" data-testid="text-active-songs">{activeSongs}</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-blue-600" data-testid="text-total-plays">{totalPlays.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total Plays</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-purple-600" data-testid="text-total-downloads">{totalDownloads.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Downloads</p>
              </CardContent>
            </Card>
          </div>
        )}

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Upload className="w-5 h-5" /> Upload New Song
            </CardTitle>
            <CardDescription>
              Upload audio files with cover art. Songs are gated behind a minimum $20 donation or can be purchased individually.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpload} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Song Title *</Label>
                  <Input id="title" name="title" placeholder="e.g. Freedom" required data-testid="input-song-title" />
                </div>
                <div>
                  <Label htmlFor="artist">Artist *</Label>
                  <Input id="artist" name="artist" placeholder="e.g. Bobi Wine" required data-testid="input-song-artist" />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea id="description" name="description" placeholder="Brief description of the song..." rows={2} data-testid="input-song-description" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="songFile">Song File (MP4, MP3, M4A, WAV) *</Label>
                  <Input id="songFile" name="songFile" type="file" accept=".mp4,.mp3,.m4a,.wav,.ogg,.aac" required data-testid="input-song-file" />
                </div>
                <div>
                  <Label htmlFor="coverImage">Cover Art (Optional)</Label>
                  <Input id="coverImage" name="coverImage" type="file" accept="image/*" data-testid="input-song-cover" />
                  <p className="text-xs text-muted-foreground mt-1">Square image recommended (e.g. 500x500)</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Per-Song Price ($)</Label>
                  <Input id="price" name="price" type="number" step="0.01" defaultValue="5.00" min="0" data-testid="input-song-price" />
                </div>
                <div className="flex items-end pb-2">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="isFree" name="isFree" className="w-4 h-4" data-testid="checkbox-is-free" />
                    <Label htmlFor="isFree" className="text-sm cursor-pointer">Make this song free (no payment needed)</Label>
                  </div>
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
            <CardDescription>
              {freeSongs > 0 && `${freeSongs} free · `}{activeSongs} active · Click the edit icon to modify details
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground py-4">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading songs...
              </div>
            ) : songs && songs.length > 0 ? (
              <div className="space-y-4">
                {songs.map((song) => {
                  const isEditing = editingSong === song.id;

                  return (
                    <div key={song.id} className="rounded-lg border bg-background overflow-hidden" data-testid={`song-admin-${song.id}`}>
                      <div className="flex">
                        <div className="w-24 h-24 sm:w-28 sm:h-28 bg-muted shrink-0 relative group">
                          {song.coverImageUrl ? (
                            <img src={song.coverImageUrl} alt={song.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                              <Music className="w-8 h-8 text-primary/40" />
                            </div>
                          )}
                          <label className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/40 transition-all cursor-pointer opacity-0 group-hover:opacity-100">
                            <input
                              type="file"
                              accept="image/*"
                              className="sr-only"
                              onChange={(e) => {
                                if (e.target.files?.[0]) handleCoverUpload(song.id, e.target.files[0]);
                              }}
                            />
                            <div className="bg-white/90 rounded-full p-2">
                              <ImagePlus className="w-4 h-4 text-primary" />
                            </div>
                          </label>
                          {!song.coverImageUrl && (
                            <label className="absolute bottom-1 right-1 cursor-pointer">
                              <input
                                type="file"
                                accept="image/*"
                                className="sr-only"
                                onChange={(e) => {
                                  if (e.target.files?.[0]) handleCoverUpload(song.id, e.target.files[0]);
                                }}
                              />
                              <div className="bg-primary text-primary-foreground rounded-full p-1.5 shadow-md hover:bg-primary/90 transition-colors" title="Add cover art">
                                <ImagePlus className="w-3 h-3" />
                              </div>
                            </label>
                          )}
                        </div>

                        <div className="flex-1 min-w-0 p-4">
                          {isEditing ? (
                            <div className="space-y-3">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                  <Label className="text-xs">Title</Label>
                                  <Input
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    className="h-8 text-sm"
                                    data-testid="input-edit-title"
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs">Artist</Label>
                                  <Input
                                    value={editArtist}
                                    onChange={(e) => setEditArtist(e.target.value)}
                                    className="h-8 text-sm"
                                    data-testid="input-edit-artist"
                                  />
                                </div>
                              </div>
                              <div>
                                <Label className="text-xs">Description</Label>
                                <Input
                                  value={editDescription}
                                  onChange={(e) => setEditDescription(e.target.value)}
                                  placeholder="Brief description..."
                                  className="h-8 text-sm"
                                  data-testid="input-edit-description"
                                />
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                  <Label className="text-xs">Price $</Label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={editPrice}
                                    onChange={(e) => setEditPrice(e.target.value)}
                                    className="h-8 text-sm w-20"
                                    data-testid="input-edit-price"
                                  />
                                </div>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={editIsFree}
                                    onChange={(e) => setEditIsFree(e.target.checked)}
                                    className="w-3.5 h-3.5"
                                    id={`edit-free-${song.id}`}
                                    data-testid="checkbox-edit-free"
                                  />
                                  <Label htmlFor={`edit-free-${song.id}`} className="text-xs cursor-pointer">Free</Label>
                                </div>
                                <div className="flex gap-1 ml-auto">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setEditingSong(null)}
                                    className="h-7 px-2"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={saveEdit}
                                    disabled={updateMutation.isPending}
                                    className="h-7 px-3 gap-1"
                                    data-testid="button-save-edit"
                                  >
                                    {updateMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                                    Save
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="font-semibold truncate">{song.title}</p>
                                  <Badge variant={song.isActive ? "default" : "secondary"} className="text-[10px] px-1.5 py-0 shrink-0">
                                    {song.isActive ? "Active" : "Hidden"}
                                  </Badge>
                                  {song.isFree && (
                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-green-600 border-green-300 shrink-0">FREE</Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground">{song.artist}</p>
                                {song.description && (
                                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{song.description}</p>
                                )}
                                <div className="flex gap-4 text-xs text-muted-foreground mt-2 flex-wrap">
                                  <span className="flex items-center gap-1"><Play className="w-3 h-3" /> {song.playCount || 0} plays</span>
                                  <span className="flex items-center gap-1"><Download className="w-3 h-3" /> {song.downloadCount || 0} downloads</span>
                                  {!song.isFree && (
                                    <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" /> ${Number(song.price || 5).toFixed(2)}</span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => startEditing(song)}
                                  title="Edit song details"
                                  className="h-8 w-8"
                                  data-testid={`button-edit-${song.id}`}
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => toggleMutation.mutate({ id: song.id, isActive: !song.isActive })}
                                  title={song.isActive ? "Hide song" : "Show song"}
                                  className="h-8 w-8"
                                  data-testid={`button-toggle-${song.id}`}
                                >
                                  {song.isActive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="text-destructive hover:text-destructive h-8 w-8"
                                  onClick={() => {
                                    if (confirm("Delete this song permanently?")) {
                                      deleteMutation.mutate(song.id);
                                    }
                                  }}
                                  data-testid={`button-delete-${song.id}`}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
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
