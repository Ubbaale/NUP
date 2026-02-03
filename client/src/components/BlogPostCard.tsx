import type { BlogPost } from "@shared/schema";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, User } from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";

interface BlogPostCardProps {
  post: BlogPost;
}

export function BlogPostCard({ post }: BlogPostCardProps) {
  return (
    <Link href={`/blog/${post.slug}`}>
      <Card className="overflow-hidden hover-elevate cursor-pointer h-full" data-testid={`blog-post-${post.id}`}>
        {post.imageUrl && (
          <div className="aspect-video overflow-hidden">
            <img
              src={post.imageUrl}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant={post.isPublished ? "default" : "secondary"}>
              {post.isPublished ? "Published" : "Draft"}
            </Badge>
          </div>
          <h3 className="font-bold text-lg line-clamp-2">{post.title}</h3>
        </CardHeader>
        <CardContent className="pt-0">
          {post.excerpt && (
            <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{post.excerpt}</p>
          )}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Avatar className="w-6 h-6">
                <AvatarFallback className="text-xs">
                  {post.authorName.split(" ").map(n => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <span>{post.authorName}</span>
            </div>
            {post.publishedAt && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {format(new Date(post.publishedAt), "MMM d, yyyy")}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
