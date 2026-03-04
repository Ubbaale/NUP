import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  DollarSign,
  Video,
  Mic,
  Music,
  Presentation,
  CheckCircle,
  Copy,
  ExternalLink,
  Ticket,
} from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { VirtualEvent, EventTicket } from "@shared/schema";

const eventTypeIcons: Record<string, typeof Video> = {
  webinar: Presentation,
  townhall: Mic,
  concert: Music,
  workshop: Users,
};

const eventTypeLabels: Record<string, string> = {
  webinar: "Webinar",
  townhall: "Town Hall",
  concert: "Concert",
  workshop: "Workshop",
};

const ticketFormSchema = z.object({
  buyerName: z.string().min(2, "Name must be at least 2 characters"),
  buyerEmail: z.string().email("Please enter a valid email"),
});

type TicketFormData = z.infer<typeof ticketFormSchema>;

export default function VirtualEventDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { toast } = useToast();
  const [purchasedTicket, setPurchasedTicket] = useState<EventTicket | null>(null);

  const { data: event, isLoading } = useQuery<VirtualEvent & { meetingLink?: string; ticketsSold?: number }>({
    queryKey: ["/api/events", slug],
  });

  const form = useForm<TicketFormData>({
    resolver: zodResolver(ticketFormSchema),
    defaultValues: {
      buyerName: "",
      buyerEmail: "",
    },
  });

  const purchaseMutation = useMutation({
    mutationFn: async (data: TicketFormData) => {
      const res = await apiRequest("POST", `/api/events/${slug}/tickets`, {
        buyerName: data.buyerName,
        buyerEmail: data.buyerEmail,
      });
      return res.json();
    },
    onSuccess: (ticket: EventTicket) => {
      setPurchasedTicket(ticket);
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({
        title: "Ticket Purchased",
        description: "Your ticket has been confirmed. Check your details below.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Purchase Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: TicketFormData) => {
    purchaseMutation.mutate(data);
  };

  const copyTicketCode = () => {
    if (purchasedTicket?.ticketCode) {
      navigator.clipboard.writeText(purchasedTicket.ticketCode);
      toast({ title: "Copied", description: "Ticket code copied to clipboard." });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-32 mb-8" />
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Skeleton className="h-64 rounded-md mb-8" />
            <Skeleton className="h-48 rounded-md" />
          </div>
          <Skeleton className="h-96 rounded-md" />
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h1 className="text-2xl font-bold mb-2">Event Not Found</h1>
        <p className="text-muted-foreground mb-4">The event you're looking for doesn't exist.</p>
        <Link href="/events">
          <Button>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Events
          </Button>
        </Link>
      </div>
    );
  }

  const TypeIcon = eventTypeIcons[event.eventType] || Video;
  const typeLabel = eventTypeLabels[event.eventType] || event.eventType;
  const price = parseFloat(event.ticketPrice?.toString() || "0");
  const eventDate = new Date(event.eventDate);
  const isPast = eventDate < new Date();

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <Link href="/events">
          <Button variant="ghost" className="mb-6" data-testid="button-back-to-events">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Events
          </Button>
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {event.imageUrl && (
              <div className="aspect-video rounded-md overflow-hidden mb-8">
                <img
                  src={event.imageUrl}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <Badge variant="secondary">
                  <TypeIcon className="w-3 h-3 mr-1" />
                  {typeLabel}
                </Badge>
                {event.isFeatured && <Badge>Featured</Badge>}
                {isPast && <Badge variant="outline">Ended</Badge>}
                {price === 0 && !isPast && <Badge variant="outline">Free</Badge>}
              </div>
              <h1 className="text-4xl font-bold mb-4" data-testid="text-event-detail-title">{event.title}</h1>
            </div>

            {event.description && (
              <Card className="mb-8">
                <CardHeader>
                  <h2 className="font-semibold">About This Event</h2>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-wrap" data-testid="text-event-description">
                    {event.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {event.hostName && (
              <Card className="mb-8">
                <CardHeader>
                  <h2 className="font-semibold">Host</h2>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium" data-testid="text-host-name">{event.hostName}</p>
                      {event.hostTitle && (
                        <p className="text-sm text-muted-foreground">{event.hostTitle}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card className="sticky top-24">
              <CardHeader>
                <h3 className="font-semibold">Event Details</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Date</p>
                    <p className="text-muted-foreground" data-testid="text-event-detail-date">
                      {format(eventDate, "EEEE, MMMM d, yyyy")}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Time</p>
                    <p className="text-muted-foreground">
                      {format(eventDate, "h:mm a")}
                      {event.endDate && ` - ${format(new Date(event.endDate), "h:mm a")}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <DollarSign className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Ticket Price</p>
                    <p className="text-muted-foreground" data-testid="text-ticket-price">
                      {price === 0 ? "Free" : `$${price.toFixed(2)}`}
                    </p>
                  </div>
                </div>

                {event.maxAttendees && (
                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Capacity</p>
                      <p className="text-muted-foreground">
                        {event.maxAttendees} attendees max
                      </p>
                    </div>
                  </div>
                )}

                {isPast ? (
                  <div className="p-4 bg-muted/50 rounded-md text-center">
                    <Clock className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">This event has ended</p>
                  </div>
                ) : purchasedTicket ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-md text-center">
                      <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600 dark:text-green-400" />
                      <p className="font-semibold text-green-700 dark:text-green-300">Ticket Confirmed</p>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Ticket Code</p>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 bg-muted px-3 py-2 rounded-md text-sm font-mono" data-testid="text-ticket-code">
                            {purchasedTicket.ticketCode}
                          </code>
                          <Button size="icon" variant="ghost" onClick={copyTicketCode} data-testid="button-copy-ticket">
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Name</p>
                        <p className="text-sm font-medium">{purchasedTicket.buyerName}</p>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Email</p>
                        <p className="text-sm font-medium">{purchasedTicket.buyerEmail}</p>
                      </div>
                    </div>

                    {event.meetingLink && (
                      <Button className="w-full" asChild data-testid="button-join-event">
                        <a href={event.meetingLink} target="_blank" rel="noopener noreferrer">
                          <Video className="w-4 h-4 mr-2" />
                          Join Event
                          <ExternalLink className="w-4 h-4 ml-2" />
                        </a>
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4 pt-2">
                    <div className="border-t pt-4">
                      <h4 className="font-semibold mb-4 flex items-center gap-2">
                        <Ticket className="w-4 h-4" />
                        Get Your Ticket
                      </h4>
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                          <FormField
                            control={form.control}
                            name="buyerName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Enter your full name"
                                    data-testid="input-ticket-name"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="buyerEmail"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input
                                    type="email"
                                    placeholder="Enter your email"
                                    data-testid="input-ticket-email"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <Button
                            type="submit"
                            className="w-full"
                            disabled={purchaseMutation.isPending}
                            data-testid="button-purchase-ticket"
                          >
                            {purchaseMutation.isPending ? (
                              "Processing..."
                            ) : price === 0 ? (
                              "Register for Free"
                            ) : (
                              `Purchase Ticket - $${price.toFixed(2)}`
                            )}
                          </Button>
                        </form>
                      </Form>
                    </div>
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
