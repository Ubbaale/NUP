import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, MapPin, Mail, Phone, Calendar, Users, Clock, Building } from "lucide-react";
import { format } from "date-fns";
import type { Chapter, Activity } from "@shared/schema";

export default function ChapterDetail() {
  const { slug } = useParams<{ slug: string }>();

  const { data: chapter, isLoading: chapterLoading } = useQuery<Chapter>({
    queryKey: ["/api/chapters", slug],
  });

  const { data: activities } = useQuery<Activity[]>({
    queryKey: ["/api/chapters", slug, "activities"],
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
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
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
                {chapter.iconEmoji && (
                  <span className="text-5xl" data-testid="icon-chapter-detail">{chapter.iconEmoji}</span>
                )}
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
              </CardContent>
            </Card>

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
