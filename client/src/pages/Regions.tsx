import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { WorldMap } from "@/components/WorldMap";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Globe2, MapPin, Mail, Phone, Users, ChevronRight } from "lucide-react";
import type { Region } from "@shared/schema";

export default function Regions() {
  const { data: regions, isLoading } = useQuery<Region[]>({
    queryKey: ["/api/regions"],
  });

  return (
    <div className="min-h-screen py-8">
      <SEO
        title="Global Regions & Chapters"
        description="Find NUP Diaspora chapters in your region. Our global network spans North America, Europe, Africa, Asia, Middle East, and Oceania with active chapters working towards a free Uganda."
        keywords="NUP chapters, NUP diaspora regions, People Power chapters, NUP North America, NUP Europe, NUP Africa, Uganda diaspora chapters, NUP worldwide, find NUP chapter"
      />
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">Global Network</Badge>
          <h1 className="text-4xl font-bold mb-4">NUP Diaspora Regions</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Connect with NUP chapters and members in your region. Our global network spans 
            six major regions with active chapters working towards a free Uganda.
          </p>
        </div>

        <div className="mb-12">
          {isLoading ? (
            <Skeleton className="w-full aspect-[2/1] rounded-lg" />
          ) : (
            <WorldMap regions={regions || []} />
          )}
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">Regional Leadership</h2>
          <p className="text-muted-foreground">
            Each region is led by a representative who sits on the Diaspora Council
          </p>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Skeleton key={i} className="h-64 rounded-lg" />
            ))}
          </div>
        ) : regions && regions.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regions.map(region => (
              <Card key={region.id} className="overflow-hidden hover-elevate" data-testid={`region-card-${region.id}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-md flex items-center justify-center">
                        <Globe2 className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{region.name}</h3>
                        <Badge variant="outline" className="text-xs mt-1">
                          <Users className="w-3 h-3 mr-1" />
                          Regional Council
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {region.description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{region.description}</p>
                  )}

                  {region.leaderName && (
                    <div className="flex items-center gap-3 mb-4 p-3 bg-muted/50 rounded-md">
                      <Avatar>
                        <AvatarImage src={region.leaderImage || undefined} alt={region.leaderName} />
                        <AvatarFallback>{region.leaderName.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{region.leaderName}</p>
                        <p className="text-xs text-muted-foreground">{region.leaderTitle || "Regional Coordinator"}</p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2 text-sm mb-4">
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

                  <Link href={`/regions/${region.slug}`}>
                    <Button variant="outline" className="w-full" data-testid={`view-region-${region.id}`}>
                      View Chapters
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <Globe2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-semibold mb-2">No Regions Found</h3>
            <p className="text-muted-foreground">Regions will be displayed here once available.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
