import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Target, Clock, Users, ArrowRight } from "lucide-react";
import type { Campaign } from "@shared/schema";

function CountdownTimer({ endDate }: { endDate: string | Date | null }) {
  if (!endDate) return null;
  const end = new Date(endDate);
  const now = new Date();
  const diff = end.getTime() - now.getTime();

  if (diff <= 0) {
    return <span className="text-muted-foreground text-sm">Ended</span>;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  return (
    <div className="flex items-center gap-1 text-sm text-muted-foreground" data-testid="text-countdown">
      <Clock className="w-3.5 h-3.5" />
      <span>{days}d {hours}h left</span>
    </div>
  );
}

function CampaignCard({ campaign }: { campaign: Campaign }) {
  const raised = Number(campaign.raisedAmount);
  const goal = Number(campaign.goalAmount);
  const progress = goal > 0 ? Math.min((raised / goal) * 100, 100) : 0;

  const categoryColors: Record<string, string> = {
    legal: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    education: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    healthcare: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
    infrastructure: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
    general: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  };

  return (
    <Link href={`/campaigns/${campaign.slug}`}>
      <Card className="hover-elevate cursor-pointer h-full" data-testid={`card-campaign-${campaign.id}`}>
        {campaign.imageUrl && (
          <div className="aspect-video overflow-hidden rounded-t-md">
            <img
              src={campaign.imageUrl}
              alt={campaign.title}
              className="w-full h-full object-cover"
              data-testid={`img-campaign-${campaign.id}`}
            />
          </div>
        )}
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <Badge
              variant="outline"
              className={categoryColors[campaign.category] || categoryColors.general}
              data-testid={`badge-category-${campaign.id}`}
            >
              {campaign.category}
            </Badge>
            <CountdownTimer endDate={campaign.endDate} />
          </div>

          <h3 className="font-bold text-lg leading-tight" data-testid={`text-title-${campaign.id}`}>
            {campaign.title}
          </h3>

          {campaign.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {campaign.description}
            </p>
          )}

          <div className="space-y-2">
            <Progress value={progress} className="h-2" data-testid={`progress-campaign-${campaign.id}`} />
            <div className="flex items-center justify-between gap-2 text-sm">
              <span className="font-semibold" data-testid={`text-raised-${campaign.id}`}>
                ${raised.toLocaleString()}
              </span>
              <span className="text-muted-foreground" data-testid={`text-goal-${campaign.id}`}>
                of ${goal.toLocaleString()} goal
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Users className="w-3.5 h-3.5" />
              <span data-testid={`text-donors-${campaign.id}`}>{campaign.donorCount || 0} donors</span>
            </div>
            <span className="text-sm font-medium text-primary">
              {Math.round(progress)}% funded
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function Campaigns() {
  const { data: campaigns, isLoading } = useQuery<Campaign[]>({
    queryKey: ["/api/campaigns"],
  });

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">Fundraising</Badge>
          <h1 className="text-4xl font-bold mb-4" data-testid="text-page-title">Crowdfunding Campaigns</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Support specific initiatives that advance democracy, justice, and community development.
            Every contribution brings us closer to our goals.
          </p>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <Skeleton className="aspect-video rounded-t-md" />
                <CardContent className="p-5 space-y-3">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-2 w-full" />
                  <Skeleton className="h-4 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : campaigns && campaigns.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
        ) : (
          <Card className="max-w-md mx-auto text-center">
            <CardContent className="p-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-bold text-lg mb-2">No Active Campaigns</h3>
              <p className="text-muted-foreground mb-6">
                Check back soon for new fundraising campaigns.
              </p>
              <Link href="/donate">
                <Button data-testid="link-donate-fallback">
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Make a General Donation
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
