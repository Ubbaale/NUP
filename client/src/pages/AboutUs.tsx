import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect, useCallback } from "react";
import { Heart, Users, Globe, Shield, BookOpen, Scale, Megaphone, HandHeart, ArrowRight, Eye, Target, Award, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import aboutGroupPhoto from "@assets/nup-about-us-group.webp";
import congressMeetingPhoto from "@assets/nup-congressman-meeks.webp";
import initiativesPhoto from "@assets/nup-initiatives.jpg";
import getInvolvedPhoto from "@assets/nup-get-involved.jpg";
import eventPhoto from "@assets/nup-event-photo.jpg";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

const whatWeDoSlides = [
  {
    image: congressMeetingPhoto,
    alt: "NUP Diaspora delegation meeting with Congressman Gregory Meeks",
    caption: "NUP Diaspora delegation meeting with Congressman Gregory Meeks, September 21, 2023",
  },
  {
    image: initiativesPhoto,
    alt: "NUP Diaspora community advocacy and outreach",
    caption: "Community advocacy and grassroots engagement across the diaspora",
  },
  {
    image: eventPhoto,
    alt: "NUP Diaspora convention and policy discussions",
    caption: "Annual conventions bringing together Ugandans from across the globe",
  },
];

function WhatWeDoSection() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % whatWeDoSlides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + whatWeDoSlides.length) % whatWeDoSlides.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  return (
    <section className="py-16 md:py-20 bg-muted/30">
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div {...fadeIn} className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" data-testid="text-what-we-do-heading">What We Do</h2>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
            Stay tuned to our latest news, upcoming events, and ongoing projects. Embark on a journey through our tireless efforts to usher positive change into our world.
          </p>
        </motion.div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div {...fadeIn}>
            <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-[4/3] group" data-testid="slideshow-what-we-do">
              {whatWeDoSlides.map((slide, idx) => (
                <div
                  key={idx}
                  className="absolute inset-0 transition-opacity duration-700"
                  style={{ opacity: currentSlide === idx ? 1 : 0 }}
                >
                  <img
                    src={slide.image}
                    alt={slide.alt}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6">
                    <p className="text-white text-sm md:text-base font-medium">{slide.caption}</p>
                  </div>
                </div>
              ))}
              <button
                onClick={prevSlide}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Previous slide"
                data-testid="button-slide-prev"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Next slide"
                data-testid="button-slide-next"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {whatWeDoSlides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${currentSlide === idx ? "bg-white scale-110" : "bg-white/50"}`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
          <motion.div {...fadeIn} transition={{ delay: 0.2 }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <Megaphone className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold">Engagement with U.S. Congress</h3>
            </div>
            <p className="text-muted-foreground text-lg leading-relaxed mb-6">
              We actively engage with all levers of power, including Congress, the State Department, the Executive Branch, civil society, human rights organizations, and other influential entities shaping policy decisions.
            </p>
            <p className="text-muted-foreground text-lg leading-relaxed mb-6">
              On September 21, 2023, we convened a pivotal meeting with <strong>Congressman Gregory Meeks</strong>, Chairman of the House Foreign Affairs Committee, to advocate for democracy, human rights, and empowerment in Africa.
            </p>
            <div className="space-y-4">
              {[
                { title: "Congressional Advocacy", desc: "Direct engagement with members of Congress to champion democratic reforms in Uganda." },
                { title: "Policy Briefings", desc: "Presenting evidence-based reports on human rights conditions to U.S. policymakers." },
                { title: "Coalition Building", desc: "Partnering with civil society organizations and human rights groups for amplified impact." },
                { title: "Community Mobilization", desc: "Organizing diaspora communities to participate in civic engagement and advocacy campaigns." },
              ].map(item => (
                <div key={item.title} className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-red-600 mt-2.5 shrink-0" />
                  <div>
                    <h4 className="font-semibold">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <a href="https://diasporanup.org/index.php/about-us/" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="gap-2" data-testid="button-learn-more-nup">
                  Learn More at diasporanup.org <ExternalLink className="w-4 h-4" />
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

const nupActions = [
  {
    title: "Engagement with U.S. Congress",
    description: "At the National Unity Platform Diaspora Inc., we place a strong emphasis on engaging with members of Congress. On September 21, 2023, our diaspora leadership, which includes prominent figures such as Milton Alimadi, Dr. Daniel Kawuma, NUP President Hon. Robert Ssentamu Kyagulanyi, and Civil Rights Icon Dr. Ron Daniels, had the privilege of convening a meeting at the office of Congressman Gregory Meeks in Washington, D.C.",
  },
  {
    title: "Congressman Gregory Meeks: A Key Player",
    description: "Congressman Gregory Meeks holds a significant role as the Ranking Member of the House Foreign Affairs Committee and is a senior member of the House Committee on Financial Services, with positions on the Subcommittee on Capital Markets and the Subcommittee on Financial Institutions and Monetary Policy. Additionally, he is a distinguished member of the Congressional Black Caucus (CBC).",
  },
  {
    title: "A Shared Vision",
    description: "In our collective efforts to advocate for democracy and empowerment in Africa, we believe that establishing a strong bond with the African American community and its leadership is of utmost importance. This connection is a powerful tool in influencing U.S. foreign policy, particularly concerning Uganda and the broader African continent.",
  },
  {
    title: "Solidarity with Civil Rights Advocacy",
    description: "The meeting commenced with a reflection on the historical significance of the African American community's involvement in Africa's decolonization and their unwavering struggle against discrimination and apartheid. We stand in solidarity with their ongoing civil rights endeavors in the United States.",
  },
];

const keyDiscussions = [
  {
    title: "Congressional Action",
    description: "We called for congressional hearings on Uganda to address human rights issues, conflicts in Eastern Congo and Sudan, the refugee crisis, and President Museveni's involvement in regional conflicts. Moreover, we stressed the need for congressional scrutiny of military aid to ensure it does not contribute to the oppression of Ugandan citizens.",
  },
  {
    title: "Museveni's Utilization of Ugandan Troops",
    description: "Concerns were raised regarding President Museveni's strategy of using Ugandan troops as mercenaries under the pretext of fighting terrorism. This approach has been employed to suppress the voices of human rights advocates in the name of national security.",
  },
  {
    title: "Human Rights Violations",
    description: "The systematic violation of human rights, including the erosion of civil liberties, pervasive corruption in foreign aid and loans, and recurring instances of election violence and manipulation, was identified as a matter of grave concern. Such violations severely undermine democracy, the rule of law, and the fundamental rights of the Ugandan populace.",
  },
  {
    title: "Political Prisoners and Military Trials",
    description: "We highlighted the issue of unjust detentions in Uganda without trial, including the case of political prisoners like Olivia Lutaaya. The practice of trying civilians in military courts was strongly condemned.",
  },
  {
    title: "Uganda's Role in Regional Conflicts",
    description: "There was a unanimous consensus on the importance of holding those responsible for regional instability accountable and not rewarding President Museveni for his role in regional conflicts.",
  },
];

function AccordionItem({ item, isExpanded, onToggle, testId }: { item: { title: string; description: string }; isExpanded: boolean; onToggle: () => void; testId: string }) {
  return (
    <div
      className={`border-b border-border last:border-b-0 cursor-pointer transition-colors ${isExpanded ? "bg-muted/30" : "hover:bg-muted/20"}`}
      onClick={onToggle}
      data-testid={testId}
    >
      <div className="flex items-center gap-3 px-4 py-4">
        <ChevronRight className={`w-4 h-4 text-red-600 shrink-0 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
        <h4 className="font-bold text-base">{item.title}</h4>
      </div>
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.3 }}
          className="px-4 pb-4 pl-11"
        >
          <p className="text-muted-foreground leading-relaxed text-sm">{item.description}</p>
        </motion.div>
      )}
    </div>
  );
}

