import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { HandHeart, Users, ArrowRight, Target, Trophy } from "lucide-react";
import { SEO } from "@/components/SEO";
import type { Campaign } from "@shared/schema";

export default function Fundraise() {
  const { data: campaigns, isLoading } = useQuery<Campaign[]>({
    queryKey: ["/api/campaigns"],
  });

  const activeCampaigns = campaigns?.filter(c => c.isActive) || [];

  return (
    <>
      <SEO
        title="Fundraise | NUP Diaspora"
        description="Start your own fundraising page for NUP campaigns. Share with friends and family to raise funds for the causes that matter."
        keywords="fundraise, peer-to-peer, NUP, People Power, Uganda, diaspora fundraising"
      />
      <div className="min-h-screen">
        <div className="bg-gradient-to-br from-primary/10 via-background to-primary/5 py-16 lg:py-24">
          <div className="container mx-auto px-4 text-center max-w-3xl">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <HandHeart className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-3xl lg:text-5xl font-bold mb-4" data-testid="text-fundraise-title">
              Start Your Own Fundraiser
            </h1>
            <p className="text-lg text-muted-foreground mb-2" data-testid="text-fundraise-subtitle">
              Create your personal fundraising page, share it with friends and family, and help raise money for the causes you believe in.
            </p>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
              It's simple — pick a campaign below, set your goal, and share your link via WhatsApp, text, or Facebook. Every donation you bring in is tracked on your page.
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12 max-w-5xl">
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">Choose a Campaign to Fundraise For</h2>
          </div>
          <p className="text-muted-foreground mb-8">
            Select a campaign and create your personal fundraising page in under a minute.
          </p>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-64 rounded-lg" />
              ))}
            </div>
          ) : activeCampaigns.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-bold mb-2">No Active Campaigns</h3>
                <p className="text-muted-foreground">Check back soon — new campaigns are added regularly.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeCampaigns.map(campaign => {
                const raised = Number(campaign.raisedAmount);
                const goal = Number(campaign.goalAmount);
                const pct = goal > 0 ? Math.min((raised / goal) * 100, 100) : 0;

                return (
                  <Card key={campaign.id} className="overflow-hidden hover:shadow-lg transition-shadow" data-testid={`campaign-card-${campaign.id}`}>
                    {campaign.imageUrl && (
                      <div className="aspect-video overflow-hidden">
                        <img src={campaign.imageUrl} alt={campaign.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <CardContent className={`p-5 ${!campaign.imageUrl ? "pt-6" : ""}`}>
                      <h3 className="font-bold text-lg mb-2 line-clamp-2" data-testid={`text-campaign-title-${campaign.id}`}>
                        {campaign.title}
                      </h3>
                      {campaign.description && (
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{campaign.description}</p>
                      )}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-semibold">${raised.toLocaleString()} raised</span>
                          <span className="text-muted-foreground">of ${goal.toLocaleString()}</span>
                        </div>
                        <Progress value={pct} className="h-2" />
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Users className="w-3.5 h-3.5" />
                          <span>{campaign.donorCount || 0} donors</span>
                        </div>
                      </div>
                      <Link href={`/campaigns/${campaign.slug}`}>
                        <Button className="w-full gap-2" data-testid={`button-fundraise-${campaign.slug}`}>
                          <HandHeart className="w-4 h-4" />
                          Start Fundraising
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          <div className="mt-16 bg-muted/50 rounded-2xl p-8 lg:p-12">
            <h2 className="text-2xl font-bold mb-6 text-center">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">1</span>
                </div>
                <h3 className="font-bold mb-2">Pick a Campaign</h3>
                <p className="text-sm text-muted-foreground">
                  Choose a campaign you care about from the list above and click "Start Fundraising."
                </p>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">2</span>
                </div>
                <h3 className="font-bold mb-2">Create Your Page</h3>
                <p className="text-sm text-muted-foreground">
                  Add your name, photo, set your goal, and write a personal message. You'll get your own unique link.
                </p>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">3</span>
                </div>
                <h3 className="font-bold mb-2">Share & Raise</h3>
                <p className="text-sm text-muted-foreground">
                  Share your link via WhatsApp, text message, or Facebook. Track every donation on your page.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <h3 className="font-bold text-lg">Top fundraisers appear on the campaign leaderboard!</h3>
            </div>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto">
              Every campaign page shows a leaderboard ranking fundraisers by how much they've raised. See your name rise as your supporters donate.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
