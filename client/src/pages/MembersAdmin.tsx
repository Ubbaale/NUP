import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ArrowLeft,
  Users,
  Search,
  Download,
  Globe2,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Calendar,
} from "lucide-react";
import type { Region, Member } from "@shared/schema";

interface MembersResponse {
  members: Member[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface MemberStats {
  totalCount: number;
  byRegion: { regionId: string | null; regionName: string; count: number }[];
}

export default function MembersAdmin() {
  const [search, setSearch] = useState("");
  const [regionFilter, setRegionFilter] = useState("all");
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data: regions } = useQuery<Region[]>({
    queryKey: ["/api/regions"],
  });

  const { data: stats, isLoading: statsLoading } = useQuery<MemberStats>({
    queryKey: ["/api/members/stats"],
  });

  const queryParams = new URLSearchParams();
  queryParams.set("page", String(page));
  queryParams.set("limit", String(limit));
  if (regionFilter && regionFilter !== "all") queryParams.set("regionId", regionFilter);
  if (search.trim()) queryParams.set("search", search.trim());

  const { data: membersData, isLoading: membersLoading } = useQuery<MembersResponse>({
    queryKey: ["/api/members", { page, regionFilter, search, limit }],
    queryFn: async () => {
      const res = await fetch(`/api/members?${queryParams.toString()}`);
      if (!res.ok) throw new Error("Failed to load members");
      return res.json();
    },
  });

  const getRegionName = (regionId: string | null) => {
    if (!regionId || !regions) return "—";
    return regions.find((r) => r.id === regionId)?.name || "—";
  };

  const handleExport = () => {
    const exportUrl = regionFilter && regionFilter !== "all"
      ? `/api/members/export?regionId=${regionFilter}`
      : "/api/members/export";
    window.open(exportUrl, "_blank");
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleRegionChange = (value: string) => {
    setRegionFilter(value);
    setPage(1);
  };

  return (
    <div className="min-h-screen py-8 bg-muted/30">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/admin">
            <Button variant="ghost" size="sm" data-testid="button-back-admin">
              <ArrowLeft className="w-4 h-4 mr-2" /> Admin Dashboard
            </Button>
          </Link>
        </div>

        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold" data-testid="text-members-admin-title">Member Directory</h1>
              <p className="text-muted-foreground">View and manage all registered members</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleExport} data-testid="button-export-members">
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </Button>
        </div>

        {statsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-lg" />
            ))}
          </div>
        ) : stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <Card>
              <CardContent className="pt-4 pb-4">
                <p className="text-2xl font-bold text-primary" data-testid="text-total-members">{stats.totalCount}</p>
                <p className="text-xs text-muted-foreground">Total Members</p>
              </CardContent>
            </Card>
            {stats.byRegion.slice(0, 3).map((r) => (
              <Card key={r.regionId || "none"}>
                <CardContent className="pt-4 pb-4">
                  <p className="text-2xl font-bold">{r.count}</p>
                  <p className="text-xs text-muted-foreground truncate">{r.regionName}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or membership ID..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
              data-testid="input-search-members"
            />
          </div>
          <Select value={regionFilter} onValueChange={handleRegionChange}>
            <SelectTrigger className="w-full sm:w-52" data-testid="select-region-filter">
              <Globe2 className="w-4 h-4 mr-2" />
              <SelectValue placeholder="All Regions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regions</SelectItem>
              {regions?.map((r) => (
                <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {membersLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-lg" />
            ))}
          </div>
        ) : membersData && membersData.members.length > 0 ? (
          <div className="space-y-1">
            <div className="hidden md:grid grid-cols-12 gap-2 px-4 py-2 text-xs font-medium text-muted-foreground uppercase">
              <div className="col-span-3">Member</div>
              <div className="col-span-2">Membership ID</div>
              <div className="col-span-2">Region</div>
              <div className="col-span-2">Location</div>
              <div className="col-span-1">Card</div>
              <div className="col-span-2">Joined</div>
            </div>
            {membersData.members.map((member) => (
              <Card key={member.id} className="overflow-hidden" data-testid={`member-row-${member.id}`}>
                <CardContent className="p-4">
                  <div className="md:grid md:grid-cols-12 md:gap-2 md:items-center space-y-2 md:space-y-0">
                    <div className="col-span-3">
                      <p className="font-medium text-sm">{member.firstName} {member.lastName}</p>
                      <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                    </div>
                    <div className="col-span-2">
                      <Badge variant="outline" className="font-mono text-xs" data-testid={`text-id-${member.id}`}>
                        {member.membershipId}
                      </Badge>
                    </div>
                    <div className="col-span-2">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Globe2 className="w-3 h-3" />
                        <span className="truncate">{getRegionName(member.regionId)}</span>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{member.city ? `${member.city}, ` : ""}{member.country}</span>
                      </div>
                    </div>
                    <div className="col-span-1">
                      {member.cardOrdered ? (
                        <Badge variant="default" className="text-[10px]">
                          <CreditCard className="w-3 h-3 mr-0.5" /> Ordered
                        </Badge>
                      ) : member.cardNumber ? (
                        <Badge variant="secondary" className="text-[10px]">Has Card</Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </div>
                    <div className="col-span-2">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {member.joinedAt ? new Date(member.joinedAt).toLocaleDateString() : "—"}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {membersData.pagination.totalPages > 1 && (
              <div className="flex items-center justify-between pt-4">
                <p className="text-sm text-muted-foreground">
                  Showing {((membersData.pagination.page - 1) * membersData.pagination.limit) + 1}–{Math.min(membersData.pagination.page * membersData.pagination.limit, membersData.pagination.total)} of {membersData.pagination.total}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                    data-testid="button-prev-page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm font-medium">
                    Page {membersData.pagination.page} of {membersData.pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= membersData.pagination.totalPages}
                    onClick={() => setPage(page + 1)}
                    data-testid="button-next-page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">
                {search || regionFilter !== "all"
                  ? "No members match your search or filter"
                  : "No registered members yet"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
