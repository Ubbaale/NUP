import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { NewsCard } from "@/components/NewsCard";
import { Newspaper, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { NewsItem } from "@shared/schema";

export default function News() {
  const { toast } = useToast();
  const { data: news, isLoading } = useQuery<NewsItem[]>({
    queryKey: ["/api/news"],
  });

  const refreshMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/news/refresh");
      return res.json();
    },
    onSuccess: (data: { count: number }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/news"] });
      toast({
        title: "News Refreshed",
        description: data.count > 0
          ? `Found ${data.count} new article${data.count !== 1 ? "s" : ""} from international sources.`
          : "No new articles found. Check back later.",
      });
    },
    onError: () => {
      toast({
        title: "Refresh Failed",
        description: "Could not fetch latest news. Please try again.",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">Live Updates</Badge>
          <h1 className="text-4xl font-bold mb-4">News from Uganda</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
            Stay updated with the latest news about Robert Kyagulanyi (Bobi Wine), 
            NUP activities, and political developments from international and local sources.
          </p>
          <Button 
            variant="outline" 
            onClick={() => refreshMutation.mutate()} 
            disabled={refreshMutation.isPending}
            data-testid="button-refresh-news"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshMutation.isPending ? 'animate-spin' : ''}`} />
            {refreshMutation.isPending ? "Fetching Latest News..." : "Refresh News"}
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
