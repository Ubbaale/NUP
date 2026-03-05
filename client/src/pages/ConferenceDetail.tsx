import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft, Calendar, MapPin, ExternalLink, Users, Clock,
  Hotel, Ship, DollarSign, Plane, Phone, Mail, Trophy,
  Flag, Music, BookOpen, Heart, Star, CheckCircle
} from "lucide-react";
import { format } from "date-fns";
import type { Conference } from "@shared/schema";
import laBrightDayImg from "@assets/la-bright-day.png";
import laOceanImg from "@assets/la-ocean.png";
import laStreetsImg from "@assets/la-streets.png";
import laSkylineDayImg from "@assets/la-skyline-day.png";
import laPierDayImg from "@assets/la-pier-day.png";
import hiltonExteriorImg from "@assets/hilton-la-exterior.png";
import hiltonLobbyImg from "@assets/hilton-la-lobby.png";
import cityCruiseBoatImg from "@assets/city-cruise-boat.png";
import cityCruiseInteriorImg from "@assets/city-cruise-interior.png";

const HERO_SLIDES = [
  { src: laSkylineDayImg, alt: "Los Angeles skyline on a bright sunny day" },
  { src: laOceanImg, alt: "Beautiful Pacific Ocean beach in California" },
  { src: hiltonExteriorImg, alt: "Hilton Los Angeles Airport Hotel exterior" },
  { src: laStreetsImg, alt: "Beverly Hills boulevard with luxury buildings" },
  { src: hiltonLobbyImg, alt: "Hilton Los Angeles Airport Hotel elegant lobby" },
  { src: laBrightDayImg, alt: "Sunny Los Angeles boulevard with palm trees" },
  { src: laPierDayImg, alt: "Santa Monica pier on a beautiful day" },
];

const SCHEDULE_DATA = [
  {
    day: "Thursday, August 13th",
    title: "Arrival & Leadership",
    events: [
      { time: "8:00 AM – 2:00 PM", title: "Arrival of Delegates", desc: "Offsite meetings for Ugandan delegates" },
      { time: "12:00 PM – 1:00 PM", title: "Convention Leadership Meetings", desc: "NUP Leadership and Convention organizing committee meeting" },
      { time: "2:00 PM – 6:00 PM", title: "Empowering Leadership Training", desc: "Leadership training session" },
      { time: "7:00 PM – 11:00 PM", title: "Patriot's Day Cup", desc: "Soccer game between Chicago Cranes and NUP Diaspora, followed by Picnic/BBQ", icon: Trophy },
    ],
  },
  {
    day: "Friday, August 14th",
    title: "Engaging the World for Democracy",
    events: [
      { time: "8:00 AM – 11:00 PM", title: "Delegate Registration", desc: "Registration Desk, 2nd floor" },
      { time: "8:00 AM – 12:00 PM", title: "March for Democracy", desc: "Rally for Democracy Demonstration/Protest", icon: Flag },
      { time: "10:00 AM – 12:00 PM", title: "United Forces for Change", desc: "Leaders Meeting" },
      { time: "12:30 PM – 1:30 PM", title: "Muslim Prayer Session", desc: "" },
      { time: "1:30 PM – 6:00 PM", title: "Opening Ceremony", desc: "Envisioning A New Uganda — Presentation of Papers", icon: BookOpen },
      { time: "7:00 PM – 10:30 PM", title: "Celebrating Women's Excellence", desc: "Celebrating Women's Excellence and Achievements", icon: Heart },
      { time: "10:30 PM – 1:00 AM", title: "Meet and Greet Cocktail", desc: "Fostering Connections" },
    ],
  },
  {
    day: "Saturday, August 15th",
    title: "Building Bridges for Progress",
    events: [
      { time: "8:00 AM – 5:00 PM", title: "Delegate Registration", desc: "" },
      { time: "8:30 AM – 9:30 AM", title: "General Session", desc: "Welcome remarks and Introduction of the Theme" },
      { time: "9:30 AM – 12:00 PM", title: "Distinguished Speakers", desc: "Presentation by Panelists", icon: Star },
      { time: "10:00 AM – 12:00 PM", title: "Youth Session", desc: "Empowering the Youth" },
      { time: "1:00 PM – 3:30 PM", title: "Ugandan Delegates", desc: "Our Collective Vision — Presentation by Ugandan Delegates" },
      { time: "4:00 PM", title: "Departure for Boat Cruise", desc: "Buses depart from the Hotel", icon: Ship },
      { time: "7:00 PM – 11:00 PM", title: "Boat Cruise", desc: "Heroes Celebration on Waters — Dinner and Entertainment", icon: Music },
    ],
  },
  {
    day: "Sunday, August 16th",
    title: "Solidarity & Celebration",
    events: [
      { time: "8:00 AM", title: "Patriots Day 2K Run", desc: "Supporting the Victims", icon: Trophy },
      { time: "10:00 AM – 12:00 PM", title: "Interdenominational Prayer", desc: "Prayers for the Victims and Patriots" },
      { time: "1:00 PM – 3:00 PM", title: "Annual General Meeting", desc: "Solidifying Our Path" },
      { time: "4:00 PM – 2:00 AM", title: "Closing Ceremony & Banquet", desc: "Culminating the Convention", icon: Star },
    ],
  },
];

