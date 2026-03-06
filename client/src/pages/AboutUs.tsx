import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Heart, Users, Globe, Shield, BookOpen, Scale, Megaphone, HandHeart, ArrowRight, Eye, Target, Award } from "lucide-react";
import aboutGroupPhoto from "@assets/nup-about-us-group.webp";
import initiativesPhoto from "@assets/nup-initiatives.jpg";
import getInvolvedPhoto from "@assets/nup-get-involved.jpg";
import eventPhoto from "@assets/nup-event-photo.jpg";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

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

      <section className="py-16 md:py-20 bg-muted/30">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div {...fadeIn}>
              <h2 className="text-3xl md:text-4xl font-bold mb-6" data-testid="text-initiatives-heading">Our Initiatives</h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                Explore a diverse spectrum of initiatives that form the cornerstones of our collective efforts. From initiatives in education, advocacy and charity work, we are the architects of a brighter Uganda for all.
              </p>
              <div className="space-y-4">
                {[
                  { title: "Advocacy & Policy", desc: "Engaging with Congress and international bodies to champion democratic reforms." },
                  { title: "Education Programs", desc: "Civic education workshops, scholarship support, and youth mentorship." },
                  { title: "Charity & Relief", desc: "Community support programs, disaster relief, and humanitarian aid." },
                  { title: "Civic Engagement", desc: "Voter education, community organizing, and grassroots mobilization." },
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
            </motion.div>
            <motion.div {...fadeIn} transition={{ delay: 0.2 }}>
              <img
                src={initiativesPhoto}
                alt="NUP Diaspora initiatives"
                className="rounded-2xl shadow-2xl w-full object-cover aspect-[4/3]"
                data-testid="img-initiatives"
              />
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div {...fadeIn} transition={{ delay: 0.2 }} className="order-2 lg:order-1">
              <img
                src={eventPhoto}
                alt="NUP Diaspora impact and community"
                className="rounded-2xl shadow-2xl w-full object-cover aspect-[4/3]"
                data-testid="img-impact"
              />
            </motion.div>
            <motion.div {...fadeIn} className="order-1 lg:order-2">
              <h2 className="text-3xl md:text-4xl font-bold mb-6" data-testid="text-impact-heading">Our Impact</h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                Uncover the stories, projects, and communities that bear the indelible marks of our influence. Witness firsthand how your support has ushered transformation and rekindled hope.
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Through the collective power of our diaspora community, we have amplified the voices of the voiceless, supported families in need, and built bridges between Ugandans worldwide and their homeland.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

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