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
import chairmanPhoto from "@assets/image_1776696949491.png";
import laConventionLogo from "@assets/ImageLA_1776729605630.jpeg";
import type { Conference } from "@shared/schema";
import laBrightDayImg from "@assets/la-bright-day.png";
import laOceanImg from "@assets/la-ocean.png";
import laStreetsImg from "@assets/la-streets.png";
import laSkylineDayImg from "@assets/la-skyline-day.png";
import laPierDayImg from "@assets/la-pier-day.png";
import hiltonExteriorImg from "@assets/hilton-la-exterior.png";
import hiltonLobbyImg from "@assets/hilton-la-lobby.png";
import nupEventPhotoImg from "@assets/nup-event-photo.jpg";
import nupInitiativesImg from "@assets/nup-initiatives.jpg";
import nupGetInvolvedImg from "@assets/nup-get-involved.jpg";
import nupBoatCruise1Img from "@assets/nup-boat-cruise-1.jpg";
import nupBoatCruise2Img from "@assets/nup-boat-cruise-2.jpg";
import bobiWineSpeakerImg from "@assets/bobi-wine-speaker.jpg";
import bobiWineDiasporaImg from "@assets/bobi-wine-speaker-diaspora.jpg";
import joelSsenyonyiImg from "@assets/joel-ssenyonyi-speaker.jpg";
import barbieKyagulanyiImg from "@assets/barbie-kyagulanyi-speaker.jpg";
import davidLewisImg from "@assets/david-lewis-rubongeya.jpg";
import chicagoMarriottImg from "@assets/chicago-marriott-hotel.jpeg";
import chicagoPromontoryImg from "@assets/chicago-promontory-point.jpg";
import chicagoSpiritCruiseImg from "@assets/chicago-spirit-cruise.jpg";
import chicagoGroupImg from "@assets/chicago-convention-group.jpeg";
import chicagoDelegate1Img from "@assets/chicago-convention-delegate1.jpeg";
import chicagoDelegate2Img from "@assets/chicago-convention-delegate2.jpeg";
import bostonMarriottImg from "@assets/boston-marriott-burlington.webp";
import bostonCommitteeImg from "@assets/IMG_0757_1774407291853.jpeg";
import bostonGallery1Img from "@assets/773fc454-f6b7-4927-96c3-9b6dd42a668d_1774407768204.jpeg";
import bostonGallery2Img from "@assets/f68e9197-1c2b-4472-8927-0a7acd548652_1774407768204.jpeg";
import bostonGallery3Img from "@assets/b27f82a2-30c7-4394-9a19-4555f6a293f1_1774407768204.jpeg";
import bostonGallery4Img from "@assets/2b1f77f4-29db-46dd-ac1a-25d817062c16_1774407768204.jpeg";
import bostonGallery5Img from "@assets/IMG_4101_1774407768204.jpeg";
import bostonGallery6Img from "@assets/IMG_4045_1774407768204.jpeg";
import bostonGallery7Img from "@assets/IMG_4022_1774407768204.jpeg";
import bostonGallery8Img from "@assets/IMG_4050_1774407768204.jpeg";
import bostonGallery9Img from "@assets/7b35a902-c9a7-4c59-bb44-ede36f2dd642_1774407768204.jpeg";
import bostonGallery10Img from "@assets/IMG_4305_1774407768204.jpeg";
import chicagoFlyerImg from "@assets/chicago-flyer-poster.jpeg";
import davidSsejinjaImg from "@assets/david-ssejinja-speaker.jpg";
import katieLoweSpeakerImg from "@assets/katie-lowe-speaker.jpg";
import timSzczepanskiImg from "@assets/tim-szczepanski-speaker.jpg";
import dannyKDavisImg from "@assets/danny-k-davis-speaker.jpg";

