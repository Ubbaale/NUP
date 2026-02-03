import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, MapPin, ExternalLink, Users, Clock } from "lucide-react";
import { format } from "date-fns";
import type { Conference } from "@shared/schema";

export default function ConferenceDetail() {
  const { slug } = useParams<{ slug: string }>();

  const { data: conference, isLoading } = useQuery<Conference>({
    queryKey: ["/api/conferences", slug],
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-32 mb-8" />
        <Skeleton className="h-64 rounded-lg mb-8" />
        <Skeleton className="h-96 rounded-lg" />
      </div>
    );
  }

  if (!conference) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h1 className="text-2xl font-bold mb-2">Conference Not Found</h1>
        <p className="text-muted-foreground mb-4">The conference you're looking for doesn't exist.</p>
        <Link href="/conferences">
          <Button>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Conferences
          </Button>
        </Link>
      </div>
    );
  }

  const speakers = conference.speakers ? JSON.parse(conference.speakers) : [];

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <Link href="/conferences">
          <Button variant="ghost" className="mb-6" data-testid="button-back-to-conferences">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Conferences
          </Button>
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {conference.imageUrl && (
              <div className="aspect-video rounded-lg overflow-hidden mb-8">
                <img
                  src={conference.imageUrl}
                  alt={conference.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Badge variant={conference.isUpcoming ? "default" : "secondary"}>
                  {conference.isUpcoming ? "Upcoming" : "Past Event"}
                </Badge>
                <Badge variant="outline">{conference.year}</Badge>
              </div>
              <h1 className="text-4xl font-bold mb-4">{conference.title}</h1>
              {conference.theme && (
                <p className="text-xl text-muted-foreground italic">"{conference.theme}"</p>
              )}
            </div>

            {conference.description && (
              <Card className="mb-8">
                <CardHeader>
                  <h2 className="font-semibold">About This Conference</h2>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-wrap">{conference.description}</p>
                </CardContent>
              </Card>
            )}

            {speakers.length > 0 && (
              <Card>
                <CardHeader>
                  <h2 className="font-semibold flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Event Speakers
                  </h2>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {speakers.map((speaker: string, index: number) => (
                      <div key={index} className="text-center p-4 bg-muted/50 rounded-md">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                          <Users className="w-6 h-6 text-primary" />
                        </div>
                        <p className="font-medium text-sm">{speaker}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <h3 className="font-semibold">Event Details</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-muted-foreground">{conference.location}</p>
                    <p className="text-muted-foreground">{conference.city}, {conference.country}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Dates</p>
                    <p className="text-muted-foreground">
                      {conference.startDate && format(new Date(conference.startDate), "MMMM d")} - {conference.endDate && format(new Date(conference.endDate), "MMMM d, yyyy")}
                    </p>
                  </div>
                </div>

                {conference.isUpcoming && conference.registrationUrl && (
                  <Button className="w-full" asChild data-testid="button-register">
                    <a href={conference.registrationUrl} target="_blank" rel="noopener noreferrer">
                      Register Now
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </a>
                  </Button>
                )}

                {!conference.isUpcoming && (
                  <div className="p-4 bg-muted/50 rounded-md text-center">
                    <Clock className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">This event has concluded</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