const SPEAKERS = [
  { name: "President Robert Ssentamu Kyagulanyi", role: "Keynote Speaker", desc: "Leader of the People Power Movement and President of NUP" },
  { name: "Danny K Davis", role: "Distinguished Guest Speaker", desc: "U.S. Congressman and human rights advocate" },
  { name: "Professor David Ssejinja", role: "Guest Speaker", desc: "Expert in international politics and African education" },
  { name: "Professor James Powell", role: "Guest Speaker", desc: "Adjunct Professor and humanitarian advocate" },
  { name: "Professor Tim Szczepanski", role: "Guest Speaker", desc: "Director of Student Engagement, CSU Northridge" },
  { name: "Katie Lowe", role: "Guest Speaker", desc: "CFO, American Leaders Class — human rights activist" },
];

function CountdownTimer({ targetDate }: { targetDate: Date }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculate = () => {
      const now = new Date().getTime();
      const target = targetDate.getTime();
      const diff = target - now;
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    };
    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const units = [
    { label: "Days", value: timeLeft.days },
    { label: "Hours", value: timeLeft.hours },
    { label: "Minutes", value: timeLeft.minutes },
    { label: "Seconds", value: timeLeft.seconds },
  ];

  return (
    <div className="flex items-center justify-center gap-3 sm:gap-5" data-testid="countdown-timer">
      {units.map((unit) => (
        <div key={unit.label} className="text-center">
          <div className="bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mb-1">
            <span className="text-2xl sm:text-4xl font-bold text-white tabular-nums">
              {String(unit.value).padStart(2, "0")}
            </span>
          </div>
          <span className="text-[10px] sm:text-xs text-white/70 uppercase tracking-wider font-medium">{unit.label}</span>
        </div>
      ))}
    </div>
  );
}

