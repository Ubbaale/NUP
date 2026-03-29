import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { SEO } from "@/components/SEO";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Calendar, Clock, Users, DollarSign, Video, Mic, Music, Presentation, ExternalLink, MapPin, Plus, Loader2, Link2, User } from "lucide-react";
import { format } from "date-fns";
import type { VirtualEvent, CommunityEvent } from "@shared/schema";

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
  const { toast } = useToast();
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { data: events, isLoading } = useQuery<VirtualEvent[]>({
    queryKey: ["/api/events"],
  });

  const { data: communityEvents, isLoading: communityLoading } = useQuery<CommunityEvent[]>({
    queryKey: ["/api/community-events"],
  });

  const handleSubmitEvent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/community-events", { method: "POST", body: formData });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to submit");
      }
      toast({ title: "Event submitted!", description: "Your event is now live on the page." });
      setShowSubmitForm(false);
      queryClient.invalidateQueries({ queryKey: ["/api/community-events"] });
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      toast({ title: "Submission failed", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const now = new Date();
  const upcomingEvents = events?.filter(e => e.isActive && new Date(e.eventDate) >= now) || [];
  const pastEvents = events?.filter(e => !e.isActive || new Date(e.eventDate) < now) || [];
  const featuredEvents = upcomingEvents.filter(e => e.isFeatured);
  const regularEvents = upcomingEvents.filter(e => !e.isFeatured);

  return (
    <div className="min-h-screen py-8">
      <SEO
        title="Events"
        description="Join NUP Diaspora virtual events, town halls, webinars, workshops, and concerts. Post and discover community events organized by NUP supporters worldwide."
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

      {/* Community Events Section */}
      <div className="max-w-6xl mx-auto px-4 mb-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold" data-testid="text-community-events-heading">Community Events</h2>
            <p className="text-muted-foreground text-sm mt-1">Events organized by NUP supporters worldwide</p>
          </div>
          <Button onClick={() => setShowSubmitForm(true)} data-testid="button-submit-community-event">
            <Plus className="w-4 h-4 mr-2" /> Post an Event
          </Button>
        </div>

        {communityLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-48 rounded-lg" />)}
          </div>
        ) : communityEvents && communityEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {communityEvents.map((ce) => (
              <Card key={ce.id} className="overflow-hidden hover-elevate" data-testid={`card-community-event-${ce.id}`}>
                {ce.imageUrl && (
                  <div className="aspect-video overflow-hidden">
                    <img src={ce.imageUrl} alt={ce.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <CardContent className="p-4">
                  <h3 className="font-semibold text-base mb-2 line-clamp-2" data-testid={`text-community-event-title-${ce.id}`}>{ce.title}</h3>
                  {ce.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{ce.description}</p>
                  )}
                  <div className="space-y-1.5 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{ce.eventDate}{ce.eventTime ? ` at ${ce.eventTime}` : ""}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{ce.location}{ce.city ? `, ${ce.city}` : ""}{ce.country ? `, ${ce.country}` : ""}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5" />
                      <span>By {ce.organizerName}</span>
                    </div>
                  </div>
                  {ce.ticketUrl && (
                    <a
                      href={ce.ticketUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-3 text-sm text-primary hover:underline"
                      data-testid={`link-community-event-tickets-${ce.id}`}
                    >
                      <Link2 className="w-3.5 h-3.5" /> Get Tickets <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center border-dashed">
            <Users className="w-12 h-12 mx-auto mb-3 text-muted-foreground/40" />
            <h3 className="font-semibold mb-2">No Community Events Yet</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
              Be the first to post an event for the NUP Diaspora community. Share meetups, rallies, and gatherings happening in your area.
            </p>
            <Button onClick={() => setShowSubmitForm(true)} variant="outline" data-testid="button-submit-community-event-empty">
              <Plus className="w-4 h-4 mr-2" /> Post an Event
            </Button>
          </Card>
        )}
      </div>

      {/* Community Event Submission Dialog */}
      <Dialog open={showSubmitForm} onOpenChange={setShowSubmitForm}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Post a Community Event</DialogTitle>
            <DialogDescription>Share your NUP-related event with the diaspora community. Events appear immediately once submitted.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitEvent} className="space-y-4" data-testid="form-community-event">
            <div>
              <Label htmlFor="ce-title">Event Title *</Label>
              <Input id="ce-title" name="title" required placeholder="e.g. NUP Supporters Meetup" data-testid="input-community-event-title" />
            </div>
            <div>
              <Label htmlFor="ce-description">Description</Label>
              <Textarea id="ce-description" name="description" rows={3} placeholder="Tell people what this event is about..." data-testid="input-community-event-description" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="ce-date">Date *</Label>
                <Input id="ce-date" name="eventDate" type="date" required data-testid="input-community-event-date" />
              </div>
              <div>
                <Label htmlFor="ce-time">Time</Label>
                <Input id="ce-time" name="eventTime" type="time" data-testid="input-community-event-time" />
              </div>
            </div>
            <div>
              <Label htmlFor="ce-location">Location / Venue *</Label>
              <Input id="ce-location" name="location" required placeholder="e.g. Community Center, 123 Main St" data-testid="input-community-event-location" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="ce-city">City</Label>
                <Input id="ce-city" name="city" placeholder="e.g. London" data-testid="input-community-event-city" />
              </div>
              <div>
                <Label htmlFor="ce-country">Country</Label>
                <Input id="ce-country" name="country" placeholder="e.g. United Kingdom" data-testid="input-community-event-country" />
              </div>
            </div>
            <div>
              <Label htmlFor="ce-organizer">Your Name *</Label>
              <Input id="ce-organizer" name="organizerName" required placeholder="Full name" data-testid="input-community-event-organizer" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="ce-email">Your Email *</Label>
                <Input id="ce-email" name="organizerEmail" type="email" required placeholder="email@example.com" data-testid="input-community-event-email" />
              </div>
              <div>
                <Label htmlFor="ce-phone">Phone (optional)</Label>
                <Input id="ce-phone" name="organizerPhone" type="tel" placeholder="+1 555-0100" data-testid="input-community-event-phone" />
              </div>
            </div>
            <div>
              <Label htmlFor="ce-ticket">Ticket / Registration URL</Label>
              <Input id="ce-ticket" name="ticketUrl" type="url" placeholder="https://..." data-testid="input-community-event-ticket-url" />
            </div>
            <div>
              <Label htmlFor="ce-flyer">Event Flyer (optional)</Label>
              <Input id="ce-flyer" name="flyer" type="file" accept="image/*" data-testid="input-community-event-flyer" />
              <p className="text-xs text-muted-foreground mt-1">Max 10MB. JPG, PNG, or WebP.</p>
            </div>
            <Button type="submit" className="w-full" disabled={submitting} data-testid="button-submit-community-event-form">
              {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</> : "Post Event"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
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
