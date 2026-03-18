import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DollarSign, ArrowLeft, Heart, TrendingUp, Users, Search,
} from "lucide-react";
import { format } from "date-fns";
import { useState, useMemo } from "react";
import { Link } from "wouter";
import type { Donation } from "@shared/schema";

export default function DonationsAdmin() {
  const { data: donations, isLoading } = useQuery<Donation[]>({ queryKey: ["/api/donations"] });
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!donations) return [];
    if (!search) return donations;
    const q = search.toLowerCase();
    return donations.filter(d =>
      d.donorName.toLowerCase().includes(q) ||
      d.email.toLowerCase().includes(q) ||
      (d.message && d.message.toLowerCase().includes(q))
    );
  }, [donations, search]);

  const stats = useMemo(() => {
    if (!donations) return { total: 0, count: 0, recurring: 0, avgAmount: 0 };
    const total = donations.reduce((sum, d) => sum + Number(d.amount), 0);
    const recurring = donations.filter(d => d.isRecurring).length;
    return { total, count: donations.length, recurring, avgAmount: donations.length > 0 ? total / donations.length : 0 };
  }, [donations]);

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/admin"><Button variant="ghost" size="icon" data-testid="button-back"><ArrowLeft className="w-5 h-5" /></Button></Link>
          <Heart className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold" data-testid="text-donations-admin-title">Donations</h1>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <DollarSign className="w-5 h-5 text-green-600 mx-auto mb-1" />
              <p className="text-2xl font-bold" data-testid="text-total-donations">${stats.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
              <p className="text-xs text-muted-foreground">Total Raised</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="w-5 h-5 text-blue-600 mx-auto mb-1" />
              <p className="text-2xl font-bold" data-testid="text-donation-count">{stats.count}</p>
              <p className="text-xs text-muted-foreground">Total Donations</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-5 h-5 text-purple-600 mx-auto mb-1" />
              <p className="text-2xl font-bold" data-testid="text-avg-donation">${stats.avgAmount.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">Average</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Heart className="w-5 h-5 text-red-600 mx-auto mb-1" />
              <p className="text-2xl font-bold" data-testid="text-recurring-count">{stats.recurring}</p>
              <p className="text-xs text-muted-foreground">Recurring</p>
            </CardContent>
          </Card>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by name, email, or message..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} data-testid="input-search-donations" />
        </div>

        {isLoading ? (
          <div className="space-y-4">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-16 w-full" />)}</div>
        ) : !filtered.length ? (
          <Card><CardContent className="p-8 text-center text-muted-foreground">{search ? "No matching donations" : "No donations yet"}</CardContent></Card>
        ) : (
          <div className="space-y-2">
            {filtered.map(d => (
              <Card key={d.id} data-testid={`card-donation-${d.id}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium" data-testid={`text-donor-name-${d.id}`}>{d.isAnonymous ? "Anonymous Donor" : d.donorName}</p>
                        {d.isRecurring && <Badge variant="outline">Recurring</Badge>}
                        {d.isAnonymous && <Badge variant="secondary">Anonymous</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">{d.email} {d.createdAt ? `· ${format(new Date(d.createdAt), "MMM d, yyyy h:mm a")}` : ""}</p>
                      {d.message && <p className="text-sm text-muted-foreground mt-1 italic">"{d.message}"</p>}
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600" data-testid={`text-donation-amount-${d.id}`}>${Number(d.amount).toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">{d.currency}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
