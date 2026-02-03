import type { Chapter } from "@shared/schema";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
    <Card className="hover-elevate" data-testid={`chapter-card-${chapter.id}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-bold text-lg">{chapter.name}</h3>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {chapter.city}, {chapter.country}
            </p>
          </div>
          {chapter.isActive ? (
            <Badge variant="default">Active</Badge>
          ) : (
            <Badge variant="secondary">Inactive</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
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
