import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import {
  Building,
  Package,
  Calendar,
  Users,
  Music,
  Printer,
  Globe2,
  LayoutDashboard,
} from "lucide-react";

const adminSections = [
  {
    title: "Chapters",
    description: "Create and manage chapters across all regions",
    href: "/admin/chapters",
    icon: Building,
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
    title: "Membership",
    description: "View subscriptions and track award fulfillment",
    href: "/admin/membership",
    icon: Users,
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
    title: "Regions",
    description: "Manage regions, chapters, and regional leadership",
    href: "/admin/regions",
    icon: Globe2,
  },
];

export default function AdminDashboard() {
  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex items-center gap-3 mb-8">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {adminSections.map((section) => (
            <Link key={section.href} href={section.href}>
              <Card
                className="hover-elevate cursor-pointer h-full"
                data-testid={`card-admin-${section.title.toLowerCase()}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <section.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <h3
                        className="font-semibold mb-1"
                        data-testid={`text-admin-section-${section.title.toLowerCase()}`}
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
