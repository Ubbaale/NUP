import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  CheckCircle, XCircle, Trash2, Clock, Star, StarOff,
  PenLine, Calendar, Mail, User, ChevronDown, ChevronUp, BookOpen, Eye
} from "lucide-react";
import type { PublicArticle } from "@shared/schema";

const categoryLabels: Record<string, string> = {
  general: "General",
  opinion: "Opinion",
  analysis: "Analysis",
  history: "History",
  human_rights: "Human Rights",
  diaspora: "Diaspora Life",
  democracy: "Democracy",
  culture: "Culture & Identity",
};

export default function PublicArticlesAdmin() {
  const { toast } = useToast();
  const [filter, setFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});

  const { data: articles, isLoading } = useQuery<PublicArticle[]>({
    queryKey: ["/api/admin/public-articles"],
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<PublicArticle> }) => {
      const res = await apiRequest("PATCH", `/api/admin/public-articles/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/public-articles"] });
      toast({ title: "Article Updated" });
    },
    onError: () => {
      toast({ title: "Update Failed", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/admin/public-articles/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/public-articles"] });
      toast({ title: "Article Deleted" });
    },
    onError: () => {
      toast({ title: "Delete Failed", variant: "destructive" });
    },
  });

  const filtered = articles?.filter(a => filter === "all" || a.status === filter) || [];
  const pendingCount = articles?.filter(a => a.status === "pending").length || 0;
  const approvedCount = articles?.filter(a => a.status === "approved").length || 0;
  const rejectedCount = articles?.filter(a => a.status === "rejected").length || 0;

  const statusColor: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    approved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-articles-admin-title">Public Articles</h1>
          <p className="text-muted-foreground">Review and moderate community-submitted articles</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:border-primary" onClick={() => setFilter("all")} data-testid="card-articles-filter-all">
          <CardContent className="p-4 text-center">
            <BookOpen className="w-6 h-6 mx-auto mb-1 text-muted-foreground" />
            <p className="text-2xl font-bold">{articles?.length || 0}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-yellow-500" onClick={() => setFilter("pending")} data-testid="card-articles-filter-pending">
          <CardContent className="p-4 text-center">
            <Clock className="w-6 h-6 mx-auto mb-1 text-yellow-500" />
            <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-green-500" onClick={() => setFilter("approved")} data-testid="card-articles-filter-approved">
          <CardContent className="p-4 text-center">
            <CheckCircle className="w-6 h-6 mx-auto mb-1 text-green-500" />
            <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
            <p className="text-xs text-muted-foreground">Approved</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-red-500" onClick={() => setFilter("rejected")} data-testid="card-articles-filter-rejected">
          <CardContent className="p-4 text-center">
            <XCircle className="w-6 h-6 mx-auto mb-1 text-red-500" />
            <p className="text-2xl font-bold text-red-600">{rejectedCount}</p>
            <p className="text-xs text-muted-foreground">Rejected</p>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : filtered.length === 0 ? (
        <Card className="p-8 text-center border-dashed">
          <BookOpen className="w-12 h-12 mx-auto mb-3 text-muted-foreground/40" />
          <h3 className="font-semibold">No Articles {filter !== "all" ? `(${filter})` : ""}</h3>
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map(article => (
            <Card key={article.id} data-testid={`card-admin-article-${article.id}`} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  {article.coverImageUrl && (
                    <div className="md:w-48 flex-shrink-0">
                      <img src={article.coverImageUrl} alt={article.title} className="w-full h-full object-cover aspect-square md:aspect-auto" />
                    </div>
                  )}
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h3 className="font-semibold text-lg">{article.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={`text-[10px] ${statusColor[article.status] || ""}`}>
                            {article.status === "pending" && <Clock className="w-3 h-3 mr-0.5" />}
                            {article.status === "approved" && <CheckCircle className="w-3 h-3 mr-0.5" />}
                            {article.status === "rejected" && <XCircle className="w-3 h-3 mr-0.5" />}
                            {article.status.charAt(0).toUpperCase() + article.status.slice(1)}
                          </Badge>
                          <Badge variant="outline" className="text-[10px]">
                            {categoryLabels[article.category || "general"] || article.category}
                          </Badge>
                          {article.isFeatured && (
                            <Badge className="bg-yellow-500/90 text-black text-[10px]"><Star className="w-3 h-3 mr-0.5" /> Featured</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        {article.status !== "approved" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 hover:bg-green-50"
                            onClick={() => updateMutation.mutate({ id: article.id, data: { status: "approved" } })}
                            data-testid={`button-approve-article-${article.id}`}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" /> Approve
                          </Button>
                        )}
                        {article.status !== "rejected" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => updateMutation.mutate({ id: article.id, data: { status: "rejected" } })}
                            data-testid={`button-reject-article-${article.id}`}
                          >
                            <XCircle className="w-4 h-4 mr-1" /> Reject
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateMutation.mutate({ id: article.id, data: { isFeatured: !article.isFeatured } })}
                          data-testid={`button-feature-article-${article.id}`}
                        >
                          {article.isFeatured ? <StarOff className="w-4 h-4" /> : <Star className="w-4 h-4" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            if (confirm("Permanently delete this article?")) {
                              deleteMutation.mutate(article.id);
                            }
                          }}
                          data-testid={`button-delete-article-${article.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {article.excerpt && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{article.excerpt}</p>
                    )}

                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-3">
                      <span className="flex items-center gap-1"><User className="w-3 h-3" /> {article.authorName}</span>
                      {article.createdAt && (
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(article.createdAt).toLocaleDateString()}</span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs"
                        onClick={() => setPreviewId(previewId === article.id ? null : article.id)}
                        data-testid={`button-preview-article-${article.id}`}
                      >
                        <Eye className="w-3 h-3 mr-1" /> {previewId === article.id ? "Hide" : "Preview"} Content
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs"
                        onClick={() => setExpandedId(expandedId === article.id ? null : article.id)}
                        data-testid={`button-details-article-${article.id}`}
                      >
                        {expandedId === article.id ? <ChevronUp className="w-3 h-3 mr-1" /> : <ChevronDown className="w-3 h-3 mr-1" />}
                        Author Details & Notes
                      </Button>
                    </div>

                    {previewId === article.id && (
                      <div className="mt-3 p-4 bg-muted/30 rounded-lg border">
                        <p className="text-sm whitespace-pre-wrap">{article.content}</p>
                      </div>
                    )}

                    {expandedId === article.id && (
                      <div className="mt-3 p-3 bg-muted/50 rounded-lg space-y-3">
                        <div className="flex flex-wrap gap-4 text-sm">
                          <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> {article.authorName}</span>
                          <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {article.authorEmail}</span>
                        </div>
                        {article.authorBio && (
                          <p className="text-sm text-muted-foreground">Bio: {article.authorBio}</p>
                        )}
                        <div>
                          <label className="text-xs font-medium mb-1 block">Admin Notes:</label>
                          <Textarea
                            rows={2}
                            value={adminNotes[article.id] ?? article.adminNotes ?? ""}
                            onChange={(e) => setAdminNotes({ ...adminNotes, [article.id]: e.target.value })}
                            placeholder="Internal notes about this article..."
                            data-testid={`input-article-admin-notes-${article.id}`}
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            className="mt-2"
                            onClick={() => updateMutation.mutate({ id: article.id, data: { adminNotes: adminNotes[article.id] ?? article.adminNotes ?? "" } })}
                            data-testid={`button-save-article-notes-${article.id}`}
                          >
                            Save Notes
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
