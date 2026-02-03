import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChapterCard } from "@/components/ChapterCard";
import { ArrowLeft, Globe2, Mail, Phone, Users, MapPin } from "lucide-react";
import type { Region, Chapter, CouncilMember } from "@shared/schema";

export default function RegionDetail() {
  const { slug } = useParams<{ slug: string }>();

  const { data: region, isLoading: regionLoading } = useQuery<Region>({
    queryKey: ["/api/regions", slug],
  });

  const { data: chapters, isLoading: chaptersLoading } = useQuery<Chapter[]>({
    queryKey: ["/api/regions", slug, "chapters"],
    enabled: !!region,
  });

  const { data: councilMembers } = useQuery<CouncilMember[]>({
    queryKey: ["/api/regions", slug, "council"],
    enabled: !!region,
  });

  if (regionLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-32 mb-8" />
        <Skeleton className="h-48 rounded-lg mb-8" />
        <Skeleton className="h-96 rounded-lg" />
      </div>
    );
  }

  if (!region) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Globe2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h1 className="text-2xl font-bold mb-2">Region Not Found</h1>
        <p className="text-muted-foreground mb-4">The region you're looking for doesn't exist.</p>
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
            Back to All Regions
          </Button>
        </Link>

        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2">
            <Badge variant="secondary" className="mb-4">Regional Network</Badge>
            <h1 className="text-4xl font-bold mb-4">{region.name}</h1>
            {region.description && (
              <p className="text-lg text-muted-foreground mb-6">{region.description}</p>
            )}

            <div className="flex flex-wrap gap-4 text-sm">
              {region.contactEmail && (
                <a href={`mailto:${region.contactEmail}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                  <Mail className="w-4 h-4" />
                  {region.contactEmail}
                </a>
              )}
              {region.contactPhone && (
                <a href={`tel:${region.contactPhone}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                  <Phone className="w-4 h-4" />
                  {region.contactPhone}
                </a>
              )}
            </div>
          </div>

          {region.leaderName && (
            <Card>
              <CardHeader className="pb-2">
                <h3 className="font-semibold text-sm text-muted-foreground">Regional Coordinator</h3>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={region.leaderImage || undefined} alt={region.leaderName} />
                    <AvatarFallback className="text-lg">{region.leaderName.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold text-lg">{region.leaderName}</p>
                    <p className="text-sm text-muted-foreground">{region.leaderTitle || "Regional Coordinator"}</p>
                    <Badge variant="outline" className="mt-1 text-xs">Diaspora Council</Badge>
                  </div>
                </div>
                {region.leaderBio && (
                  <p className="text-sm text-muted-foreground">{region.leaderBio}</p>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {councilMembers && councilMembers.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Regional Council</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {councilMembers.map(member => (
                <Card key={member.id} className="p-4 text-center">
                  <Avatar className="w-16 h-16 mx-auto mb-3">
                    <AvatarImage src={member.imageUrl || undefined} alt={member.name} />
                    <AvatarFallback>{member.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                  </Avatar>
                  <p className="font-semibold">{member.name}</p>
                  <p className="text-sm text-muted-foreground">{member.role}</p>
                </Card>
              ))}
            </div>
          </section>
        )}

        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">Chapters in {region.name}</h2>
              <p className="text-muted-foreground">Local chapters managed by chapter leaders</p>
            </div>
            <Badge variant="outline">
              <Users className="w-3 h-3 mr-1" />
              {chapters?.length || 0} Chapters
            </Badge>
          </div>

          {chaptersLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-64 rounded-lg" />
              ))}
            </div>
          ) : chapters && chapters.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {chapters.map(chapter => (
                <ChapterCard key={chapter.id} chapter={chapter} />
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <MapPin className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-semibold mb-2">No Chapters Yet</h3>
              <p className="text-muted-foreground">Chapters in this region will be displayed here.</p>
            </Card>
          )}
        </section>
      </div>
    </div>
  );
}
