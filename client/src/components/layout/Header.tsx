import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Heart, ShoppingBag, Users, Globe2, Calendar, Newspaper, BookOpen } from "lucide-react";
import { useState } from "react";
import nupLogo from "@/assets/images/nup-official-logo.png";

const navItems = [
  { href: "/", label: "Home", icon: Globe2 },
  { href: "/regions", label: "Regions", icon: Globe2 },
  { href: "/conferences", label: "Conferences", icon: Calendar },
  { href: "/news", label: "News", icon: Newspaper },
  { href: "/blog", label: "Blog", icon: BookOpen },
  { href: "/store", label: "Store", icon: ShoppingBag },
  { href: "/membership", label: "Membership", icon: Users },
  { href: "/donate", label: "Donate", icon: Heart },
];

export function Header() {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center">
            <img src={nupLogo} alt="National Unity Platform" className="h-10 sm:h-12 object-contain" />
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
            <Link href="/donate" className="hidden sm:block">
              <Button data-testid="button-donate-header">
                <Heart className="w-4 h-4 mr-2" />
                Donate
              </Button>
            </Link>
            
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button size="icon" variant="ghost" data-testid="button-mobile-menu">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <nav className="flex flex-col gap-2 mt-8">
                  {navItems.map((item) => (
                    <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}>
                      <Button
                        variant={location === item.href ? "secondary" : "ghost"}
                        className="w-full justify-start"
                        data-testid={`mobile-nav-${item.label.toLowerCase()}`}
                      >
                        <item.icon className="w-4 h-4 mr-3" />
                        {item.label}
                      </Button>
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
