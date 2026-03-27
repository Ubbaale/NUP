import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Music, Play, Pause, Download, Lock, Heart, DollarSign,
  Volume2, Smartphone, Loader2, CheckCircle, ShoppingCart, Unlock
} from "lucide-react";
import type { RevolutionarySong } from "@shared/schema";

const ALL_ACCESS_AMOUNTS = [20, 30, 50, 100];

function formatDuration(seconds: number | null): string {
  if (!seconds) return "";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function RevolutionarySongs() {
  const { toast } = useToast();
  const [allAccessToken, setAllAccessToken] = useState<string | null>(() => {
    return localStorage.getItem("nup_song_access_token");
  });
  const [hasAllAccess, setHasAllAccess] = useState(false);
  const [purchasedSongs, setPurchasedSongs] = useState<Record<string, string>>(() => {
    try {
      return JSON.parse(localStorage.getItem("nup_song_purchases") || "{}");
    } catch { return {}; }
  });

  const [showAllAccessModal, setShowAllAccessModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState<string | null>(null);
  const [donationAmount, setDonationAmount] = useState("20");
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [donating, setDonating] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [playProgress, setPlayProgress] = useState<Record<string, number>>({});
  const [durations, setDurations] = useState<Record<string, number>>({});
  const audioRefs = useRef<Record<string, HTMLAudioElement>>({});
  const [downloadSongId, setDownloadSongId] = useState<string | null>(null);
  const [downloadFormat, setDownloadFormat] = useState("mp4");

  const { data: songs, isLoading } = useQuery<RevolutionarySong[]>({
    queryKey: ["/api/songs"],
  });

  useEffect(() => {
    if (allAccessToken) {
      fetch(`/api/songs/verify-access?token=${allAccessToken}`)
        .then(r => r.json())
        .then(data => {
          if (data.hasAccess) {
            setHasAllAccess(true);
          } else {
            localStorage.removeItem("nup_song_access_token");
            setAllAccessToken(null);
            setHasAllAccess(false);
          }
        })
        .catch(() => {});
    }
  }, [allAccessToken]);

  const canAccessSong = (song: RevolutionarySong) => {
    if (song.isFree) return true;
    if (hasAllAccess) return true;
    if (purchasedSongs[song.id]) return true;
    return false;
  };

  const getTokenForSong = (song: RevolutionarySong) => {
    if (hasAllAccess && allAccessToken) return allAccessToken;
    if (purchasedSongs[song.id]) return purchasedSongs[song.id];
    return null;
  };

  const handleAllAccessDonate = async () => {
    if (!donorName || !donorEmail || !donationAmount) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }
    if (Number(donationAmount) < 20) {
      toast({ title: "Minimum donation is $20", variant: "destructive" });
      return;
    }
    setDonating(true);
    try {
      const res = await apiRequest("POST", "/api/songs/donate-for-access", {
        donorName,
        email: donorEmail,
        amount: donationAmount,
      });
      const data = await res.json();
      if (data.token) {
        localStorage.setItem("nup_song_access_token", data.token);
        setAllAccessToken(data.token);
        setHasAllAccess(true);
        setShowAllAccessModal(false);
        toast({ title: "Thank you!", description: "You now have full access to all songs for 1 month." });
      }
    } catch (err: any) {
      toast({ title: "Donation failed", description: err.message, variant: "destructive" });
    } finally {
      setDonating(false);
    }
  };

  const handlePurchaseSong = async (songId: string) => {
    if (!donorName || !donorEmail) {
      toast({ title: "Please fill name and email", variant: "destructive" });
      return;
    }
    setPurchasing(true);
    try {
      const res = await apiRequest("POST", `/api/songs/${songId}/purchase`, {
        buyerName: donorName,
        buyerEmail: donorEmail,
      });
      const data = await res.json();
      if (data.token) {
        const updated = { ...purchasedSongs, [songId]: data.token };
        setPurchasedSongs(updated);
        localStorage.setItem("nup_song_purchases", JSON.stringify(updated));
        setShowPurchaseModal(null);
        toast({ title: "Song purchased!", description: "You now have access to this song for 1 month." });
      }
    } catch (err: any) {
      toast({ title: "Purchase failed", description: err.message, variant: "destructive" });
    } finally {
      setPurchasing(false);
    }
  };

  const togglePlay = (song: RevolutionarySong) => {
    if (!canAccessSong(song)) {
      setShowPurchaseModal(song.id);
      return;
    }

    if (currentlyPlaying === song.id) {
      audioRefs.current[song.id]?.pause();
      setCurrentlyPlaying(null);
      return;
    }

    if (currentlyPlaying && audioRefs.current[currentlyPlaying]) {
      audioRefs.current[currentlyPlaying].pause();
    }

    const token = getTokenForSong(song);
    if (!audioRefs.current[song.id]) {
      const streamUrl = song.isFree
        ? `/api/songs/${song.id}/stream`
        : `/api/songs/${song.id}/stream?token=${token}`;
      const audio = new Audio(streamUrl);
      audio.addEventListener("timeupdate", () => {
        setPlayProgress(prev => ({ ...prev, [song.id]: audio.currentTime }));
      });
      audio.addEventListener("loadedmetadata", () => {
        setDurations(prev => ({ ...prev, [song.id]: audio.duration }));
      });
      audio.addEventListener("ended", () => {
        setCurrentlyPlaying(null);
        setPlayProgress(prev => ({ ...prev, [song.id]: 0 }));
      });
      audioRefs.current[song.id] = audio;
    }

    audioRefs.current[song.id].play();
    setCurrentlyPlaying(song.id);
    fetch(`/api/songs/${song.id}/play`, { method: "POST" }).catch(() => {});
  };

  const handleDownload = (song: RevolutionarySong) => {
    if (!canAccessSong(song)) {
      setShowPurchaseModal(song.id);
      return;
    }
    setDownloadSongId(song.id);
  };

  const executeDownload = () => {
    if (!downloadSongId) return;
    const song = songs?.find(s => s.id === downloadSongId);
    if (!song) return;
    const token = getTokenForSong(song);
    const tokenParam = song.isFree ? "" : `?token=${token}&format=${downloadFormat}`;
    const url = song.isFree
      ? `/api/songs/${downloadSongId}/download?format=${downloadFormat}`
      : `/api/songs/${downloadSongId}/download${tokenParam}`;
    window.open(url, "_blank");
    setDownloadSongId(null);
    toast({ title: "Download started!" });
  };

  if (isLoading) {
    return (
      <Card className="mt-12">
        <CardContent className="py-12 text-center text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
          Loading revolutionary songs...
        </CardContent>
      </Card>
    );
  }

  const hasSongs = songs && songs.length > 0;
  const purchaseSong = songs?.find(s => s.id === showPurchaseModal);

  return (
    <>
      <div className="mt-16 max-w-5xl mx-auto" data-testid="section-revolutionary-songs">
        <div className="text-center mb-8">
          <Badge variant="secondary" className="mb-4">
            <Music className="w-3 h-3 mr-1" /> Revolutionary Music
          </Badge>
          <h2 className="text-3xl font-bold mb-3">Songs of the Revolution</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Listen to and download powerful revolutionary songs. Some songs are free — others can be
            purchased individually or unlocked all at once with a donation of $20 or more.
          </p>
        </div>

        {!hasSongs && (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Music className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Revolutionary songs are being prepared. Check back soon to listen to and download
                powerful music from the People Power movement.
              </p>
            </CardContent>
          </Card>
        )}

        {hasSongs && !hasAllAccess && (
          <Card className="mb-8 border-primary/30 bg-primary/5">
            <CardContent className="py-6">
              <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                  <Unlock className="w-7 h-7 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">Unlock All Songs</h3>
                  <p className="text-sm text-muted-foreground">
                    Donate $20 or more to get full access to all songs for 1 month.
                    Or purchase individual songs below.
                  </p>
                </div>
                <Button size="lg" onClick={() => setShowAllAccessModal(true)} data-testid="button-unlock-songs">
                  <Heart className="w-5 h-5 mr-2" /> Donate & Unlock All
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {hasSongs && <div className="space-y-3">
          {songs.map((song) => {
            const isPlaying = currentlyPlaying === song.id;
            const progress = playProgress[song.id] || 0;
            const duration = durations[song.id] || (song.duration || 0);
            const progressPct = duration > 0 ? (progress / duration) * 100 : 0;
            const accessible = canAccessSong(song);

            return (
              <Card key={song.id} className={`transition-all ${isPlaying ? "border-primary shadow-md" : ""}`} data-testid={`song-card-${song.id}`}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => togglePlay(song)}
                      className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-all ${
                        accessible
                          ? isPlaying
                            ? "bg-primary text-primary-foreground shadow-lg"
                            : "bg-primary/10 text-primary hover:bg-primary/20"
                          : "bg-muted text-muted-foreground"
                      }`}
                      data-testid={`button-play-${song.id}`}
                    >
                      {!accessible ? (
                        <Lock className="w-5 h-5" />
                      ) : isPlaying ? (
                        <Pause className="w-5 h-5" />
                      ) : (
                        <Play className="w-5 h-5 ml-0.5" />
                      )}
                    </button>

                    <div className="w-10 h-10 rounded-md bg-muted overflow-hidden shrink-0">
                      {song.coverImageUrl ? (
                        <img src={song.coverImageUrl} alt={song.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Music className="w-5 h-5 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold truncate" data-testid={`text-song-title-${song.id}`}>{song.title}</p>
                        {song.isFree && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 shrink-0">FREE</Badge>
                        )}
                        {!song.isFree && accessible && !hasAllAccess && purchasedSongs[song.id] && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-green-600 border-green-300 shrink-0">PURCHASED</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground" data-testid={`text-song-artist-${song.id}`}>{song.artist}</p>
                      {song.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">{song.description}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {!song.isFree && !accessible && (
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => setShowPurchaseModal(song.id)}
                          className="gap-1"
                          data-testid={`button-buy-${song.id}`}
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">${Number(song.price || 5).toFixed(0)}</span>
                        </Button>
                      )}
                      {duration > 0 && (
                        <span className="text-xs text-muted-foreground font-mono hidden sm:inline">
                          {isPlaying ? `${formatDuration(Math.floor(progress))} / ` : ""}
                          {formatDuration(Math.floor(duration))}
                        </span>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownload(song)}
                        className="gap-1"
                        data-testid={`button-download-${song.id}`}
                      >
                        {accessible ? <Download className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                        <span className="hidden sm:inline">Download</span>
                      </Button>
                    </div>
                  </div>

                  {isPlaying && duration > 0 && (
                    <div className="mt-3 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-200"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>}

        {hasSongs && hasAllAccess && (
          <div className="mt-6 text-center">
            <Badge variant="outline" className="text-green-600 border-green-300">
              <CheckCircle className="w-3 h-3 mr-1" /> All-access unlocked — Thank you for your donation!
            </Badge>
          </div>
        )}

        <div className="mt-10 border-t pt-8 space-y-6" data-testid="section-songs-legal">
            <div className="bg-muted/50 rounded-lg p-6 space-y-3">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Music className="w-4 h-4 text-primary" />
                Artist Attribution & Rights
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                All songs featured on this platform are shared with the knowledge and permission of the
                respective artists. NUP Diaspora acknowledges and credits each artist for their creative
                contributions to the People Power movement. The rights to all musical works remain with
                their original creators.
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                If you are an artist whose work appears here and you wish to discuss terms, request
                modifications, or have your music removed, please contact us at{" "}
                <a href="mailto:media@diasporanup.org" className="text-primary underline">media@diasporanup.org</a>.
              </p>
            </div>

            <div className="bg-muted/50 rounded-lg p-6 space-y-3">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Lock className="w-4 h-4 text-primary" />
                Terms of Use
              </h3>
              <ul className="text-xs text-muted-foreground leading-relaxed space-y-2">
                <li>Songs purchased or unlocked via donation are for <strong>personal, non-commercial use only</strong>.</li>
                <li>Redistribution, resale, or public broadcast of downloaded songs is prohibited without written consent from the artist.</li>
                <li>All-access passes and individual purchases grant access for <strong>one month</strong> from the date of transaction.</li>
                <li>Donations and purchases support the NUP Diaspora movement and are non-refundable.</li>
                <li>Ringtone formats (MP3, M4R) are provided as a convenience for personal device use only.</li>
              </ul>
            </div>
          </div>
      </div>

      <Dialog open={showAllAccessModal} onOpenChange={setShowAllAccessModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-primary" /> Unlock All Songs
            </DialogTitle>
            <DialogDescription>
              Donate $20 or more to unlock full access to all songs for 1 month.
              Play and download every song, including new ones added during your access period.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label className="mb-2 block">Select Donation Amount</Label>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {ALL_ACCESS_AMOUNTS.map(amt => (
                  <Button
                    key={amt}
                    type="button"
                    variant={donationAmount === String(amt) ? "default" : "outline"}
                    size="sm"
                    onClick={() => setDonationAmount(String(amt))}
                    data-testid={`button-song-donate-${amt}`}
                  >
                    ${amt}
                  </Button>
                ))}
              </div>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="number"
                  placeholder="Custom amount (min $20)"
                  value={donationAmount}
                  onChange={e => setDonationAmount(e.target.value)}
                  className="pl-10"
                  min="20"
                  data-testid="input-song-donate-amount"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="song-donor-name">Your Name</Label>
              <Input
                id="song-donor-name"
                placeholder="Full name"
                value={donorName}
                onChange={e => setDonorName(e.target.value)}
                data-testid="input-song-donor-name"
              />
            </div>
            <div>
              <Label htmlFor="song-donor-email">Email Address</Label>
              <Input
                id="song-donor-email"
                type="email"
                placeholder="your@email.com"
                value={donorEmail}
                onChange={e => setDonorEmail(e.target.value)}
                data-testid="input-song-donor-email"
              />
            </div>
            <Separator />
            <div className="flex items-start gap-2 text-xs text-muted-foreground">
              <Smartphone className="w-4 h-4 shrink-0 mt-0.5" />
              <p>After donating, you can download songs in MP4, MP3 (Android ringtone), or M4R (iPhone ringtone) format.</p>
            </div>
            <Button
              className="w-full"
              size="lg"
              disabled={donating || Number(donationAmount) < 20}
              onClick={handleAllAccessDonate}
              data-testid="button-confirm-song-donation"
            >
              {donating ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
              ) : (
                <><Heart className="w-4 h-4 mr-2" /> Donate ${donationAmount} & Unlock All Songs</>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!showPurchaseModal} onOpenChange={() => setShowPurchaseModal(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-primary" /> Purchase Song
            </DialogTitle>
            <DialogDescription>
              {purchaseSong ? (
                <>Buy "{purchaseSong.title}" by {purchaseSong.artist} for ${Number(purchaseSong.price || 5).toFixed(2)}. Access lasts 1 month.</>
              ) : "Purchase this song"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {purchaseSong && (
              <Card className="bg-muted/50">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 bg-muted rounded-lg overflow-hidden flex items-center justify-center shrink-0">
                    {purchaseSong.coverImageUrl ? (
                      <img src={purchaseSong.coverImageUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Music className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{purchaseSong.title}</p>
                    <p className="text-sm text-muted-foreground">{purchaseSong.artist}</p>
                  </div>
                  <p className="text-xl font-bold text-primary">${Number(purchaseSong.price || 5).toFixed(2)}</p>
                </CardContent>
              </Card>
            )}
            <div>
              <Label htmlFor="purchase-name">Your Name</Label>
              <Input
                id="purchase-name"
                placeholder="Full name"
                value={donorName}
                onChange={e => setDonorName(e.target.value)}
                data-testid="input-purchase-name"
              />
            </div>
            <div>
              <Label htmlFor="purchase-email">Email Address</Label>
              <Input
                id="purchase-email"
                type="email"
                placeholder="your@email.com"
                value={donorEmail}
                onChange={e => setDonorEmail(e.target.value)}
                data-testid="input-purchase-email"
              />
            </div>
            <Separator />
            <div className="text-xs text-muted-foreground text-center">
              Or <button className="text-primary underline" onClick={() => { setShowPurchaseModal(null); setShowAllAccessModal(true); }} data-testid="link-unlock-all">donate $20+ to unlock ALL songs</button>
            </div>
            <Button
              className="w-full"
              size="lg"
              disabled={purchasing || !donorName || !donorEmail}
              onClick={() => showPurchaseModal && handlePurchaseSong(showPurchaseModal)}
              data-testid="button-confirm-purchase"
            >
              {purchasing ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
              ) : (
                <><ShoppingCart className="w-4 h-4 mr-2" /> Buy for ${purchaseSong ? Number(purchaseSong.price || 5).toFixed(2) : "5.00"}</>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!downloadSongId} onOpenChange={() => setDownloadSongId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" /> Download Song
            </DialogTitle>
            <DialogDescription>
              Choose a format for your download. Use M4R for iPhone ringtones and MP3 for Android ringtones.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label className="mb-2 block">Download Format</Label>
              <Select value={downloadFormat} onValueChange={setDownloadFormat}>
                <SelectTrigger data-testid="select-download-format">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mp4">MP4 — Original Format</SelectItem>
                  <SelectItem value="mp3">MP3 — Save as Android Ringtone</SelectItem>
                  <SelectItem value="m4r">M4R — Save as iPhone Ringtone</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground space-y-1.5">
              <p className="flex items-center gap-1.5"><Smartphone className="w-3.5 h-3.5" /> <strong>iPhone:</strong> Download M4R → Open in GarageBand → Export as Ringtone</p>
              <p className="flex items-center gap-1.5"><Volume2 className="w-3.5 h-3.5" /> <strong>Android:</strong> Download MP3 → Settings → Sound → Ringtone → Add</p>
            </div>
            <Button className="w-full" onClick={executeDownload} data-testid="button-confirm-download">
              <Download className="w-4 h-4 mr-2" /> Download Now
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
