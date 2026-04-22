import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAdminAuth } from "@/components/AdminAuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Shield, ScrollText, ChevronLeft, ChevronRight } from "lucide-react";

interface AuditEntry {
  id: string;
  userId: string | null;
  username: string | null;
  role: string | null;
  method: string;
  path: string;
  statusCode: number | null;
  bodyPreview: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string | null;
}

const PAGE_SIZE = 50;

const METHOD_COLORS: Record<string, string> = {
  POST: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200",
  PATCH: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
  PUT: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
  DELETE: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200",
  GET: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200",
};

export default function AuditLogAdmin() {
  const { hasRole } = useAdminAuth();
  const [page, setPage] = useState(0);
  const [filter, setFilter] = useState("");

  const { data: entries = [], isLoading } = useQuery<AuditEntry[]>({
    queryKey: ["/api/admin/audit-log", page],
    queryFn: async () => {
      const res = await fetch(`/api/admin/audit-log?limit=${PAGE_SIZE}&offset=${page * PAGE_SIZE}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load audit log");
      return res.json();
    },
    enabled: hasRole("super_admin"),
  });

  if (!hasRole("super_admin")) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="py-12 text-center">
            <Shield className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-lg font-semibold">Super Admin access required</p>
            <p className="text-muted-foreground mt-1">Only super admins can view the audit log.</p>
            <Link href="/admin">
              <Button variant="outline" className="mt-4" data-testid="link-back">Back to dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filtered = filter
    ? entries.filter(e => {
        const f = filter.toLowerCase();
        return (e.username || "").toLowerCase().includes(f)
          || e.path.toLowerCase().includes(f)
          || (e.bodyPreview || "").toLowerCase().includes(f);
      })
    : entries;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <Link href="/admin">
          <Button variant="ghost" size="sm" data-testid="link-back">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to dashboard
          </Button>
        </Link>
        <h1 className="text-2xl font-bold mt-2 flex items-center gap-2">
          <ScrollText className="w-6 h-6" /> Audit Log
        </h1>
        <p className="text-muted-foreground">Every change made through the admin is recorded here.</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap">
          <CardTitle>Recent activity</CardTitle>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Filter by user, path, content..."
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="w-64"
              data-testid="input-filter"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              data-testid="button-prev-page"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm text-muted-foreground">Page {page + 1}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => p + 1)}
              disabled={entries.length < PAGE_SIZE}
              data-testid="button-next-page"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-2">
              {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : (
            <div className="divide-y">
              {filtered.map(entry => (
                <AuditRow key={entry.id} entry={entry} />
              ))}
              {filtered.length === 0 && (
                <div className="p-6 text-center text-muted-foreground">
                  {filter ? "No entries match your filter." : "No audit log entries yet."}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function AuditRow({ entry }: { entry: AuditEntry }) {
  const [expanded, setExpanded] = useState(false);
  const ts = entry.createdAt ? new Date(entry.createdAt) : null;
  const methodClass = METHOD_COLORS[entry.method] || "bg-gray-100 text-gray-800";
  const failed = entry.statusCode && entry.statusCode >= 400;

  return (
    <div
      className="p-3 hover:bg-muted/40 cursor-pointer"
      onClick={() => setExpanded(e => !e)}
      data-testid={`row-audit-${entry.id}`}
    >
      <div className="flex items-center gap-3 flex-wrap text-sm">
        <span className="text-xs text-muted-foreground w-44 shrink-0">
          {ts ? ts.toLocaleString() : "—"}
        </span>
        <Badge className={methodClass}>{entry.method}</Badge>
        <span className="font-mono text-xs flex-1 min-w-[200px] break-all">{entry.path}</span>
        <span className="font-medium" data-testid={`text-audit-user-${entry.id}`}>
          {entry.username || <span className="text-muted-foreground italic">anonymous</span>}
        </span>
        {entry.role && <Badge variant="outline" className="text-xs">{entry.role}</Badge>}
        {entry.statusCode != null && (
          <Badge variant={failed ? "destructive" : "secondary"} className="text-xs">
            {entry.statusCode}
          </Badge>
        )}
      </div>
      {expanded && (
        <div className="mt-2 ml-44 text-xs space-y-1 bg-muted/40 p-3 rounded">
          {entry.ipAddress && <div><strong>IP:</strong> {entry.ipAddress}</div>}
          {entry.userAgent && <div className="break-all"><strong>User agent:</strong> {entry.userAgent}</div>}
          {entry.bodyPreview && (
            <div>
              <strong>Request body:</strong>
              <pre className="mt-1 whitespace-pre-wrap break-all bg-background p-2 rounded">{entry.bodyPreview}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
