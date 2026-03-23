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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Target, Clock, Users, DollarSign, Heart, CheckCircle, ArrowLeft, User, Trophy, UserPlus, Share2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
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

function CountdownTimer({ endDate }: { endDate: string | Date | null }) {
  if (!endDate) return null;
  const end = new Date(endDate);
  const now = new Date();
  const diff = end.getTime() - now.getTime();

  if (diff <= 0) {
    return <Badge variant="outline">Campaign Ended</Badge>;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return (
    <div className="flex items-center gap-3 text-sm" data-testid="text-countdown-detail">
      <Clock className="w-4 h-4 text-muted-foreground" />
      <div className="flex gap-3">
        <div className="text-center">
          <span className="font-bold text-lg block">{days}</span>
          <span className="text-muted-foreground text-xs">days</span>
        </div>
        <div className="text-center">
          <span className="font-bold text-lg block">{hours}</span>
          <span className="text-muted-foreground text-xs">hours</span>
        </div>
        <div className="text-center">
          <span className="font-bold text-lg block">{minutes}</span>
          <span className="text-muted-foreground text-xs">min</span>
        </div>
      </div>
    </div>
  );
}

function DonorWall({ donations }: { donations: CampaignDonation[] }) {
  if (!donations || donations.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        Be the first to contribute to this campaign.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {donations.map((donation) => (
        <div
          key={donation.id}
          className="flex items-start gap-3 p-3 rounded-md bg-muted/30"
          data-testid={`donation-entry-${donation.id}`}
        >
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="font-medium text-sm" data-testid={`text-donor-name-${donation.id}`}>
                {donation.isAnonymous ? "Anonymous" : donation.donorName}
              </span>
              <span className="font-semibold text-sm text-primary" data-testid={`text-donation-amount-${donation.id}`}>
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
  );
}

const fundraiserSignupSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  personalMessage: z.string().optional(),
  goalAmount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 50, {
    message: "Minimum goal is $50",
  }),
});

type FundraiserSignupData = z.infer<typeof fundraiserSignupSchema>;

function FundraiserLeaderboard({ fundraisers, campaignSlug }: { fundraisers: CampaignFundraiser[]; campaignSlug: string }) {
  if (!fundraisers || fundraisers.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <h3 className="font-bold text-lg flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Fundraiser Leaderboard
        </h3>
        <CardDescription>
          {fundraisers.length} {fundraisers.length === 1 ? "person is" : "people are"} fundraising for this campaign
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {fundraisers.map((fr, index) => {
            const raised = Number(fr.raisedAmount);
            const goal = Number(fr.goalAmount);
            const pct = goal > 0 ? Math.min((raised / goal) * 100, 100) : 0;
            return (
              <a
                key={fr.id}
                href={`/fundraise/${fr.slug}`}
                className="flex items-center gap-3 p-3 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors group"
                data-testid={`fundraiser-leaderboard-${fr.id}`}
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-sm font-bold text-primary">
                  {index < 3 ? ["🥇", "🥈", "🥉"][index] : `#${index + 1}`}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="font-medium text-sm group-hover:text-primary transition-colors" data-testid={`text-fr-name-${fr.id}`}>
                      {fr.fullName}
                    </span>
                    <span className="font-semibold text-sm text-primary" data-testid={`text-fr-raised-${fr.id}`}>
                      ${raised.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Progress value={pct} className="h-1.5 flex-1" />
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {Math.round(pct)}% of ${goal.toLocaleString()}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">{fr.donorCount} supporters</span>
                </div>
              </a>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export default function CampaignDetail() {
  const [, params] = useRoute("/campaigns/:slug");
  const slug = params?.slug;
  const { toast } = useToast();
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showFundraiserDialog, setShowFundraiserDialog] = useState(false);
  const [fundraiserCreated, setFundraiserCreated] = useState<CampaignFundraiser | null>(null);

  const { data: campaign, isLoading } = useQuery<Campaign>({
    queryKey: ["/api/campaigns", slug],
    enabled: !!slug,
  });

  const { data: donations } = useQuery<CampaignDonation[]>({
    queryKey: ["/api/campaigns", slug, "donations"],
    enabled: !!slug,
  });

  const { data: fundraisers } = useQuery<CampaignFundraiser[]>({
    queryKey: ["/api/campaigns", slug, "fundraisers"],
    enabled: !!slug,
  });

  const fundraiserForm = useForm<FundraiserSignupData>({
    resolver: zodResolver(fundraiserSignupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      personalMessage: "",
      goalAmount: "500",
    },
  });

  const createFundraiserMutation = useMutation({
    mutationFn: async (data: FundraiserSignupData) => {
      const res = await apiRequest("POST", `/api/campaigns/${slug}/fundraisers`, {
        fullName: data.fullName,
        email: data.email,
        personalMessage: data.personalMessage || "",
        goalAmount: data.goalAmount,
      });
      return res.json();
    },
    onSuccess: (data) => {
      setFundraiserCreated(data);
      fundraiserForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns", slug, "fundraisers"] });
      toast({
        title: "Fundraiser Page Created!",
        description: "Share your unique link to start collecting donations.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed",
        description: error.message || "Could not create fundraiser page.",
        variant: "destructive",
      });
    },
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
      return apiRequest("POST", `/api/campaigns/${slug}/donate`, {
        donorName: data.donorName,
        email: data.email,
        amount: data.amount,
        message: data.message || "",
        isAnonymous: data.isAnonymous,
      });
    },
    onSuccess: () => {
      setShowSuccess(true);
      form.reset();
      setSelectedAmount(null);
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns", slug] });
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns", slug, "donations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
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
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-48 w-full rounded-md" />
              <Skeleton className="h-64 w-full rounded-md" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen py-16 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4 text-center">
          <CardContent className="p-8">
            <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Campaign Not Found</h2>
            <p className="text-muted-foreground mb-6">This campaign may have ended or been removed.</p>
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

  const raised = Number(campaign.raisedAmount);
  const goal = Number(campaign.goalAmount);
  const progress = goal > 0 ? Math.min((raised / goal) * 100, 100) : 0;

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <Link href="/campaigns">
          <Button variant="ghost" className="mb-6" data-testid="link-back-campaigns">
            <ArrowLeft className="w-4 h-4 mr-2" />
            All Campaigns
          </Button>
        </Link>

        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <Badge variant="secondary" data-testid="badge-campaign-category">
              {campaign.category}
            </Badge>
            <CountdownTimer endDate={campaign.endDate} />
          </div>
          <h1 className="text-3xl font-bold mb-2" data-testid="text-campaign-title">{campaign.title}</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {campaign.imageUrl && (
              <div className="aspect-video overflow-hidden rounded-md">
                <img
                  src={campaign.imageUrl}
                  alt={campaign.title}
                  className="w-full h-full object-cover"
                  data-testid="img-campaign-detail"
                />
              </div>
            )}

            <Card>
              <CardContent className="p-6">
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-2xl font-bold" data-testid="text-raised-amount">
                      ${raised.toLocaleString()}
                    </span>
                    <span className="text-muted-foreground" data-testid="text-goal-amount">
                      of ${goal.toLocaleString()} goal
                    </span>
                  </div>
                  <Progress value={progress} className="h-3" data-testid="progress-campaign-detail" />
                  <div className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-4 h-4" />
                      <span data-testid="text-donor-count">{campaign.donorCount || 0} donors</span>
                    </div>
                    <span className="font-medium">{Math.round(progress)}% funded</span>
                  </div>
                </div>

                {campaign.description && (
                  <div className="prose prose-sm max-w-none text-foreground">
                    <h3 className="font-bold text-lg mb-3">About This Campaign</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap" data-testid="text-campaign-description">
                      {campaign.description}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Share2 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Help Raise Funds</h3>
                    <p className="text-sm text-muted-foreground">Create your own fundraising page for this campaign</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Get your own unique link to share with friends and family. Track how much you've raised and see your name on the leaderboard.
                </p>
                <Button
                  onClick={() => { setShowFundraiserDialog(true); setFundraiserCreated(null); }}
                  className="w-full"
                  data-testid="button-start-fundraising"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Start My Fundraiser
                </Button>
              </CardContent>
            </Card>

            {fundraisers && fundraisers.length > 0 && (
              <FundraiserLeaderboard fundraisers={fundraisers} campaignSlug={slug || ""} />
            )}

            <Card>
              <CardHeader>
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Heart className="w-5 h-5 text-primary" />
                  Recent Supporters
                </h3>
                <CardDescription>
                  {donations && donations.length > 0
                    ? `${donations.length} people have contributed`
                    : "No donations yet"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DonorWall donations={donations || []} />
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
                    Your donation has been recorded. Together we make a difference.
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
                    Contribute
                  </h3>
                  <CardDescription>Choose an amount to support this campaign</CardDescription>
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
                              data-testid={`button-amount-${amount}`}
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
                                    data-testid="input-donation-amount"
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
                              <Input placeholder="John Doe" {...field} data-testid="input-donor-name" />
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
                              <Input type="email" placeholder="john@example.com" {...field} data-testid="input-donor-email" />
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
                                data-testid="input-donation-message"
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
                                data-testid="checkbox-anonymous"
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
                        data-testid="button-submit-campaign-donation"
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
          </div>
        </div>
      </div>

      <Dialog open={showFundraiserDialog} onOpenChange={setShowFundraiserDialog}>
        <DialogContent className="max-w-md">
          {fundraiserCreated ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
              <DialogHeader className="mb-4">
                <DialogTitle>Your Fundraiser Page is Live!</DialogTitle>
                <DialogDescription>Share your unique link to start collecting donations</DialogDescription>
              </DialogHeader>
              <div className="bg-muted rounded-md p-3 mb-4">
                <p className="text-sm font-mono break-all" data-testid="text-fundraiser-link">
                  {window.location.origin}/fundraise/{fundraiserCreated.slug}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/fundraise/${fundraiserCreated.slug}`);
                    toast({ title: "Link copied!" });
                  }}
                  data-testid="button-copy-fundraiser-link"
                >
                  Copy Link
                </Button>
                <a href={`/fundraise/${fundraiserCreated.slug}`} className="flex-1">
                  <Button className="w-full" data-testid="button-view-fundraiser">
                    View My Page
                  </Button>
                </a>
              </div>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-primary" />
                  Start Your Fundraiser
                </DialogTitle>
                <DialogDescription>
                  Create your personal fundraising page for "{campaign?.title}". You'll get a unique link to share.
                </DialogDescription>
              </DialogHeader>
              <Form {...fundraiserForm}>
                <form onSubmit={fundraiserForm.handleSubmit((data) => createFundraiserMutation.mutate(data))} className="space-y-4">
                  <FormField
                    control={fundraiserForm.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} data-testid="input-fundraiser-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={fundraiserForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="john@example.com" {...field} data-testid="input-fundraiser-email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={fundraiserForm.control}
                    name="goalAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>My Fundraising Goal ($)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input type="number" placeholder="500" className="pl-10" {...field} data-testid="input-fundraiser-goal" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={fundraiserForm.control}
                    name="personalMessage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Personal Message (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Why this campaign is important to me..."
                            {...field}
                            data-testid="input-fundraiser-message"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={createFundraiserMutation.isPending}
                    data-testid="button-create-fundraiser"
                  >
                    {createFundraiserMutation.isPending ? "Creating..." : "Create My Fundraiser Page"}
                  </Button>
                </form>
              </Form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
