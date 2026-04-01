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
import { Check, Crown, Star, Mail, ArrowRight, Award, Trophy, Medal, Package } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import type { MembershipTier } from "@shared/schema";

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
  membershipId: z.string().min(5, "Please enter your Membership ID (e.g. NUP26-ABC123)"),
});

type StatusCheckData = z.infer<typeof statusCheckSchema>;

function getTierIcon(slug: string) {
  if (slug.includes("gold")) return Crown;
  if (slug.includes("silver")) return Star;
  return Crown;
}

function getTierGradient(slug: string) {
  if (slug.includes("gold")) return { bg: "from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/20", border: "border-yellow-400 dark:border-yellow-600", accent: "#B8860B" };
  if (slug.includes("silver")) return { bg: "from-gray-50 to-slate-50 dark:from-gray-950/30 dark:to-slate-950/20", border: "border-gray-400 dark:border-gray-500", accent: "#808080" };
  return { bg: "", border: "", accent: "#DC2626" };
}

export default function MembershipTiers() {
  const { toast } = useToast();
  const [selectedTier, setSelectedTier] = useState<MembershipTier | null>(null);
  const [subscribeDialogOpen, setSubscribeDialogOpen] = useState(false);
  const [statusResult, setStatusResult] = useState<any>(null);
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
      membershipId: "",
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
        renewalDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      });
    },
    onSuccess: async () => {
      const hasAward = selectedTier?.awardType;
      toast({
        title: "Renewal Successful!",
        description: hasAward
          ? `Your ${selectedTier?.name} membership renewal is confirmed. Your ${awardLabels[selectedTier?.awardType || ""] || "award"} will be engraved and shipped to you!`
          : `Your ${selectedTier?.name} membership renewal is confirmed. Thank you for your continued support!`,
      });
      subscribeForm.reset();
      setSubscribeDialogOpen(false);
      setSelectedTier(null);
      setSubscribeStep("info");
      queryClient.invalidateQueries({ queryKey: ["/api/membership-tiers"] });
    },
    onError: (error: any) => {
      toast({
        title: "Renewal Failed",
        description: error.message || "Could not complete renewal. Please try again.",
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
      const response = await fetch(`/api/membership/status?membershipId=${encodeURIComponent(data.membershipId.trim())}`);
      if (response.ok) {
        const result = await response.json();
        setStatusResult(result);
      } else if (response.status === 404) {
        setStatusError("No member found with this Membership ID. Please check your ID and try again.");
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-[500px] rounded-xl" />
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
            Member Renewal
          </Badge>
          <h1 className="text-4xl font-bold mb-4" data-testid="text-page-title">NUP Diaspora Membership Renewal</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Renew your commitment to the struggle for democracy in Uganda.
            Choose your renewal tier and continue standing with the movement.
          </p>
          <div className="mt-4">
            <Link href="/membership">
              <Button variant="outline" data-testid="link-basic-membership">
                New member? Register here first
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          {sortedTiers.map((tier) => {
            const Icon = getTierIcon(tier.slug);
            const benefits = parseBenefits(tier.benefits);
            const isGold = tier.slug.includes("gold");
            const style = getTierGradient(tier.slug);

            return (
              <Card
                key={tier.id}
                className={`relative flex flex-col bg-gradient-to-br ${style.bg} ${style.border} border-2 ${isGold ? "shadow-xl shadow-yellow-200/30 dark:shadow-yellow-900/20" : "shadow-lg"}`}
                data-testid={`card-tier-${tier.id}`}
              >
                {isGold && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-yellow-500 text-black hover:bg-yellow-400 font-bold" data-testid={`badge-popular-${tier.id}`}>
                      Recommended
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-2 pt-8">
                  <div
                    className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                    style={{ backgroundColor: `${style.accent}20` }}
                  >
                    <Icon
                      className="w-8 h-8"
                      style={{ color: style.accent }}
                    />
                  </div>
                  <h3 className="text-xl font-bold" data-testid={`text-tier-name-${tier.id}`}>{tier.name}</h3>
                  <div className="mt-3">
                    <span className="text-4xl font-extrabold" data-testid={`text-tier-price-${tier.id}`}>
                      ${tier.price}
                    </span>
                    <span className="text-muted-foreground ml-1">/year</span>
                  </div>
                  {tier.description && (
                    <p className="text-sm text-muted-foreground mt-3" data-testid={`text-tier-desc-${tier.id}`}>
                      {tier.description}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="flex-1 flex flex-col px-6 pb-6">
                  {tier.awardType && (
                    <div
                      className="mb-5 p-4 rounded-lg border border-dashed flex items-start gap-3"
                      style={{ borderColor: style.accent, backgroundColor: `${style.accent}08` }}
                      data-testid={`award-info-${tier.id}`}
                    >
                      {(() => { const AwardIcon = getAwardIcon(tier.awardType); return <AwardIcon className="w-5 h-5 mt-0.5 shrink-0" style={{ color: style.accent }} />; })()}
                      <div>
                        <p className="text-xs font-semibold" style={{ color: style.accent }}>
                          {awardLabels[tier.awardType] || "Award"} Included
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">{tier.awardDescription}</p>
                      </div>
                    </div>
                  )}
                  {benefits.length > 0 && (
                    <ul className="space-y-2.5 mb-6 flex-1">
                      {benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color: style.accent }} />
                          <span data-testid={`text-benefit-${tier.id}-${idx}`}>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <Button
                    className={`w-full mt-auto text-base py-6 font-semibold ${isGold ? "bg-yellow-600 hover:bg-yellow-700 text-white" : ""}`}
                    variant={isGold ? "default" : "outline"}
                    onClick={() => handleSelectTier(tier)}
                    data-testid={`button-subscribe-${tier.id}`}
                  >
                    {isGold ? "Renew Gold — $1,000" : "Renew Silver — $500"}
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
                Enter your unique Membership ID to view your current tier and renewal status.
                Your Membership ID was sent to you when you registered (e.g. NUP26-ABC123).
              </p>
            </CardHeader>
            <CardContent>
              <Form {...statusForm}>
                <form onSubmit={statusForm.handleSubmit(handleStatusCheck)} className="space-y-4">
                  <FormField
                    control={statusForm.control}
                    name="membershipId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Membership ID</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="NUP26-ABC123"
                            {...field}
                            className="uppercase tracking-wider font-mono"
                            data-testid="input-status-membership-id"
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
                    <h3 className="font-bold" data-testid="text-status-name">{statusResult.memberName}</h3>
                    <Badge
                      variant={statusResult.active ? "default" : "secondary"}
                      data-testid="badge-status"
                    >
                      {statusResult.active ? "Active" : "No Active Subscription"}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Membership ID</p>
                      <p className="font-medium font-mono" data-testid="text-status-id">{statusResult.membershipId}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Member Since</p>
                      <p className="font-medium" data-testid="text-status-joined">
                        {statusResult.joinedAt
                          ? new Date(statusResult.joinedAt).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>
                    {statusResult.tierName && (
                      <div>
                        <p className="text-muted-foreground">Tier</p>
                        <p className="font-medium" data-testid="text-status-tier">{statusResult.tierName}</p>
                      </div>
                    )}
                    {statusResult.renewalDate && (
                      <div>
                        <p className="text-muted-foreground">Renewal Date</p>
                        <p className="font-medium" data-testid="text-status-renewal">
                          {new Date(statusResult.renewalDate).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
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
              {subscribeStep === "shipping" ? "Shipping Details for Your Award" : `Renew — ${selectedTier?.name}`}
            </DialogTitle>
            <DialogDescription>
              {subscribeStep === "shipping" ? (
                <span>
                  Your {awardLabels[selectedTier?.awardType || ""] || "award"} will be engraved with your name and shipped to you.
                </span>
              ) : selectedTier ? (
                <span>
                  ${selectedTier.price}/year — {selectedTier.description}
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
                  <div className="p-4 bg-muted/50 rounded-lg text-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Renewal Tier</span>
                      <span className="font-semibold" data-testid="text-confirm-tier">{selectedTier?.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Amount</span>
                      <span className="font-bold text-lg" data-testid="text-confirm-amount">
                        ${selectedTier?.price}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Period</span>
                      <span className="font-medium">Annual</span>
                    </div>
                    {selectedTier?.awardType && (
                      <div className="flex items-center justify-between">
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
                    {selectedTier?.awardType ? "Continue to Shipping Details" : "Confirm Renewal"}
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

                  <div>
                    <FormLabel>Name for Engraving</FormLabel>
                    <Input
                      value={subscribeForm.watch("engravingName") || ""}
                      onChange={(e) => subscribeForm.setValue("engravingName", e.target.value)}
                      placeholder="How your name should appear on the award"
                      data-testid="input-engraving-name"
                    />
                    {shippingErrors.engravingName && <p className="text-xs text-destructive mt-1">{shippingErrors.engravingName}</p>}
                  </div>
                  <div>
                    <FormLabel>Street Address</FormLabel>
                    <Input
                      value={subscribeForm.watch("shippingAddress") || ""}
                      onChange={(e) => subscribeForm.setValue("shippingAddress", e.target.value)}
                      placeholder="123 Main Street"
                      data-testid="input-shipping-address"
                    />
                    {shippingErrors.shippingAddress && <p className="text-xs text-destructive mt-1">{shippingErrors.shippingAddress}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <FormLabel>City</FormLabel>
                      <Input
                        value={subscribeForm.watch("shippingCity") || ""}
                        onChange={(e) => subscribeForm.setValue("shippingCity", e.target.value)}
                        placeholder="City"
                        data-testid="input-shipping-city"
                      />
                      {shippingErrors.shippingCity && <p className="text-xs text-destructive mt-1">{shippingErrors.shippingCity}</p>}
                    </div>
                    <div>
                      <FormLabel>State / Province</FormLabel>
                      <Input
                        value={subscribeForm.watch("shippingState") || ""}
                        onChange={(e) => subscribeForm.setValue("shippingState", e.target.value)}
                        placeholder="State"
                        data-testid="input-shipping-state"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <FormLabel>ZIP / Postal Code</FormLabel>
                      <Input
                        value={subscribeForm.watch("shippingZip") || ""}
                        onChange={(e) => subscribeForm.setValue("shippingZip", e.target.value)}
                        placeholder="ZIP"
                        data-testid="input-shipping-zip"
                      />
                    </div>
                    <div>
                      <FormLabel>Country</FormLabel>
                      <Input
                        value={subscribeForm.watch("shippingCountry") || ""}
                        onChange={(e) => subscribeForm.setValue("shippingCountry", e.target.value)}
                        placeholder="Country"
                        data-testid="input-shipping-country"
                      />
                      {shippingErrors.shippingCountry && <p className="text-xs text-destructive mt-1">{shippingErrors.shippingCountry}</p>}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => { setSubscribeStep("info"); setShippingErrors({}); }}
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={subscribeMutation.isPending}
                      data-testid="button-confirm-subscribe"
                    >
                      {subscribeMutation.isPending ? "Processing..." : `Confirm — $${selectedTier?.price}`}
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
