import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Calendar, MapPin, User, Mail, Phone, Trash2, Eye, EyeOff, ExternalLink, AlertTriangle, Users } from "lucide-react";
import type { CommunityEvent } from "@shared/schema";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function CommunityEventsAdmin() {
  const { toast } = useToast();

  const { data: events, isLoading } = useQuery<CommunityEvent[]>({
    queryKey: ["/api/admin/community-events"],
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await apiRequest("PATCH", `/api/admin/community-events/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/community-events"] });
      toast({ title: "Event updated" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/community-events/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/community-events"] });
      toast({ title: "Event deleted" });
    },
  });

  const activeCount = events?.filter(e => e.status === "active").length || 0;
  const hiddenCount = events?.filter(e => e.status === "hidden").length || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" data-testid="text-community-events-admin-title">Community Events Moderation</h1>
        <p className="text-muted-foreground">Review and moderate community-submitted events. Hide or delete events that violate guidelines.</p>
      </div>

      <div className="flex gap-4">
        <Card className="flex-1">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600" data-testid="text-active-count">{activeCount}</p>
            <p className="text-xs text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card className="flex-1">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600" data-testid="text-hidden-count">{hiddenCount}</p>
            <p className="text-xs text-muted-foreground">Hidden</p>
          </CardContent>
        </Card>
        <Card className="flex-1">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold" data-testid="text-total-count">{events?.length || 0}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
      ) : events && events.length > 0 ? (
        <div className="space-y-3">
          {events.map((event) => (
            <Card key={event.id} className={event.status === "hidden" ? "opacity-60" : ""} data-testid={`card-admin-community-event-${event.id}`}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {event.imageUrl && (
                    <img src={event.imageUrl} alt={event.title} className="w-24 h-24 object-cover rounded-md flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{event.title}</h3>
                          <Badge variant={event.status === "active" ? "default" : "secondary"}>
                            {event.status}
                          </Badge>
                        </div>
                        {event.description && (
                          <p className="text-sm text-muted-foreground line-clamp-1 mb-2">{event.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleMutation.mutate({
                            id: event.id,
                            status: event.status === "active" ? "hidden" : "active"
                          })}
                          disabled={toggleMutation.isPending}
                          data-testid={`button-toggle-community-event-${event.id}`}
                        >
                          {event.status === "active" ? (
                            <><EyeOff className="w-3.5 h-3.5 mr-1" /> Hide</>
                          ) : (
                            <><Eye className="w-3.5 h-3.5 mr-1" /> Show</>
                          )}
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm" data-testid={`button-delete-community-event-${event.id}`}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Community Event?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently remove "{event.title}" and its flyer image. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteMutation.mutate(event.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {event.eventDate}{event.eventTime ? ` at ${event.eventTime}` : ""}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {event.location}{event.city ? `, ${event.city}` : ""}{event.country ? `, ${event.country}` : ""}</span>
                      <span className="flex items-center gap-1"><User className="w-3 h-3" /> {event.organizerName}</span>
                      <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {event.organizerEmail}</span>
                      {event.organizerPhone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {event.organizerPhone}</span>}
                      {event.ticketUrl && (
                        <a href={event.ticketUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                          <ExternalLink className="w-3 h-3" /> Ticket Link
                        </a>
                      )}
                    </div>
                    {event.createdAt && (
                      <p className="text-[10px] text-muted-foreground mt-1">Submitted: {new Date(event.createdAt).toLocaleDateString()}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center border-dashed">
          <Users className="w-12 h-12 mx-auto mb-3 text-muted-foreground/40" />
          <h3 className="font-semibold mb-2">No Community Events</h3>
          <p className="text-sm text-muted-foreground">Community-submitted events will appear here for moderation.</p>
        </Card>
      )}
    </div>
  );
}
