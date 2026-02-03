import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Phone, MapPin, Facebook, Youtube } from "lucide-react";
import { SiX } from "react-icons/si";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import nupLogo from "@/assets/images/nup-official-logo.png";

export function Footer() {
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  const subscribeMutation = useMutation({
    mutationFn: async (email: string) => {
      return apiRequest("POST", "/api/subscriptions", { email });
    },
    onSuccess: () => {
      toast({ title: "Subscribed!", description: "Thank you for subscribing to our newsletter." });
      setEmail("");
    },
    onError: () => {
      toast({ title: "Error", description: "Could not subscribe. Please try again.", variant: "destructive" });
    },
  });

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      subscribeMutation.mutate(email);
    }
  };

  return (
    <footer className="bg-card border-t mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src={nupLogo} alt="NUP Logo" className="w-14 h-14 object-contain" />
              <div>
                <span className="font-bold text-lg block text-primary">People Power Uganda</span>
                <span className="text-muted-foreground text-sm">NUP Diaspora</span>
              </div>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Shaping our future together. We invite all Ugandans who share our vision to join us in building a better Uganda.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <nav className="flex flex-col gap-2">
              <Link href="/regions" className="text-muted-foreground hover:text-foreground text-sm transition-colors">Global Regions</Link>
              <Link href="/conferences" className="text-muted-foreground hover:text-foreground text-sm transition-colors">Conferences</Link>
              <Link href="/membership" className="text-muted-foreground hover:text-foreground text-sm transition-colors">Become a Member</Link>
              <Link href="/store" className="text-muted-foreground hover:text-foreground text-sm transition-colors">Party Store</Link>
              <Link href="/donate" className="text-muted-foreground hover:text-foreground text-sm transition-colors">Donate</Link>
            </nav>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <div className="space-y-3 text-sm">
              <a href="mailto:info@diasporanup.org" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <Mail className="w-4 h-4" />
                info@diasporanup.org
              </a>
              <a href="tel:+16512786724" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <Phone className="w-4 h-4" />
                +1 (651) 278-6724
              </a>
              <div className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4 mt-0.5" />
                <span>Worldwide Chapters</span>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <Button size="icon" variant="ghost" asChild>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" data-testid="link-facebook">
                  <Facebook className="w-4 h-4" />
                </a>
              </Button>
              <Button size="icon" variant="ghost" asChild>
                <a href="https://x.com" target="_blank" rel="noopener noreferrer" data-testid="link-twitter">
                  <SiX className="w-4 h-4" />
                </a>
              </Button>
              <Button size="icon" variant="ghost" asChild>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" data-testid="link-youtube">
                  <Youtube className="w-4 h-4" />
                </a>
              </Button>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Newsletter</h4>
            <p className="text-muted-foreground text-sm mb-3">
              Stay updated with the latest news from NUP Diaspora.
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                data-testid="input-newsletter-email"
              />
              <Button type="submit" disabled={subscribeMutation.isPending} data-testid="button-subscribe">
                {subscribeMutation.isPending ? "Subscribing..." : "Subscribe"}
              </Button>
            </form>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-muted-foreground text-sm">
          <p>&copy; {new Date().getFullYear()} National Unity Platform Diaspora Inc. All rights reserved.</p>
        </div>
      </div>
      <div className="flex h-2">
        <div className="flex-1 bg-black"></div>
        <div className="flex-1 bg-yellow-500"></div>
        <div className="flex-1 bg-red-600"></div>
        <div className="flex-1 bg-blue-900"></div>
      </div>
    </footer>
  );
}
