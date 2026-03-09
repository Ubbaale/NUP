import type { Chapter } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Mail, Phone, Calendar } from "lucide-react";
import { Link } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ChapterCardProps {
  chapter: Chapter;
}

export function ChapterCard({ chapter }: ChapterCardProps) {
  return (
    <Card className="hover-elevate overflow-hidden" data-testid={`chapter-card-${chapter.id}`}>
      {chapter.imageUrl && (
        <div className="relative h-40 overflow-hidden">
          <img
            src={chapter.imageUrl}
            alt={`${chapter.city} landmark`}
            className="w-full h-full object-cover"
            data-testid={`img-chapter-landmark-${chapter.id}`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-2">
            <div className="flex items-center gap-2">
              {chapter.iconEmoji && (
                <span className="text-2xl drop-shadow-lg" data-testid={`icon-chapter-${chapter.id}`}>{chapter.iconEmoji}</span>
              )}
              <div>
                <h3 className="font-bold text-lg leading-tight drop-shadow-sm">{chapter.name}</h3>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {chapter.city}, {chapter.country}
                </p>
              </div>
            </div>
            {chapter.isActive ? (
              <Badge variant="default" className="shrink-0">Active</Badge>
            ) : (
              <Badge variant="secondary" className="shrink-0">Inactive</Badge>
            )}
          </div>
        </div>
      )}

      {!chapter.imageUrl && (
        <div className="px-6 pt-6 pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-3">
              {chapter.logoUrl ? (
                <img src={chapter.logoUrl} alt={`${chapter.name} logo`} className="w-10 h-10 object-contain rounded flex-shrink-0 mt-0.5" data-testid={`img-chapter-logo-${chapter.id}`} />
              ) : chapter.iconEmoji ? (
                <span className="text-3xl leading-none mt-0.5" data-testid={`icon-chapter-${chapter.id}`}>{chapter.iconEmoji}</span>
              ) : null}
              <div>
                <h3 className="font-bold text-lg">{chapter.name}</h3>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {chapter.city}, {chapter.country}
                </p>
              </div>
            </div>
            {chapter.isActive ? (
              <Badge variant="default">Active</Badge>
            ) : (
              <Badge variant="secondary">Inactive</Badge>
            )}
          </div>
        </div>
      )}

      <CardContent className={chapter.imageUrl ? "pt-3" : "pt-0"}>
        {chapter.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{chapter.description}</p>
        )}

        {chapter.leaderName && (
          <div className="flex items-center gap-3 mb-4 p-3 bg-muted/50 rounded-md">
            <Avatar>
              <AvatarImage src={chapter.leaderImage || undefined} alt={chapter.leaderName} />
              <AvatarFallback>{chapter.leaderName.split(" ").map(n => n[0]).join("")}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm">{chapter.leaderName}</p>
              <p className="text-xs text-muted-foreground">{chapter.leaderTitle || "Chapter Leader"}</p>
            </div>
          </div>
        )}

        <div className="space-y-2 text-sm mb-4">
          {chapter.meetingSchedule && (
            <p className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              {chapter.meetingSchedule}
            </p>
          )}
          {chapter.contactEmail && (
            <a href={`mailto:${chapter.contactEmail}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <Mail className="w-4 h-4" />
              {chapter.contactEmail}
            </a>
          )}
          {chapter.contactPhone && (
            <a href={`tel:${chapter.contactPhone}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <Phone className="w-4 h-4" />
              {chapter.contactPhone}
            </a>
          )}
        </div>

        <Link href={`/chapters/${chapter.slug}`}>
          <Button variant="outline" className="w-full" data-testid={`view-chapter-${chapter.id}`}>
            View Chapter Details
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
