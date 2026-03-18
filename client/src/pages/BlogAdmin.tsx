import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import {
  FileText, Plus, Trash2, Edit, ArrowLeft, Eye, EyeOff,
} from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import type { BlogPost } from "@shared/schema";

const blogFormSchema = z.object({
  authorId: z.string().min(1),
  authorName: z.string().min(2),
  title: z.string().min(3),
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/),
  content: z.string().min(10),
  excerpt: z.string().optional(),
  imageUrl: z.string().optional(),
  isPublished: z.boolean().default(false),
});

type BlogFormData = z.infer<typeof blogFormSchema>;

function getDefaults(p?: BlogPost): BlogFormData {
  return {
    authorId: p?.authorId || "admin",
    authorName: p?.authorName || "Admin",
    title: p?.title || "",
    slug: p?.slug || "",
    content: p?.content || "",
    excerpt: p?.excerpt || "",
    imageUrl: p?.imageUrl || "",
    isPublished: p?.isPublished ?? false,
  };
}

export default function BlogAdmin() {
  const { toast } = useToast();
  const [createOpen, setCreateOpen] = useState(false);
  const [editPost, setEditPost] = useState<BlogPost | null>(null);

  const { data: posts, isLoading } = useQuery<BlogPost[]>({ queryKey: ["/api/blog"] });

  const createForm = useForm<BlogFormData>({ resolver: zodResolver(blogFormSchema), defaultValues: getDefaults() });
  const editForm = useForm<BlogFormData>({ resolver: zodResolver(blogFormSchema), defaultValues: getDefaults() });

  const createMutation = useMutation({
    mutationFn: async (data: BlogFormData) => {
      const payload: any = { ...data };
      if (data.isPublished) payload.publishedAt = new Date().toISOString();
      const res = await apiRequest("POST", "/api/blog", payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
      setCreateOpen(false);
      createForm.reset(getDefaults());
      toast({ title: "Blog Post Created" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: BlogFormData }) => {
      const payload: any = { ...data };
      if (data.isPublished && !editPost?.publishedAt) payload.publishedAt = new Date().toISOString();
      const res = await apiRequest("PATCH", `/api/blog/${id}`, payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
      setEditPost(null);
      toast({ title: "Blog Post Updated" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { await apiRequest("DELETE", `/api/blog/${id}`); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
      toast({ title: "Blog Post Deleted" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const togglePublish = useMutation({
    mutationFn: async ({ id, isPublished }: { id: string; isPublished: boolean }) => {
      const payload: any = { isPublished };
      if (isPublished) payload.publishedAt = new Date().toISOString();
      const res = await apiRequest("PATCH", `/api/blog/${id}`, payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
      toast({ title: "Post Updated" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  function openEdit(p: BlogPost) { setEditPost(p); editForm.reset(getDefaults(p)); }

  function BlogForm({ form, onSubmit, isPending, label }: {
    form: ReturnType<typeof useForm<BlogFormData>>; onSubmit: (d: BlogFormData) => void; isPending: boolean; label: string;
  }) {
    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="title" render={({ field }) => (
              <FormItem><FormLabel>Title</FormLabel><FormControl><Input data-testid="input-blog-title" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="slug" render={({ field }) => (
              <FormItem><FormLabel>Slug</FormLabel><FormControl><Input data-testid="input-blog-slug" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="authorName" render={({ field }) => (
              <FormItem><FormLabel>Author Name</FormLabel><FormControl><Input data-testid="input-blog-author" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="authorId" render={({ field }) => (
              <FormItem><FormLabel>Author ID</FormLabel><FormControl><Input data-testid="input-blog-author-id" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <FormField control={form.control} name="excerpt" render={({ field }) => (
            <FormItem><FormLabel>Excerpt (optional)</FormLabel><FormControl><Textarea rows={2} data-testid="input-blog-excerpt" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="content" render={({ field }) => (
            <FormItem><FormLabel>Content</FormLabel><FormControl><Textarea rows={8} data-testid="input-blog-content" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="imageUrl" render={({ field }) => (
            <FormItem><FormLabel>Image URL (optional)</FormLabel><FormControl><Input data-testid="input-blog-image" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="isPublished" render={({ field }) => (
            <FormItem className="flex items-center gap-3"><FormLabel>Published</FormLabel><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-blog-published" /></FormControl></FormItem>
          )} />
          <Button type="submit" disabled={isPending} className="w-full" data-testid="button-blog-submit">{isPending ? "Saving..." : label}</Button>
        </form>
      </Form>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/admin"><Button variant="ghost" size="icon" data-testid="button-back"><ArrowLeft className="w-5 h-5" /></Button></Link>
          <FileText className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold" data-testid="text-blog-admin-title">Blog Posts</h1>
          <div className="ml-auto"><Button onClick={() => setCreateOpen(true)} data-testid="button-create-blog"><Plus className="w-4 h-4 mr-2" />New Post</Button></div>
        </div>

        {isLoading ? (
          <div className="space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-20 w-full" />)}</div>
        ) : !posts?.length ? (
          <Card><CardContent className="p-8 text-center text-muted-foreground">No blog posts yet</CardContent></Card>
        ) : (
          <div className="space-y-3">
            {posts.map(p => (
              <Card key={p.id} data-testid={`card-blog-${p.id}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold" data-testid={`text-blog-title-${p.id}`}>{p.title}</h3>
                        <Badge variant={p.isPublished ? "default" : "secondary"}>{p.isPublished ? "Published" : "Draft"}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>By {p.authorName}</span>
                        {p.createdAt && <span>{format(new Date(p.createdAt), "MMM d, yyyy")}</span>}
                      </div>
                      {p.excerpt && <p className="text-sm mt-1 text-muted-foreground line-clamp-2">{p.excerpt}</p>}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button variant="outline" size="sm" onClick={() => togglePublish.mutate({ id: p.id, isPublished: !p.isPublished })} data-testid={`button-toggle-publish-${p.id}`}>
                        {p.isPublished ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => openEdit(p)} data-testid={`button-edit-blog-${p.id}`}><Edit className="w-4 h-4" /></Button>
                      <Button variant="destructive" size="sm" onClick={() => { if (confirm("Delete this post?")) deleteMutation.mutate(p.id); }} data-testid={`button-delete-blog-${p.id}`}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>New Blog Post</DialogTitle></DialogHeader>
            <BlogForm form={createForm} onSubmit={(d) => createMutation.mutate(d)} isPending={createMutation.isPending} label="Create Post" />
          </DialogContent>
        </Dialog>

        {editPost && (
          <Dialog open={!!editPost} onOpenChange={(o) => !o && setEditPost(null)}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Edit: {editPost.title}</DialogTitle></DialogHeader>
              <BlogForm form={editForm} onSubmit={(d) => updateMutation.mutate({ id: editPost.id, data: d })} isPending={updateMutation.isPending} label="Save Changes" />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
