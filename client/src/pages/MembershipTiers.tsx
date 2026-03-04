import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, Crown, Star, Shield, Heart, Mail, ArrowRight, Award, Trophy, Medal, Package } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import type { MembershipTier, MemberSubscription } from "@shared/schema";

const subscribeSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  engravingName: z.string().optional(),
  shippingAddress: z.string().optional(),
  shippingCity: z.string().optional(),
  shippingState: z.string().optional(),
  shippingZip: z.string().optional(),
  shippingCountry: z.string().optional(),
});

type SubscribeFormData = z.infer<typeof subscribeSchema>;

const awardIcons: Record<string, typeof Trophy> = {
  medal: Medal,
  crystal: Award,
  trophy: Trophy,
  plaque: Award,
};

function getAwardIcon(awardType: string | null) {
  if (!awardType) return Package;
  return awardIcons[awardType] || Award;
}

const awardLabels: Record<string, string> = {
  medal: "Engraved Medal",
  crystal: "Crystal Award",
  trophy: "Engraved Trophy",
  plaque: "Engraved Plaque",
};

const statusCheckSchema = z.object({
  email: z.string().email("Please enter a valid email"),
});

type StatusCheckData = z.infer<typeof statusCheckSchema>;

const tierIcons: Record<string, typeof Crown> = {
  supporter: Heart,
  advocate: Star,
  champion: Shield,
  ambassador: Crown,
};

function getTierIcon(slug: string) {
  const Icon = tierIcons[slug] || Heart;
  return Icon;
}

