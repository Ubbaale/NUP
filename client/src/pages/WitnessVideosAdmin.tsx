import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Eye, CheckCircle, XCircle, Trash2, Pencil, Clock, AlertTriangle,
  Video, MapPin, Calendar, Mail, Phone, User, ChevronDown, ChevronUp
} from "lucide-react";
import type { WitnessVideo } from "@shared/schema";
import { EditEntryDialog } from "@/components/EditEntryDialog";

export default function WitnessVideosAdmin() {
  const { toast } = useToast();
  const [filter, setFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});
  const [editTarget, setEditTarget] = useState<WitnessVideo | null>(null);

  const { data: videos, isLoading } = useQuery<WitnessVideo[]>({
    queryKey: ["/api/admin/witness-videos"],
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<WitnessVideo> }) => {
      const res = await apiRequest("PATCH", `/api/admin/witness-videos/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/witness-videos"] });
      toast({ title: "Video Updated" });
    },
    onError: () => {
      toast({ title: "Update Failed", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/admin/witness-videos/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/witness-videos"] });
      toast({ title: "Video Deleted" });
    },
    onError: () => {
      toast({ title: "Delete Failed", variant: "destructive" });
    },
  });

  const filtered = videos?.filter(v => filter === "all" || v.status === filter) || [];
  const pendingCount = videos?.filter(v => v.status === "pending").length || 0;
  const approvedCount = videos?.filter(v => v.status === "approved").length || 0;
  const rejectedCount = videos?.filter(v => v.status === "rejected").length || 0;

  const statusColor: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    approved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-witness-admin-title">When You See, Speak</h1>
          <p className="text-muted-foreground">Review and moderate witness video submissions</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:border-primary" onClick={() => setFilter("all")} data-testid="card-filter-all">
          <CardContent className="p-4 text-center">
            <Video className="w-6 h-6 mx-auto mb-1 text-muted-foreground" />
            <p className="text-2xl font-bold">{videos?.length || 0}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-yellow-500" onClick={() => setFilter("pending")} data-testid="card-filter-pending">
          <CardContent className="p-4 text-center">
            <Clock className="w-6 h-6 mx-auto mb-1 text-yellow-500" />
            <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-green-500" onClick={() => setFilter("approved")} data-testid="card-filter-approved">
          <CardContent className="p-4 text-center">
            <CheckCircle className="w-6 h-6 mx-auto mb-1 text-green-500" />
            <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
            <p className="text-xs text-muted-foreground">Approved</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-red-500" onClick={() => setFilter("rejected")} data-testid="card-filter-rejected">
          <CardContent className="p-4 text-center">
            <XCircle className="w-6 h-6 mx-auto mb-1 text-red-500" />
            <p className="text-2xl font-bold text-red-600">{rejectedCount}</p>
            <p className="text-xs text-muted-foreground">Rejected</p>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : filtered.length === 0 ? (
        <Card className="p-8 text-center border-dashed">
          <Video className="w-12 h-12 mx-auto mb-3 text-muted-foreground/40" />
          <h3 className="font-semibold">No Videos {filter !== "all" ? `(${filter})` : ""}</h3>
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map(video => (
            <Card key={video.id} data-testid={`card-admin-witness-${video.id}`} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-80 flex-shrink-0 bg-black">
                    <video
                      src={video.videoUrl}
                      className="w-full aspect-video object-contain"
                      controls
                      preload="metadata"
                    />
                  </div>
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h3 className="font-semibold text-lg">{video.title}</h3>
                        <Badge className={`text-[10px] mt-1 ${statusColor[video.status] || ""}`}>
                          {video.status === "pending" && <Clock className="w-3 h-3 mr-0.5" />}
                          {video.status === "approved" && <CheckCircle className="w-3 h-3 mr-0.5" />}
                          {video.status === "rejected" && <XCircle className="w-3 h-3 mr-0.5" />}
                          {video.status.charAt(0).toUpperCase() + video.status.slice(1)}
                        </Badge>
                      </div>
                      <div className="flex gap-1">
                        {video.status !== "approved" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 hover:bg-green-50"
                            onClick={() => updateMutation.mutate({ id: video.id, data: { status: "approved" } })}
                            data-testid={`button-approve-${video.id}`}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" /> Approve
                          </Button>
                        )}
                        {video.status !== "rejected" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => updateMutation.mutate({ id: video.id, data: { status: "rejected" } })}
                            data-testid={`button-reject-${video.id}`}
                          >
                            <XCircle className="w-4 h-4 mr-1" /> Reject
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditTarget(video)}
                          data-testid={`button-edit-video-${video.id}`}
                        >
                          <Pencil className="w-4 h-4 mr-1" /> Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            if (confirm("Permanently delete this video and its file?")) {
                              deleteMutation.mutate(video.id);
                            }
                          }}
                          data-testid={`button-delete-${video.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {video.description && (
                      <p className="text-sm text-muted-foreground mb-3">{video.description}</p>
                    )}

                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-3">
                      {video.location && (
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {video.location}</span>
                      )}
                      {video.incidentDate && (
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {video.incidentDate}</span>
                      )}
                      {video.createdAt && (
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Submitted: {new Date(video.createdAt).toLocaleDateString()}</span>
                      )}
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs"
                      onClick={() => setExpandedId(expandedId === video.id ? null : video.id)}
                      data-testid={`button-details-${video.id}`}
                    >
                      {expandedId === video.id ? <ChevronUp className="w-3 h-3 mr-1" /> : <ChevronDown className="w-3 h-3 mr-1" />}
                      Submitter Details & Notes
                    </Button>

                    {expandedId === video.id && (
                      <div className="mt-3 p-3 bg-muted/50 rounded-lg space-y-3">
                        <div className="flex flex-wrap gap-4 text-sm">
                          <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> {video.submitterName}</span>
                          <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {video.submitterEmail}</span>
                          {video.submitterPhone && (
                            <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {video.submitterPhone}</span>
                          )}
                        </div>
                        <div>
                          <label className="text-xs font-medium mb-1 block">Admin Notes:</label>
                          <Textarea
                            rows={2}
                            value={adminNotes[video.id] ?? video.adminNotes ?? ""}
                            onChange={(e) => setAdminNotes({ ...adminNotes, [video.id]: e.target.value })}
                            placeholder="Internal notes about this submission..."
                            data-testid={`input-admin-notes-${video.id}`}
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            className="mt-2"
                            onClick={() => updateMutation.mutate({ id: video.id, data: { adminNotes: adminNotes[video.id] ?? video.adminNotes ?? "" } })}
                            data-testid={`button-save-notes-${video.id}`}
                          >
                            Save Notes
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {editTarget && (
        <EditEntryDialog
          open={!!editTarget}
          onClose={() => setEditTarget(null)}
          title={`Edit ${editTarget.title}`}
          endpoint={`/api/admin/witness-videos/${editTarget.id}`}
          invalidateKeys={[["/api/admin/witness-videos"], ["/api/witness-videos"]]}
          initial={editTarget as any}
          fields={[
            { name: "title", label: "Title" },
            { name: "description", label: "Description", type: "textarea", rows: 4 },
            { name: "videoUrl", label: "Video URL", type: "url" },
            { name: "thumbnailUrl", label: "Thumbnail URL", type: "url" },
            { name: "location", label: "Location" },
            { name: "incidentDate", label: "Incident Date", placeholder: "YYYY-MM-DD" },
            { name: "submitterName", label: "Submitter Name" },
            { name: "submitterEmail", label: "Submitter Email", type: "email" },
            { name: "submitterPhone", label: "Submitter Phone" },
            { name: "status", label: "Status", type: "select", options: [
              { value: "pending", label: "Pending" },
              { value: "approved", label: "Approved" },
              { value: "rejected", label: "Rejected" },
            ]},
          ]}
        />
      )}
    </div>
  );
}
