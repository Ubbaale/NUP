import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  ArrowLeft,
  Gavel,
  Ticket,
  Clock,
  DollarSign,
  User,
  Mail,
  TrendingUp,
  Minus,
  Plus,
} from "lucide-react";
import { format, formatDistanceToNow, isPast } from "date-fns";
import { useState } from "react";
import type { AuctionItem, Bid } from "@shared/schema";

export default function AuctionDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { toast } = useToast();

  const { data: item, isLoading } = useQuery<AuctionItem>({
    queryKey: ["/api/auctions", slug],
  });

  const { data: bidsList } = useQuery<Bid[]>({
    queryKey: ["/api/auctions", slug, "bids"],
    enabled: !!item && item.auctionType === "auction",
  });

  const isAuction = item?.auctionType === "auction";
  const ended = item ? isPast(new Date(item.endDate)) : false;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-32 mb-8" />
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Skeleton className="h-64 rounded-lg mb-8" />
            <Skeleton className="h-48 rounded-lg" />
          </div>
          <Skeleton className="h-96 rounded-lg" />
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Gavel className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h1 className="text-2xl font-bold mb-2">Item Not Found</h1>
        <p className="text-muted-foreground mb-4">The auction or raffle item you're looking for doesn't exist.</p>
        <Link href="/auctions">
          <Button data-testid="button-back-not-found">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Auctions
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <Link href="/auctions">
          <Button variant="ghost" className="mb-6" data-testid="button-back-to-auctions">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Auctions & Raffles
          </Button>
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {item.imageUrl && (
              <div className="aspect-video rounded-md overflow-hidden">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div>
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <Badge variant={isAuction ? "default" : "secondary"} data-testid="badge-item-type">
                  {isAuction ? <Gavel className="w-3 h-3 mr-1" /> : <Ticket className="w-3 h-3 mr-1" />}
                  {isAuction ? "Auction" : "Raffle"}
                </Badge>
                {ended && <Badge variant="outline">Ended</Badge>}
                {!ended && <Badge variant="outline">Active</Badge>}
              </div>
              <h1 className="text-3xl font-bold mb-4" data-testid="text-item-title">{item.title}</h1>
              {item.description && (
                <p className="text-muted-foreground whitespace-pre-wrap" data-testid="text-item-description">{item.description}</p>
              )}
            </div>

            {isAuction && bidsList && bidsList.length > 0 && (
              <Card>
                <CardHeader>
                  <h2 className="font-semibold flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Bid History ({bidsList.length})
                  </h2>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {bidsList.map((bid, index) => (
                      <div
                        key={bid.id}
                        className={`flex items-center justify-between gap-4 p-3 rounded-md ${index === 0 ? "bg-primary/5 border border-primary/20" : "bg-muted/50"}`}
                        data-testid={`row-bid-${bid.id}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{bid.bidderName}</p>
                            {bid.createdAt && (
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(bid.createdAt), "MMM d, h:mm a")}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold" data-testid={`text-bid-amount-${bid.id}`}>${Number(bid.amount).toFixed(2)}</p>
                          {index === 0 && (
                            <Badge variant="default" className="text-xs">Highest</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card className="sticky top-24">
              <CardHeader>
                <h3 className="font-semibold">
                  {isAuction ? "Place a Bid" : "Get Raffle Tickets"}
                </h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  {ended ? (
                    <span className="text-destructive font-medium" data-testid="text-status-ended">This {isAuction ? "auction" : "raffle"} has ended</span>
                  ) : (
                    <span className="text-muted-foreground" data-testid="text-status-countdown">
                      Ends {formatDistanceToNow(new Date(item.endDate), { addSuffix: true })}
                    </span>
                  )}
                </div>

                {item.startDate && (
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(item.startDate), "MMM d")} - {format(new Date(item.endDate), "MMM d, yyyy")}
                  </div>
                )}

                {isAuction ? (
                  <AuctionBidSection item={item} ended={ended} />
                ) : (
                  <RaffleTicketSection item={item} ended={ended} />
                )}

                {item.winnerName && (
                  <div className="p-4 bg-primary/5 rounded-md border border-primary/20">
                    <p className="text-sm font-medium mb-1">Winner</p>
                    <p className="font-bold" data-testid="text-winner">{item.winnerName}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function AuctionBidSection({ item, ended }: { item: AuctionItem; ended: boolean }) {
  const { toast } = useToast();
  const { slug } = useParams<{ slug: string }>();
  const minBid = Math.max(Number(item.startingBid), Number(item.currentBid) + Number(item.bidIncrement));

  const [bidderName, setBidderName] = useState("");
  const [bidderEmail, setBidderEmail] = useState("");
  const [amount, setAmount] = useState(minBid.toFixed(2));

  const bidMutation = useMutation({
    mutationFn: async (data: { bidderName: string; bidderEmail: string; amount: string }) => {
      const res = await apiRequest("POST", `/api/auctions/${slug}/bid`, data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Bid placed successfully!", description: `Your bid of $${amount} has been recorded.` });
      setBidderName("");
      setBidderEmail("");
      queryClient.invalidateQueries({ queryKey: ["/api/auctions", slug] });
      queryClient.invalidateQueries({ queryKey: ["/api/auctions", slug, "bids"] });
    },
    onError: (error: Error) => {
      toast({ title: "Bid failed", description: error.message, variant: "destructive" });
    },
  });

  return (
    <>
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm text-muted-foreground">Current Bid</span>
          <span className="text-2xl font-bold" data-testid="text-current-bid">
            ${Number(item.currentBid) > 0 ? Number(item.currentBid).toFixed(2) : Number(item.startingBid).toFixed(2)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm text-muted-foreground">Starting Bid</span>
          <span className="text-sm">${Number(item.startingBid).toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm text-muted-foreground">Min. Increment</span>
          <span className="text-sm">${Number(item.bidIncrement).toFixed(2)}</span>
        </div>
        {item.buyNowPrice && (
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm text-muted-foreground">Buy Now</span>
            <span className="text-sm font-medium">${Number(item.buyNowPrice).toFixed(2)}</span>
          </div>
        )}
      </div>

      {!ended && (
        <div className="space-y-3 pt-4 border-t">
          <div className="space-y-1.5">
            <Label htmlFor="bidder-name">Your Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="bidder-name"
                placeholder="Full name"
                value={bidderName}
                onChange={e => setBidderName(e.target.value)}
                className="pl-10"
                data-testid="input-bidder-name"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bidder-email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="bidder-email"
                type="email"
                placeholder="you@example.com"
                value={bidderEmail}
                onChange={e => setBidderEmail(e.target.value)}
                className="pl-10"
                data-testid="input-bidder-email"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bid-amount">Bid Amount ($)</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="bid-amount"
                type="number"
                step="0.01"
                min={minBid}
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="pl-10"
                data-testid="input-bid-amount"
              />
            </div>
            <p className="text-xs text-muted-foreground">Minimum bid: ${minBid.toFixed(2)}</p>
          </div>
          <Button
            className="w-full"
            disabled={bidMutation.isPending || !bidderName || !bidderEmail || !amount}
            onClick={() => bidMutation.mutate({ bidderName, bidderEmail, amount })}
            data-testid="button-place-bid"
          >
            {bidMutation.isPending ? "Placing Bid..." : "Place Bid"}
          </Button>
        </div>
      )}
    </>
  );
}

function RaffleTicketSection({ item, ended }: { item: AuctionItem; ended: boolean }) {
  const { toast } = useToast();
  const { slug } = useParams<{ slug: string }>();
  const pricePerTicket = Number(item.ticketPrice || 5);

  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [ticketCount, setTicketCount] = useState(1);

  const totalAmount = (ticketCount * pricePerTicket).toFixed(2);

  const raffleMutation = useMutation({
    mutationFn: async (data: { buyerName: string; buyerEmail: string; ticketCount: number }) => {
      const res = await apiRequest("POST", `/api/auctions/${slug}/raffle-ticket`, data);
      return res.json();
    },
    onSuccess: (data: any) => {
      const tickets = data.ticketNumbers || "";
      toast({
        title: "Tickets purchased!",
        description: `You purchased ${ticketCount} ticket(s). Your ticket numbers: ${tickets}`,
      });
      setBuyerName("");
      setBuyerEmail("");
      setTicketCount(1);
      queryClient.invalidateQueries({ queryKey: ["/api/auctions", slug] });
    },
    onError: (error: Error) => {
      toast({ title: "Purchase failed", description: error.message, variant: "destructive" });
    },
  });

  return (
    <>
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm text-muted-foreground">Price per Ticket</span>
          <span className="text-lg font-bold" data-testid="text-ticket-price">${pricePerTicket.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm text-muted-foreground">Tickets Sold</span>
          <span className="text-lg font-bold" data-testid="text-total-tickets">{item.totalTicketsSold}</span>
        </div>
      </div>

      {!ended && (
        <div className="space-y-3 pt-4 border-t">
          <div className="space-y-1.5">
            <Label htmlFor="buyer-name">Your Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="buyer-name"
                placeholder="Full name"
                value={buyerName}
                onChange={e => setBuyerName(e.target.value)}
                className="pl-10"
                data-testid="input-buyer-name"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="buyer-email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="buyer-email"
                type="email"
                placeholder="you@example.com"
                value={buyerEmail}
                onChange={e => setBuyerEmail(e.target.value)}
                className="pl-10"
                data-testid="input-buyer-email"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Number of Tickets</Label>
            <div className="flex items-center gap-3">
              <Button
                size="icon"
                variant="outline"
                disabled={ticketCount <= 1}
                onClick={() => setTicketCount(c => Math.max(1, c - 1))}
                data-testid="button-decrease-tickets"
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="text-xl font-bold min-w-[3rem] text-center" data-testid="text-ticket-count">{ticketCount}</span>
              <Button
                size="icon"
                variant="outline"
                onClick={() => setTicketCount(c => c + 1)}
                data-testid="button-increase-tickets"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-between gap-2 p-3 bg-muted/50 rounded-md">
            <span className="text-sm font-medium">Total</span>
            <span className="text-xl font-bold" data-testid="text-total-amount">${totalAmount}</span>
          </div>
          <Button
            className="w-full"
            disabled={raffleMutation.isPending || !buyerName || !buyerEmail}
            onClick={() => raffleMutation.mutate({ buyerName, buyerEmail, ticketCount })}
            data-testid="button-purchase-tickets"
          >
            {raffleMutation.isPending ? "Processing..." : `Purchase ${ticketCount} Ticket${ticketCount > 1 ? "s" : ""}`}
          </Button>
        </div>
      )}
    </>
  );
}
