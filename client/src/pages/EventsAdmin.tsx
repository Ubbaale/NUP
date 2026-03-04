import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import {
  Calendar,
  Plus,
  Users,
  Ticket,
  Video,
  Mic,
  Music,
  Presentation,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Settings,
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

const eventFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  slug: z.string().min(3, "Slug must be at least 3 characters").regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  eventDate: z.string().min(1, "Event date is required"),
  endDate: z.string().optional(),
  eventType: z.string().min(1, "Event type is required"),
  meetingLink: z.string().url("Must be a valid URL").or(z.literal("")),
  ticketPrice: z.string().min(1, "Price is required"),
  maxAttendees: z.string().optional(),
  hostName: z.string().min(1, "Host name is required"),
  hostTitle: z.string().optional(),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

type EventFormData = z.infer<typeof eventFormSchema>;

export default function EventsAdmin() {
  const { toast } = useToast();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const { data: events, isLoading } = useQuery<VirtualEvent[]>({
    queryKey: ["/api/events/all"],
  });

  const { data: paymentConfig } = useQuery<{ stripeConfigured: boolean; emailConfigured: boolean }>({
    queryKey: ["/api/config/payment"],
  });

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: "",
      slug: "",
      description: "",
      eventDate: "",
      endDate: "",
      eventType: "webinar",
      meetingLink: "",
      ticketPrice: "0",
      maxAttendees: "",
      hostName: "",
      hostTitle: "",
      isFeatured: false,
      isActive: true,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: EventFormData) => {
      const payload = {
        ...data,
        ticketPrice: data.ticketPrice,
        maxAttendees: data.maxAttendees ? parseInt(data.maxAttendees) : null,
        meetingLink: data.meetingLink || null,
        hostTitle: data.hostTitle || null,
      };
      const res = await apiRequest("POST", "/api/events", payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/events/all"] });
      setCreateDialogOpen(false);
      form.reset();
      toast({ title: "Event Created", description: "The event has been created successfully." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const res = await apiRequest("PATCH", `/api/events/${id}`, { isActive });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/events/all"] });
    },
  });

  const featuredMutation = useMutation({
    mutationFn: async ({ id, isFeatured }: { id: string; isFeatured: boolean }) => {
      const res = await apiRequest("PATCH", `/api/events/${id}`, { isFeatured });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/events/all"] });
    },
  });

  const autoSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const now = new Date();
  const activeEvents = events?.filter(e => e.isActive) || [];
  const inactiveEvents = events?.filter(e => !e.isActive) || [];
  const upcomingCount = events?.filter(e => new Date(e.eventDate) > now).length || 0;

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold" data-testid="text-admin-events-title">Events Administration</h1>
            <p className="text-muted-foreground mt-1">Manage virtual events, view tickets, and configure settings</p>
          </div>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-event">
                <Plus className="w-4 h-4 mr-2" />
                Create Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Event</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit((data) => createMutation.mutate(data))} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Event Title</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Town Hall: Democracy Discussion"
                            data-testid="input-event-title"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              if (!form.getValues("slug") || form.getValues("slug") === autoSlug(field.value)) {
                                form.setValue("slug", autoSlug(e.target.value));
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL Slug</FormLabel>
                        <FormControl>
                          <Input placeholder="town-hall-democracy" data-testid="input-event-slug" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea rows={4} placeholder="Describe the event..." data-testid="input-event-description" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="eventType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Event Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-event-type">
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="webinar">Webinar</SelectItem>
                              <SelectItem value="townhall">Town Hall</SelectItem>
                              <SelectItem value="concert">Concert</SelectItem>
                              <SelectItem value="workshop">Workshop</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="ticketPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ticket Price ($)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" min="0" data-testid="input-ticket-price" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="eventDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Date & Time</FormLabel>
                          <FormControl>
                            <Input type="datetime-local" data-testid="input-event-date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Date & Time</FormLabel>
                          <FormControl>
                            <Input type="datetime-local" data-testid="input-event-end-date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="meetingLink"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meeting Link (Zoom, Google Meet, YouTube Live, etc.)</FormLabel>
                        <FormControl>
                          <Input placeholder="https://zoom.us/j/..." data-testid="input-meeting-link" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="maxAttendees"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Attendees (optional)</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" placeholder="Unlimited if empty" data-testid="input-max-attendees" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="hostName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Host Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Hon. Robert Kyagulanyi" data-testid="input-host-name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="hostTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Host Title</FormLabel>
                          <FormControl>
                            <Input placeholder="NUP President" data-testid="input-host-title" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex items-center gap-6">
                    <FormField
                      control={form.control}
                      name="isFeatured"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-2">
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-featured" />
                          </FormControl>
                          <FormLabel className="!mt-0">Featured</FormLabel>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-2">
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-active" />
                          </FormControl>
                          <FormLabel className="!mt-0">Active</FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={createMutation.isPending} data-testid="button-submit-event">
                    {createMutation.isPending ? "Creating..." : "Create Event"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <Calendar className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold" data-testid="text-total-events">{events?.length || 0}</p>
              <p className="text-xs text-muted-foreground">Total Events</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Video className="w-8 h-8 mx-auto mb-2 text-blue-500" />
              <p className="text-2xl font-bold">{upcomingCount}</p>
              <p className="text-xs text-muted-foreground">Upcoming</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              {paymentConfig?.stripeConfigured ? (
                <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
              ) : (
                <AlertCircle className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
              )}
              <p className="text-sm font-medium">{paymentConfig?.stripeConfigured ? "Connected" : "Not Set"}</p>
              <p className="text-xs text-muted-foreground">Stripe Payments</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              {paymentConfig?.emailConfigured ? (
                <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
              ) : (
                <AlertCircle className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
              )}
              <p className="text-sm font-medium">{paymentConfig?.emailConfigured ? "Connected" : "Not Set"}</p>
              <p className="text-xs text-muted-foreground">Email Notifications</p>
            </CardContent>
          </Card>
        </div>

        {!paymentConfig?.stripeConfigured && (
          <Card className="mb-6 border-yellow-300 bg-yellow-50 dark:bg-yellow-950/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Settings className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-800 dark:text-yellow-200">Payment Setup Required</p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    Add <code className="bg-yellow-200/50 px-1 rounded">STRIPE_SECRET_KEY</code> and optionally{" "}
                    <code className="bg-yellow-200/50 px-1 rounded">STRIPE_WEBHOOK_SECRET</code> to your environment
                    secrets to enable real payment processing. Without these, tickets are recorded but no payment is collected.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {!paymentConfig?.emailConfigured && (
          <Card className="mb-6 border-blue-300 bg-blue-50 dark:bg-blue-950/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Settings className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-800 dark:text-blue-200">Email Setup Optional</p>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    Add <code className="bg-blue-200/50 px-1 rounded">SMTP_HOST</code>,{" "}
                    <code className="bg-blue-200/50 px-1 rounded">SMTP_USER</code>, and{" "}
                    <code className="bg-blue-200/50 px-1 rounded">SMTP_PASS</code> to enable automatic email
                    confirmations for ticket purchases, donations, and memberships.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-lg" />)}
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Active Events ({activeEvents.length})</h2>
              {activeEvents.length === 0 ? (
                <Card className="p-8 text-center">
                  <Calendar className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-muted-foreground">No active events. Create one to get started.</p>
                </Card>
              ) : (
                <div className="space-y-3">
                  {activeEvents.map(event => (
                    <EventRow
                      key={event.id}
                      event={event}
                      onToggleActive={() => toggleMutation.mutate({ id: event.id, isActive: false })}
                      onToggleFeatured={() => featuredMutation.mutate({ id: event.id, isFeatured: !event.isFeatured })}
                    />
                  ))}
                </div>
              )}
            </div>

            {inactiveEvents.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Inactive Events ({inactiveEvents.length})</h2>
                <div className="space-y-3">
                  {inactiveEvents.map(event => (
                    <EventRow
                      key={event.id}
                      event={event}
                      onToggleActive={() => toggleMutation.mutate({ id: event.id, isActive: true })}
                      onToggleFeatured={() => featuredMutation.mutate({ id: event.id, isFeatured: !event.isFeatured })}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function EventRow({
  event,
  onToggleActive,
  onToggleFeatured,
}: {
  event: VirtualEvent;
  onToggleActive: () => void;
  onToggleFeatured: () => void;
}) {
  const TypeIcon = eventTypeIcons[event.eventType] || Video;
  const eventDate = new Date(event.eventDate);
  const isPast = eventDate < new Date();
  const price = parseFloat(event.ticketPrice?.toString() || "0");

  return (
    <Card data-testid={`card-admin-event-${event.id}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <TypeIcon className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold truncate">{event.title}</h3>
                {event.isFeatured && <Badge variant="default" className="text-xs">Featured</Badge>}
                {isPast && <Badge variant="outline" className="text-xs">Ended</Badge>}
                {price === 0 && <Badge variant="secondary" className="text-xs">Free</Badge>}
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                <span>{format(eventDate, "MMM d, yyyy h:mm a")}</span>
                {event.hostName && <span>{event.hostName}</span>}
                {price > 0 && <span>${price.toFixed(2)}</span>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              size="sm"
              variant={event.isFeatured ? "default" : "outline"}
              onClick={onToggleFeatured}
              data-testid={`button-toggle-featured-${event.id}`}
            >
              {event.isFeatured ? "Unfeature" : "Feature"}
            </Button>
            <Button
              size="sm"
              variant={event.isActive ? "destructive" : "default"}
              onClick={onToggleActive}
              data-testid={`button-toggle-active-${event.id}`}
            >
              {event.isActive ? "Deactivate" : "Activate"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
