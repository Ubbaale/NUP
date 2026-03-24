import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, MapPin, Mail, Phone, Calendar, Users, Clock, Building, Globe, ExternalLink } from "lucide-react";
import { SiFacebook, SiInstagram, SiYoutube, SiWhatsapp } from "react-icons/si";
import { format } from "date-fns";
import type { Chapter, Activity, ChapterLeader } from "@shared/schema";

export default function ChapterDetail() {
  const { slug } = useParams<{ slug: string }>();

  const { data: chapter, isLoading: chapterLoading } = useQuery<Chapter>({
    queryKey: ["/api/chapters", slug],
  });

  const { data: activities } = useQuery<Activity[]>({
    queryKey: ["/api/chapters", slug, "activities"],
    enabled: !!chapter,
  });

  const { data: leaders } = useQuery<ChapterLeader[]>({
    queryKey: ["/api/chapters", slug, "leaders"],
    enabled: !!chapter,
  });

  if (chapterLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-32 mb-8" />
        <Skeleton className="h-48 rounded-lg mb-8" />
        <Skeleton className="h-96 rounded-lg" />
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Building className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h1 className="text-2xl font-bold mb-2">Chapter Not Found</h1>
        <p className="text-muted-foreground mb-4">The chapter you're looking for doesn't exist.</p>
        <Link href="/regions">
          <Button>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Regions
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {chapter.imageUrl && (
        <div className="relative h-56 md:h-72 overflow-hidden">
          <img
            src={chapter.imageUrl}
            alt={`${chapter.city} landmark`}
            className="w-full h-full object-cover"
            data-testid="img-chapter-banner"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        </div>
      )}
      <div className={`container mx-auto px-4 ${chapter.imageUrl ? '-mt-20 relative z-10' : 'py-8'}`}>
        <Link href="/regions">
          <Button variant="ghost" className="mb-6" data-testid="button-back-to-regions">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Regions
          </Button>
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Badge variant={chapter.isActive ? "default" : "secondary"}>
                  {chapter.isActive ? "Active Chapter" : "Inactive"}
                </Badge>
              </div>
              <div className="flex items-center gap-4">
                {chapter.logoUrl ? (
                  <img src={chapter.logoUrl} alt={`${chapter.name} logo`} className="w-16 h-16 object-contain rounded-lg" data-testid="img-chapter-logo" />
                ) : chapter.iconEmoji ? (
                  <span className="text-5xl" data-testid="icon-chapter-detail">{chapter.iconEmoji}</span>
                ) : null}
                <div>
                  <h1 className="text-4xl font-bold mb-2">{chapter.name}</h1>
                  <p className="text-lg text-muted-foreground flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    {chapter.city}, {chapter.country}
                  </p>
                </div>
              </div>
            </div>

            {chapter.description && (
              <Card className="mb-8">
                <CardHeader>
                  <h2 className="font-semibold">About This Chapter</h2>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{chapter.description}</p>
                </CardContent>
              </Card>
            )}

            <Card className="mb-8">
              <CardHeader>
                <h2 className="font-semibold">Chapter Information</h2>
              </CardHeader>
              <CardContent className="space-y-4">
                {chapter.meetingSchedule && (
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Meeting Schedule</p>
                      <p className="text-muted-foreground">{chapter.meetingSchedule}</p>
                    </div>
                  </div>
                )}
                {chapter.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Meeting Location</p>
                      <p className="text-muted-foreground">{chapter.address}</p>
                    </div>
                  </div>
                )}
                {chapter.contactEmail && (
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Email</p>
                      <a href={`mailto:${chapter.contactEmail}`} className="text-primary hover:underline">
                        {chapter.contactEmail}
                      </a>
                    </div>
                  </div>
                )}
                {chapter.contactPhone && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Phone</p>
                      <a href={`tel:${chapter.contactPhone}`} className="text-primary hover:underline">
                        {chapter.contactPhone}
                      </a>
                    </div>
                  </div>
                )}
                {chapter.websiteUrl && (
                  <div className="flex items-start gap-3">
                    <Globe className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Website</p>
                      <a href={chapter.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1" data-testid="link-chapter-website">
                        {chapter.websiteUrl.replace(/^https?:\/\//, '')}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {(chapter.facebookUrl || chapter.twitterUrl || chapter.instagramUrl || chapter.youtubeUrl || chapter.whatsappLink) && (
              <Card className="mb-8">
                <CardHeader>
                  <h2 className="font-semibold">Connect With Us</h2>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    {chapter.facebookUrl && (
                      <a href={chapter.facebookUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2]/20 transition-colors" data-testid="link-chapter-facebook">
                        <SiFacebook className="w-5 h-5" />
                        Facebook
                      </a>
                    )}
                    {chapter.instagramUrl && (
                      <a href={chapter.instagramUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#E4405F]/10 text-[#E4405F] hover:bg-[#E4405F]/20 transition-colors" data-testid="link-chapter-instagram">
                        <SiInstagram className="w-5 h-5" />
                        Instagram
                      </a>
                    )}
                    {chapter.youtubeUrl && (
                      <a href={chapter.youtubeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#FF0000]/10 text-[#FF0000] hover:bg-[#FF0000]/20 transition-colors" data-testid="link-chapter-youtube">
                        <SiYoutube className="w-5 h-5" />
                        YouTube
                      </a>
                    )}
                    {chapter.whatsappLink && (
                      <a href={chapter.whatsappLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 transition-colors" data-testid="link-chapter-whatsapp">
                        <SiWhatsapp className="w-5 h-5" />
                        WhatsApp
                      </a>
                    )}
                    {chapter.twitterUrl && (
                      <a href={chapter.twitterUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-foreground/10 text-foreground hover:bg-foreground/20 transition-colors" data-testid="link-chapter-twitter">
                        <span className="font-bold text-lg">𝕏</span>
                        Twitter/X
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {leaders && leaders.length > 0 && (
              <Card className="mb-8">
                <CardHeader>
                  <h2 className="font-semibold flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Leadership Team
                  </h2>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {leaders.map((leader) => (
                      <div key={leader.id} className="flex flex-col items-center text-center p-4 bg-muted/50 rounded-xl" data-testid={`leader-${leader.id}`}>
                        {leader.image ? (
                          <img
                            src={leader.image}
                            alt={leader.name}
                            className="w-24 h-24 rounded-full object-cover mb-3 ring-2 ring-primary/20"
                          />
                        ) : (
                          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl mb-3 ring-2 ring-primary/20">
                            {leader.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                          </div>
                        )}
                        <p className="font-semibold">{leader.name}</p>
                        <p className="text-sm text-muted-foreground">{leader.title}</p>
                        {leader.bio && <p className="text-xs text-muted-foreground mt-2 line-clamp-3">{leader.bio}</p>}
                        {leader.email && (
                          <a href={`mailto:${leader.email}`} className="text-xs text-primary hover:underline mt-1">{leader.email}</a>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {activities && activities.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold mb-4">Recent Activities</h2>
                <div className="space-y-4">
                  {activities.map(activity => (
                    <Card key={activity.id} className="overflow-hidden">
                      <div className="flex">
                        {activity.imageUrl && (
                          <div className="w-32 h-32 shrink-0">
                            <img
                              src={activity.imageUrl}
                              alt={activity.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <CardContent className="p-4 flex-1">
                          <h3 className="font-semibold mb-1">{activity.title}</h3>
                          {activity.description && (
                            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{activity.description}</p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            {activity.date && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {format(new Date(activity.date), "MMM d, yyyy")}
                              </span>
                            )}
                            {activity.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {activity.location}
                              </span>
                            )}
                          </div>
                        </CardContent>
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
            )}
          </div>

          <div>
            {chapter.leaderName && (
              <Card className="sticky top-24">
                <CardHeader className="pb-2">
                  <h3 className="font-semibold text-sm text-muted-foreground">Chapter Leadership</h3>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-4">
                    <Avatar className="w-24 h-24 mx-auto mb-3">
                      <AvatarImage src={chapter.leaderImage || undefined} alt={chapter.leaderName} />
                      <AvatarFallback className="text-2xl">{chapter.leaderName.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                    </Avatar>
                    <p className="font-bold text-lg">{chapter.leaderName}</p>
                    <p className="text-sm text-muted-foreground">{chapter.leaderTitle || "Chapter Leader"}</p>
                  </div>
                  {chapter.leaderBio && (
                    <p className="text-sm text-muted-foreground mb-4">{chapter.leaderBio}</p>
                  )}
                  <div className="space-y-2">
                    {chapter.contactEmail && (
                      <Button variant="outline" className="w-full" asChild>
                        <a href={`mailto:${chapter.contactEmail}`}>
                          <Mail className="w-4 h-4 mr-2" />
                          Contact Leader
                        </a>
                      </Button>
                    )}
                    <Link href="/membership">
                      <Button className="w-full">
                        <Users className="w-4 h-4 mr-2" />
                        Join This Chapter
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