export default function MembershipTiers() {
  const { toast } = useToast();
  const [selectedTier, setSelectedTier] = useState<MembershipTier | null>(null);
  const [subscribeDialogOpen, setSubscribeDialogOpen] = useState(false);
  const [statusResult, setStatusResult] = useState<(MemberSubscription & { tierName?: string }) | null>(null);
  const [statusError, setStatusError] = useState("");
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  const { data: tiers, isLoading } = useQuery<MembershipTier[]>({
    queryKey: ["/api/membership-tiers"],
  });

  const [subscribeStep, setSubscribeStep] = useState<"info" | "shipping">("info");

  const subscribeForm = useForm<SubscribeFormData>({
    resolver: zodResolver(subscribeSchema),
    defaultValues: {
      fullName: "",
      email: "",
      engravingName: "",
      shippingAddress: "",
      shippingCity: "",
      shippingState: "",
      shippingZip: "",
      shippingCountry: "",
    },
  });

  const statusForm = useForm<StatusCheckData>({
    resolver: zodResolver(statusCheckSchema),
    defaultValues: {
      email: "",
    },
  });

  const subscribeMutation = useMutation({
    mutationFn: async (data: SubscribeFormData & { tierId: string; amount: string }) => {
      return apiRequest("POST", "/api/membership/subscribe", {
        ...data,
        tierId: data.tierId,
        amount: data.amount,
        status: "active",
        startDate: new Date().toISOString(),
        renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });
    },
    onSuccess: async () => {
      const hasAward = selectedTier?.awardType;
      toast({
        title: "Subscription Successful!",
        description: hasAward
          ? `You are now subscribed to the ${selectedTier?.name} tier. Your ${awardLabels[selectedTier?.awardType || ""] || "award"} will be engraved and shipped to you!`
          : `You are now subscribed to the ${selectedTier?.name} tier. Welcome to the movement!`,
      });
      subscribeForm.reset();
      setSubscribeDialogOpen(false);
      setSelectedTier(null);
      setSubscribeStep("info");
      queryClient.invalidateQueries({ queryKey: ["/api/membership-tiers"] });
    },
    onError: (error: any) => {
      toast({
        title: "Subscription Failed",
        description: error.message || "Could not complete subscription. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSelectTier = (tier: MembershipTier) => {
    setSelectedTier(tier);
    setSubscribeStep("info");
    subscribeForm.reset();
    setSubscribeDialogOpen(true);
  };

  const onContinueToShipping = () => {
    const { fullName, email } = subscribeForm.getValues();
    if (!fullName || fullName.length < 2 || !email || !email.includes("@")) {
      subscribeForm.trigger(["fullName", "email"]);
      return;
    }
    if (selectedTier?.awardType) {
      if (!subscribeForm.getValues("engravingName")) {
        subscribeForm.setValue("engravingName", fullName);
      }
      setSubscribeStep("shipping");
    } else {
      subscribeForm.handleSubmit(onSubscribe)();
    }
  };

  const [shippingErrors, setShippingErrors] = useState<Record<string, string>>({});

  const validateShipping = (): boolean => {
    const values = subscribeForm.getValues();
    const errors: Record<string, string> = {};
    if (!values.engravingName?.trim()) errors.engravingName = "Name for engraving is required";
    if (!values.shippingAddress?.trim()) errors.shippingAddress = "Street address is required";
    if (!values.shippingCity?.trim()) errors.shippingCity = "City is required";
    if (!values.shippingCountry?.trim()) errors.shippingCountry = "Country is required";
    setShippingErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const onSubscribe = (data: SubscribeFormData) => {
    if (!selectedTier) return;
    if (selectedTier.awardType && !validateShipping()) return;
    subscribeMutation.mutate({
      ...data,
      tierId: selectedTier.id,
      amount: selectedTier.price,
    });
  };

  const handleStatusCheck = async (data: StatusCheckData) => {
    setIsCheckingStatus(true);
    setStatusError("");
    setStatusResult(null);

    try {
      const response = await fetch(`/api/membership/status?email=${encodeURIComponent(data.email)}`);
      if (response.ok) {
        const result = await response.json();
        setStatusResult(result);
      } else if (response.status === 404) {
        setStatusError("No active membership found for this email address.");
      } else {
        setStatusError("Could not check membership status. Please try again.");
      }
    } catch {
      setStatusError("Could not check membership status. Please try again.");
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const parseBenefits = (benefits: string | null): string[] => {
    if (!benefits) return [];
    try {
      return JSON.parse(benefits);
    } catch {
      return benefits.split(",").map((b) => b.trim());
    }
  };

  const sortedTiers = tiers?.slice().sort((a, b) => a.displayOrder - b.displayOrder) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Skeleton className="h-6 w-40 mx-auto mb-4" />
            <Skeleton className="h-10 w-72 mx-auto mb-4" />
            <Skeleton className="h-5 w-96 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-96 rounded-md" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4" data-testid="badge-membership-tiers">
            Support the Movement
          </Badge>
          <h1 className="text-4xl font-bold mb-4" data-testid="text-page-title">Membership Tiers</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Choose a membership tier that fits your commitment level. Every contribution
            strengthens our movement and supports the fight for democracy in Uganda.
          </p>
          <div className="mt-4">
            <Link href="/membership">
              <Button variant="outline" data-testid="link-basic-membership">
                Looking for basic membership registration?
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-16">
          {sortedTiers.map((tier) => {
            const Icon = getTierIcon(tier.slug);
            const benefits = parseBenefits(tier.benefits);
            const isPopular = tier.isPopular;

            return (
              <Card
                key={tier.id}
                className={`relative flex flex-col ${isPopular ? "border-primary shadow-md" : ""}`}
                data-testid={`card-tier-${tier.id}`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge data-testid={`badge-popular-${tier.id}`}>
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-2">
                  <div
                    className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
                    style={{ backgroundColor: tier.badgeColor ? `${tier.badgeColor}20` : undefined }}
                  >
                    <Icon
                      className="w-6 h-6"
                      style={{ color: tier.badgeColor || undefined }}
                    />
                  </div>
                  <h3 className="text-lg font-bold" data-testid={`text-tier-name-${tier.id}`}>{tier.name}</h3>
                  <div className="mt-2">
                    <span className="text-3xl font-bold" data-testid={`text-tier-price-${tier.id}`}>
                      ${tier.price}
                    </span>
                    <span className="text-muted-foreground">/{tier.interval === "yearly" ? "yr" : "mo"}</span>
                  </div>
                  {tier.description && (
                    <p className="text-sm text-muted-foreground mt-2" data-testid={`text-tier-desc-${tier.id}`}>
                      {tier.description}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  {tier.awardType && (
                    <div
                      className="mb-4 p-3 rounded-lg border border-dashed flex items-start gap-3"
                      style={{ borderColor: tier.badgeColor || undefined, backgroundColor: tier.badgeColor ? `${tier.badgeColor}08` : undefined }}
                      data-testid={`award-info-${tier.id}`}
                    >
                      {(() => { const AwardIcon = getAwardIcon(tier.awardType); return <AwardIcon className="w-5 h-5 mt-0.5 shrink-0" style={{ color: tier.badgeColor || undefined }} />; })()}
                      <div>
                        <p className="text-xs font-semibold" style={{ color: tier.badgeColor || undefined }}>
                          {awardLabels[tier.awardType] || "Award"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">{tier.awardDescription}</p>
                      </div>
                    </div>
                  )}
                  {benefits.length > 0 && (
                    <ul className="space-y-2 mb-6 flex-1">
                      {benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                          <span data-testid={`text-benefit-${tier.id}-${idx}`}>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <Button
                    className="w-full mt-auto"
                    variant={isPopular ? "default" : "outline"}
                    onClick={() => handleSelectTier(tier)}
                    data-testid={`button-subscribe-${tier.id}`}
                  >
                    Subscribe Now
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="max-w-lg mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-muted rounded-full mx-auto mb-3 flex items-center justify-center">
                <Mail className="w-6 h-6 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-bold" data-testid="text-status-check-title">Check Membership Status</h2>
              <p className="text-sm text-muted-foreground">
                Enter your email to view your current membership tier and status.
              </p>
            </CardHeader>
            <CardContent>
              <Form {...statusForm}>
                <form onSubmit={statusForm.handleSubmit(handleStatusCheck)} className="space-y-4">
                  <FormField
                    control={statusForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="your@email.com"
                            {...field}
                            data-testid="input-status-email"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isCheckingStatus}
                    data-testid="button-check-status"
                  >
                    {isCheckingStatus ? "Checking..." : "Check Status"}
                  </Button>
                </form>
              </Form>

              {statusError && (
                <div
                  className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-sm"
                  data-testid="text-status-error"
                >
                  {statusError}
                </div>
              )}

              {statusResult && (
                <div className="mt-4 p-4 bg-muted/50 rounded-md space-y-3" data-testid="text-status-result">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h3 className="font-bold" data-testid="text-status-name">{statusResult.fullName}</h3>
                    <Badge
                      variant={statusResult.status === "active" ? "default" : "secondary"}
                      data-testid="badge-status"
                    >
                      {statusResult.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Tier</p>
                      <p className="font-medium" data-testid="text-status-tier">
                        {statusResult.tierName || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Amount</p>
                      <p className="font-medium" data-testid="text-status-amount">${statusResult.amount}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Start Date</p>
                      <p className="font-medium" data-testid="text-status-start">
                        {statusResult.startDate
                          ? new Date(statusResult.startDate).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Renewal Date</p>
                      <p className="font-medium" data-testid="text-status-renewal">
                        {statusResult.renewalDate
                          ? new Date(statusResult.renewalDate).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                  {statusResult.awardStatus && (
                    <div className="mt-3 p-3 bg-primary/5 border border-primary/20 rounded-md" data-testid="text-award-status">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">Award Status</span>
                      </div>
                      <div className="mt-1 flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {statusResult.engravingName && `Engraved for: ${statusResult.engravingName}`}
                        </span>
                        <Badge variant={statusResult.awardStatus === "shipped" ? "default" : "secondary"} data-testid="badge-award-status">
                          {statusResult.awardStatus === "pending" ? "Being Prepared" :
                           statusResult.awardStatus === "shipped" ? "Shipped" :
                           statusResult.awardStatus === "delivered" ? "Delivered" :
                           statusResult.awardStatus}
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={subscribeDialogOpen} onOpenChange={(open) => { setSubscribeDialogOpen(open); if (!open) setSubscribeStep("info"); }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle data-testid="text-dialog-title">
              {subscribeStep === "shipping" ? "Shipping Details for Your Award" : `Subscribe to ${selectedTier?.name}`}
            </DialogTitle>
            <DialogDescription>
              {subscribeStep === "shipping" ? (
                <span>
                  Your {awardLabels[selectedTier?.awardType || ""] || "award"} will be engraved with your name and shipped to you.
                </span>
              ) : selectedTier ? (
                <span>
                  ${selectedTier.price}/{selectedTier.interval === "yearly" ? "year" : "month"} —{" "}
                  {selectedTier.description}
                </span>
              ) : null}
            </DialogDescription>
          </DialogHeader>
          <Form {...subscribeForm}>
            <form onSubmit={subscribeForm.handleSubmit(onSubscribe)} className="space-y-4">
              {subscribeStep === "info" && (
                <>
                  <FormField
                    control={subscribeForm.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} data-testid="input-subscribe-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={subscribeForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="john@example.com"
                            {...field}
                            data-testid="input-subscribe-email"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="p-3 bg-muted/50 rounded-md text-sm">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="text-muted-foreground">Selected Tier</span>
                      <span className="font-medium" data-testid="text-confirm-tier">{selectedTier?.name}</span>
                    </div>
                    <div className="flex items-center justify-between flex-wrap gap-2 mt-1">
                      <span className="text-muted-foreground">Amount</span>
                      <span className="font-bold" data-testid="text-confirm-amount">
                        ${selectedTier?.price}/{selectedTier?.interval === "yearly" ? "yr" : "mo"}
                      </span>
                    </div>
                    {selectedTier?.awardType && (
                      <div className="flex items-center justify-between flex-wrap gap-2 mt-1">
                        <span className="text-muted-foreground">Award</span>
                        <span className="font-medium text-primary">
                          {awardLabels[selectedTier.awardType] || "Award"} included
                        </span>
                      </div>
                    )}
                  </div>
                  <Button
                    type="button"
                    className="w-full"
                    onClick={onContinueToShipping}
                    data-testid="button-continue-subscribe"
                  >
                    {selectedTier?.awardType ? "Continue to Shipping Details" : "Confirm Subscription"}
                  </Button>
                </>
              )}

              {subscribeStep === "shipping" && (
                <>
                  {selectedTier?.awardType && (
                    <div className="p-3 bg-primary/5 border border-primary/20 rounded-md flex items-start gap-3">
                      {(() => { const AIcon = getAwardIcon(selectedTier.awardType); return <AIcon className="w-5 h-5 mt-0.5 shrink-0 text-primary" />; })()}
                      <div>
                        <p className="text-sm font-semibold text-primary">{awardLabels[selectedTier.awardType] || "Award"}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{selectedTier.awardDescription}</p>
                      </div>
                    </div>
                  )}
                  <FormField
                    control={subscribeForm.control}
                    name="engravingName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name for Engraving *</FormLabel>
                        <FormControl>
                          <Input placeholder="Name as it should appear on your award" {...field} data-testid="input-engraving-name" />
                        </FormControl>
                        {shippingErrors.engravingName && <p className="text-sm text-destructive">{shippingErrors.engravingName}</p>}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={subscribeForm.control}
                    name="shippingAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street Address *</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Main St, Apt 4" {...field} data-testid="input-shipping-address" />
                        </FormControl>
                        {shippingErrors.shippingAddress && <p className="text-sm text-destructive">{shippingErrors.shippingAddress}</p>}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={subscribeForm.control}
                      name="shippingCity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City *</FormLabel>
                          <FormControl>
                            <Input placeholder="City" {...field} data-testid="input-shipping-city" />
                          </FormControl>
                          {shippingErrors.shippingCity && <p className="text-sm text-destructive">{shippingErrors.shippingCity}</p>}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={subscribeForm.control}
                      name="shippingState"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State / Province</FormLabel>
                          <FormControl>
                            <Input placeholder="State" {...field} data-testid="input-shipping-state" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={subscribeForm.control}
                      name="shippingZip"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ZIP / Postal Code</FormLabel>
                          <FormControl>
                            <Input placeholder="12345" {...field} data-testid="input-shipping-zip" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={subscribeForm.control}
                      name="shippingCountry"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country *</FormLabel>
                          <FormControl>
                            <Input placeholder="United States" {...field} data-testid="input-shipping-country" />
                          </FormControl>
                          {shippingErrors.shippingCountry && <p className="text-sm text-destructive">{shippingErrors.shippingCountry}</p>}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setSubscribeStep("info")}
                      data-testid="button-back-to-info"
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={subscribeMutation.isPending}
                      data-testid="button-confirm-subscribe"
                    >
                      {subscribeMutation.isPending ? "Processing..." : "Complete Subscription"}
                    </Button>
                  </div>
                </>
              )}
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
