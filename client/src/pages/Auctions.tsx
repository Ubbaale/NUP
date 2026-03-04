import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Gavel, Ticket, Clock, ArrowRight, DollarSign } from "lucide-react";
import { formatDistanceToNow, isPast } from "date-fns";
import type { AuctionItem } from "@shared/schema";

function CountdownTimer({ endDate }: { endDate: string | Date }) {
  const end = new Date(endDate);
  const ended = isPast(end);

  if (ended) {
    return (
      <span className="text-destructive font-medium" data-testid="text-ended">Ended</span>
    );
  }

  return (
    <span className="text-muted-foreground" data-testid="text-countdown">
      {formatDistanceToNow(end, { addSuffix: true })}
    </span>
  );
}

function AuctionCard({ item }: { item: AuctionItem }) {
  const isAuction = item.auctionType === "auction";
  const ended = isPast(new Date(item.endDate));

  return (
    <Link href={`/auctions/${item.slug}`}>
      <Card className="overflow-visible hover-elevate active-elevate-2 cursor-pointer" data-testid={`card-auction-${item.id}`}>
        {item.imageUrl && (
          <div className="aspect-video overflow-hidden rounded-t-md">
            <img
              src={item.imageUrl}
              alt={item.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={isAuction ? "default" : "secondary"} data-testid={`badge-type-${item.id}`}>
              {isAuction ? <Gavel className="w-3 h-3 mr-1" /> : <Ticket className="w-3 h-3 mr-1" />}
              {isAuction ? "Auction" : "Raffle"}
            </Badge>
            {ended && <Badge variant="outline">Ended</Badge>}
          </div>

          <h3 className="text-lg font-semibold line-clamp-2" data-testid={`text-title-${item.id}`}>{item.title}</h3>

          {item.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
          )}

          <div className="flex items-center justify-between gap-2 flex-wrap">
            {isAuction ? (
              <div data-testid={`text-current-bid-${item.id}`}>
                <p className="text-xs text-muted-foreground">Current Bid</p>
                <p className="text-lg font-bold">${Number(item.currentBid) > 0 ? Number(item.currentBid).toFixed(2) : Number(item.startingBid).toFixed(2)}</p>
              </div>
            ) : (
              <div data-testid={`text-tickets-sold-${item.id}`}>
                <p className="text-xs text-muted-foreground">Tickets Sold</p>
                <p className="text-lg font-bold">{item.totalTicketsSold}</p>
              </div>
            )}

            <div className="text-right">
              <div className="flex items-center gap-1 text-sm">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                <CountdownTimer endDate={item.endDate} />
              </div>
            </div>
          </div>

          {isAuction && item.buyNowPrice && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <DollarSign className="w-3.5 h-3.5" />
              Buy Now: ${Number(item.buyNowPrice).toFixed(2)}
            </div>
          )}

          {!isAuction && item.ticketPrice && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Ticket className="w-3.5 h-3.5" />
              ${Number(item.ticketPrice).toFixed(2)} per ticket
            </div>
          )}

          <Button variant="outline" className="w-full" data-testid={`button-view-${item.id}`}>
            {isAuction ? "Place Bid" : "Get Tickets"}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function Auctions() {
  const { data: items, isLoading } = useQuery<AuctionItem[]>({
    queryKey: ["/api/auctions"],
  });

  const auctions = items?.filter(i => i.auctionType === "auction") || [];
  const raffles = items?.filter(i => i.auctionType === "raffle") || [];

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">Fundraising</Badge>
          <h1 className="text-4xl font-bold mb-4" data-testid="text-page-title">Auctions & Raffles</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Bid on exclusive items or enter raffles to win prizes while supporting the NUP Diaspora movement.
          </p>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-80 rounded-lg" />
            ))}
          </div>
        ) : !items || items.length === 0 ? (
          <Card className="p-12 text-center">
            <Gavel className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No Active Auctions or Raffles</h3>
            <p className="text-muted-foreground">
              Check back soon for upcoming auctions and raffle opportunities.
            </p>
          </Card>
        ) : (
          <div className="space-y-12">
            {auctions.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-6">
                  <Gavel className="w-5 h-5" />
                  <h2 className="text-2xl font-bold">Auctions</h2>
                  <Badge variant="outline">{auctions.length}</Badge>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {auctions.map(item => (
                    <AuctionCard key={item.id} item={item} />
                  ))}
                </div>
              </section>
            )}

            {raffles.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-6">
                  <Ticket className="w-5 h-5" />
                  <h2 className="text-2xl font-bold">Raffles</h2>
                  <Badge variant="outline">{raffles.length}</Badge>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {raffles.map(item => (
                    <AuctionCard key={item.id} item={item} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
