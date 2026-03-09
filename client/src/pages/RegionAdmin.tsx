import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Globe2, MapPin, Users, ChevronRight } from "lucide-react";
import type { Region } from "@shared/schema";

export default function RegionAdmin() {
  const { data: regions, isLoading } = useQuery<Region[]>({
    queryKey: ["/api/regions"],
  });

  return (
    <div className="min-h-screen py-8 bg-muted/30">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/admin">
            <Button variant="ghost" size="sm" data-testid="button-back-admin">
              <ArrowLeft className="w-4 h-4 mr-2" /> Admin Dashboard
            </Button>
          </Link>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <Globe2 className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold" data-testid="text-regions-admin-title">Manage Regions</h1>
            <p className="text-muted-foreground">Update region details, manage chapters and leadership</p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {regions?.map((region) => (
              <Link key={region.id} href={`/admin/regions/${region.slug}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer group" data-testid={`card-region-${region.slug}`}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold group-hover:text-primary transition-colors">{region.name}</h3>
                        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                          <Users className="w-3.5 h-3.5" />
                          <span>{region.leaderName}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{region.contactEmail}</span>
                        </div>
                        {region.leaderTitle && (
                          <Badge variant="outline" className="mt-2 text-xs">{region.leaderTitle}</Badge>
                        )}
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors mt-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
