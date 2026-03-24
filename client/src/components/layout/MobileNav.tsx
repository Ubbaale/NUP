import { Link, useLocation } from "wouter";
import { Home, Globe2, Video, Heart, Menu, HandHeart, Mail } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  ShoppingBag,
  Users,
  Calendar,
  Newspaper,
  BookOpen,
  Info,
  Target,
  Gavel,
  Crown,
  Settings,
  Music,
  ImageIcon,
  Flame,
} from "lucide-react";
import { useState } from "react";

const bottomTabs = [
  { href: "/", label: "Home", icon: Home },
  { href: "/events", label: "Events", icon: Video },
  { href: "/regions", label: "Regions", icon: Globe2 },
  { href: "/donate", label: "Donate", icon: Heart },
  { href: "mail", label: "Mail", icon: Mail, external: "https://mail.hostinger.com/v2/auth/login" },
  { href: "more", label: "More", icon: Menu },
];

const moreItems = [
  { href: "/about", label: "About Us", icon: Info },
  { href: "/songs", label: "Songs", icon: Music },
  { href: "/fundraise", label: "Fundraise", icon: HandHeart },
  { href: "/campaigns", label: "Campaigns", icon: Target },
  { href: "/conferences", label: "Conferences", icon: Calendar },
  { href: "/news", label: "News", icon: Newspaper },
  { href: "/blog", label: "Blog", icon: BookOpen },
  { href: "/auctions", label: "Auctions", icon: Gavel },
  { href: "/gallery", label: "Gallery", icon: ImageIcon },
  { href: "/fallen-heroes", label: "Fallen Heroes", icon: Flame },
  { href: "/store", label: "Store", icon: ShoppingBag },
  { href: "/membership", label: "Membership", icon: Users },
  { href: "/membership-tiers", label: "Premium Tiers", icon: Crown },
  { href: "/order-tracking", label: "Track Order", icon: ShoppingBag },
  { href: "/admin/events", label: "Admin: Events", icon: Settings },
  { href: "/admin/membership", label: "Admin: Subscriptions", icon: Settings },
  { href: "/admin/members", label: "Admin: Directory", icon: Settings },
  { href: "/admin/songs", label: "Admin: Songs", icon: Settings },
  { href: "/admin/chapters", label: "Admin: Chapters", icon: Settings },
  { href: "/admin/store", label: "Admin: Store", icon: Settings },
  { href: "/admin/printful", label: "Admin: Printful", icon: Settings },
  { href: "/admin", label: "Admin", icon: Settings },
];

export function MobileNav() {
  const [location] = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") return location === "/";
    return location.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-t lg:hidden" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div className="flex items-center justify-around h-16 px-1">
        {bottomTabs.map((tab) => {
          if (tab.href === "more") {
            return (
              <Sheet key="more" open={moreOpen} onOpenChange={setMoreOpen}>
                <SheetTrigger asChild>
                  <button
                    className={`flex flex-col items-center justify-center gap-0.5 w-16 h-full transition-colors ${moreOpen ? "text-primary" : "text-muted-foreground"}`}
                    data-testid="button-more-menu"
                  >
                    <tab.icon className="w-5 h-5" />
                    <span className="text-[10px] font-medium">{tab.label}</span>
                  </button>
                </SheetTrigger>
                <SheetContent side="bottom" className="rounded-t-2xl max-h-[70vh]">
                  <div className="pt-2 pb-4">
                    <div className="w-10 h-1 bg-muted-foreground/30 rounded-full mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-3 px-2">More</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {moreItems.map((item) => (
                        <Link key={item.href} href={item.href} onClick={() => setMoreOpen(false)}>
                          <button
                            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl w-full transition-colors ${
                              isActive(item.href)
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground hover:bg-muted"
                            }`}
                            data-testid={`more-nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                          >
                            <item.icon className="w-5 h-5" />
                            <span className="text-[11px] font-medium text-center leading-tight">{item.label}</span>
                          </button>
                        </Link>
                      ))}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            );
          }

          if ((tab as any).external) {
            return (
              <a key={tab.href} href={(tab as any).external} target="_blank" rel="noopener noreferrer">
                <button
                  className="flex flex-col items-center justify-center gap-0.5 w-16 h-full transition-colors text-muted-foreground"
                  data-testid={`tab-${tab.label.toLowerCase()}`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="text-[10px] font-medium">{tab.label}</span>
                </button>
              </a>
            );
          }

          return (
            <Link key={tab.href} href={tab.href}>
              <button
                className={`flex flex-col items-center justify-center gap-0.5 w-16 h-full transition-colors ${
                  isActive(tab.href) ? "text-primary" : "text-muted-foreground"
                }`}
                data-testid={`tab-${tab.label.toLowerCase()}`}
              >
                <tab.icon className={`w-5 h-5 ${isActive(tab.href) ? "scale-110" : ""} transition-transform`} />
                <span className="text-[10px] font-medium">{tab.label}</span>
                {isActive(tab.href) && (
                  <div className="w-1 h-1 rounded-full bg-primary -mt-0.5" />
                )}
              </button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
