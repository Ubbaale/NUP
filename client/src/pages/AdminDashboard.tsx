import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminAuth } from "@/components/AdminAuthProvider";
import {
  Building,
  Package,
  Calendar,
  Users,
  Music,
  Printer,
  Globe2,
  LayoutDashboard,
  IdCard,
  LogOut,
  CalendarDays,
  Newspaper,
  Target,
  FileText,
  Heart,
  Gavel,
  Crown,
  ShoppingCart,
  ImageIcon,
  HandHeart,
  Rss,
  Flame,
  Megaphone,
  Film,
  Eye,
  PenLine,
  UserX,
  Shield,
  AlertCircle,
  Video,
  ScrollText,
  UserCog,
  type LucideIcon,
} from "lucide-react";

type AdminSection = {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  pendingKey?: string;
  totalKey?: string;
  color?: string;
};

type SectionGroup = {
  groupTitle: string;
  groupDescription: string;
  groupIcon: LucideIcon;
  groupColor: string;
  sections: AdminSection[];
};

const sectionGroups: SectionGroup[] = [
  {
    groupTitle: "Public Submissions & Moderation",
    groupDescription: "Review and approve submissions from the public",
    groupIcon: Shield,
    groupColor: "text-red-500",
    sections: [
      {
        title: "Fallen Heroes",
        description: "Review public memorial submissions and manage the heroes page",
        href: "/admin/fallen-heroes",
        icon: Flame,
        pendingKey: "fallenHeroes",
        totalKey: "fallenHeroes",
        color: "text-red-500",
      },
      {
        title: "Missing Persons & Prisoners",
        description: "Review reports of missing, abducted, detained persons and political prisoners",
        href: "/admin/missing-persons",
        icon: UserX,
        pendingKey: "missingPersons",
        totalKey: "missingPersons",
        color: "text-red-600",
      },
      {
        title: "When You See, Speak",
        description: "Moderate witness video uploads of abductions, arrests, and human rights abuses",
        href: "/admin/witness-videos",
        icon: Eye,
        pendingKey: "witnessVideos",
        totalKey: "witnessVideos",
        color: "text-purple-500",
      },
      {
        title: "Public Articles",
        description: "Review and moderate Voice of the People article submissions",
        href: "/admin/public-articles",
        icon: PenLine,
        pendingKey: "publicArticles",
        totalKey: "publicArticles",
        color: "text-blue-500",
      },
      {
        title: "Community Events",
        description: "Moderate community-submitted events and remove violations",
        href: "/admin/community-events",
        icon: Megaphone,
        pendingKey: "communityEvents",
        totalKey: "communityEvents",
        color: "text-orange-500",
      },
    ],
  },
  {
    groupTitle: "Organization & Community",
    groupDescription: "Manage chapters, regions, members, and conferences",
    groupIcon: Globe2,
    groupColor: "text-blue-500",
    sections: [
      {
        title: "Chapters",
        description: "Create and manage chapters across all regions",
        href: "/admin/chapters",
        icon: Building,
      },
      {
        title: "Regions",
        description: "Manage regions, chapters, and regional leadership",
        href: "/admin/regions",
        icon: Globe2,
      },
      {
        title: "Membership",
        description: "View subscriptions and track award fulfillment",
        href: "/admin/membership",
        icon: Users,
        totalKey: "members",
      },
      {
        title: "Membership Tiers",
        description: "Manage tier pricing, benefits, and awards",
        href: "/admin/tiers",
        icon: Crown,
      },
      {
        title: "Member Directory",
        description: "View, search, filter, and export all registered members",
        href: "/admin/members",
        icon: IdCard,
      },
      {
        title: "Conferences",
        description: "Manage conferences, conventions, and past events",
        href: "/admin/conferences",
        icon: CalendarDays,
      },
    ],
  },
  {
    groupTitle: "Fundraising & Commerce",
    groupDescription: "Manage donations, campaigns, store, orders, and auctions",
    groupIcon: Heart,
    groupColor: "text-green-500",
    sections: [
      {
        title: "Donations",
        description: "View all donations, stats, and donor information",
        href: "/admin/donations",
        icon: Heart,
        totalKey: "donations",
      },
      {
        title: "Campaigns",
        description: "Manage fundraising campaigns and track progress",
        href: "/admin/campaigns",
        icon: Target,
      },
      {
        title: "Fundraisers",
        description: "View and manage peer-to-peer fundraising pages",
        href: "/admin/fundraisers",
        icon: HandHeart,
      },
      {
        title: "Store",
        description: "Manage products, inventory, and pricing",
        href: "/admin/store",
        icon: Package,
      },
      {
        title: "Orders",
        description: "View and manage all store orders, tracking, and returns",
        href: "/admin/orders",
        icon: ShoppingCart,
        totalKey: "orders",
      },
      {
        title: "Auctions & Raffles",
        description: "Manage auction items, raffles, bids, and tickets",
        href: "/admin/auctions",
        icon: Gavel,
      },
      {
        title: "Printful",
        description: "Manage print-on-demand fulfillment integration",
        href: "/admin/printful",
        icon: Printer,
      },
    ],
  },
  {
    groupTitle: "Content & Media",
    groupDescription: "Manage blog posts, news, documentaries, songs, advocacy rallies, and reports",
    groupIcon: Film,
    groupColor: "text-violet-500",
    sections: [
      {
        title: "Blog",
        description: "Create, edit, and publish blog posts",
        href: "/admin/blog",
        icon: FileText,
      },
      {
        title: "News",
        description: "View live news feed and trigger manual refreshes",
        href: "/admin/news",
        icon: Rss,
      },
      {
        title: "Documentaries",
        description: "Manage documentaries about democracy and human rights",
        href: "/admin/documentaries",
        icon: Film,
      },
      {
        title: "Songs",
        description: "Upload and manage revolutionary songs",
        href: "/admin/songs",
        icon: Music,
      },
      {
        title: "Advocacy Rally Demonstrations",
        description: "Upload photos & videos of rallies and demonstrations — auto-compressed with thumbnails",
        href: "/admin/gallery",
        icon: Video,
      },
      {
        title: "Human Rights Reports",
        description: "Manage and auto-discover reports from international organizations",
        href: "/admin/human-rights-reports",
        icon: FileText,
      },
      {
        title: "Events",
        description: "Create and manage virtual events and tickets",
        href: "/admin/events",
        icon: Calendar,
      },
      {
        title: "Newsletter",
        description: "Compose, preview, and send newsletters to subscribers",
        href: "/admin/newsletter",
        icon: Newspaper,
      },
    ],
  },
];

