import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingBag, Users, Globe2, Calendar, Newspaper, BookOpen, Video, Target, Gavel, Music } from "lucide-react";
import nupLogo from "@/assets/images/nup-official-logo.png";

const navItems = [
  { href: "/", label: "Home", icon: Globe2 },
  { href: "/regions", label: "Regions", icon: Globe2 },
  { href: "/events", label: "Events", icon: Video },
  { href: "/campaigns", label: "Campaigns", icon: Target },
  { href: "/conferences", label: "Conferences", icon: Calendar },
  { href: "/news", label: "News", icon: Newspaper },
  { href: "/blog", label: "Blog", icon: BookOpen },
  { href: "/auctions", label: "Auctions", icon: Gavel },
  { href: "/songs", label: "Songs", icon: Music },
  { href: "/store", label: "Store", icon: ShoppingBag },
  { href: "/membership", label: "Membership", icon: Users },
  { href: "/donate", label: "Donate", icon: Heart },
];

export function Header() {
  const [location] = useLocation();

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b" style={{ paddingTop: "env(safe-area-inset-top)" }}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-12 lg:h-16">
          <Link href="/" className="flex items-center">
            <img src={nupLogo} alt="National Unity Platform" className="h-8 lg:h-12 object-contain" />
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={location === item.href ? "secondary" : "ghost"}
                  className="font-bold"
                  data-testid={`nav-${item.label.toLowerCase()}`}
                >
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/donate" className="hidden lg:block">
              <Button data-testid="button-donate-header">
                <Heart className="w-4 h-4 mr-2" />
                Donate
              </Button>
            </Link>
            <span className="lg:hidden text-sm font-semibold text-foreground">NUP Diaspora</span>
          </div>
        </div>
      </div>
    </header>
  );
}
