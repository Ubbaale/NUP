import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { SEO } from "@/components/SEO";
import type { HumanRightsReport } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Heart, Users, Globe, Shield, BookOpen, Scale, Megaphone, HandHeart, Eye, Target, Award, ChevronRight, FileText, ExternalLink } from "lucide-react";
import lincolnMemorialBg from "@assets/stock_images/lincoln-memorial-dc.jpg";
import capitolBg from "@assets/istockphoto-1632197496-612x612_1773032358389.jpg";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

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

const ORG_COLORS: Record<string, string> = {
  "U.S. Department of State": "bg-blue-600",
  "Human Rights Watch": "bg-green-700",
  "Amnesty International": "bg-yellow-600",
  "Freedom House": "bg-purple-700",
  "United Nations (OHCHR)": "bg-sky-600",
  "European Parliament": "bg-indigo-600",
};

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

export default function AboutUs() {
  const [expandedAction, setExpandedAction] = useState<number | null>(null);
  const [expandedDiscussion, setExpandedDiscussion] = useState<number | null>(null);
  const { data: dbReports = [] } = useQuery<HumanRightsReport[]>({
    queryKey: ["/api/human-rights-reports"],
  });

  const groupedReports = dbReports.reduce<Record<string, HumanRightsReport[]>>((acc, r) => {
    if (!acc[r.organization]) acc[r.organization] = [];
    acc[r.organization].push(r);
    return acc;
  }, {});

  return (
    <div className="min-h-screen">
      <SEO
        title="About Us"
        description="Learn about the National Unity Platform (NUP) Diaspora Inc. Our mission, vision, leadership, and advocacy work with U.S. Congress for democracy, human rights, and freedom in Uganda."
        keywords="about NUP diaspora, NUP mission, People Power vision, NUP leadership, Bobi Wine, Uganda advocacy US Congress, NUP diaspora Inc, Uganda human rights, Gregory Meeks Uganda"
      />
      <section className="relative py-28 md:py-40 overflow-hidden">
        <div className="absolute inset-0" style={{ backgroundImage: `url(${lincolnMemorialBg})`, backgroundSize: "cover", backgroundPosition: "center" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div {...fadeIn}>
            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6" data-testid="text-about-heading">
              About Us
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              National Unity Platform Diaspora — A home for Ugandans and friends of Uganda united for democracy, human rights, and positive change.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-background">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div {...fadeIn}>
            <h2 className="text-3xl md:text-4xl font-bold mb-6" data-testid="text-who-we-are">Who We Are</h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-6">
              National Unity Platform Diaspora is a home for Ugandans and friends of Uganda residing across the globe. Our commitment extends beyond national interests. We advocate for a foreign policy founded on principles that uphold human rights, democracy, and individual liberties.
            </p>
            <p className="text-muted-foreground text-lg leading-relaxed mb-6">
              Our aim is to address the pressing issues of growing poverty, inequality, and the erosion of civil and political liberties across Uganda and other African nations. We work diligently to defend human rights, promote democratic governance, safeguard freedom of expression, challenge discrimination, and demand accountability for government abuses. Our focus extends to combating the growing threat of authoritarianism.
            </p>
            <p className="text-muted-foreground text-lg leading-relaxed">
              We extend a warm invitation to join hands with us — a unique opportunity to forge a platform for effective engagement with policymakers and civil society organizations. Whether you are a passionate activist, a benevolent philanthropist, or a dedicated volunteer, your role is pivotal within our community.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-muted/30">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div {...fadeIn}>
              <Card className="h-full border-l-4 border-l-red-600">
                <CardContent className="pt-8 pb-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                      <Eye className="w-7 h-7 text-red-600" />
                    </div>
                    <h3 className="text-2xl font-bold" data-testid="text-vision-heading">Our Vision</h3>
                  </div>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    Our vision transcends borders, tirelessly striving for principles of the rule of law, ensuring dignity and equal opportunity for all. We envision a Uganda where every citizen enjoys their fundamental rights and freedoms.
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
                    <h3 className="text-2xl font-bold" data-testid="text-mission-heading">Our Mission</h3>
                  </div>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    We are dedicated to advancing social welfare and civic engagement through advocacy, service, and education. United by the values of unity, progress, and empowerment, we champion democracy, address human rights violations, and protect fundamental rights.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="relative py-16 md:py-20 overflow-hidden">
        <div className="absolute inset-0" style={{ backgroundImage: `url(${capitolBg})`, backgroundSize: "cover", backgroundPosition: "center" }} />
        <div className="absolute inset-0 bg-white/85 dark:bg-black/85" />
        <div className="container mx-auto px-4 max-w-5xl relative z-10">
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
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div {...fadeIn} className="mb-2">
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">NUP Actions</p>
          </motion.div>
          <motion.div {...fadeIn} className="mb-1">
            <h2 className="text-3xl md:text-4xl font-bold" data-testid="text-what-we-do-heading">What We Do</h2>
            <Separator className="w-16 h-1 bg-red-600 mt-3 mb-4 rounded-full" />
          </motion.div>
          <motion.div {...fadeIn}>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              We actively engage with all levers of power, including Congress, the State Department, the Executive Branch, civil society, human rights organizations, and other influential entities shaping policy decisions.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div {...fadeIn}>
              <div className="border border-border rounded-xl overflow-hidden bg-background">
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

            <motion.div {...fadeIn} transition={{ delay: 0.2 }}>
              <h3 className="text-2xl font-bold mb-3" data-testid="text-key-discussions">Key Discussions</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                During the meeting, the following crucial points were discussed:
              </p>
              <div className="border border-border rounded-xl overflow-hidden bg-background">
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

      <section id="human-rights-reports" className="py-16 md:py-20 bg-background">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div {...fadeIn} className="text-center mb-12">
            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4" data-testid="text-human-rights-reports-heading">Human Rights Reports</h2>
            <Separator className="w-16 h-1 bg-red-600 mx-auto mb-4 rounded-full" />
            <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
              International organizations and governments have documented Uganda's human rights situation extensively. Below are official reports from credible institutions since 2019.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(groupedReports).map(([orgName, orgReports], orgIdx) => (
              <motion.div key={orgName} {...fadeIn} transition={{ delay: orgIdx * 0.1 }}>
                <Card className="h-full hover:shadow-lg transition-shadow" data-testid={`card-hr-org-${orgIdx}`}>
                  <CardContent className="pt-6 pb-6">
                    <div className="flex items-center gap-3 mb-4">
                      <span className={`w-3 h-3 rounded-full ${ORG_COLORS[orgName] || "bg-gray-500"} shrink-0`} />
                      <h3 className="font-bold text-lg">{orgName}</h3>
                    </div>
                    <div className="space-y-2">
                      {orgReports.map((report, rIdx) => (
                        <a
                          key={report.id}
                          href={report.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/60 transition-colors group"
                          data-testid={`link-hr-report-${orgIdx}-${rIdx}`}
                        >
                          <span className="text-xs font-bold bg-muted px-2 py-1 rounded min-w-[52px] text-center shrink-0">
                            {report.year}
                          </span>
                          <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors flex-1 line-clamp-1">
                            {report.title}
                          </span>
                          <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-red-600 shrink-0 transition-colors" />
                        </a>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div {...fadeIn} className="mt-10 text-center">
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
              These reports consistently highlight concerns around restrictions on civic space, political freedoms, press freedom, and treatment of opposition supporters in Uganda. We encourage all members to read and share these findings.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-gradient-to-br from-red-700 via-red-800 to-red-900 text-white">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <motion.div {...fadeIn}>
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
