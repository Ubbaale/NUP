import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { WorldMap } from "@/components/WorldMap";
import { SEO } from "@/components/SEO";

import { ConferenceCard } from "@/components/ConferenceCard";
import { ConventionFlyer } from "@/components/ConventionFlyer";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { 
  Globe2, Users, Heart, Calendar, ArrowRight, 
  MapPin, ChevronRight,
  Shield, Handshake, Award, UsersRound, Flag,
  Ship, Hotel, ExternalLink, Clock, FileText, Download
} from "lucide-react";
import type { Region, Conference } from "@shared/schema";

import nupEventPhotoImg from "@assets/nup-event-photo.jpg";
import laSkylineDayImg from "@assets/la-skyline-day.png";
import bobiCrowd1 from "@assets/481158321_1250421886443613_5486285688228274535_n_1771985183074.jpg";
import bobiSpeech from "@assets/481960678_1247756343376834_40067085171628253_n_1771985183075.jpg";
import bobiCrowd2 from "@assets/482020332_1247763793376089_5532648801704771009_n_1771985183075.jpg";
import bobiRally from "@assets/482270132_1250411063111362_8964145687773853448_n_1771985183076.jpg";
import bobiKabale from "@assets/Bobi-Wine-in-Kabale_1771985183076.jpeg";
import bobiProtest from "@assets/bobi-wine-leads-protest-_1771985183077.jpg";
import nupCanadaEngagement from "@assets/nup-canada-engagement.jpg";
import nupCanadaOutreach from "@assets/nup-canada-outreach.jpg";
import nupDiasporaProtest from "@assets/de951d73-ea0a-473a-9750-b0aefabdf65c_1775495129553.jpg";
import nupCapitolRally from "@assets/4195b9ae-144a-4562-bcb9-1b18fd127e6d_1775495145185.jpg";
import nupLeadershipTeam from "@assets/dd6652e3-bcef-4321-a16e-e66da4db3eb5_1775495155056.jpg";
import nupConventionLadies from "@assets/5599b2f0-53a7-4cd8-9c87-bf178c61f03c_1775495171624.jpg";
import nupFreedomRally from "@assets/17c1311e-5b39-4a5c-875b-ba79ac933d57_1775495183701.jpg";
import nupAboutUsGroup from "@assets/nup-about-us-group.webp";
import nupInitiatives from "@assets/nup-initiatives.jpg";
import nupExecutiveTeam from "@assets/Executive-Team-Members-1024x683_1773023680694.jpg";
import nupGetInvolved from "@assets/nup-get-involved.jpg";
import bobiWinePresidentImg from "@assets/bobi-wine-los-angeles-premiere-national-geographic-440nw-14022_1773964190237.png";
import nupHeadquartersBg from "@assets/GDveZy3XoAE5uHY_1773964414475.jpg";

