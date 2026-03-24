import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, HandHeart, Users, DollarSign, ExternalLink, Trash2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Campaign } from "@shared/schema";

interface Fundraiser {
  id: string;
  campaignId: string;
  fullName: string;
  email: string;
  slug: string;
  goalAmount: string;
  raisedAmount: string;
  personalMessage: string | null;
  photoUrl: string | null;
  donorCount: number;
  createdAt: string;
}

export default function FundraisersAdmin() {
  const { toast } = useToast();
  const { data: campaigns, isLoading: loadingCampaigns } = useQuery<Campaign[]>({
    queryKey: ["/api/campaigns"],
  });

  const activeCampaigns = campaigns?.filter(c => c.isActive) || [];

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/admin">
            <Button variant="ghost" size="icon" data-testid="button-back-admin">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-fundraisers-admin-title">Fundraisers</h1>
            <p className="text-sm text-muted-foreground">Manage peer-to-peer fundraisers across all campaigns</p>
          </div>
        </div>

        {loadingCampaigns ? (
          <div className="space-y-4">
            {[1, 2].map(i => <Skeleton key={i} className="h-48" />)}
          </div>
        ) : activeCampaigns.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <HandHeart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-bold mb-2">No Active Campaigns</h3>
              <p className="text-muted-foreground">Create a campaign first to enable peer-to-peer fundraising.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {activeCampaigns.map(campaign => (
              <CampaignFundraisers key={campaign.id} campaign={campaign} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CampaignFundraisers({ campaign }: { campaign: Campaign }) {
  const { toast } = useToast();
  const { data: fundraisers, isLoading } = useQuery<Fundraiser[]>({
    queryKey: ["/api/campaigns", campaign.slug, "fundraisers"],
    queryFn: async () => {
      const res = await fetch(`/api/campaigns/${campaign.slug}/fundraisers`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const totalRaised = fundraisers?.reduce((sum, f) => sum + Number(f.raisedAmount), 0) || 0;
  const totalDonors = fundraisers?.reduce((sum, f) => sum + (f.donorCount || 0), 0) || 0;

  return (
    <Card data-testid={`card-campaign-fundraisers-${campaign.slug}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{campaign.title}</CardTitle>
          <Badge variant="secondary">{fundraisers?.length || 0} fundraisers</Badge>
        </div>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5" />
            ${totalRaised.toLocaleString()} raised via fundraisers
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {totalDonors} donors
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-20" />
        ) : !fundraisers || fundraisers.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">No fundraisers yet for this campaign.</p>
        ) : (
          <div className="divide-y">
            {fundraisers.map(fr => (
              <div key={fr.id} className="py-3 flex items-center gap-4" data-testid={`fundraiser-row-${fr.slug}`}>
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                  {fr.photoUrl ? (
                    <img src={fr.photoUrl} alt={fr.fullName} className="w-full h-full object-cover" />
                  ) : (
                    <HandHeart className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm truncate">{fr.fullName}</p>
                    <span className="text-xs text-muted-foreground">({fr.email})</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>${Number(fr.raisedAmount).toLocaleString()} / ${Number(fr.goalAmount).toLocaleString()}</span>
                    <span>{fr.donorCount || 0} donors</span>
                    <span>{new Date(fr.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <a href={`/fundraise/${fr.slug}`} target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="icon" data-testid={`button-view-fundraiser-${fr.slug}`}>
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </a>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
