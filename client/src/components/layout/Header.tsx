import { Link, useLocation } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingBag, Users, Globe2, Calendar, Newspaper, BookOpen, Video, Target, Gavel, Music, ChevronDown, ImageIcon, HandHeart, Flame, Film, PenLine, UserX } from "lucide-react";
import { LanguageSelector } from "@/components/LanguageSelector";
import nupLogo from "@/assets/images/nup-official-logo.png";
import peoplePowerLogo from "@assets/download_(5)_1772752192596.jpg";

const primaryNav = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/regions", label: "Regions" },
  { href: "/conferences/convention-2026", label: "Convention" },
  { href: "/events", label: "Events" },
  { href: "/news", label: "News" },
  { href: "/store", label: "Store" },
  { href: "/membership", label: "Membership" },
];

const moreNavItems = [
  { href: "/campaigns", label: "Campaigns", icon: Target },
  { href: "/blog", label: "Blog", icon: BookOpen },
  { href: "/auctions", label: "Auctions", icon: Gavel },
  { href: "/songs", label: "Songs", icon: Music },
  { href: "/gallery", label: "Advocacy Rallies", icon: ImageIcon },
  { href: "/documentaries", label: "Documentaries", icon: Film },
  { href: "/articles", label: "Articles", icon: PenLine },
  { href: "/fallen-heroes", label: "Fallen Heroes", icon: Flame },
  { href: "/missing-persons", label: "Missing & Prisoners", icon: UserX },
];

export function Header() {
  const [location] = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);
  const closeTimeout = useState<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    if (closeTimeout[0]) {
      clearTimeout(closeTimeout[0]);
      closeTimeout[0] = null;
    }
    setMoreOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimeout[0] = setTimeout(() => {
      setMoreOpen(false);
    }, 200);
  };

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b" style={{ paddingTop: "env(safe-area-inset-top)" }}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-12 lg:h-16">
          <Link href="/" className="flex items-center">
            <img src={nupLogo} alt="National Unity Platform" className="h-8 lg:h-12 object-contain" />
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {primaryNav.map((item) => (
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
            <div
              className="relative"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <Button
                variant="ghost"
                className="font-bold"
                onClick={() => setMoreOpen(!moreOpen)}
                data-testid="nav-more"
              >
                More
                <ChevronDown className={`w-3 h-3 ml-1 transition-transform ${moreOpen ? "rotate-180" : ""}`} />
              </Button>
              {moreOpen && (
                <div className="absolute top-full right-0 pt-1 z-50">
                  <div className="bg-background border rounded-lg shadow-lg py-1 min-w-[200px]">
                    {moreNavItems.map((item) => (
                      <Link key={item.href} href={item.href}>
                        <button
                          className={`w-full text-left px-4 py-2.5 text-sm font-medium flex items-center gap-2.5 hover:bg-muted transition-colors ${
                            location === item.href ? "bg-muted text-primary" : ""
                          }`}
                          data-testid={`nav-${item.label.toLowerCase()}`}
                          onClick={() => setMoreOpen(false)}
                        >
                          <item.icon className="w-4 h-4" />
                          {item.label}
                        </button>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden lg:block">
              <LanguageSelector />
            </div>
            <Link href="/fundraise" className="hidden lg:block">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white" data-testid="button-fundraise-header">
                <HandHeart className="w-4 h-4 mr-2" />
                Fundraise
              </Button>
            </Link>
            <Link href="/donate" className="hidden lg:block">
              <Button data-testid="button-donate-header">
                <Heart className="w-4 h-4 mr-2" />
                Donate
              </Button>
            </Link>
            <div className="lg:hidden">
              <LanguageSelector compact />
            </div>
            <span className="lg:hidden text-sm font-semibold text-foreground">NUP Diaspora</span>
            <div className="flex items-center gap-2">
              <img src={peoplePowerLogo} alt="People Power" className="h-8 lg:h-10 w-8 lg:w-10 rounded-full object-cover" />
              <span className="hidden xl:block text-xs font-bold leading-tight text-muted-foreground">Powered by<br /><span className="text-primary">People Power</span></span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
