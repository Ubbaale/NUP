import type { NewsItem } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Calendar } from "lucide-react";
import { format } from "date-fns";

interface NewsCardProps {
  news: NewsItem;
}

export function NewsCard({ news }: NewsCardProps) {
  return (
    <Card className="overflow-hidden hover-elevate group" data-testid={`news-card-${news.id}`}>
      {news.imageUrl && (
        <div className="aspect-video overflow-hidden">
          <img
            src={news.imageUrl}
            alt={news.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          {news.category && (
            <Badge variant="secondary" className="text-xs">
              {news.category}
            </Badge>
          )}
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {news.publishedAt ? format(new Date(news.publishedAt), "MMM d, yyyy") : "Recent"}
          </span>
        </div>
        <h3 className="font-semibold line-clamp-2 mb-2">{news.title}</h3>
        {news.excerpt && (
          <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{news.excerpt}</p>
        )}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{news.source}</span>
          {news.url && (
            <a
              href={news.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary text-sm flex items-center gap-1 hover:underline"
              data-testid={`news-link-${news.id}`}
            >
              Read more
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
