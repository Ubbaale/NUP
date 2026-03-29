import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { SEO } from "@/components/SEO";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PenLine, Calendar, User, Star, ArrowLeft, Send, ImagePlus, BookOpen } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

interface PublicArticleSafe {
  id: string;
  title: string;
  content: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  category: string | null;
  authorName: string;
  authorBio: string | null;
  isFeatured: boolean;
  createdAt: string;
}

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

export default function PublicArticles() {
  const { toast } = useToast();
  const { data: articles, isLoading } = useQuery<PublicArticleSafe[]>({
    queryKey: ["/api/public-articles"],
  });
  const [selectedArticle, setSelectedArticle] = useState<PublicArticleSafe | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showWriteForm, setShowWriteForm] = useState(false);
  const [formCategory, setFormCategory] = useState("general");

  const submitMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch("/api/public-articles", { method: "POST", body: formData });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Submission failed");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Article Submitted", description: "Your article has been submitted for review. It will appear once approved by our team." });
      setShowWriteForm(false);
      queryClient.invalidateQueries({ queryKey: ["/api/public-articles"] });
    },
    onError: (error: Error) => {
      toast({ title: "Submission Failed", description: error.message, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("category", formCategory);
    submitMutation.mutate(fd);
  };

  const categories = articles
    ? ["all", ...Array.from(new Set(articles.map(a => a.category || "general")))]
    : ["all"];

  const filtered = articles?.filter(a =>
    selectedCategory === "all" || (a.category || "general") === selectedCategory
  ) || [];

  const featured = filtered.filter(a => a.isFeatured);
  const regular = filtered.filter(a => !a.isFeatured);

  if (selectedArticle) {
    return (
      <div className="min-h-screen py-8">
        <SEO title={`${selectedArticle.title} - Voice of the People`} description={selectedArticle.excerpt || ""} />
        <div className="container mx-auto px-4 max-w-3xl">
          <Button variant="ghost" onClick={() => setSelectedArticle(null)} className="mb-6" data-testid="button-back-articles">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Articles
          </Button>
          {selectedArticle.coverImageUrl && (
            <div className="rounded-xl overflow-hidden mb-6 aspect-[2/1]">
              <img src={selectedArticle.coverImageUrl} alt={selectedArticle.title} className="w-full h-full object-cover" />
            </div>
          )}
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="outline">{categoryLabels[selectedArticle.category || "general"] || selectedArticle.category}</Badge>
            {selectedArticle.isFeatured && (
              <Badge className="bg-yellow-500/90 text-black"><Star className="w-3 h-3 mr-0.5" /> Featured</Badge>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4" data-testid="text-article-detail-title">{selectedArticle.title}</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8 pb-6 border-b">
            <span className="flex items-center gap-1"><User className="w-4 h-4" /> {selectedArticle.authorName}</span>
            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {new Date(selectedArticle.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
          </div>
          {selectedArticle.authorBio && (
            <div className="bg-muted/50 rounded-lg p-4 mb-8">
              <p className="text-sm text-muted-foreground"><strong>About the author:</strong> {selectedArticle.authorBio}</p>
            </div>
          )}
          <div className="prose prose-lg dark:prose-invert max-w-none whitespace-pre-wrap" data-testid="text-article-content">
            {selectedArticle.content}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <SEO
        title="Voice of the People - Public Articles"
        description="Read articles from fellow Ugandans about the struggle for democracy, human rights, and justice. Share your voice — submit your own article."
        keywords="Uganda articles, NUP opinion, people power articles, Uganda democracy, diaspora voices, Uganda human rights"
      />
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            <PenLine className="w-3 h-3 mr-1" /> Voice of the People
          </Badge>
          <h1 className="text-4xl font-bold mb-4" data-testid="text-articles-title">Public Articles</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
            Articles written by fellow Ugandans about the struggle for democracy, human rights, justice, and life in the diaspora. Your voice matters — share your story.
          </p>
          <Button
            size="lg"
            onClick={() => setShowWriteForm(true)}
            data-testid="button-write-article"
          >
            <PenLine className="w-5 h-5 mr-2" /> Write an Article
          </Button>
        </div>

        {categories.length > 2 && (
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {categories.map(cat => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
                data-testid={`button-article-category-${cat}`}
              >
                {cat === "all" ? "All" : categoryLabels[cat] || cat}
              </Button>
            ))}
          </div>
        )}

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Skeleton key={i} className="h-72 rounded-lg" />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <>
            {featured.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" /> Featured Articles
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {featured.map(article => (
                    <ArticleCard key={article.id} article={article} onRead={setSelectedArticle} large />
                  ))}
                </div>
              </div>
            )}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regular.map(article => (
                <ArticleCard key={article.id} article={article} onRead={setSelectedArticle} />
              ))}
            </div>
          </>
        ) : (
          <Card className="p-12 text-center border-dashed">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground/40" />
            <h3 className="text-xl font-semibold mb-2">No Articles Yet</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-4">
              Be the first to share your voice. Write about the struggle, share your experience, or offer analysis on current events.
            </p>
            <Button onClick={() => setShowWriteForm(true)} data-testid="button-write-article-empty">
              <PenLine className="w-4 h-4 mr-2" /> Write the First Article
            </Button>
          </Card>
        )}
      </div>

      <Dialog open={showWriteForm} onOpenChange={setShowWriteForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PenLine className="w-5 h-5" /> Write an Article
            </DialogTitle>
          </DialogHeader>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
            <p className="text-xs text-blue-800 dark:text-blue-200">
              Your article will be reviewed by our team before being published. Please write thoughtfully and factually.
              Your email is kept confidential and never displayed publicly.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4" data-testid="form-public-article">
            <div>
              <Label htmlFor="pa-title">Title *</Label>
              <Input id="pa-title" name="title" required placeholder="Your article title" data-testid="input-article-title" />
            </div>
            <div>
              <Label htmlFor="pa-excerpt">Short Summary</Label>
              <Input id="pa-excerpt" name="excerpt" placeholder="A brief summary that appears in the article preview" data-testid="input-article-excerpt" />
            </div>
            <div>
              <Label htmlFor="pa-content">Article Content *</Label>
              <Textarea id="pa-content" name="content" required rows={12} placeholder="Write your article here... Share your thoughts, analysis, or personal experience related to the struggle for democracy and human rights in Uganda." data-testid="input-article-content" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Category</Label>
                <Select value={formCategory} onValueChange={setFormCategory}>
                  <SelectTrigger data-testid="select-article-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="pa-cover">Cover Image</Label>
                <Input
                  id="pa-cover"
                  name="coverImage"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif"
                  data-testid="input-article-cover"
                  className="cursor-pointer"
                />
              </div>
            </div>
            <div className="border-t pt-4">
              <p className="text-xs text-muted-foreground mb-3">About you:</p>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="pa-name">Your Name *</Label>
                    <Input id="pa-name" name="authorName" required placeholder="Your full name" data-testid="input-article-author-name" />
                  </div>
                  <div>
                    <Label htmlFor="pa-email">Email * (confidential)</Label>
                    <Input id="pa-email" name="authorEmail" type="email" required placeholder="your@email.com" data-testid="input-article-author-email" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="pa-bio">Short Bio (optional)</Label>
                  <Input id="pa-bio" name="authorBio" placeholder="e.g. Writer, activist, NUP member since 2020..." data-testid="input-article-author-bio" />
                </div>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={submitMutation.isPending}
              data-testid="button-submit-article"
            >
              {submitMutation.isPending ? "Submitting..." : <><Send className="w-4 h-4 mr-2" /> Submit Article for Review</>}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ArticleCard({ article, onRead, large }: { article: PublicArticleSafe; onRead: (a: PublicArticleSafe) => void; large?: boolean }) {
  const catLabel = categoryLabels[article.category || "general"] || article.category;

  return (
    <Card
      className="overflow-hidden hover-elevate cursor-pointer group"
      onClick={() => onRead(article)}
      data-testid={`card-article-${article.id}`}
    >
      {article.coverImageUrl && (
        <div className={`${large ? "aspect-[2/1]" : "aspect-[3/1.5]"} overflow-hidden`}>
          <img
            src={article.coverImageUrl}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          {catLabel && <Badge variant="outline" className="text-[10px]">{catLabel}</Badge>}
          {article.isFeatured && (
            <Badge className="bg-yellow-500/90 text-black text-[10px]"><Star className="w-3 h-3 mr-0.5" /> Featured</Badge>
          )}
        </div>
        <h3 className="font-semibold line-clamp-2 mb-2 group-hover:text-primary transition-colors" data-testid={`text-article-title-${article.id}`}>
          {article.title}
        </h3>
        {article.excerpt && (
          <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{article.excerpt}</p>
        )}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><User className="w-3 h-3" /> {article.authorName}</span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(article.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
