import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { SEO } from "@/components/SEO";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, Users, DollarSign, Video, Mic, Music, Presentation } from "lucide-react";
import { format } from "date-fns";
import type { VirtualEvent } from "@shared/schema";

const eventTypeIcons: Record<string, typeof Video> = {
  webinar: Presentation,
  townhall: Mic,
  concert: Music,
  workshop: Users,
};

const eventTypeLabels: Record<string, string> = {
  webinar: "Webinar",
  townhall: "Town Hall",
  concert: "Concert",
  workshop: "Workshop",
};

export default function VirtualEvents() {
  const { data: events, isLoading } = useQuery<VirtualEvent[]>({
    queryKey: ["/api/events"],
  });

  const now = new Date();
  const upcomingEvents = events?.filter(e => e.isActive && new Date(e.eventDate) >= now) || [];
  const pastEvents = events?.filter(e => !e.isActive || new Date(e.eventDate) < now) || [];
  const featuredEvents = upcomingEvents.filter(e => e.isFeatured);
  const regularEvents = upcomingEvents.filter(e => !e.isFeatured);

  return (
    <div className="min-h-screen py-8">
      <SEO
        title="Events"
        description="Join NUP Diaspora virtual events, town halls, webinars, workshops, and concerts. Connect with the Ugandan community worldwide and participate in the democracy movement."
        keywords="NUP events, People Power events, Uganda diaspora events, NUP webinar, NUP town hall, Uganda virtual events, NUP diaspora meetings, Uganda community events"
      />
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">Virtual Events</Badge>
          <h1 className="text-4xl font-bold mb-4" data-testid="text-events-title">NUP Virtual Events</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Join our virtual events from anywhere in the world. Connect with fellow NUP members
            through webinars, town halls, concerts, and workshops.
          </p>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-72 rounded-md" />
            ))}
          </div>
        ) : (
          <>
            {featuredEvents.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold mb-6">Featured Events</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {featuredEvents.map(event => (
                    <EventCard key={event.id} event={event} featured />
                  ))}
                </div>
              </div>
            )}

            {regularEvents.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold mb-6">Upcoming Events</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {regularEvents.map(event => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              </div>
            )}

            {upcomingEvents.length === 0 && (
              <Card className="p-12 text-center mb-12">
                <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No Upcoming Events</h3>
                <p className="text-muted-foreground">
                  Check back soon for new virtual event announcements.
                </p>
              </Card>
            )}

            {pastEvents.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Past Events</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pastEvents.map(event => (
                    <EventCard key={event.id} event={event} past />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function EventCard({ event, featured, past }: { event: VirtualEvent; featured?: boolean; past?: boolean }) {
  const TypeIcon = eventTypeIcons[event.eventType] || Video;
  const typeLabel = eventTypeLabels[event.eventType] || event.eventType;
  const price = parseFloat(event.ticketPrice?.toString() || "0");

  return (
    <Link href={`/events/${event.slug}`}>
      <Card
        className={`overflow-visible hover-elevate active-elevate-2 cursor-pointer ${featured ? "border-primary/30" : ""}`}
        data-testid={`card-event-${event.id}`}
      >
        {event.imageUrl && (
          <div className="aspect-video overflow-hidden rounded-t-md">
            <img
              src={event.imageUrl}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <Badge variant="secondary">
              <TypeIcon className="w-3 h-3 mr-1" />
              {typeLabel}
            </Badge>
            {featured && <Badge>Featured</Badge>}
            {past && <Badge variant="outline">Ended</Badge>}
            {price === 0 && !past && <Badge variant="outline">Free</Badge>}
          </div>

          <h3 className="text-lg font-semibold mb-2 line-clamp-2" data-testid={`text-event-title-${event.id}`}>
            {event.title}
          </h3>

          {event.description && (
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {event.description}
            </p>
          )}

          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span data-testid={`text-event-date-${event.id}`}>
                {format(new Date(event.eventDate), "MMM d, yyyy")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{format(new Date(event.eventDate), "h:mm a")}</span>
            </div>
            {event.hostName && (
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>{event.hostName}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-2 mt-4 pt-4 border-t">
            <div className="flex items-center gap-1">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
              <span className="font-semibold" data-testid={`text-event-price-${event.id}`}>
                {price === 0 ? "Free" : `$${price.toFixed(2)}`}
              </span>
            </div>
            {event.maxAttendees && (
              <span className="text-xs text-muted-foreground">
                Max {event.maxAttendees} attendees
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
