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
import { Target, Clock, Users, DollarSign, Heart, CheckCircle, ArrowLeft, User } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Campaign, CampaignDonation } from "@shared/schema";

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

export default function CampaignDetail() {
  const [, params] = useRoute("/campaigns/:slug");
  const slug = params?.slug;
  const { toast } = useToast();
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const { data: campaign, isLoading } = useQuery<Campaign>({
    queryKey: ["/api/campaigns", slug],
    enabled: !!slug,
  });

  const { data: donations } = useQuery<CampaignDonation[]>({
    queryKey: ["/api/campaigns", slug, "donations"],
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
    </div>
  );
}
