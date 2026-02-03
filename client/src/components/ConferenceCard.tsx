import type { Conference } from "@shared/schema";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";

interface ConferenceCardProps {
  conference: Conference;
  variant?: "default" | "compact";
}

export function ConferenceCard({ conference, variant = "default" }: ConferenceCardProps) {
  const isUpcoming = conference.isUpcoming;

  if (variant === "compact") {
    return (
      <Card className="hover-elevate" data-testid={`conference-card-${conference.id}`}>
        <CardContent className="p-4 flex items-center gap-4">
          <div className="w-16 h-16 bg-primary/10 rounded-md flex flex-col items-center justify-center shrink-0">
            <span className="text-primary font-bold text-xl">{conference.year}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{conference.title}</h3>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {conference.city}, {conference.country}
            </p>
          </div>
          <Link href={`/conferences/${conference.slug}`}>
            <Button variant="ghost" size="sm" data-testid={`view-conference-${conference.id}`}>
              View
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden hover-elevate" data-testid={`conference-card-${conference.id}`}>
      {conference.imageUrl && (
        <div className="aspect-video overflow-hidden">
          <img
            src={conference.imageUrl}
            alt={conference.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant={isUpcoming ? "default" : "secondary"}>
            {isUpcoming ? "Upcoming" : "Past"}
          </Badge>
          <Badge variant="outline">{conference.year}</Badge>
        </div>
        <h3 className="font-bold text-lg">{conference.title}</h3>
      </CardHeader>
      <CardContent className="pt-0">
        {conference.theme && (
          <p className="text-sm text-muted-foreground italic mb-3">"{conference.theme}"</p>
        )}
        <div className="space-y-2 text-sm mb-4">
          <p className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            {conference.location}, {conference.city}, {conference.country}
          </p>
          <p className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            {conference.startDate && format(new Date(conference.startDate), "MMM d")} - {conference.endDate && format(new Date(conference.endDate), "MMM d, yyyy")}
          </p>
        </div>
        {conference.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{conference.description}</p>
        )}
        <div className="flex gap-2">
          <Link href={`/conferences/${conference.slug}`} className="flex-1">
            <Button variant="outline" className="w-full" data-testid={`view-conference-${conference.id}`}>
              Learn More
            </Button>
          </Link>
          {isUpcoming && conference.registrationUrl && (
            <Button asChild data-testid={`register-conference-${conference.id}`}>
              <a href={conference.registrationUrl} target="_blank" rel="noopener noreferrer">
                Register
                <ExternalLink className="w-4 h-4 ml-2" />
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