const campaignImages = [
  bobiCrowd1,
  nupCanadaEngagement,
  bobiSpeech,
  nupDiasporaProtest,
  bobiRally,
  nupAboutUsGroup,
  bobiKabale,
  nupExecutiveTeam,
  bobiProtest,
  nupGetInvolved,
  nupCapitolRally,
  nupLeadershipTeam,
  nupConventionLadies,
  nupFreedomRally,
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

  const { data: conferences, isLoading: conferencesLoading } = useQuery<Conference[]>({
    queryKey: ["/api/conferences"],
  });

  const upcomingConference = conferences?.find(c => c.isUpcoming);

  return (
    <div className="min-h-screen relative">
      <ConventionFlyer />
      <SEO
        title="Home"
        description="National Unity Platform (NUP) Diaspora connects Ugandans worldwide for democracy, freedom, and good governance. Join People Power chapters, attend conventions, support campaigns, and stand for a better Uganda."
        keywords="NUP, National Unity Platform, People Power, Bobi Wine, Uganda diaspora, NUP chapters worldwide, Uganda democracy movement, People Power diaspora, free Uganda, Uganda opposition, #ProtestVote26"
      />
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img src={nupHeadquartersBg} alt="" className="w-full h-full object-cover opacity-[0.06]" />
      </div>
      <div className="relative z-10">
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
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50" />
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
                <Link href="/conferences/convention-2026">
                  <Button
                    size="lg"
                    className="bg-red-600 hover:bg-red-700 text-white border-0 font-bold shadow-lg shadow-red-500/50 animate-pulse-glow ring-2 ring-red-400/60"
                    data-testid="button-convention-2026-hero"
                  >
                    <Calendar className="w-5 h-5 mr-2" />
                    LA Convention 2026
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

      <section className="py-16" data-testid="section-introduction">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <Badge variant="outline" className="mb-4">Who We Are</Badge>
              <h2 className="text-3xl font-bold mb-4">National Unity Platform</h2>
              <p className="text-muted-foreground text-lg max-w-3xl mx-auto leading-relaxed">
                The National Unity Platform is a political and social liberation political party duly registered United States under the laws of US Government. We are a progressive, social democratic organisation, guided by the principles of servant leadership, equality, transparency, accountability, freedom, liberty and social justice.
              </p>
            </div>

            <Card className="overflow-hidden">
              <div className="grid md:grid-cols-5 gap-0">
                <div className="md:col-span-2 bg-muted flex items-center justify-center p-6">
                  <img
                    src={bobiWinePresidentImg}
                    alt="President Kyagulanyi Ssentamu Robert (Bobi Wine)"
                    className="max-w-[160px] max-h-[220px] object-contain"
                  />
                </div>
                <div className="md:col-span-3 p-6 md:p-8 flex flex-col justify-center">
                  <Badge className="w-fit mb-3 bg-primary/10 text-primary border-primary/20">The President</Badge>
                  <h3 className="text-xl md:text-2xl font-bold mb-1">Kyagulanyi Ssentamu Robert</h3>
                  <p className="text-sm text-primary font-medium mb-4">Hon. Bobi Wine</p>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Hon. Kyagulanyi Ssentamu Robert, also known by his stage name Bobi Wine, a Ugandan musician, actor, and activist; he's an artist-turned-politician who, by popular acclaim, heads the generational and transformational People Power Movement, which is a resistance pressure group formed in 2018 to unite Ugandans across the globe on issues such as ending human rights abuse, corruption, redefining the rule of law, restoring dignity, and rebuilding lives.
                  </p>
                </div>
              </div>
            </Card>
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

      <section className="py-16 bg-muted/30" data-testid="section-manifesto">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <Badge variant="outline" className="mb-4">2026–2031</Badge>
              <h2 className="text-3xl font-bold mb-4">NUP Manifesto</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our blueprint for building A New Uganda Now — a comprehensive plan addressing democracy, jobs, healthcare, education, and more.
              </p>
            </div>

            <Card className="overflow-hidden">
              <div className="grid md:grid-cols-2 gap-0">
                <div className="bg-primary p-8 md:p-10 flex flex-col justify-center text-primary-foreground">
                  <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-6">
                    <FileText className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">A New Uganda Now!</h3>
                  <p className="text-primary-foreground/80 mb-6 text-sm leading-relaxed">
                    This Manifesto is our solemn contract with the people of Uganda — 11 priority areas covering freedom, anti-corruption, national unity, public services, job creation, agriculture, land rights, governance, diaspora empowerment, climate resilience, and technology.
                  </p>
                  <Button size="lg" variant="secondary" className="w-full sm:w-auto font-bold" asChild>
                    <a href="/api/manifesto/download" download aria-label="Download NUP Manifesto 2026-2031 PDF" data-testid="button-download-manifesto">
                      <Download className="w-5 h-5 mr-2" />
                      Download Manifesto (PDF)
                    </a>
                  </Button>
                </div>
                <div className="p-8 md:p-10 bg-card">
                  <h4 className="font-bold text-lg mb-4">Key Priorities</h4>
                  <ul className="space-y-3 text-sm">
                    {[
                      "Restore Freedom, Constitutionalism & Human Rights",
                      "End Corruption & Wasteful Government Expenditure",
                      "Consolidate National Unity & Rebuild Communities",
                      "Guarantee Quality Public Services for All",
                      "Create 10 Million New Jobs by 2032",
                      "Public School Feeding & Food Security",
                      "Stop Land Grabbing & Secure Land Rights",
                      "Empower Regional & Local Governance",
                      "Position the Diaspora as a Strategic Asset",
                      "Sustainable Natural Resources & Climate Resilience",
                      "Transform Uganda into a Tech-Driven Economy",
                    ].map((priority, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5">
                          {i + 1}
                        </span>
                        <span className="text-muted-foreground">{priority}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
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
        <section className="py-0" data-testid="section-convention">
          <div className="relative overflow-hidden">
            <div className="absolute inset-0">
              <img src={laSkylineDayImg} alt="Los Angeles" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-red-900/90 via-red-900/80 to-red-900/60" />
            </div>
            <div className="container mx-auto px-4 relative z-10 py-16">
              <div className="grid lg:grid-cols-5 gap-8 items-center">
                <div className="lg:col-span-3 text-white">
                  <Badge className="bg-white/20 text-white border-white/30 mb-4 text-sm">
                    Upcoming Convention
                  </Badge>
                  <h2 className="text-3xl md:text-4xl font-bold mb-2" data-testid="text-convention-title">
                    {upcomingConference.title}
                  </h2>
                  <p className="text-xl text-white/80 italic mb-6">
                    "{upcomingConference.theme}"
                  </p>
                  <div className="grid sm:grid-cols-2 gap-4 mb-6">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-white/70 mt-0.5" />
                      <div>
                        <p className="font-semibold">Hilton Los Angeles Airport</p>
                        <p className="text-sm text-white/70">Los Angeles, California</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-white/70 mt-0.5" />
                      <div>
                        <p className="font-semibold">August 13th – 17th, 2026</p>
                        <p className="text-sm text-white/70">4 days of leadership & unity</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Ship className="w-5 h-5 text-white/70 mt-0.5" />
                      <div>
                        <p className="font-semibold">Boat Cruise — $220</p>
                        <p className="text-sm text-white/70">Heroes Celebration on Waters</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Hotel className="w-5 h-5 text-white/70 mt-0.5" />
                      <div>
                        <p className="font-semibold">Hotel from $199/night</p>
                        <p className="text-sm text-white/70">Breakfast included</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Link href={`/conferences/${upcomingConference.slug}`}>
                      <Button size="lg" className="bg-white text-red-900 hover:bg-white/90 font-bold" data-testid="button-conference-details">
                        View Full Details
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                    {upcomingConference.registrationUrl && (
                      <Button size="lg" variant="outline" className="border-white/50 text-white hover:bg-white/10 font-bold" asChild data-testid="button-convention-register">
                        <a href={upcomingConference.registrationUrl} target="_blank" rel="noopener noreferrer">
                          Register — $280
                          <ExternalLink className="w-4 h-4 ml-2" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
                <div className="hidden lg:block lg:col-span-2">
                  <div className="rounded-xl overflow-hidden shadow-2xl border-2 border-white/20">
                    <img
                      src={nupEventPhotoImg}
                      alt="NUP Diaspora community event"
                      className="w-full h-64 object-cover"
                    />
                  </div>
                  <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                    <p className="text-white text-sm text-center">
                      Join Ugandans from across the globe — register early and be part of this historic gathering.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      </div>
    </div>
  );
}
