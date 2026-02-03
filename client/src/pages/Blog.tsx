import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { BlogPostCard } from "@/components/BlogPostCard";
import { BookOpen, Plus, Pencil, Lock } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { BlogPost } from "@shared/schema";

const blogPostSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  content: z.string().min(50, "Content must be at least 50 characters"),
  excerpt: z.string().optional(),
  authorName: z.string().min(2, "Author name is required"),
  authorId: z.string().default("member"),
});

type BlogPostData = z.infer<typeof blogPostSchema>;

export default function Blog() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [memberEmail, setMemberEmail] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const { data: posts, isLoading } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog"],
  });

  const form = useForm<BlogPostData>({
    resolver: zodResolver(blogPostSchema),
    defaultValues: {
      title: "",
      content: "",
      excerpt: "",
      authorName: "",
      authorId: "member",
    },
  });

  const createPostMutation = useMutation({
    mutationFn: async (data: BlogPostData) => {
      return apiRequest("POST", "/api/blog", {
        ...data,
        isPublished: true,
        publishedAt: new Date().toISOString(),
        slug: data.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      });
    },
    onSuccess: () => {
      toast({ title: "Post Published!", description: "Your blog post has been published successfully." });
      form.reset();
      setIsDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to publish",
        description: error.message || "Could not publish post. Please try again.",
        variant: "destructive",
      });
    },
  });

  const verifyMember = async () => {
    if (!memberEmail.trim()) {
      toast({ title: "Error", description: "Please enter your email", variant: "destructive" });
      return;
    }
    
    setIsVerifying(true);
    try {
      const response = await fetch(`/api/members/search?q=${encodeURIComponent(memberEmail)}`);
      if (response.ok) {
        const member = await response.json();
        setIsVerified(true);
        form.setValue("authorName", `${member.firstName} ${member.lastName}`);
        form.setValue("authorId", member.id);
        toast({ title: "Verified!", description: "You can now create blog posts." });
      } else {
        toast({ 
          title: "Not Found", 
          description: "No member found with this email. Please register first.", 
          variant: "destructive" 
        });
      }
    } catch {
      toast({ title: "Error", description: "Verification failed. Please try again.", variant: "destructive" });
    } finally {
      setIsVerifying(false);
    }
  };

  const onSubmit = (data: BlogPostData) => {
    createPostMutation.mutate(data);
  };

  const publishedPosts = posts?.filter(p => p.isPublished) || [];

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <Badge variant="secondary" className="mb-2">Member Content</Badge>
            <h1 className="text-4xl font-bold">NUP Diaspora Blog</h1>
            <p className="text-muted-foreground">Stories and updates from our community members</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-post">
                <Plus className="w-4 h-4 mr-2" />
                Create Post
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Pencil className="w-5 h-5" />
                  Create New Blog Post
                </DialogTitle>
              </DialogHeader>

              {!isVerified ? (
                <div className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-md">
                    <div className="flex items-start gap-3">
                      <Lock className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium mb-1">Members Only</p>
                        <p className="text-sm text-muted-foreground">
                          Only registered NUP members can create blog posts. Please verify your membership to continue.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="email"
                      placeholder="Enter your registered email"
                      value={memberEmail}
                      onChange={(e) => setMemberEmail(e.target.value)}
                      data-testid="input-verify-email"
                    />
                    <Button onClick={verifyMember} disabled={isVerifying} data-testid="button-verify">
                      {isVerifying ? "Verifying..." : "Verify"}
                    </Button>
                  </div>
                </div>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Post Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your post title..." {...field} data-testid="input-post-title" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="excerpt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Excerpt (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Brief summary of your post..." {...field} data-testid="input-excerpt" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Content</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Write your blog post content here..." 
                              className="min-h-[200px]"
                              {...field} 
                              data-testid="input-content"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="authorName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Author Name</FormLabel>
                          <FormControl>
                            <Input {...field} disabled data-testid="input-author-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={createPostMutation.isPending}
                      data-testid="button-publish-post"
                    >
                      {createPostMutation.isPending ? "Publishing..." : "Publish Post"}
                    </Button>
                  </form>
                </Form>
              )}
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Skeleton key={i} className="h-80 rounded-lg" />
            ))}
          </div>
        ) : publishedPosts.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publishedPosts.map(post => (
              <BlogPostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No Blog Posts Yet</h3>
            <p className="text-muted-foreground mb-4">
              Be the first to share your story with the NUP community.
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Post
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
