import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { WorldMap } from "@/components/WorldMap";
import { NewsCard } from "@/components/NewsCard";
import { ConferenceCard } from "@/components/ConferenceCard";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { 
  Globe2, Users, Heart, Calendar, ArrowRight, 
  Newspaper, ShoppingBag, MapPin, ChevronRight,
  Shield, Handshake, Award, UsersRound, Flag
} from "lucide-react";
import type { Region, NewsItem, Conference } from "@shared/schema";

import rallyLeader1 from "@/assets/images/rally-leader_1.jpg";
import rallyLeader2 from "@/assets/images/rally-leader_2.jpg";
import diasporaProtest1 from "@/assets/images/diaspora-protest_1.jpg";
import diasporaProtest2 from "@/assets/images/diaspora-protest_2.jpg";
import crowdCelebration1 from "@/assets/images/crowd-celebration_1.jpg";
import crowdCelebration2 from "@/assets/images/crowd-celebration_2.jpg";

const campaignImages = [
  rallyLeader1,
  diasporaProtest1,
  crowdCelebration1,
  rallyLeader2,
  diasporaProtest2,
  crowdCelebration2,
];

export default function Home() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % campaignImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const { data: regions, isLoading: regionsLoading } = useQuery<Region[]>({
    queryKey: ["/api/regions"],
  });

  const { data: news, isLoading: newsLoading } = useQuery<NewsItem[]>({
    queryKey: ["/api/news"],
  });

  const { data: conferences, isLoading: conferencesLoading } = useQuery<Conference[]>({
    queryKey: ["/api/conferences"],
  });

  const upcomingConference = conferences?.find(c => c.isUpcoming);

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden py-20 lg:py-32">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentImageIndex}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
          >
            <img
              src={campaignImages[currentImageIndex]}
              alt="NUP Campaign"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80" />
          </motion.div>
        </AnimatePresence>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge className="mb-4 bg-primary/90 text-white border-primary">
                People Power Movement
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-white drop-shadow-lg">
                National Unity Platform
                <span className="block text-primary drop-shadow-lg">Diaspora</span>
              </h1>
              <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto drop-shadow">
                Shaping our future together. Join Ugandans worldwide in building a better Uganda founded on justice, equality, and opportunity for all.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link href="/membership">
                  <Button size="lg" data-testid="button-join-movement">
                    <Users className="w-5 h-5 mr-2" />
                    Join the Movement
                  </Button>
                </Link>
                <Link href="/donate">
                  <Button size="lg" variant="outline" className="bg-white/10 border-white text-white hover:bg-white/20" data-testid="button-donate-hero">
                    <Heart className="w-5 h-5 mr-2" />
                    Support the Cause
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>

          <div className="flex justify-center mt-8 gap-2">
            {campaignImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentImageIndex 
                    ? "bg-primary w-8" 
                    : "bg-white/50 hover:bg-white/70"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Globe2, label: "Global Regions", value: regions?.length || "6+" },
              { icon: Users, label: "Active Members", value: "10,000+" },
              { icon: MapPin, label: "Chapters", value: "50+" },
              { icon: Calendar, label: "Conventions", value: "Annual" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="text-center p-4">
                  <stat.icon className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">What We Stand For</Badge>
            <h2 className="text-3xl font-bold mb-4">Our Core Values</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              The pillars that guide the National Unity Platform in our pursuit of a democratic and prosperous Uganda
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {[
              { icon: Shield, value: "Discipline", description: "Commitment to order and self-control in our actions" },
              { icon: Handshake, value: "Reliability", description: "Being dependable and trustworthy in all we do" },
              { icon: Award, value: "Integrity", description: "Upholding honesty and strong moral principles" },
              { icon: UsersRound, value: "Inclusiveness", description: "Embracing all Ugandans regardless of background" },
              { icon: Flag, value: "Patriotism", description: "Deep love and devotion to our motherland Uganda" },
            ].map((item, i) => (
              <motion.div
                key={item.value}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="text-center p-6 h-full hover-elevate">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                    <item.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{item.value}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Our Global Presence</h2>
              <p className="text-muted-foreground">Click on any region to explore local chapters</p>
            </div>
            <Link href="/regions">
              <Button variant="outline" data-testid="button-view-all-regions">
                View All Regions
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
          
          {regionsLoading ? (
            <Skeleton className="w-full aspect-[2/1] rounded-lg" />
          ) : (
            <WorldMap regions={regions || []} />
          )}
        </div>
      </section>

      {upcomingConference && (
        <section className="py-16 bg-gradient-to-r from-primary/10 to-primary/5">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <Badge className="mb-4">Upcoming Event</Badge>
                <h2 className="text-3xl font-bold mb-4">{upcomingConference.title}</h2>
                {upcomingConference.theme && (
                  <p className="text-lg text-muted-foreground italic mb-4">"{upcomingConference.theme}"</p>
                )}
                <div className="space-y-2 mb-6">
                  <p className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    {upcomingConference.city}, {upcomingConference.country}
                  </p>
                  <p className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    {upcomingConference.year}
                  </p>
                </div>
                <div className="flex gap-3">
                  <Link href={`/conferences/${upcomingConference.slug}`}>
                    <Button data-testid="button-conference-details">
                      Learn More
                    </Button>
                  </Link>
                  {upcomingConference.registrationUrl && (
                    <Button variant="outline" asChild>
                      <a href={upcomingConference.registrationUrl} target="_blank" rel="noopener noreferrer">
                        Register Now
                      </a>
                    </Button>
                  )}
                </div>
              </div>
              <div className="hidden md:block">
                {upcomingConference.imageUrl ? (
                  <img 
                    src={upcomingConference.imageUrl} 
                    alt={upcomingConference.title}
                    className="rounded-lg shadow-lg"
                  />
                ) : (
                  <div className="aspect-video bg-card rounded-lg flex items-center justify-center border">
                    <Calendar className="w-24 h-24 text-primary/30" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2 flex items-center gap-2">
                <Newspaper className="w-8 h-8 text-primary" />
                Latest News from Uganda
              </h2>
              <p className="text-muted-foreground">Stay updated with NUP and Bobi Wine news</p>
            </div>
            <Link href="/news">
              <Button variant="outline" data-testid="button-view-all-news">
                View All News
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
          
          {newsLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-80 rounded-lg" />
              ))}
            </div>
          ) : news && news.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {news.slice(0, 6).map(item => (
                <NewsCard key={item.id} news={item} />
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <Newspaper className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No news available at the moment</p>
            </Card>
          )}
        </div>
      </section>

      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Get Involved</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Users,
                title: "Become a Member",
                description: "Join thousands of Ugandans worldwide in the fight for democracy and freedom.",
                href: "/membership",
                action: "Register Now",
              },
              {
                icon: Heart,
                title: "Make a Donation",
                description: "Support our initiatives and help fund the movement for change in Uganda.",
                href: "/donate",
                action: "Donate Today",
              },
              {
                icon: ShoppingBag,
                title: "Shop Merchandise",
                description: "Show your support with official NUP merchandise and party apparel.",
                href: "/store",
                action: "Visit Store",
              },
            ].map((item) => (
              <Card key={item.title} className="p-6 hover-elevate">
                <item.icon className="w-12 h-12 text-primary mb-4" />
                <h3 className="font-bold text-xl mb-2">{item.title}</h3>
                <p className="text-muted-foreground mb-4">{item.description}</p>
                <Link href={item.href}>
                  <Button variant="outline" className="w-full" data-testid={`button-${item.title.toLowerCase().replace(/\s+/g, '-')}`}>
                    {item.action}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Vote for a Free Uganda</h2>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            We are mobilizing for a peaceful transition after over 40 years of oppression. 
            Your support is not just a donation, it's a declaration for democracy, justice, and a better tomorrow.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/donate">
              <Button size="lg" variant="secondary" data-testid="button-support-movement">
                Support the Movement
              </Button>
            </Link>
            <Link href="/membership">
              <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10" data-testid="button-become-member">
                Become a Member
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
