import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
} from "lucide-react";

const adminSections = [
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
    title: "Store",
    description: "Manage products, inventory, and pricing",
    href: "/admin/store",
    icon: Package,
  },
  {
    title: "Events",
    description: "Create and manage virtual events and tickets",
    href: "/admin/events",
    icon: Calendar,
  },
  {
    title: "Conferences",
    description: "Manage conferences, conventions, and past events",
    href: "/admin/conferences",
    icon: CalendarDays,
  },
  {
    title: "Campaigns",
    description: "Manage fundraising campaigns and track donations",
    href: "/admin/campaigns",
    icon: Target,
  },
  {
    title: "Auctions & Raffles",
    description: "Manage auction items, raffles, bids, and tickets",
    href: "/admin/auctions",
    icon: Gavel,
  },
  {
    title: "Donations",
    description: "View all donations, stats, and donor information",
    href: "/admin/donations",
    icon: Heart,
  },
  {
    title: "Blog",
    description: "Create, edit, and publish blog posts",
    href: "/admin/blog",
    icon: FileText,
  },
  {
    title: "Membership",
    description: "View subscriptions and track award fulfillment",
    href: "/admin/membership",
    icon: Users,
  },
  {
    title: "Membership Tiers",
    description: "Manage tier pricing, benefits, and awards",
    href: "/admin/tiers",
    icon: Crown,
  },
  {
    title: "Songs",
    description: "Upload and manage revolutionary songs",
    href: "/admin/songs",
    icon: Music,
  },
  {
    title: "Printful",
    description: "Manage print-on-demand fulfillment integration",
    href: "/admin/printful",
    icon: Printer,
  },
  {
    title: "Orders",
    description: "View and manage all store orders, tracking, and returns",
    href: "/admin/orders",
    icon: ShoppingCart,
  },
  {
    title: "Gallery",
    description: "Upload and manage event & advocacy photo galleries",
    href: "/admin/gallery",
    icon: ImageIcon,
  },
  {
    title: "Member Directory",
    description: "View, search, filter, and export all registered members",
    href: "/admin/members",
    icon: IdCard,
  },
  {
    title: "Newsletter",
    description: "Compose, preview, and send newsletters to subscribers",
    href: "/admin/newsletter",
    icon: Newspaper,
  },
  {
    title: "Fundraisers",
    description: "View and manage peer-to-peer fundraising pages",
    href: "/admin/fundraisers",
    icon: HandHeart,
  },
  {
    title: "News",
    description: "View live news feed and trigger manual refreshes",
    href: "/admin/news",
    icon: Rss,
  },
  {
    title: "Fallen Heroes",
    description: "Honor and remember those who made the ultimate sacrifice",
    href: "/admin/fallen-heroes",
    icon: Flame,
  },
  {
    title: "Human Rights Reports",
    description: "Manage and auto-discover reports from international organizations",
    href: "/admin/human-rights-reports",
    icon: FileText,
  },
  {
    title: "Community Events",
    description: "Moderate community-submitted events and remove violations",
    href: "/admin/community-events",
    icon: Megaphone,
  },
  {
    title: "Documentaries",
    description: "Manage documentaries about the struggle for democracy and human rights",
    href: "/admin/documentaries",
    icon: Film,
  },
  {
    title: "When You See, Speak",
    description: "Review and moderate public witness video submissions of abductions and arrests",
    href: "/admin/witness-videos",
    icon: Eye,
  },
  {
    title: "Public Articles",
    description: "Review and moderate articles submitted by the public about the struggle",
    href: "/admin/public-articles",
    icon: PenLine,
  },
];

export default function AdminDashboard() {
  const { logout } = useAdminAuth();
  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-5xl">
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
                Manage all aspects of the NUP platform
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {adminSections.map((section) => (
            <Link key={section.href} href={section.href}>
              <Card
                className="hover-elevate cursor-pointer h-full"
                data-testid={`card-admin-${section.title.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <section.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <h3
                        className="font-semibold mb-1"
                        data-testid={`text-admin-section-${section.title.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        {section.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {section.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
