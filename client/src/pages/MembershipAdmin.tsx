import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Users,
  Award,
  Medal,
  Trophy,
  Package,
  MapPin,
  Mail,
  Search,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { format } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { MemberSubscription } from "@shared/schema";

type EnrichedSubscription = MemberSubscription & {
  tierName: string;
  tierSlug: string;
  awardType: string | null;
};

const awardStatusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
};

const awardStatusLabels: Record<string, string> = {
  pending: "Pending",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
};

const awardTypeLabels: Record<string, string> = {
  medal: "Engraved Medal",
  crystal: "Crystal Award",
  trophy: "Engraved Trophy",
  plaque: "Engraved Plaque",
};

const awardIcons: Record<string, typeof Trophy> = {
  medal: Medal,
  crystal: Award,
  trophy: Trophy,
  plaque: Award,
};

const tierBadgeColors: Record<string, string> = {
  supporter: "bg-blue-100 text-blue-800",
  advocate: "bg-yellow-100 text-yellow-800",
  champion: "bg-orange-100 text-orange-800",
  ambassador: "bg-red-100 text-red-800",
};

export default function MembershipAdmin() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTier, setFilterTier] = useState<string>("all");
  const [filterAwardStatus, setFilterAwardStatus] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [shippingDetailId, setShippingDetailId] = useState<string | null>(null);

  const { data: subscriptions, isLoading } = useQuery<EnrichedSubscription[]>({
    queryKey: ["/api/membership/subscriptions"],
  });

  const updateAwardMutation = useMutation({
    mutationFn: async ({ id, awardStatus }: { id: string; awardStatus: string }) => {
      return apiRequest("PATCH", `/api/membership/subscriptions/${id}/award-status`, { awardStatus });
    },
    onSuccess: () => {
      toast({ title: "Award status updated" });
      queryClient.invalidateQueries({ queryKey: ["/api/membership/subscriptions"] });
    },
    onError: (error: any) => {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    },
  });

  const filtered = (subscriptions || []).filter((sub) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (
        !sub.fullName.toLowerCase().includes(q) &&
        !sub.email.toLowerCase().includes(q) &&
        !(sub.engravingName || "").toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    if (filterTier !== "all" && sub.tierSlug !== filterTier) return false;
    if (filterAwardStatus !== "all" && sub.awardStatus !== filterAwardStatus) return false;
    return true;
  });

  const stats = {
    total: subscriptions?.length || 0,
    active: subscriptions?.filter((s) => s.status === "active").length || 0,
    pendingAwards: subscriptions?.filter((s) => s.awardStatus === "pending").length || 0,
    shippedAwards: subscriptions?.filter((s) => s.awardStatus === "shipped").length || 0,
  };

  const shippingDetail = subscriptions?.find((s) => s.id === shippingDetailId);

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-page-title">Membership Dashboard</h1>
            <p className="text-sm text-muted-foreground">Manage subscriptions and track award fulfillment</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card data-testid="stat-total">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-sm text-muted-foreground">Total Subscribers</p>
            </CardContent>
          </Card>
          <Card data-testid="stat-active">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              <p className="text-sm text-muted-foreground">Active</p>
            </CardContent>
          </Card>
          <Card data-testid="stat-pending-awards">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-yellow-600">{stats.pendingAwards}</div>
              <p className="text-sm text-muted-foreground">Awards Pending</p>
            </CardContent>
          </Card>
          <Card data-testid="stat-shipped-awards">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-purple-600">{stats.shippedAwards}</div>
              <p className="text-sm text-muted-foreground">Awards Shipped</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or engraving name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                  data-testid="input-search"
                />
              </div>
              <Select value={filterTier} onValueChange={setFilterTier}>
                <SelectTrigger className="w-full md:w-40" data-testid="select-filter-tier">
                  <SelectValue placeholder="All Tiers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tiers</SelectItem>
                  <SelectItem value="supporter">Supporter</SelectItem>
                  <SelectItem value="advocate">Advocate</SelectItem>
                  <SelectItem value="champion">Champion</SelectItem>
                  <SelectItem value="ambassador">Ambassador</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterAwardStatus} onValueChange={setFilterAwardStatus}>
                <SelectTrigger className="w-full md:w-44" data-testid="select-filter-award">
                  <SelectValue placeholder="Award Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="animate-pulse flex gap-4">
                    <div className="w-10 h-10 bg-muted rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-1/3" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-1" data-testid="text-empty">
                {subscriptions?.length === 0 ? "No Subscriptions Yet" : "No Results Found"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {subscriptions?.length === 0
                  ? "Membership subscriptions will appear here once members subscribe."
                  : "Try adjusting your filters or search terms."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map((sub) => {
              const isExpanded = expandedId === sub.id;
              const AwardIcon = sub.awardType ? (awardIcons[sub.awardType] || Award) : Package;
              return (
                <Card key={sub.id} data-testid={`card-subscription-${sub.id}`}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                        <AwardIcon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="font-semibold" data-testid={`text-name-${sub.id}`}>{sub.fullName}</h3>
                          <Badge className={tierBadgeColors[sub.tierSlug] || ""} variant="secondary" data-testid={`badge-tier-${sub.id}`}>
                            {sub.tierName}
                          </Badge>
                          <Badge variant={sub.status === "active" ? "default" : "secondary"} data-testid={`badge-status-${sub.id}`}>
                            {sub.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {sub.email}
                          </span>
                          <span>${sub.amount}/{sub.tierSlug === "ambassador" ? "mo" : "mo"}</span>
                          <span>Since {sub.startDate ? format(new Date(sub.startDate), "MMM d, yyyy") : "N/A"}</span>
                        </div>

                        {sub.awardType && (
                          <div className="mt-3 flex items-center gap-3 flex-wrap">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{awardTypeLabels[sub.awardType] || sub.awardType}</span>
                              {sub.engravingName && (
                                <span className="text-xs text-muted-foreground">— "{sub.engravingName}"</span>
                              )}
                            </div>
                            <Select
                              value={sub.awardStatus || "pending"}
                              onValueChange={(val) => updateAwardMutation.mutate({ id: sub.id, awardStatus: val })}
                            >
                              <SelectTrigger
                                className={`w-36 h-8 text-xs ${awardStatusColors[sub.awardStatus || "pending"] || ""}`}
                                data-testid={`select-award-status-${sub.id}`}
                              >
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="processing">Processing</SelectItem>
                                <SelectItem value="shipped">Shipped</SelectItem>
                                <SelectItem value="delivered">Delivered</SelectItem>
                              </SelectContent>
                            </Select>
                            {sub.shippingAddress && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 text-xs"
                                onClick={() => setShippingDetailId(sub.id)}
                                data-testid={`button-view-shipping-${sub.id}`}
                              >
                                <MapPin className="w-3 h-3 mr-1" />
                                View Address
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0"
                        onClick={() => setExpandedId(isExpanded ? null : sub.id)}
                        data-testid={`button-expand-${sub.id}`}
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </Button>
                    </div>

                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Subscription ID</p>
                          <p className="font-mono text-xs break-all">{sub.id}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Start Date</p>
                          <p>{sub.startDate ? format(new Date(sub.startDate), "MMM d, yyyy") : "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Renewal Date</p>
                          <p>{sub.renewalDate ? format(new Date(sub.renewalDate), "MMM d, yyyy") : "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Amount</p>
                          <p className="font-medium">${sub.amount}/month</p>
                        </div>
                        {sub.engravingName && (
                          <div>
                            <p className="text-muted-foreground">Engraving Name</p>
                            <p className="font-medium">{sub.engravingName}</p>
                          </div>
                        )}
                        {sub.shippingAddress && (
                          <div className="col-span-2 md:col-span-3">
                            <p className="text-muted-foreground">Shipping Address</p>
                            <p>
                              {sub.shippingAddress}, {sub.shippingCity}
                              {sub.shippingState ? `, ${sub.shippingState}` : ""}
                              {sub.shippingZip ? ` ${sub.shippingZip}` : ""}
                              {sub.shippingCountry ? `, ${sub.shippingCountry}` : ""}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={!!shippingDetailId} onOpenChange={(open) => { if (!open) setShippingDetailId(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Shipping Details</DialogTitle>
          </DialogHeader>
          {shippingDetail && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg">
                {(() => { const Icon = shippingDetail.awardType ? (awardIcons[shippingDetail.awardType] || Award) : Package; return <Icon className="w-5 h-5 text-primary" />; })()}
                <div>
                  <p className="font-medium">{awardTypeLabels[shippingDetail.awardType || ""] || "Award"}</p>
                  <p className="text-sm text-muted-foreground">for {shippingDetail.fullName}</p>
                </div>
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Engraving Name</p>
                  <p className="font-medium" data-testid="text-shipping-engraving">{shippingDetail.engravingName || shippingDetail.fullName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Street Address</p>
                  <p data-testid="text-shipping-address">{shippingDetail.shippingAddress || "Not provided"}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-muted-foreground">City</p>
                    <p data-testid="text-shipping-city">{shippingDetail.shippingCity || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">State / Province</p>
                    <p data-testid="text-shipping-state">{shippingDetail.shippingState || "N/A"}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-muted-foreground">ZIP / Postal Code</p>
                    <p data-testid="text-shipping-zip">{shippingDetail.shippingZip || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Country</p>
                    <p data-testid="text-shipping-country">{shippingDetail.shippingCountry || "N/A"}</p>
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground">Award Status</p>
                  <Badge className={awardStatusColors[shippingDetail.awardStatus || "pending"]} variant="secondary">
                    {awardStatusLabels[shippingDetail.awardStatus || "pending"]}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