function Convention2026Page({ conference }: { conference: Conference }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
  }, []);

  return (
    <div className="min-h-screen">
      <div className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          {HERO_SLIDES.map((slide, i) => (
            <img
              key={i}
              src={slide.src}
              alt={slide.alt}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[2000ms] ease-in-out ${
                i === currentSlide ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <Link href="/conferences">
            <Button variant="ghost" className="mb-6 text-white/80 hover:text-white hover:bg-white/10 absolute left-4 top-0" data-testid="button-back-to-conferences">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
          </Link>
          <h2 className="text-xl md:text-2xl font-medium text-white/90 mb-3 tracking-wide" data-testid="text-conference-theme">
            Building a New Uganda Together &nbsp; Los Angeles 2026
          </h2>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-white drop-shadow-lg" data-testid="text-conference-title">
            August 13th-17th
          </h1>

          <div className="mb-8">
            <CountdownTimer targetDate={new Date("2026-08-13T00:00:00")} />
          </div>

          <div className="flex items-center justify-center gap-2 mb-8" data-testid="slide-indicators">
            {HERO_SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => goToSlide(i)}
                className={`h-2.5 rounded-full transition-all duration-500 ${
                  i === currentSlide
                    ? "bg-white w-8"
                    : "bg-white/40 w-2.5 hover:bg-white/60"
                }`}
                aria-label={`Go to slide ${i + 1}`}
                data-testid={`slide-dot-${i}`}
              />
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="bg-white text-red-900 hover:bg-white/90 font-bold text-lg px-8 shadow-xl" asChild data-testid="button-register-convention">
              <a href="https://buy.stripe.com/fZucN60BC3SKcLR9eYaR20j" target="_blank" rel="noopener noreferrer">
                Pay for Convention
                <ExternalLink className="w-5 h-5 ml-2" />
              </a>
            </Button>
            <Button size="lg" variant="outline" className="border-white/50 text-white hover:bg-white/10 font-bold text-lg px-8" asChild data-testid="button-reserve-hotel">
              <a href="https://book.passkey.com/go/NUPD2026" target="_blank" rel="noopener noreferrer">
                <Hotel className="w-5 h-5 mr-2" />
                Reserve a Hotel
              </a>
            </Button>
            <Button size="lg" variant="outline" className="border-white/50 text-white hover:bg-white/10 font-bold text-lg px-8" asChild data-testid="button-boat-cruise">
              <a href="https://buy.stripe.com/9AQ4k10e1cW96Ri14e" target="_blank" rel="noopener noreferrer">
                <Ship className="w-5 h-5 mr-2" />
                Pay for Boat Cruise
              </a>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          <div className="lg:col-span-2">
            <h2 className="text-3xl font-bold mb-4">A Call to Unity and Purpose</h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-6">
              The National Unity Platform (NUP) invites Ugandans in the Diaspora and friends of Uganda to the NUP Diaspora Convention 2026, taking place in Los Angeles, California. This historic gathering comes at a defining moment as Uganda approaches a pivotal national election.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              The convention will bring together visionary leaders, activists, and partners from across the globe to reflect, strategize, and strengthen our shared mission to build a New Uganda founded on democracy, justice, and good governance.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              California, home to innovation, diversity, and global influence provides the ideal setting for this year's convention. Los Angeles, a crossroads of cultures and ideas, reflects the resilience and creativity of the Ugandan Diaspora, making it the perfect backdrop for a global dialogue on freedom, leadership, and transformation.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              The Ugandan Diaspora continues to play a vital role in shaping Uganda's future through education, healthcare, business, and community initiatives. Our unity and advocacy remain central to the peaceful transition toward a new generation of leadership under Robert Ssentamu Kyagulanyi (Bobi Wine) and the National Unity Platform.
            </p>
          </div>

          <div className="space-y-4">
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-primary" />
                  Registration Fees
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Early Bird</span>
                    <Badge variant="default" className="text-lg px-3">$280</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Partial Payment</span>
                    <Badge variant="outline" className="text-lg px-3">2 × $150</Badge>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Boat Cruise</span>
                    <Badge variant="secondary" className="text-lg px-3">$220</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Registration fees are non-refundable. Swaps accommodated if pre-approved.
                  </p>
                </div>
                <div className="mt-4 space-y-2">
                  <Button className="w-full" size="sm" asChild>
                    <a href="https://buy.stripe.com/fZucN60BC3SKcLR9eYaR20j" target="_blank" rel="noopener noreferrer">
                      Pay Full Registration <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </Button>
                  <Button className="w-full" variant="outline" size="sm" asChild>
                    <a href="https://buy.stripe.com/bIYaIp1i59JX7Vm6ov" target="_blank" rel="noopener noreferrer">
                      Pay in 2 Installments <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Venue
                </h3>
                <p className="font-medium">Hilton Los Angeles Airport Hotel</p>
                <p className="text-sm text-muted-foreground mt-1">5711 West Century Boulevard</p>
                <p className="text-sm text-muted-foreground">Los Angeles, CA 90045</p>
                <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                  <Phone className="w-3 h-3" />
                  <span>(310) 410-4000</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-primary" />
                  Contact
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3 h-3 text-muted-foreground" />
                    <a href="mailto:conventions@diasporanup.org" className="text-primary hover:underline">conventions@diasporanup.org</a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3 h-3 text-muted-foreground" />
                    <a href="mailto:info@diasporanup.org" className="text-primary hover:underline">info@diasporanup.org</a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3 h-3 text-muted-foreground" />
                    <span>651 278 6724</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-2 text-center">Featured Speakers</h2>
          <p className="text-center text-muted-foreground mb-8">Voices of Freedom and Justice</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SPEAKERS.map((speaker, i) => (
              <Card key={i} className="text-center" data-testid={`card-speaker-${i}`}>
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg">{speaker.name}</h3>
                  <Badge variant="outline" className="mt-2 mb-3">{speaker.role}</Badge>
                  <p className="text-sm text-muted-foreground">{speaker.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-2 text-center">Hotel & Accommodation</h2>
          <p className="text-center text-muted-foreground mb-8">Special rates negotiated for convention delegates</p>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card className="border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Hotel className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold">Standard King / 2 Doubles</h3>
                    <p className="text-sm text-muted-foreground">Breakfast for one included</p>
                  </div>
                </div>
                <p className="text-4xl font-bold text-primary mb-2">$179<span className="text-lg font-normal text-muted-foreground">/night</span></p>
                <ul className="text-sm text-muted-foreground space-y-1 mb-4">
                  <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-green-500" /> Complimentary WiFi</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-green-500" /> Breakfast for 1 guest</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-green-500" /> NUP group discount rate</li>
                </ul>
                <Button className="w-full" asChild>
                  <a href="https://book.passkey.com/go/NUPD2026" target="_blank" rel="noopener noreferrer">
                    Reserve Room <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                </Button>
              </CardContent>
            </Card>
            <Card className="border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Hotel className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold">Standard King / 2 Doubles</h3>
                    <p className="text-sm text-muted-foreground">Breakfast for two included</p>
                  </div>
                </div>
                <p className="text-4xl font-bold text-primary mb-2">$189<span className="text-lg font-normal text-muted-foreground">/night</span></p>
                <ul className="text-sm text-muted-foreground space-y-1 mb-4">
                  <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-green-500" /> Complimentary WiFi</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-green-500" /> Breakfast for 2 guests</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-green-500" /> NUP group discount rate</li>
                </ul>
                <Button className="w-full" asChild>
                  <a href="https://book.passkey.com/go/NUPD2026" target="_blank" rel="noopener noreferrer">
                    Reserve Room <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
          <p className="text-center text-sm text-muted-foreground mt-4">
            Rooms are limited and available first-come, first-served. If you experience difficulties, call the hotel at <strong>(310) 410-4000</strong>.
          </p>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-2 text-center">Boat Cruise Experience</h2>
          <p className="text-center text-muted-foreground mb-8">An unforgettable evening on the Southern California coastline</p>

          <div className="relative max-w-5xl mx-auto rounded-2xl overflow-hidden shadow-2xl">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
              poster={cityCruiseBoatImg}
            >
              <source src="/videos/ocean-cruise.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-b from-blue-900/40 via-blue-900/60 to-blue-950/90" />

            <div className="relative z-10 p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-4 mb-8">
                <div className="rounded-xl overflow-hidden shadow-lg border border-white/20">
                  <img src={cityCruiseBoatImg} alt="City Cruises luxury yacht on Pacific Ocean" className="w-full h-48 object-cover" loading="lazy" />
                </div>
                <div className="rounded-xl overflow-hidden shadow-lg border border-white/20">
                  <img src={cityCruiseInteriorImg} alt="Elegant dining interior of City Cruises boat" className="w-full h-48 object-cover" loading="lazy" />
                </div>
              </div>

              <div className="text-white">
                <div className="flex items-center gap-4 mb-4">
                  <Ship className="w-12 h-12" />
                  <div>
                    <h3 className="text-2xl md:text-3xl font-bold">Heroes Celebration on Waters</h3>
                    <p className="text-white/80">Saturday, August 15th · 7:00 PM – 11:00 PM</p>
                  </div>
                </div>
                <p className="text-white/90 mb-6 text-lg max-w-2xl">
                  Join fellow Ugandans and friends of Uganda aboard a luxury City Cruises vessel departing from the scenic Marina del Rey. Enjoy breathtaking ocean views, live entertainment, music, dinner, and conversations with NUP leaders and convention guests.
                </p>
                <div className="flex flex-wrap items-center gap-4">
                  <Badge className="bg-white/20 text-white border-white/30 text-xl px-5 py-2">$220</Badge>
                  <Button size="lg" className="bg-white text-blue-900 hover:bg-white/90 font-bold" asChild>
                    <a href="https://buy.stripe.com/9AQ4k10e1cW96Ri14e" target="_blank" rel="noopener noreferrer">
                      Buy Boat Cruise Ticket <ExternalLink className="w-4 h-4 ml-2" />
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-2 text-center">Event Schedule</h2>
          <p className="text-center text-muted-foreground mb-8">Four days of leadership, advocacy, and celebration</p>
          <Tabs defaultValue="day-0" className="max-w-4xl mx-auto">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              {SCHEDULE_DATA.map((day, i) => (
                <TabsTrigger key={i} value={`day-${i}`} className="text-xs sm:text-sm" data-testid={`tab-day-${i}`}>
                  {day.day.split(",")[0]}
                </TabsTrigger>
              ))}
            </TabsList>
            {SCHEDULE_DATA.map((day, i) => (
              <TabsContent key={i} value={`day-${i}`}>
                <Card>
                  <CardHeader>
                    <h3 className="text-xl font-bold">{day.day}</h3>
                    <p className="text-muted-foreground">{day.title}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {day.events.map((event, j) => {
                        const IconComponent = event.icon;
                        return (
                          <div key={j} className="flex gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors" data-testid={`event-${i}-${j}`}>
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              {IconComponent ? <IconComponent className="w-5 h-5 text-primary" /> : <Clock className="w-5 h-5 text-primary" />}
                            </div>
                            <div className="flex-1">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                                <span className="text-sm font-mono text-muted-foreground whitespace-nowrap">{event.time}</span>
                                <h4 className="font-semibold">{event.title}</h4>
                              </div>
                              {event.desc && <p className="text-sm text-muted-foreground mt-1">{event.desc}</p>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-2 text-center">International Delegates</h2>
          <p className="text-center text-muted-foreground mb-8">Information for delegates traveling from Uganda and beyond</p>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Plane className="w-6 h-6 text-primary" />
                  <h3 className="font-bold">Travel Information</h3>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" /> Closest Airport: Los Angeles International Airport (LAX)</li>
                  <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" /> Complimentary airport shuttle every 30 minutes</li>
                  <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" /> Register early for visa application processing</li>
                  <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" /> Take registration acknowledgment to visa appointment</li>
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <DollarSign className="w-6 h-6 text-primary" />
                  <h3 className="font-bold">Alternative Payment</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  For international delegates unable to pay online, use Western Union or MoneyGram:
                </p>
                <div className="bg-muted/50 rounded-lg p-4 text-sm space-y-1">
                  <p className="font-medium">Elvis Balikalaba</p>
                  <p className="text-muted-foreground">656 Weaver Blvd, Anoka, MN 55303</p>
                  <p className="text-muted-foreground">Tel: +1 651 208 3354</p>
                  <p className="text-muted-foreground">elvis100b@gmail.com</p>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Email <a href="mailto:conventions@diasporanup.org" className="text-primary hover:underline">conventions@diasporanup.org</a> after payment for your invitation letter.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="text-center py-12 bg-gradient-to-br from-red-900 via-red-800 to-red-950 text-white rounded-2xl px-8">
          <h2 className="text-3xl font-bold mb-4">Join Us in Los Angeles</h2>
          <p className="text-white/80 max-w-2xl mx-auto mb-8 text-lg">
            Be part of this historic gathering. Register today and help build a New Uganda together.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="bg-white text-red-900 hover:bg-white/90 font-bold text-lg px-8" asChild>
              <a href="https://buy.stripe.com/fZucN60BC3SKcLR9eYaR20j" target="_blank" rel="noopener noreferrer">
                Register Now <ExternalLink className="w-5 h-5 ml-2" />
              </a>
            </Button>
            <Button size="lg" variant="outline" className="border-white/50 text-white hover:bg-white/10 font-bold text-lg px-8" asChild>
              <a href="https://book.passkey.com/go/NUPD2026" target="_blank" rel="noopener noreferrer">
                <Hotel className="w-5 h-5 mr-2" /> Book Hotel
              </a>
            </Button>
          </div>
          <p className="text-white/60 text-sm mt-6">
            Convention Chairman: Joseph William Ssenkumba
          </p>
        </section>
      </div>
    </div>
  );
}

export default function ConferenceDetail() {
  const { slug } = useParams<{ slug: string }>();

  const { data: conference, isLoading } = useQuery<Conference>({
    queryKey: ["/api/conferences", slug],
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-32 mb-8" />
        <Skeleton className="h-64 rounded-lg mb-8" />
        <Skeleton className="h-96 rounded-lg" />
      </div>
    );
  }

  if (!conference) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h1 className="text-2xl font-bold mb-2">Conference Not Found</h1>
        <p className="text-muted-foreground mb-4">The conference you're looking for doesn't exist.</p>
        <Link href="/conferences">
          <Button>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Conferences
          </Button>
        </Link>
      </div>
    );
  }

  if (conference.slug === "convention-2026") {
    return <Convention2026Page conference={conference} />;
  }

  const speakers = conference.speakers ? JSON.parse(conference.speakers) : [];

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <Link href="/conferences">
          <Button variant="ghost" className="mb-6" data-testid="button-back-to-conferences">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Conferences
          </Button>
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {conference.imageUrl && (
              <div className="aspect-video rounded-lg overflow-hidden mb-8">
                <img
                  src={conference.imageUrl}
                  alt={conference.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Badge variant={conference.isUpcoming ? "default" : "secondary"}>
                  {conference.isUpcoming ? "Upcoming" : "Past Event"}
                </Badge>
                <Badge variant="outline">{conference.year}</Badge>
              </div>
              <h1 className="text-4xl font-bold mb-4">{conference.title}</h1>
              {conference.theme && (
                <p className="text-xl text-muted-foreground italic">"{conference.theme}"</p>
              )}
            </div>

            {conference.description && (
              <Card className="mb-8">
                <CardHeader>
                  <h2 className="font-semibold">About This Conference</h2>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-wrap">{conference.description}</p>
                </CardContent>
              </Card>
            )}

            {speakers.length > 0 && (
              <Card>
                <CardHeader>
                  <h2 className="font-semibold flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Event Speakers
                  </h2>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {speakers.map((speaker: string, index: number) => (
                      <div key={index} className="text-center p-4 bg-muted/50 rounded-md">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                          <Users className="w-6 h-6 text-primary" />
                        </div>
                        <p className="font-medium text-sm">{speaker}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <h3 className="font-semibold">Event Details</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-muted-foreground">{conference.location}</p>
                    <p className="text-muted-foreground">{conference.city}, {conference.country}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Dates</p>
                    <p className="text-muted-foreground">
                      {conference.startDate && format(new Date(conference.startDate), "MMMM d")} - {conference.endDate && format(new Date(conference.endDate), "MMMM d, yyyy")}
                    </p>
                  </div>
                </div>

                {conference.isUpcoming && conference.registrationUrl && (
                  <Button className="w-full" asChild data-testid="button-register">
                    <a href={conference.registrationUrl} target="_blank" rel="noopener noreferrer">
                      Register Now
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </a>
                  </Button>
                )}

                {!conference.isUpcoming && (
                  <div className="p-4 bg-muted/50 rounded-md text-center">
                    <Clock className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">This event has concluded</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