const HERO_SLIDES = [
  { src: nupEventPhotoImg, alt: "NUP Diaspora community gathering" },
  { src: laSkylineDayImg, alt: "Los Angeles skyline on a bright sunny day" },
  { src: nupInitiativesImg, alt: "NUP Diaspora engagement and initiatives" },
  { src: laOceanImg, alt: "Beautiful Pacific Ocean beach in California" },
  { src: hiltonExteriorImg, alt: "Hilton Los Angeles Airport Hotel exterior" },
  { src: nupGetInvolvedImg, alt: "NUP Diaspora outreach and community" },
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
  { name: "President Robert Ssentamu Kyagulanyi", role: "Keynote Speaker", desc: "Leader of the People Power Movement and President of NUP", photo: bobiWineSpeakerImg },
  { name: "Danny K Davis", role: "Distinguished Guest Speaker", desc: "U.S. Congressman and human rights advocate", photo: null },
  { name: "Professor David Ssejinja", role: "Guest Speaker", desc: "Expert in international politics and African education", photo: null },
  { name: "Professor James Powell", role: "Guest Speaker", desc: "Adjunct Professor and humanitarian advocate", photo: null },
  { name: "Professor Tim Szczepanski", role: "Guest Speaker", desc: "Director of Student Engagement, CSU Northridge", photo: null },
  { name: "Katie Lowe", role: "Guest Speaker", desc: "CFO, American Leaders Class — human rights activist", photo: null },
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

function PastConventions() {
  const { data: conferences } = useQuery<Conference[]>({
    queryKey: ["/api/conferences"],
  });

  const pastConferences = conferences?.filter(c => !c.isUpcoming) || [];

  if (pastConferences.length === 0) return null;

  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold mb-2 text-center">Past Conventions</h2>
      <p className="text-center text-muted-foreground mb-6">A look back at our previous gatherings</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {pastConferences.map((conf) => (
          <Link key={conf.id} href={`/conferences/${conf.slug}`}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full" data-testid={`card-past-convention-${conf.slug}`}>
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg font-bold text-primary">{conf.year}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm leading-tight">{conf.title}</h3>
                    <p className="text-xs text-muted-foreground">{conf.city}, {conf.country}</p>
                  </div>
                </div>
                {conf.theme && (
                  <p className="text-xs text-muted-foreground italic">"{conf.theme}"</p>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}

function parseMetadata(metaStr?: string | null): any {
  if (!metaStr) return {};
  try { return JSON.parse(metaStr); } catch { return {}; }
}

function Convention2026Page({ conference }: { conference: Conference }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const meta = parseMetadata(conference.metadata);
  const scheduleData = meta.schedule || SCHEDULE_DATA;

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
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/40 to-transparent pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/70 via-black/30 to-transparent pointer-events-none" />
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <Link href="/conferences">
            <Button variant="ghost" className="mb-6 text-white/80 hover:text-white hover:bg-white/10 absolute left-4 top-0" data-testid="button-back-to-conferences">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
          </Link>
          <div className="flex justify-center mb-4">
            <img
              src={laConventionLogo}
              alt="NUP Los Angeles 2026 Convention Logo"
              className="w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 rounded-full bg-white/95 p-2 shadow-2xl ring-4 ring-white/40"
              data-testid="img-convention-logo"
            />
          </div>
          <h2 className="text-xl md:text-2xl font-medium text-white mb-3 tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" data-testid="text-conference-theme">
            {conference.theme || "NUP Diaspora Convention"} &nbsp; {conference.city} {conference.year}
          </h2>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-white drop-shadow-lg" data-testid="text-conference-title">
            {conference.startDate && conference.endDate
              ? `${format(new Date(conference.startDate), "MMMM d")}–${format(new Date(conference.endDate), "d")}`
              : conference.title}
          </h1>

          <div className="mb-8">
            <CountdownTimer targetDate={new Date(conference.startDate)} />
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
            {conference.registrationUrl && (
              <Button size="lg" className="bg-white text-red-900 hover:bg-white/90 font-bold text-lg px-8 shadow-xl" asChild data-testid="button-register-convention">
                <a href={conference.registrationUrl} target="_blank" rel="noopener noreferrer">
                  Pay for Convention
                  <ExternalLink className="w-5 h-5 ml-2" />
                </a>
              </Button>
            )}
            {meta.hotelBookingUrl && (
              <Button size="lg" variant="outline" className="border-white/50 text-white hover:bg-white/10 font-bold text-lg px-8" asChild data-testid="button-reserve-hotel">
                <a href={meta.hotelBookingUrl} target="_blank" rel="noopener noreferrer">
                  <Hotel className="w-5 h-5 mr-2" />
                  Reserve a Hotel
                </a>
              </Button>
            )}
            {meta.boatCruiseUrl && (
              <Button size="lg" variant="outline" className="border-white/50 text-white hover:bg-white/10 font-bold text-lg px-8" asChild data-testid="button-boat-cruise">
                <a href={meta.boatCruiseUrl} target="_blank" rel="noopener noreferrer">
                  <Ship className="w-5 h-5 mr-2" />
                  Pay for Boat Cruise
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          <div className="lg:col-span-2">
            <h2 className="text-3xl font-bold mb-4">A Call to Unity and Purpose</h2>
            {conference.description && conference.description.split("\n\n").map((para, i) => (
              <p key={i} className="text-muted-foreground leading-relaxed mb-6">{para}</p>
            ))}
          </div>

          <div className="space-y-4">
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-primary" />
                  Registration Fees
                </h3>
                <div className="space-y-3">
                  {meta.earlyBirdPrice && (
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Full Registration</span>
                      <Badge variant="default" className="text-lg px-3">${meta.earlyBirdPrice}</Badge>
                    </div>
                  )}
                  {meta.installmentPrice && (
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Partial Payment</span>
                      <Badge variant="outline" className="text-lg px-3">2 × ${meta.installmentPrice}</Badge>
                    </div>
                  )}
                  {meta.boatCruisePrice && (
                    <>
                      <Separator />
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Boat Cruise</span>
                        <Badge variant="secondary" className="text-lg px-3">${meta.boatCruisePrice}</Badge>
                      </div>
                    </>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    Registration fees are non-refundable. Swaps accommodated if pre-approved.
                  </p>
                </div>
                <div className="mt-4 space-y-2">
                  {conference.registrationUrl && (
                    <Button className="w-full" size="sm" asChild>
                      <a href={conference.registrationUrl} target="_blank" rel="noopener noreferrer">
                        Pay Full Registration <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    </Button>
                  )}
                  {meta.installmentUrl && (
                    <Button className="w-full" variant="outline" size="sm" asChild>
                      <a href={meta.installmentUrl} target="_blank" rel="noopener noreferrer">
                        Pay in 2 Installments <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Venue
                </h3>
                <p className="font-medium">{meta.hotelName || conference.location}</p>
                {meta.hotelAddress && (
                  <p className="text-sm text-muted-foreground mt-1">{meta.hotelAddress}</p>
                )}
                {meta.hotelPhone && (
                  <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                    <Phone className="w-3 h-3" />
                    <span>{meta.hotelPhone}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-primary" />
                  Contact
                </h3>
                <div className="space-y-2 text-sm">
                  {meta.contactEmail && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3 h-3 text-muted-foreground" />
                      <a href={`mailto:${meta.contactEmail}`} className="text-primary hover:underline">{meta.contactEmail}</a>
                    </div>
                  )}
                  {meta.contactEmail2 && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3 h-3 text-muted-foreground" />
                      <a href={`mailto:${meta.contactEmail2}`} className="text-primary hover:underline">{meta.contactEmail2}</a>
                    </div>
                  )}
                  {meta.contactPhone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3 h-3 text-muted-foreground" />
                      <span>{meta.contactPhone}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {meta.hotelRate1 && (
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-2 text-center">Hotel & Accommodation</h2>
          <p className="text-center text-muted-foreground mb-8">Special rates negotiated for convention delegates</p>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {meta.hotelRate1 && (
            <Card className="border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Hotel className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold">{meta.hotelRate1Desc?.split("—")[0]?.trim() || "Room Option 1"}</h3>
                    {meta.hotelRate1Desc?.includes("—") && (
                      <p className="text-sm text-muted-foreground">{meta.hotelRate1Desc.split("—")[1]?.trim()}</p>
                    )}
                  </div>
                </div>
                <p className="text-4xl font-bold text-primary mb-2">${meta.hotelRate1}<span className="text-lg font-normal text-muted-foreground">/night</span></p>
                <ul className="text-sm text-muted-foreground space-y-1 mb-4">
                  <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-green-500" /> Complimentary WiFi</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-green-500" /> NUP group discount rate</li>
                </ul>
                {meta.hotelBookingUrl && (
                <Button className="w-full" asChild>
                  <a href={meta.hotelBookingUrl} target="_blank" rel="noopener noreferrer">
                    Reserve Room <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                </Button>
                )}
              </CardContent>
            </Card>
            )}
            {meta.hotelRate2 && (
            <Card className="border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Hotel className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold">{meta.hotelRate2Desc?.split("—")[0]?.trim() || "Room Option 2"}</h3>
                    {meta.hotelRate2Desc?.includes("—") && (
                      <p className="text-sm text-muted-foreground">{meta.hotelRate2Desc.split("—")[1]?.trim()}</p>
                    )}
                  </div>
                </div>
                <p className="text-4xl font-bold text-primary mb-2">${meta.hotelRate2}<span className="text-lg font-normal text-muted-foreground">/night</span></p>
                <ul className="text-sm text-muted-foreground space-y-1 mb-4">
                  <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-green-500" /> Complimentary WiFi</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-green-500" /> NUP group discount rate</li>
                </ul>
                {meta.hotelBookingUrl && (
                <Button className="w-full" asChild>
                  <a href={meta.hotelBookingUrl} target="_blank" rel="noopener noreferrer">
                    Reserve Room <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                </Button>
                )}
              </CardContent>
            </Card>
            )}
          </div>
          <p className="text-center text-sm text-muted-foreground mt-4">
            Rooms are limited and available first-come, first-served.{meta.hotelPhone && <> If you experience difficulties, call the hotel at <strong>{meta.hotelPhone}</strong>.</>}
          </p>
        </section>
        )}

        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-2 text-center">Featured Speakers</h2>
          <p className="text-center text-muted-foreground mb-8">Voices of Freedom and Justice</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SPEAKERS.map((speaker, i) => (
              <Card key={i} className="text-center overflow-hidden" data-testid={`card-speaker-${i}`}>
                <CardContent className="p-6">
                  {speaker.photo ? (
                    <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 border-4 border-primary/20 shadow-lg">
                      <img src={speaker.photo} alt={speaker.name} className="w-full h-full object-cover object-top" loading="lazy" />
                    </div>
                  ) : (
                    <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-10 h-10 text-primary" />
                    </div>
                  )}
                  <h3 className="font-bold text-lg">{speaker.name}</h3>
                  <Badge variant="outline" className="mt-2 mb-3">{speaker.role}</Badge>
                  <p className="text-sm text-muted-foreground">{speaker.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
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
              poster={nupBoatCruise1Img}
            >
              <source src="/videos/ocean-cruise.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-b from-blue-900/40 via-blue-900/60 to-blue-950/90" />

            <div className="relative z-10 p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-4 mb-8">
                <div className="rounded-xl overflow-hidden shadow-lg border border-white/20">
                  <img src={nupBoatCruise1Img} alt="City Cruises boat for NUP convention" className="w-full h-48 object-cover" loading="lazy" />
                </div>
                <div className="rounded-xl overflow-hidden shadow-lg border border-white/20">
                  <img src={nupBoatCruise2Img} alt="NUP Diaspora boat cruise experience" className="w-full h-48 object-cover" loading="lazy" />
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
                  <Badge className="bg-white/20 text-white border-white/30 text-xl px-5 py-2">${meta.boatCruisePrice || "220"}</Badge>
                  {meta.boatCruiseUrl && (
                  <Button size="lg" className="bg-white text-blue-900 hover:bg-white/90 font-bold" asChild>
                    <a href={meta.boatCruiseUrl} target="_blank" rel="noopener noreferrer">
                      Buy Boat Cruise Ticket <ExternalLink className="w-4 h-4 ml-2" />
                    </a>
                  </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {scheduleData.length > 0 && (
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-2 text-center">Event Schedule</h2>
          <p className="text-center text-muted-foreground mb-8">{scheduleData.length} days of leadership, advocacy, and celebration</p>
          <Tabs defaultValue="day-0" className="max-w-4xl mx-auto">
            <TabsList className={`grid w-full mb-6`} style={{ gridTemplateColumns: `repeat(${scheduleData.length}, 1fr)` }}>
              {scheduleData.map((day: any, i: number) => (
                <TabsTrigger key={i} value={`day-${i}`} className="text-xs sm:text-sm" data-testid={`tab-day-${i}`}>
                  {day.day.split(",")[0]}
                </TabsTrigger>
              ))}
            </TabsList>
            {scheduleData.map((day: any, i: number) => (
              <TabsContent key={i} value={`day-${i}`}>
                <Card>
                  <CardHeader>
                    <h3 className="text-xl font-bold">{day.day}</h3>
                    <p className="text-muted-foreground">{day.title}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {day.events.map((event: any, j: number) => (
                          <div key={j} className="flex gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors" data-testid={`event-${i}-${j}`}>
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <Clock className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                                <span className="text-sm font-mono text-muted-foreground whitespace-nowrap">{event.time}</span>
                                <h4 className="font-semibold">{event.title}</h4>
                              </div>
                              {event.desc && <p className="text-sm text-muted-foreground mt-1">{event.desc}</p>}
                            </div>
                          </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </section>
        )}

        <section className="mb-16" data-testid="section-chairman-welcome">
          <h2 className="text-3xl font-bold mb-2 text-center">A Message from the Convention Chairman</h2>
          <p className="text-center text-muted-foreground mb-8">Welcome to the NUP Diaspora Convention 2026</p>
          <div className="max-w-4xl mx-auto">
            <Card className="overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-[300px_1fr]">
                <div className="relative">
                  <img
                    src={chairmanPhoto}
                    alt="Joseph William Ssenkumba — Convention Chairman"
                    className="w-full h-full object-cover object-top min-h-[350px]"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <h3 className="text-white font-bold text-lg">Joseph William Ssenkumba</h3>
                    <p className="text-white/80 text-sm">Convention Chairman</p>
                  </div>
                </div>
                <CardContent className="p-6 md:p-8 flex flex-col justify-center">
                  <p className="text-lg italic text-muted-foreground mb-4">"Dear Delegates, Guests, and Friends,"</p>
                  <p className="text-base leading-relaxed mb-4">
                    It is my honor to welcome you to the National Unity Platform (NUP) Diaspora 2026 Convention in Los Angeles. This gathering is a vital step in our shared journey to advocate for freedom, democracy, and the rule of law in Uganda. I encourage you to engage actively in our discussions, celebrate our achievements, and help build the strategies that will advance our mission.
                  </p>
                  <p className="text-base leading-relaxed mb-6">
                    Let this convention inspire and unite us as we work toward a freer, fairer, and more prosperous Uganda.
                  </p>
                  <div className="border-t pt-4">
                    <p className="font-medium text-sm text-muted-foreground">With unity,</p>
                    <p className="font-bold text-lg" style={{ fontFamily: "'Segoe Script', 'Comic Sans MS', cursive" }}>Joseph William Ssenkumba</p>
                    <p className="text-sm text-red-600 dark:text-red-400 font-semibold">Convention Chairman</p>
                  </div>
                </CardContent>
              </div>
            </Card>
          </div>
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
                  <p className="font-medium">{meta.altPaymentName || "Contact organizers"}</p>
                  {meta.altPaymentAddress && <p className="text-muted-foreground">{meta.altPaymentAddress}</p>}
                  {meta.altPaymentPhone && <p className="text-muted-foreground">Tel: {meta.altPaymentPhone}</p>}
                  {meta.altPaymentEmail && <p className="text-muted-foreground">{meta.altPaymentEmail}</p>}
                </div>
                {meta.contactEmail && (
                <p className="text-xs text-muted-foreground mt-3">
                  Email <a href={`mailto:${meta.contactEmail}`} className="text-primary hover:underline">{meta.contactEmail}</a> after payment for your invitation letter.
                </p>
                )}
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="text-center py-12 bg-gradient-to-br from-red-800 via-red-900 to-blue-900 text-white rounded-2xl px-8 mb-16">
          <h2 className="text-3xl font-bold mb-4">Join Us in {conference.city}</h2>
          <p className="text-white/80 max-w-2xl mx-auto mb-8 text-lg">
            Be part of this historic gathering. Register today and help build a New Uganda together.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {conference.registrationUrl && (
            <Button size="lg" className="bg-white text-red-900 hover:bg-white/90 font-bold text-lg px-8" asChild>
              <a href={conference.registrationUrl} target="_blank" rel="noopener noreferrer">
                Register Now <ExternalLink className="w-5 h-5 ml-2" />
              </a>
            </Button>
            )}
            {meta.hotelBookingUrl && (
            <Button size="lg" variant="outline" className="border-white/50 text-white hover:bg-white/10 font-bold text-lg px-8" asChild>
              <a href={meta.hotelBookingUrl} target="_blank" rel="noopener noreferrer">
                <Hotel className="w-5 h-5 mr-2" /> Book Hotel
              </a>
            </Button>
            )}
          </div>
        </section>

        <PastConventions />
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

  if (conference.slug === "convention-2025") {
    return <Boston2025Page conference={conference} />;
  }

  if (conference.slug === "convention-2024") {
    return <Chicago2024Page conference={conference} />;
  }

  return <GenericConferenceDetail conference={conference} />;
}

const BOSTON_SCHEDULE = [
  {
    day: "Thursday, August 7th",
    title: "Arrival & Welcome",
    events: [
      { time: "12:00 PM - 6:00 PM", title: "Delegate Arrival & Check-in", desc: "Boston Marriott Burlington — Welcome packets distributed" },
      { time: "2:00 PM - 5:00 PM", title: "Offsite Leadership Meetings", desc: "NUP Diaspora leadership and convention organizing committee" },
      { time: "7:00 PM - 10:00 PM", title: "Welcome Reception & Mixer", desc: "Networking dinner for early arrivals" },
    ],
  },
  {
    day: "Friday, August 8th",
    title: "Strategy & Mobilization",
    events: [
      { time: "8:00 AM - 11:00 PM", title: "Delegate Registration", desc: "Registration desk, main lobby", icon: CheckCircle },
      { time: "9:00 AM - 12:00 PM", title: "Opening Ceremony", desc: "Welcome remarks, theme presentation: 'Be the Change You Desire'", icon: BookOpen },
      { time: "1:30 PM - 5:00 PM", title: "Strategy Sessions", desc: "Democracy advocacy, human rights strategy, resource mobilization" },
      { time: "7:00 PM - 10:30 PM", title: "Cultural Night", desc: "Celebrating Ugandan heritage and diaspora unity", icon: Music },
    ],
  },
  {
    day: "Saturday, August 9th",
    title: "Women's Empowerment & Speakers",
    events: [
      { time: "8:30 AM - 12:00 PM", title: "Women's Empowerment Workshop", desc: "Led by First Lady Barbie Itungo Kyagulanyi — Menstrual health, cancer awareness, girl child education", icon: Heart },
      { time: "9:30 AM - 12:00 PM", title: "Distinguished Speakers", desc: "Presentations by NUP President Bobi Wine and Hon. Joel Ssenyonyi", icon: Star },
      { time: "1:00 PM - 3:30 PM", title: "Leadership Training", desc: "Building the next generation of democratic leaders" },
      { time: "4:00 PM", title: "Departure for Boat Cruise", desc: "Buses depart from hotel", icon: Ship },
      { time: "7:00 PM - 11:00 PM", title: "Boat Cruise", desc: "Networking and celebration on the water", icon: Ship },
    ],
  },
  {
    day: "Sunday, August 10th",
    title: "Vision & Solidarity",
    events: [
      { time: "9:00 AM - 11:00 AM", title: "Interdenominational Prayer", desc: "Prayers for Uganda and the movement" },
      { time: "11:30 AM - 1:00 PM", title: "Annual General Meeting", desc: "Resolutions, chapter reports, and path forward" },
      { time: "2:00 PM - 4:00 PM", title: "Keynote Address", desc: "President Robert Kyagulanyi Ssentamu — Vision for a liberated Uganda", icon: Star },
      { time: "5:00 PM - 11:00 PM", title: "Closing Banquet & Gala", desc: "Awards, entertainment, and celebration", icon: Trophy },
    ],
  },
  {
    day: "Monday, August 11th",
    title: "Departure",
    events: [
      { time: "Morning", title: "Farewell Breakfast", desc: "Final networking and departure" },
    ],
  },
];

const BOSTON_SPEAKERS = [
  { name: "President Robert Kyagulanyi Ssentamu", role: "NUP President / Keynote Speaker", desc: "Leader of the People Power Movement and President of the National Unity Platform", photo: bobiWineDiasporaImg },
  { name: "Hon. Joel Ssenyonyi", role: "Leader of Opposition", desc: "Member of Parliament for Nakawa West, NUP Spokesperson", photo: joelSsenyonyiImg },
  { name: "First Lady Barbie Itungo Kyagulanyi", role: "Women's Empowerment Speaker", desc: "Founder of Caring Hearts Uganda — champion of menstrual health, cancer awareness, and girl child education", photo: barbieKyagulanyiImg },
  { name: "S.G. David Lewis Rubongeya", role: "Secretary General", desc: "NUP Secretary General and key strategist", photo: davidLewisImg },
  { name: "Moses Mujawa", role: "Convention Chair", desc: "Lead organizer for the Boston 2025 Convention", photo: null },
  { name: "Marvin Bbale", role: "Boston Chapter Leader", desc: "Host chapter leader for the convention", photo: null },
  { name: "Dr. Daniel Kawuma", role: "Diaspora Team Leader", desc: "NUP Diaspora leadership coordination", photo: null },
  { name: "Dr. Elvis Balikalaba", role: "Organizing Committee", desc: "Convention planning and logistics", photo: null },
];

const CHICAGO_SCHEDULE = [
  {
    day: "Thursday, August 8th",
    title: "Arrival & Leadership",
    events: [
      { time: "8:00 AM - 2:00 PM", title: "Arrival of Delegates", desc: "Offsite meetings for Ugandan delegates" },
      { time: "12:00 PM - 1:00 PM", title: "Convention Leadership Meetings", desc: "NUP Leadership and organizing committee" },
      { time: "2:00 PM - 6:00 PM", title: "Leadership Training Workshop", desc: "Empowering leadership and civil engagement strategies" },
      { time: "7:00 PM - 11:00 PM", title: "Welcome Evening & Soccer", desc: "Patriot's Day Cup soccer match followed by picnic and BBQ", icon: Trophy },
    ],
  },
  {
    day: "Friday, August 9th",
    title: "Democracy & Engagement",
    events: [
      { time: "8:00 AM - 11:00 PM", title: "Delegate Registration", desc: "Registration desk open all day", icon: CheckCircle },
      { time: "8:00 AM - 12:00 PM", title: "March for Democracy", desc: "Rally and demonstration for democratic change in Uganda", icon: Flag },
      { time: "10:00 AM - 12:00 PM", title: "United Forces for Change", desc: "Leaders meeting and strategy session" },
      { time: "1:30 PM - 6:00 PM", title: "Opening Ceremony", desc: "Envisioning A New Uganda — Presentation of Papers", icon: BookOpen },
      { time: "7:00 PM - 10:30 PM", title: "Celebrating Women's Excellence", desc: "Honoring women's achievements and leadership", icon: Heart },
      { time: "10:30 PM - 1:00 AM", title: "Meet and Greet Cocktail", desc: "Fostering connections among delegates" },
    ],
  },
  {
    day: "Saturday, August 10th",
    title: "Speakers & River Cruise",
    events: [
      { time: "8:30 AM - 9:30 AM", title: "General Session", desc: "Welcome remarks and theme introduction" },
      { time: "9:30 AM - 12:00 PM", title: "Distinguished Speakers", desc: "Presentations by panelists on governance and human rights", icon: Star },
      { time: "10:00 AM - 12:00 PM", title: "Youth Session", desc: "Empowering the next generation" },
      { time: "1:00 PM - 3:30 PM", title: "Ugandan Delegates Presentations", desc: "Our Collective Vision for a New Uganda" },
      { time: "4:00 PM", title: "Departure for Chicago River Cruise", desc: "Buses depart from the hotel", icon: Ship },
      { time: "7:00 PM - 11:00 PM", title: "Chicago River Cruise", desc: "Dinner, entertainment, and networking with skyline views", icon: Music },
    ],
  },
  {
    day: "Sunday, August 11th",
    title: "Solidarity & Celebration",
    events: [
      { time: "8:00 AM", title: "Patriots Day 2K Run", desc: "Supporting victims of political repression", icon: Trophy },
      { time: "10:00 AM - 12:00 PM", title: "Interdenominational Prayer", desc: "Prayers for patriots and victims" },
      { time: "1:00 PM - 3:00 PM", title: "Annual General Meeting", desc: "Resolutions and path forward" },
      { time: "4:00 PM - 2:00 AM", title: "Closing Ceremony & Banquet", desc: "Grand finale with awards and cultural performances", icon: Star },
    ],
  },
  {
    day: "Monday, August 12th",
    title: "Departure",
    events: [
      { time: "Morning", title: "Farewell & Departure", desc: "Safe travels and continued solidarity" },
    ],
  },
];

const CHICAGO_SPEAKERS = [
  { name: "President Robert Kyagulanyi Ssentamu", role: "NUP President / Keynote Speaker", desc: "Leader of the People Power Movement — delivered powerful closing remarks thanking American supporters", photo: bobiWineDiasporaImg },
  { name: "Hon. Joel Ssenyonyi", role: "Leader of Opposition", desc: "Member of Parliament and NUP Spokesperson", photo: joelSsenyonyiImg },
  { name: "Professor Milton Allimadi", role: "Distinguished Speaker", desc: "Renowned journalist and professor of African studies", photo: null },
  { name: "Congressman Danny K Davis", role: "Distinguished Guest Speaker", desc: "U.S. Congressman and human rights advocate", photo: dannyKDavisImg },
  { name: "Professor David Ssejinja", role: "Guest Speaker", desc: "Expert in international politics and African education", photo: davidSsejinjaImg },
  { name: "Professor James Powell", role: "Guest Speaker", desc: "Adjunct Professor and humanitarian advocate", photo: null },
  { name: "Professor Tim Szczepanski", role: "Guest Speaker", desc: "Director of Student Engagement, CSU Northridge", photo: timSzczepanskiImg },
  { name: "Katie Lowe", role: "Guest Speaker", desc: "CFO, American Leaders Class — human rights activist", photo: katieLoweSpeakerImg },
  { name: "Godfrey Nyenje", role: "Convention Chair", desc: "Lead organizer for the Chicago 2024 Convention", photo: null },
  { name: "Hellen Nandaula", role: "NUP Chicago Team Leader", desc: "Host chapter leader for the convention", photo: null },
  { name: "Dr. Daniel Kawuma", role: "Diaspora Team Leader", desc: "NUP Diaspora leadership coordination", photo: null },
];

function PastConventionPage({ conference, schedule, speakersList, highlights, venue, heroImages, venueImage, organizingCommitteeImage, galleryImages }: {
  conference: Conference;
  schedule: typeof BOSTON_SCHEDULE;
  speakersList: typeof BOSTON_SPEAKERS;
  highlights: { icon: typeof Star; title: string; desc: string }[];
  venue: { name: string; address: string; details: string[] };
  heroImages?: { src: string; alt: string }[];
  venueImage?: string;
  organizingCommitteeImage?: string;
  galleryImages?: { src: string; alt: string }[];
}) {
  const [activeDay, setActiveDay] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = heroImages || [];

  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <div className="min-h-screen">
      <div className="relative py-20 min-h-[400px] flex items-center overflow-hidden">
        {slides.length > 0 ? (
          <>
            {slides.map((slide, i) => (
              <img
                key={i}
                src={slide.src}
                alt={slide.alt}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[2000ms] ease-in-out ${
                  i === currentSlide ? "opacity-100" : "opacity-0"
                }`}
              />
            ))}
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/40 to-transparent pointer-events-none" />
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-red-800 via-red-900 to-blue-900" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />
          </>
        )}
        <div className="container mx-auto px-4 relative z-10">
          <Link href="/conferences">
            <Button variant="ghost" className="mb-6 text-white/80 hover:text-white hover:bg-white/10" data-testid="button-back-to-conferences">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Conferences
            </Button>
          </Link>
          <div className="text-center">
            <Badge className="mb-4 bg-white/20 text-white border-white/30 hover:bg-white/30">
              <Clock className="w-3 h-3 mr-1" /> Past Convention
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4" data-testid="text-conference-title">
              {conference.title}
            </h1>
            {conference.theme && (
              <p className="text-xl md:text-2xl text-white/80 italic mb-6" data-testid="text-conference-theme">
                "{conference.theme}"
              </p>
            )}
            <div className="flex flex-wrap items-center justify-center gap-6 text-white/70">
              <span className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                {conference.startDate && format(new Date(conference.startDate), "MMMM d")} - {conference.endDate && format(new Date(conference.endDate), "MMMM d, yyyy")}
              </span>
              <span className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                {conference.city}, {conference.country}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {highlights.map((h, i) => (
            <Card key={i} className="text-center p-6 hover:shadow-md transition-shadow" data-testid={`card-highlight-${i}`}>
              <h.icon className="w-10 h-10 mx-auto mb-3 text-primary" />
              <h3 className="font-bold mb-1">{h.title}</h3>
              <p className="text-sm text-muted-foreground">{h.desc}</p>
            </Card>
          ))}
        </div>

        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-3 text-center">About the Convention</h2>
          <Separator className="w-20 mx-auto mb-8" />
          <Card>
            <CardContent className="p-8">
              <p className="text-muted-foreground text-lg leading-relaxed whitespace-pre-wrap">
                {conference.description}
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-3 text-center">Convention Schedule</h2>
          <Separator className="w-20 mx-auto mb-8" />
          <Tabs value={String(activeDay)} onValueChange={(v) => setActiveDay(Number(v))}>
            <TabsList className="flex flex-wrap justify-center gap-1 bg-transparent h-auto mb-6">
              {schedule.map((day, i) => (
                <TabsTrigger
                  key={i}
                  value={String(i)}
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-2 rounded-full"
                  data-testid={`tab-day-${i}`}
                >
                  Day {i + 1}
                </TabsTrigger>
              ))}
            </TabsList>
            {schedule.map((day, i) => (
              <TabsContent key={i} value={String(i)}>
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold">{day.day}</h3>
                        <p className="text-sm text-muted-foreground">{day.title}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {day.events.map((evt, j) => {
                        const IconComp = evt.icon || Clock;
                        return (
                          <div key={j} className="flex gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors" data-testid={`schedule-event-${i}-${j}`}>
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <IconComp className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-1">
                                <span className="text-xs font-mono text-primary font-semibold">{evt.time}</span>
                                <h4 className="font-semibold">{evt.title}</h4>
                              </div>
                              {evt.desc && <p className="text-sm text-muted-foreground">{evt.desc}</p>}
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
          <h2 className="text-3xl font-bold mb-3 text-center">Featured Speakers</h2>
          <Separator className="w-20 mx-auto mb-8" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {speakersList.map((speaker, i) => (
              <Card key={i} className="hover:shadow-md transition-shadow" data-testid={`card-speaker-${i}`}>
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    {speaker.photo ? (
                      <img
                        src={speaker.photo}
                        alt={speaker.name}
                        className="w-14 h-14 rounded-full object-cover flex-shrink-0 border-2 border-primary/20"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Users className="w-6 h-6 text-primary" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-sm">{speaker.name}</h3>
                      <p className="text-xs text-primary font-medium mb-1">{speaker.role}</p>
                      <p className="text-xs text-muted-foreground">{speaker.desc}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {organizingCommitteeImage && (
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-3 text-center">Organizing Committee</h2>
            <Separator className="w-20 mx-auto mb-8" />
            <Card className="overflow-hidden">
              <img
                src={organizingCommitteeImage}
                alt="Convention Organizing Committee"
                className="w-full h-auto object-cover"
                data-testid="img-organizing-committee"
              />
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">
                  The dedicated team behind the convention — working tirelessly to bring the NUP Diaspora community together.
                </p>
              </CardContent>
            </Card>
          </section>
        )}

        {galleryImages && galleryImages.length > 0 && (
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-3 text-center">Convention Gallery</h2>
            <Separator className="w-20 mx-auto mb-8" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {galleryImages.map((img, i) => (
                <div
                  key={i}
                  className={`overflow-hidden rounded-xl cursor-pointer group ${
                    i === 0 ? "col-span-2 row-span-2" : ""
                  }`}
                  data-testid={`gallery-img-${i}`}
                  onClick={() => {
                    const overlay = document.createElement("div");
                    overlay.className = "fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-pointer";
                    overlay.onclick = () => overlay.remove();
                    const image = document.createElement("img");
                    image.src = img.src;
                    image.alt = img.alt;
                    image.className = "max-w-full max-h-[90vh] object-contain rounded-lg";
                    overlay.appendChild(image);
                    document.body.appendChild(overlay);
                  }}
                >
                  <img
                    src={img.src}
                    alt={img.alt}
                    className="w-full h-full object-cover aspect-square group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
            <p className="text-center text-sm text-muted-foreground mt-4">Click any photo to view full size</p>
          </section>
        )}

        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-3 text-center">Venue</h2>
          <Separator className="w-20 mx-auto mb-8" />
          <Card className="overflow-hidden">
            {venueImage && (
              <div className="h-56 md:h-72 overflow-hidden">
                <img src={venueImage} alt={venue.name} className="w-full h-full object-cover" />
              </div>
            )}
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-start gap-6">
                <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Hotel className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1">{venue.name}</h3>
                  <p className="text-muted-foreground mb-4 flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> {venue.address}
                  </p>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {venue.details.map((detail, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        {detail}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <PastConventions />
      </div>
    </div>
  );
}

function Boston2025Page({ conference }: { conference: Conference }) {
  return (
    <PastConventionPage
      conference={conference}
      schedule={BOSTON_SCHEDULE}
      speakersList={BOSTON_SPEAKERS}
      heroImages={[
        { src: nupEventPhotoImg, alt: "NUP Diaspora community gathering at Boston convention" },
        { src: bostonMarriottImg, alt: "Boston Marriott Burlington — convention venue" },
        { src: nupInitiativesImg, alt: "NUP Diaspora initiatives and engagement" },
        { src: nupBoatCruise1Img, alt: "Convention boat cruise celebration" },
        { src: nupGetInvolvedImg, alt: "NUP community outreach and involvement" },
        { src: nupBoatCruise2Img, alt: "Delegates networking on the boat cruise" },
      ]}
      venueImage={bostonMarriottImg}
      organizingCommitteeImage={bostonCommitteeImg}
      galleryImages={[
        { src: bostonGallery1Img, alt: "NUP delegates group photo at convention meeting" },
        { src: bostonGallery2Img, alt: "Bobi Wine arriving at the convention" },
        { src: bostonGallery3Img, alt: "Joel Ssenyonyi performing on stage" },
        { src: bostonGallery4Img, alt: "Bobi Wine and Barbie Kyagulanyi with delegates" },
        { src: bostonGallery5Img, alt: "Gala dinner guests at the convention" },
        { src: bostonGallery6Img, alt: "Delegates greeting at the Celebrate Ballroom" },
        { src: bostonGallery7Img, alt: "Buganda Ntege supporters at outdoor event" },
        { src: bostonGallery8Img, alt: "Convention registration and check-in" },
        { src: bostonGallery9Img, alt: "Barbie Kyagulanyi and Joel Ssenyonyi during ceremony" },
        { src: bostonGallery10Img, alt: "Gala dinner with speaker addressing delegates" },
      ]}
      highlights={[
        { icon: Users, title: "5th Annual", desc: "The fifth gathering of NUP Diaspora from across the globe" },
        { icon: Heart, title: "Women's Empowerment", desc: "Workshop led by First Lady Barbie Kyagulanyi" },
        { icon: Star, title: "Leader of Opposition", desc: "Hon. Joel Ssenyonyi addressed delegates" },
        { icon: Ship, title: "Boat Cruise", desc: "Networking and celebration on the water" },
      ]}
      venue={{
        name: "Boston Marriott Burlington",
        address: "One Burlington Mall Road, Burlington, MA 01803",
        details: [
          "$165/night group rate",
          "Breakfast included",
          "15 miles north of Boston",
          "Complimentary airport shuttle",
          "Near Burlington Mall",
          "Close to Salem, Lexington & Concord",
        ],
      }}
    />
  );
}

function Chicago2024Page({ conference }: { conference: Conference }) {
  return (
    <PastConventionPage
      conference={conference}
      schedule={CHICAGO_SCHEDULE}
      speakersList={CHICAGO_SPEAKERS}
      heroImages={[
        { src: chicagoGroupImg, alt: "NUP convention delegates group photo in Chicago" },
        { src: chicagoPromontoryImg, alt: "Promontory Point at Burnham Park, Chicago" },
        { src: chicagoSpiritCruiseImg, alt: "Spirit of Chicago — convention river cruise" },
        { src: chicagoMarriottImg, alt: "Marriott Chicago O'Hare — convention hotel" },
        { src: chicagoDelegate1Img, alt: "Convention delegate at the Chicago gathering" },
        { src: chicagoDelegate2Img, alt: "Convention delegate at the Chicago gathering" },
        { src: nupEventPhotoImg, alt: "NUP Diaspora community gathering" },
      ]}
      venueImage={chicagoMarriottImg}
      highlights={[
        { icon: Flag, title: "March for Democracy", desc: "Public rally advocating for democratic change in Uganda" },
        { icon: Ship, title: "Chicago River Cruise", desc: "Signature cruise exploring the iconic skyline" },
        { icon: Star, title: "6+ Distinguished Speakers", desc: "Professors, congressmen, and human rights advocates" },
        { icon: Trophy, title: "Patriot's Day Cup", desc: "Soccer match and community sports event" },
      ]}
      venue={{
        name: "Marriott Chicago O'Hare",
        address: "8535 West Higgins Road, Chicago, IL 60631",
        details: [
          "Home of President Obama",
          "Legacy of civil rights movements",
          "Explore the Magnificent Mile",
          "Lake Michigan shoreline",
          "Hyde Park neighborhood",
          "World-class dining and culture",
        ],
      }}
    />
  );
}

function GenericConferenceDetail({ conference }: { conference: Conference }) {
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
