import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { NewsCard } from "@/components/NewsCard";
import { Newspaper, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { NewsItem } from "@shared/schema";

export default function News() {
  const { data: news, isLoading, refetch, isFetching } = useQuery<NewsItem[]>({
    queryKey: ["/api/news"],
  });

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">Live Updates</Badge>
          <h1 className="text-4xl font-bold mb-4">News from Uganda</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
            Stay updated with the latest news about Robert Kyagulanyi (Bobi Wine), 
            NUP activities, and political developments from Kampala, Uganda.
          </p>
          <Button 
            variant="outline" 
            onClick={() => refetch()} 
            disabled={isFetching}
            data-testid="button-refresh-news"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh News
          </Button>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Skeleton key={i} className="h-80 rounded-lg" />
            ))}
          </div>
        ) : news && news.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map(item => (
              <NewsCard key={item.id} news={item} />
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <Newspaper className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No News Available</h3>
            <p className="text-muted-foreground">
              Check back later for updates from Uganda.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
