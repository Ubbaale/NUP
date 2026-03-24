import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Newspaper, RefreshCw, ExternalLink, Clock } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface NewsArticle {
  id: string;
  title: string;
  description: string | null;
  url: string;
  source: string | null;
  imageUrl: string | null;
  publishedAt: string | null;
  category: string | null;
  createdAt: string;
}

export default function NewsAdmin() {
  const { toast } = useToast();
  const { data: articles, isLoading } = useQuery<NewsArticle[]>({
    queryKey: ["/api/news"],
  });

  const refreshMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/news/refresh");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/news"] });
      toast({ title: "News Refreshed", description: `${data.added || 0} new articles added.` });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to refresh news.", variant: "destructive" });
    },
  });

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link href="/admin">
              <Button variant="ghost" size="icon" data-testid="button-back-admin">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold" data-testid="text-news-admin-title">News</h1>
              <p className="text-sm text-muted-foreground">
                Live news articles fetched automatically every 30 minutes
              </p>
            </div>
          </div>
          <Button
            onClick={() => refreshMutation.mutate()}
            disabled={refreshMutation.isPending}
            className="gap-2"
            data-testid="button-refresh-news"
          >
            <RefreshCw className={`w-4 h-4 ${refreshMutation.isPending ? "animate-spin" : ""}`} />
            Refresh Now
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{articles?.length || 0}</p>
              <p className="text-xs text-muted-foreground">Total Articles</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">
                {articles ? new Set(articles.map(a => a.source).filter(Boolean)).size : 0}
              </p>
              <p className="text-xs text-muted-foreground">Sources</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">30 min</p>
              <p className="text-xs text-muted-foreground">Auto-Refresh Interval</p>
            </CardContent>
          </Card>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-20" />)}
          </div>
        ) : !articles || articles.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Newspaper className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-bold mb-2">No News Articles</h3>
              <p className="text-muted-foreground mb-4">Click "Refresh Now" to fetch the latest Uganda news.</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">All Articles ({articles.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y max-h-[600px] overflow-y-auto">
                {articles.map(article => (
                  <div key={article.id} className="py-3 flex items-start gap-3" data-testid={`news-row-${article.id}`}>
                    {article.imageUrl && (
                      <img src={article.imageUrl} alt="" className="w-16 h-12 object-cover rounded flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm line-clamp-1">{article.title}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        {article.source && <Badge variant="outline" className="text-[10px] py-0">{article.source}</Badge>}
                        {article.publishedAt && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(article.publishedAt).toLocaleDateString()}
                          </span>
                        )}
                        {article.category && <Badge variant="secondary" className="text-[10px] py-0">{article.category}</Badge>}
                      </div>
                    </div>
                    <a href={article.url} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="icon" className="flex-shrink-0">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </a>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
