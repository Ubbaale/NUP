import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, Check, X, RefreshCw, FileText, ExternalLink, Rss } from "lucide-react";
import type { HumanRightsReport } from "@shared/schema";

export default function HumanRightsReportsAdmin() {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "approved" | "pending" | "rejected">("all");
  const [form, setForm] = useState({
    organization: "",
    title: "",
    year: "",
    url: "",
    description: "",
    status: "approved",
    source: "manual",
  });

  const { data: reports = [], isLoading } = useQuery<HumanRightsReport[]>({
    queryKey: ["/api/human-rights-reports/all"],
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof form) => apiRequest("POST", "/api/human-rights-reports", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/human-rights-reports"] });
      toast({ title: "Report added" });
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<typeof form> }) =>
      apiRequest("PATCH", `/api/human-rights-reports/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/human-rights-reports"] });
      toast({ title: "Report updated" });
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/human-rights-reports/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/human-rights-reports"] });
      toast({ title: "Report deleted" });
    },
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => apiRequest("POST", `/api/human-rights-reports/approve/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/human-rights-reports"] });
      toast({ title: "Report approved and now visible on the site" });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => apiRequest("POST", `/api/human-rights-reports/reject/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/human-rights-reports"] });
      toast({ title: "Report rejected" });
    },
  });

  const scanMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/human-rights-reports/scan-feeds"),
    onSuccess: async (response) => {
      const result = await response.json();
      queryClient.invalidateQueries({ queryKey: ["/api/human-rights-reports"] });
      toast({
        title: "Feed scan complete",
        description: `${result.added} new reports found, ${result.skipped} already existed. ${result.errors.length > 0 ? `Errors: ${result.errors.join(", ")}` : ""}`,
      });
    },
    onError: () => {
      toast({ title: "Feed scan failed", variant: "destructive" });
    },
  });

  function resetForm() {
    setShowForm(false);
    setEditId(null);
    setForm({ organization: "", title: "", year: "", url: "", description: "", status: "approved", source: "manual" });
  }

  function startEdit(report: HumanRightsReport) {
    setEditId(report.id);
    setForm({
      organization: report.organization,
      title: report.title,
      year: report.year,
      url: report.url,
      description: report.description || "",
      status: report.status,
      source: report.source,
    });
    setShowForm(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editId) {
      updateMutation.mutate({ id: editId, data: form });
    } else {
      createMutation.mutate(form);
    }
  }

  const filteredReports = reports.filter((r) => {
    if (filter === "all") return true;
    return r.status === filter;
  });

  const pendingCount = reports.filter((r) => r.status === "pending").length;

  const grouped = filteredReports.reduce<Record<string, HumanRightsReport[]>>((acc, r) => {
    if (!acc[r.organization]) acc[r.organization] = [];
    acc[r.organization].push(r);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-hr-reports-admin-heading">Human Rights Reports</h1>
          <p className="text-muted-foreground mt-1">
            Manage reports from international organizations. Auto-discovered reports appear as pending.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => scanMutation.mutate()}
            disabled={scanMutation.isPending}
            data-testid="button-scan-feeds"
          >
            {scanMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Rss className="w-4 h-4 mr-2" />}
            Scan Feeds Now
          </Button>
          <Button onClick={() => { resetForm(); setShowForm(true); }} data-testid="button-add-report">
            <Plus className="w-4 h-4 mr-2" /> Add Report
          </Button>
        </div>
      </div>

      {pendingCount > 0 && (
        <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10">
          <CardContent className="py-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                {pendingCount} pending
              </Badge>
              <span className="text-sm text-yellow-800 dark:text-yellow-200">
                New reports were auto-discovered and need your approval before appearing on the site.
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-2">
        {(["all", "approved", "pending", "rejected"] as const).map((f) => (
          <Button
            key={f}
            variant={filter === f ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(f)}
            data-testid={`button-filter-${f}`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f === "pending" && pendingCount > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">{pendingCount}</Badge>
            )}
          </Button>
        ))}
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editId ? "Edit Report" : "Add New Report"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Organization</Label>
                  <Input
                    value={form.organization}
                    onChange={(e) => setForm({ ...form, organization: e.target.value })}
                    placeholder="e.g., Human Rights Watch"
                    required
                    data-testid="input-org"
                  />
                </div>
                <div>
                  <Label>Year</Label>
                  <Input
                    value={form.year}
                    onChange={(e) => setForm({ ...form, year: e.target.value })}
                    placeholder="e.g., 2024"
                    required
                    data-testid="input-year"
                  />
                </div>
              </div>
              <div>
                <Label>Title</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g., World Report 2024: Uganda"
                  required
                  data-testid="input-title"
                />
              </div>
              <div>
                <Label>URL</Label>
                <Input
                  value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                  placeholder="https://..."
                  required
                  data-testid="input-url"
                />
              </div>
              <div>
                <Label>Description (optional)</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Brief summary of the report..."
                  rows={2}
                  data-testid="input-description"
                />
              </div>
              <div>
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger data-testid="select-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="approved">Approved (visible on site)</SelectItem>
                    <SelectItem value="pending">Pending (needs review)</SelectItem>
                    <SelectItem value="rejected">Rejected (hidden)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-submit-report">
                  {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {editId ? "Update" : "Add"} Report
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredReports.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No reports found for this filter.
          </CardContent>
        </Card>
      ) : (
        Object.entries(grouped).map(([org, orgReports]) => (
          <Card key={org}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-red-600" />
                {org}
                <Badge variant="secondary" className="ml-auto">{orgReports.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {orgReports.map((report) => (
                  <div
                    key={report.id}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/40 transition-colors group"
                    data-testid={`admin-report-${report.id}`}
                  >
                    <span className="text-xs font-bold bg-muted px-2 py-1 rounded min-w-[52px] text-center shrink-0">
                      {report.year}
                    </span>
                    <span className="text-sm flex-1 line-clamp-1">{report.title}</span>
                    <Badge
                      variant={report.status === "approved" ? "default" : report.status === "pending" ? "outline" : "secondary"}
                      className={`text-xs ${report.status === "approved" ? "bg-green-600" : report.status === "pending" ? "border-yellow-500 text-yellow-700" : "bg-gray-400"}`}
                    >
                      {report.status}
                    </Badge>
                    {report.source === "auto-feed" && (
                      <Badge variant="outline" className="text-xs border-blue-400 text-blue-600">
                        <Rss className="w-3 h-3 mr-1" /> auto
                      </Badge>
                    )}
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <a href={report.url} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Button>
                      </a>
                      {report.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-green-600 hover:text-green-700"
                            onClick={() => approveMutation.mutate(report.id)}
                            data-testid={`button-approve-${report.id}`}
                          >
                            <Check className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
                            onClick={() => rejectMutation.mutate(report.id)}
                            data-testid={`button-reject-${report.id}`}
                          >
                            <X className="w-3.5 h-3.5" />
                          </Button>
                        </>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0"
                        onClick={() => startEdit(report)}
                        data-testid={`button-edit-${report.id}`}
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-red-500 hover:text-red-600"
                        onClick={() => {
                          if (confirm("Delete this report?")) deleteMutation.mutate(report.id);
                        }}
                        data-testid={`button-delete-${report.id}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
