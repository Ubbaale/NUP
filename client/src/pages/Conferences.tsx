import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConferenceCard } from "@/components/ConferenceCard";
import { Calendar } from "lucide-react";
import type { Conference } from "@shared/schema";

export default function Conferences() {
  const { data: conferences, isLoading } = useQuery<Conference[]>({
    queryKey: ["/api/conferences"],
  });

  const upcomingConferences = conferences?.filter(c => c.isUpcoming) || [];
  const pastConferences = conferences?.filter(c => !c.isUpcoming) || [];

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">Annual Events</Badge>
          <h1 className="text-4xl font-bold mb-4">NUP Diaspora Conferences</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Join us at our annual conventions to meet fellow Ugandans from across the globe, 
            sharing in the same NUP initiatives and working towards a brighter future.
          </p>
        </div>

        <Tabs defaultValue="upcoming" className="space-y-8">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="upcoming" data-testid="tab-upcoming">
              Upcoming ({upcomingConferences.length})
            </TabsTrigger>
            <TabsTrigger value="archive" data-testid="tab-archive">
              Archive ({pastConferences.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            {isLoading ? (
              <div className="grid md:grid-cols-2 gap-6">
                {[1, 2].map(i => (
                  <Skeleton key={i} className="h-96 rounded-lg" />
                ))}
              </div>
            ) : upcomingConferences.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                {upcomingConferences.map(conference => (
                  <ConferenceCard key={conference.id} conference={conference} />
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No Upcoming Conferences</h3>
                <p className="text-muted-foreground">
                  Check back soon for announcements about our next convention.
                </p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="archive">
            {isLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-48 rounded-lg" />
                ))}
              </div>
            ) : pastConferences.length > 0 ? (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Past Conferences</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pastConferences.map(conference => (
                    <ConferenceCard key={conference.id} conference={conference} variant="compact" />
                  ))}
                </div>
              </div>
            ) : (
              <Card className="p-12 text-center">
                <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No Past Conferences</h3>
                <p className="text-muted-foreground">
                  Conference archives will appear here after events conclude.
                </p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