type DashboardStats = {
  pending: Record<string, number>;
  totals: Record<string, number>;
};

export default function AdminDashboard() {
  const { logout, user, hasRole } = useAdminAuth();

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/admin/dashboard-stats"],
    refetchInterval: 30000,
  });

  const totalPending = stats ? Object.values(stats.pending).reduce((sum, v) => sum + v, 0) : 0;

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold" data-testid="text-admin-dashboard-title">
                Admin Dashboard
              </h1>
              <p className="text-sm text-muted-foreground">
                {user ? (
                  <>Signed in as <span className="font-semibold">{user.username}</span> · <span className="capitalize">{user.role.replace("_", " ")}</span></>
                ) : "Manage all aspects of the NUP Diaspora platform"}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={logout}
            data-testid="button-admin-logout"
            className="gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>

        {totalPending > 0 && (
          <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3" data-testid="alert-pending-reviews">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-red-800 dark:text-red-200">
                {totalPending} submission{totalPending !== 1 ? "s" : ""} awaiting review
              </p>
              <p className="text-xs text-red-600 dark:text-red-400">
                Public submissions need your approval before they appear on the site
              </p>
            </div>
          </div>
        )}

        {statsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="border-l-4 border-l-blue-500" data-testid="stat-total-members">
              <CardContent className="p-4">
                <p className="text-2xl font-bold">{stats.totals.members || 0}</p>
                <p className="text-xs text-muted-foreground">Total Members</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-green-500" data-testid="stat-total-donations">
              <CardContent className="p-4">
                <p className="text-2xl font-bold">{stats.totals.donations || 0}</p>
                <p className="text-xs text-muted-foreground">Total Donations</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-orange-500" data-testid="stat-total-orders">
              <CardContent className="p-4">
                <p className="text-2xl font-bold">{stats.totals.orders || 0}</p>
                <p className="text-xs text-muted-foreground">Store Orders</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-red-500" data-testid="stat-pending-total">
              <CardContent className="p-4">
                <p className="text-2xl font-bold text-red-600">{totalPending}</p>
                <p className="text-xs text-muted-foreground">Pending Reviews</p>
              </CardContent>
            </Card>
          </div>
        ) : null}

        {hasRole("super_admin") && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-5 h-5 text-red-600" />
              <div>
                <h2 className="text-lg font-bold">Administration</h2>
                <p className="text-xs text-muted-foreground">Super admin tools — manage admin users and review activity</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link href="/admin/users">
                <Card className="hover-elevate cursor-pointer h-full" data-testid="card-admin-users">
                  <CardContent className="p-5 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-red-100 dark:bg-red-900/30">
                      <UserCog className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm mb-1">Admin Users</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Add or remove admins, change passwords, and assign roles (Super Admin, Editor, Viewer).
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/admin/audit-log">
                <Card className="hover-elevate cursor-pointer h-full" data-testid="card-admin-audit-log">
                  <CardContent className="p-5 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-amber-100 dark:bg-amber-900/30">
                      <ScrollText className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm mb-1">Audit Log</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        See every change made through the admin — who did what, when, and from where.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        )}

        <div className="space-y-10">
          {sectionGroups.map((group) => (
            <div key={group.groupTitle}>
              <div className="flex items-center gap-3 mb-4">
                <group.groupIcon className={`w-5 h-5 ${group.groupColor}`} />
                <div>
                  <h2 className="text-lg font-bold" data-testid={`text-group-${group.groupTitle.toLowerCase().replace(/\s+/g, '-')}`}>
                    {group.groupTitle}
                  </h2>
                  <p className="text-xs text-muted-foreground">{group.groupDescription}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {group.sections.map((section) => {
                  const pending = section.pendingKey && stats ? stats.pending[section.pendingKey] || 0 : 0;
                  const total = section.totalKey && stats ? stats.totals[section.totalKey] || 0 : 0;

                  return (
                    <Link key={section.href} href={section.href}>
                      <Card
                        className={`hover-elevate cursor-pointer h-full transition-colors ${pending > 0 ? "border-red-300 dark:border-red-700" : ""}`}
                        data-testid={`card-admin-${section.title.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        <CardContent className="p-5">
                          <div className="flex items-start gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${pending > 0 ? "bg-red-100 dark:bg-red-900/30" : "bg-primary/10"}`}>
                              <section.icon className={`w-5 h-5 ${pending > 0 ? "text-red-500" : section.color || "text-primary"}`} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3
                                  className="font-semibold text-sm"
                                  data-testid={`text-admin-section-${section.title.toLowerCase().replace(/\s+/g, '-')}`}
                                >
                                  {section.title}
                                </h3>
                                {pending > 0 && (
                                  <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-5" data-testid={`badge-pending-${section.pendingKey}`}>
                                    {pending} pending
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                {section.description}
                              </p>
                              {section.totalKey && stats && (
                                <p className="text-[10px] text-muted-foreground mt-1.5">
                                  {total} total entr{total === 1 ? "y" : "ies"}
                                </p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