function OurImpactSection() {
  const [expandedAction, setExpandedAction] = useState<number | null>(null);
  const [expandedDiscussion, setExpandedDiscussion] = useState<number | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [congressMeetingPhoto, eventPhoto, initiativesPhoto];
  const slideCaptions = [
    "NUP delegation meeting with Congressman Gregory Meeks, Washington D.C.",
    "NUP Diaspora community engagement and advocacy",
    "Building bridges for democratic change across the globe",
  ];

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  return (
    <section className="py-16 md:py-20 bg-background">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-16">
          <motion.div {...fadeIn} className="mb-2">
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">NUP Actions</p>
          </motion.div>
          <motion.div {...fadeIn} className="mb-1">
            <h2 className="text-3xl md:text-4xl font-bold" data-testid="text-impact-heading">What we do</h2>
            <Separator className="w-16 h-1 bg-red-600 mt-3 mb-8 rounded-full" />
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <motion.div {...fadeIn}>
              <div className="border border-border rounded-xl overflow-hidden">
                {nupActions.map((item, idx) => (
                  <AccordionItem
                    key={item.title}
                    item={item}
                    isExpanded={expandedAction === idx}
                    onToggle={() => setExpandedAction(expandedAction === idx ? null : idx)}
                    testId={`card-action-${idx}`}
                  />
                ))}
              </div>
            </motion.div>
            <motion.div {...fadeIn} transition={{ delay: 0.2 }} className="hidden lg:block" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          <motion.div {...fadeIn}>
            <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-[4/3] group" data-testid="slideshow-impact">
              {slides.map((slide, idx) => (
                <div
                  key={idx}
                  className="absolute inset-0 transition-opacity duration-700"
                  style={{ opacity: currentSlide === idx ? 1 : 0 }}
                >
                  <img
                    src={slide}
                    alt={slideCaptions[idx]}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
              <button
                onClick={(e) => { e.stopPropagation(); prevSlide(); }}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Previous slide"
                data-testid="button-impact-slide-prev"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); nextSlide(); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Next slide"
                data-testid="button-impact-slide-next"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>

          <motion.div {...fadeIn} transition={{ delay: 0.2 }}>
            <h3 className="text-2xl md:text-3xl font-bold mb-3" data-testid="text-key-discussions">Key Discussions</h3>
            <p className="text-muted-foreground leading-relaxed mb-6">
              During the meeting, the following crucial points were discussed:
            </p>
            <div className="border border-border rounded-xl overflow-hidden">
              {keyDiscussions.map((item, idx) => (
                <AccordionItem
                  key={item.title}
                  item={item}
                  isExpanded={expandedDiscussion === idx}
                  onToggle={() => setExpandedDiscussion(expandedDiscussion === idx ? null : idx)}
                  testId={`card-discussion-${idx}`}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default function AboutUs() {
  return (
    <div className="min-h-screen">
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-700 via-red-800 to-red-900" />
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-0" style={{ backgroundImage: `url(${aboutGroupPhoto})`, backgroundSize: "cover", backgroundPosition: "center", opacity: 0.2 }} />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div {...fadeIn}>
            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6" data-testid="text-about-heading">
              About Us
            </h1>
            <p className="text-xl md:text-2xl text-red-100 max-w-3xl mx-auto leading-relaxed">
              National Unity Platform Diaspora — A home for Ugandans and friends of Uganda united for democracy, human rights, and positive change.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div {...fadeIn}>
              <img
                src={aboutGroupPhoto}
                alt="NUP Diaspora community gathering"
                className="rounded-2xl shadow-2xl w-full object-cover aspect-[4/3]"
                data-testid="img-about-group"
              />
            </motion.div>
            <motion.div {...fadeIn} transition={{ delay: 0.2 }}>
              <h2 className="text-3xl md:text-4xl font-bold mb-6" data-testid="text-who-we-are">Who We Are</h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                We actively engage with all levers of power, including Congress, the State Department, the Executive Branch, civil society, human rights organizations, and other influential entities shaping policy decisions.
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                Our aim is to address the pressing issues of growing poverty, inequality, and the erosion of civil and political liberties across Uganda and other African nations. We work diligently to defend human rights, promote democratic governance, safeguard freedom of expression, challenge discrimination, and demand accountability for government abuses. Our focus extends to combating the growing threat of authoritarianism.
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed">
                We extend a warm invitation to join hands with us — a unique opportunity to forge a platform for effective engagement with policymakers and civil society organizations. Whether you are a passionate activist, a benevolent philanthropist, or a dedicated volunteer, your role is pivotal within our community.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-muted/30">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <motion.div {...fadeIn}>
              <Card className="h-full border-l-4 border-l-red-600">
                <CardContent className="pt-8 pb-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                      <Eye className="w-7 h-7 text-red-600" />
                    </div>
                    <h3 className="text-2xl font-bold" data-testid="text-vision-heading">Our Vision & Commitment</h3>
                  </div>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    National Unity Platform Diaspora is a home for Ugandans and friends of Uganda residing in the United States. Our commitment extends beyond national interests. We advocate for a foreign policy founded on principles that uphold human rights, democracy, and individual liberties.
                  </p>
                  <p className="text-muted-foreground text-lg leading-relaxed mt-4">
                    Our vision transcends borders, tirelessly striving for principles of the rule of law, ensuring dignity and equal opportunity for all.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeIn} transition={{ delay: 0.2 }}>
              <Card className="h-full border-l-4 border-l-red-600">
                <CardContent className="pt-8 pb-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                      <Target className="w-7 h-7 text-red-600" />
                    </div>
                    <h3 className="text-2xl font-bold" data-testid="text-mission-heading">Our Mission for Positive Change</h3>
                  </div>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    Our mission radiates positive change, touching local communities and extending its reach to global horizons. At our core, we are dedicated to advancing social welfare and civic engagement through advocacy, service, and education.
                  </p>
                  <p className="text-muted-foreground text-lg leading-relaxed mt-4">
                    United by the values of unity, progress, and empowerment, we tirelessly champion democracy, address human rights violations, and protect fundamental rights — rights that encompass life, liberty, freedom of speech, press, assembly, and the right to petition for justice.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div {...fadeIn} className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What We Stand For</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Our core values guide every action we take in the pursuit of a free and democratic Uganda.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Shield, title: "Human Rights", desc: "Defending the fundamental rights and dignity of every Ugandan citizen." },
              { icon: Scale, title: "Democracy", desc: "Promoting democratic governance, free elections, and the rule of law." },
              { icon: Megaphone, title: "Freedom of Expression", desc: "Safeguarding press freedom, free speech, and the right to peaceful assembly." },
              { icon: Award, title: "Accountability", desc: "Demanding transparency and accountability from government institutions." },
              { icon: Users, title: "Unity", desc: "Bringing together Ugandans across the globe regardless of background." },
              { icon: Globe, title: "Global Advocacy", desc: "Engaging with international bodies and policymakers for change." },
              { icon: BookOpen, title: "Education", desc: "Empowering communities through civic education and awareness." },
              { icon: HandHeart, title: "Service", desc: "Serving our communities through charitable initiatives and support programs." },
            ].map((item, idx) => (
              <motion.div key={item.title} {...fadeIn} transition={{ delay: idx * 0.1 }}>
                <Card className="h-full hover:shadow-lg transition-shadow" data-testid={`card-value-${idx}`}>
                  <CardContent className="pt-6 text-center">
                    <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                      <item.icon className="w-7 h-7 text-red-600" />
                    </div>
                    <h4 className="font-bold text-lg mb-2">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <WhatWeDoSection />

      <OurImpactSection />

      <section className="py-16 md:py-20 bg-gradient-to-br from-red-700 via-red-800 to-red-900 text-white">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <motion.div {...fadeIn}>
            <img
              src={getInvolvedPhoto}
              alt="Get involved with NUP"
              className="rounded-2xl shadow-2xl w-full object-cover aspect-[16/7] mb-10 opacity-90"
              data-testid="img-get-involved"
            />
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Join the Movement</h2>
            <p className="text-xl text-red-100 leading-relaxed mb-8 max-w-2xl mx-auto">
              Your contributions serve as the unwavering bedrock of our work. Join us in our noble pursuit of crafting a future that shines for all. Together, we can etch a lasting legacy.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/membership">
                <Button size="lg" className="bg-white text-red-700 hover:bg-red-50 font-bold text-lg px-8" data-testid="button-join-membership">
                  <Users className="w-5 h-5 mr-2" /> Become a Member
                </Button>
              </Link>
              <Link href="/donate">
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 font-bold text-lg px-8" data-testid="button-donate">
                  <Heart className="w-5 h-5 mr-2" /> Support Our Cause
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}