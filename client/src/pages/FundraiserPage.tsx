import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Target, Users, DollarSign, Heart, CheckCircle, ArrowLeft, User, Share2, Copy, Check } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { SEO } from "@/components/SEO";
import type { Campaign, CampaignDonation, CampaignFundraiser } from "@shared/schema";

const donationSchema = z.object({
  donorName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 1, {
    message: "Minimum donation is $1",
  }),
  message: z.string().optional(),
  isAnonymous: z.boolean().default(false),
});

type DonationFormData = z.infer<typeof donationSchema>;

const suggestedAmounts = [10, 25, 50, 100, 250, 500];

export default function FundraiserPage() {
  const [, params] = useRoute("/fundraise/:slug");
  const slug = params?.slug;
  const { toast } = useToast();
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  const { data: fundraiser, isLoading } = useQuery<CampaignFundraiser>({
    queryKey: ["/api/fundraisers", slug],
    enabled: !!slug,
  });

  const { data: campaign } = useQuery<Campaign>({
    queryKey: ["/api/campaigns", fundraiser?.campaignId, "by-id"],
    queryFn: async () => {
      const campaigns = await fetch("/api/campaigns").then(r => r.json());
      return campaigns.find((c: Campaign) => c.id === fundraiser?.campaignId);
    },
    enabled: !!fundraiser?.campaignId,
  });

  const { data: donations } = useQuery<CampaignDonation[]>({
    queryKey: ["/api/fundraisers", slug, "donations"],
    enabled: !!slug,
  });

  const form = useForm<DonationFormData>({
    resolver: zodResolver(donationSchema),
    defaultValues: {
      donorName: "",
      email: "",
      amount: "",
      message: "",
      isAnonymous: false,
    },
  });

  const donateMutation = useMutation({
    mutationFn: async (data: DonationFormData) => {
      if (!campaign) throw new Error("Campaign not found");
      return apiRequest("POST", `/api/campaigns/${campaign.slug}/donate`, {
        donorName: data.donorName,
        email: data.email,
        amount: data.amount,
        message: data.message || "",
        isAnonymous: data.isAnonymous,
        fundraiserId: fundraiser?.id,
      });
    },
    onSuccess: () => {
      setShowSuccess(true);
      form.reset();
      setSelectedAmount(null);
      queryClient.invalidateQueries({ queryKey: ["/api/fundraisers", slug] });
      queryClient.invalidateQueries({ queryKey: ["/api/fundraisers", slug, "donations"] });
      if (campaign) {
        queryClient.invalidateQueries({ queryKey: ["/api/campaigns", campaign.slug] });
        queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Donation Failed",
        description: error.message || "Could not process donation. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    form.setValue("amount", amount.toString());
  };

  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/fundraise/${slug}` : "";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast({ title: "Link copied!", description: "Share this link with your network." });
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4 max-w-5xl">
          <Skeleton className="h-6 w-32 mb-6" />
          <Skeleton className="h-10 w-3/4 mb-4" />
          <Skeleton className="h-4 w-full mb-8" />
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-64 w-full rounded-md" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-48 w-full rounded-md" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!fundraiser) {
    return (
      <div className="min-h-screen py-16 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4 text-center">
          <CardContent className="p-8">
            <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Fundraiser Not Found</h2>
            <p className="text-muted-foreground mb-6">This fundraiser page may no longer be active.</p>
            <Link href="/campaigns">
              <Button data-testid="link-back-campaigns">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Browse Campaigns
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const raised = Number(fundraiser.raisedAmount);
  const goal = Number(fundraiser.goalAmount);
  const progress = goal > 0 ? Math.min((raised / goal) * 100, 100) : 0;

  return (
    <>
      <SEO
        title={`${fundraiser.fullName}'s Fundraiser | NUP Diaspora`}
        description={fundraiser.personalMessage || `Support ${fundraiser.fullName}'s fundraising effort`}
      />
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4 max-w-5xl">
          {campaign && (
            <Link href={`/campaigns/${campaign.slug}`}>
              <Button variant="ghost" className="mb-6" data-testid="link-back-campaign">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to {campaign.title}
              </Button>
            </Link>
          )}

          <div className="mb-8">
            <Badge variant="secondary" className="mb-3" data-testid="badge-peer-fundraiser">
              Peer-to-Peer Fundraiser
            </Badge>
            <div className="flex items-center gap-4 mb-3">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                {fundraiser.photoUrl ? (
                  <img src={fundraiser.photoUrl} alt={fundraiser.fullName} className="w-14 h-14 rounded-full object-cover" />
                ) : (
                  <User className="w-7 h-7 text-primary" />
                )}
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold" data-testid="text-fundraiser-name">
                  {fundraiser.fullName}'s Fundraiser
                </h1>
                {campaign && (
                  <p className="text-muted-foreground text-sm">
                    Raising for: <span className="text-primary font-medium">{campaign.title}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-2xl font-bold" data-testid="text-fundraiser-raised">
                        ${raised.toLocaleString()}
                      </span>
                      <span className="text-muted-foreground" data-testid="text-fundraiser-goal">
                        of ${goal.toLocaleString()} goal
                      </span>
                    </div>
                    <Progress value={progress} className="h-3" data-testid="progress-fundraiser" />
                    <div className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-4 h-4" />
                        <span data-testid="text-fundraiser-donors">{fundraiser.donorCount || 0} supporters</span>
                      </div>
                      <span className="font-medium">{Math.round(progress)}% of goal</span>
                    </div>
                  </div>

                  {fundraiser.personalMessage && (
                    <div className="border-t pt-4">
                      <h3 className="font-bold text-lg mb-2">Why I'm Fundraising</h3>
                      <p className="text-muted-foreground whitespace-pre-wrap" data-testid="text-fundraiser-message">
                        {fundraiser.personalMessage}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    <Share2 className="w-5 h-5 text-primary" />
                    <span className="font-medium text-sm">Share this fundraiser:</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Input
                          value={shareUrl}
                          readOnly
                          className="text-xs"
                          data-testid="input-share-url"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCopyLink}
                          data-testid="button-copy-link"
                        >
                          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <Heart className="w-5 h-5 text-primary" />
                    Recent Supporters
                  </h3>
                  <CardDescription>
                    {donations && donations.length > 0
                      ? `${donations.length} people have contributed through this page`
                      : "No donations yet — be the first!"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {(!donations || donations.length === 0) ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      Be the first to contribute through this fundraiser.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {donations.map((donation) => (
                        <div
                          key={donation.id}
                          className="flex items-start gap-3 p-3 rounded-md bg-muted/30"
                          data-testid={`fundraiser-donation-${donation.id}`}
                        >
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <span className="font-medium text-sm">
                                {donation.isAnonymous ? "Anonymous" : donation.donorName}
                              </span>
                              <span className="font-semibold text-sm text-primary">
                                ${Number(donation.amount).toLocaleString()}
                              </span>
                            </div>
                            {donation.message && (
                              <p className="text-xs text-muted-foreground mt-1">{donation.message}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              {showSuccess ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">Thank You!</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Your donation through {fundraiser.fullName}'s page has been recorded.
                    </p>
                    <Button onClick={() => setShowSuccess(false)} variant="outline" data-testid="button-donate-again">
                      Make Another Donation
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <h3 className="font-bold text-lg flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-primary" />
                      Donate via {fundraiser.fullName}
                    </h3>
                    <CardDescription>Your donation counts toward {fundraiser.fullName}'s goal</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit((data) => donateMutation.mutate(data))} className="space-y-4">
                        <div>
                          <div className="grid grid-cols-3 gap-2 mb-3">
                            {suggestedAmounts.map((amount) => (
                              <Button
                                key={amount}
                                type="button"
                                variant={selectedAmount === amount ? "default" : "outline"}
                                onClick={() => handleAmountSelect(amount)}
                                data-testid={`button-fr-amount-${amount}`}
                              >
                                ${amount}
                              </Button>
                            ))}
                          </div>
                          <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Custom Amount</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                      type="number"
                                      placeholder="Enter amount"
                                      className="pl-10"
                                      {...field}
                                      onChange={(e) => {
                                        field.onChange(e);
                                        setSelectedAmount(null);
                                      }}
                                      data-testid="input-fr-donation-amount"
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="donorName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Your Name</FormLabel>
                              <FormControl>
                                <Input placeholder="John Doe" {...field} data-testid="input-fr-donor-name" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="john@example.com" {...field} data-testid="input-fr-donor-email" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="message"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Message (Optional)</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Leave a message of support..."
                                  {...field}
                                  data-testid="input-fr-donation-message"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="isAnonymous"
                          render={({ field }) => (
                            <FormItem className="flex items-center gap-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  data-testid="checkbox-fr-anonymous"
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal">Donate anonymously</FormLabel>
                            </FormItem>
                          )}
                        />

                        <Button
                          type="submit"
                          size="lg"
                          className="w-full"
                          disabled={donateMutation.isPending}
                          data-testid="button-submit-fr-donation"
                        >
                          <Heart className="w-5 h-5 mr-2" />
                          {donateMutation.isPending
                            ? "Processing..."
                            : `Donate ${form.watch("amount") ? `$${form.watch("amount")}` : ""}`}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              )}

              {campaign && (
                <Card>
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground text-center">
                      All donations go directly to the{" "}
                      <Link href={`/campaigns/${campaign.slug}`} className="text-primary hover:underline">
                        {campaign.title}
                      </Link>{" "}
                      campaign. {fundraiser.fullName} is helping raise funds on behalf of this campaign.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
