import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  Users,
  Search,
  CheckCircle,
  UserPlus,
  IdCard,
  Shield,
  Crown,
  Copy,
  Calendar,
  MapPin,
  Mail,
  Phone,
  Globe2,
  Building,
  CreditCard,
  Loader2,
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import type { Region, Chapter, Member } from "@shared/schema";
import nupLogo from "@assets/national-unity-platform-nup-uganda-logo-png_seeklogo-547758_1774417367012.png";
import peoplePowerLogo from "@assets/download_(5)_1774417367011.png";

const COUNTRIES = [
  "United States",
  "Canada",
  "United Kingdom",
  "Germany",
  "France",
  "Sweden",
  "Norway",
  "Denmark",
  "Netherlands",
  "Belgium",
  "Switzerland",
  "Italy",
  "Spain",
  "Austria",
  "Ireland",
  "Australia",
  "New Zealand",
  "Japan",
  "South Korea",
  "China",
  "India",
  "UAE",
  "Saudi Arabia",
  "Qatar",
  "Kenya",
  "South Africa",
  "Nigeria",
  "Tanzania",
  "Rwanda",
  "Uganda",
  "Other",
];

const registrationSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  sex: z.string().optional(),
  nationality: z.string().optional(),
  country: z.string().min(1, "Please select your country"),
  city: z.string().optional(),
  regionId: z.string().optional(),
  chapterId: z.string().optional(),
  membershipType: z.string().default("regular"),
  mailingAddress: z.string().optional(),
  mailingCity: z.string().optional(),
  mailingState: z.string().optional(),
  mailingZip: z.string().optional(),
  mailingCountry: z.string().optional(),
  cardNumber: z.string().optional(),
});

type RegistrationData = z.infer<typeof registrationSchema>;

export default function Membership() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState<Member | null>(null);
  const [searchError, setSearchError] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [registeredMember, setRegisteredMember] = useState<Member | null>(null);
  const [hasExistingCard, setHasExistingCard] = useState(false);
  const [cardOrderMember, setCardOrderMember] = useState<Member | null>(null);
  const [cardOrderSuccess, setCardOrderSuccess] = useState(false);

  const { data: regions } = useQuery<Region[]>({
    queryKey: ["/api/regions"],
  });

  const { data: allChapters } = useQuery<Chapter[]>({
    queryKey: ["/api/chapters"],
  });

  const form = useForm<RegistrationData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      sex: "",
      nationality: "",
      country: "",
      city: "",
      regionId: "",
      chapterId: "",
      membershipType: "regular",
      mailingAddress: "",
      mailingCity: "",
      mailingState: "",
      mailingZip: "",
      mailingCountry: "",
      cardNumber: "",
    },
  });

  const selectedRegionId = form.watch("regionId");
  const chaptersForRegion = allChapters?.filter(
    (c) => c.regionId === selectedRegionId && c.isActive
  );

  const registerMutation = useMutation({
    mutationFn: async (data: RegistrationData) => {
      const payload = {
        ...data,
        regionId: data.regionId || undefined,
        chapterId: data.chapterId || undefined,
        dateOfBirth: data.dateOfBirth || undefined,
        cardNumber: data.cardNumber || undefined,
      };
      const res = await apiRequest("POST", "/api/members", payload);
      return res.json();
    },
    onSuccess: (member: Member) => {
      setRegisteredMember(member);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/members"] });
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Could not complete registration. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchError("Please enter a membership ID or email");
      return;
    }

    setIsSearching(true);
    setSearchError("");
    setSearchResult(null);

    try {
      const response = await fetch(`/api/members/search?q=${encodeURIComponent(searchQuery)}`);
      if (response.ok) {
        const member = await response.json();
        setSearchResult(member);
      } else if (response.status === 404) {
        setSearchError("No member found with that ID or email");
      } else {
        setSearchError("Search failed. Please try again.");
      }
    } catch {
      setSearchError("Search failed. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const cardOrderSchema = z.object({
    shippingName: z.string().min(2, "Full name required"),
    shippingAddress: z.string().min(5, "Address required"),
    shippingCity: z.string().min(2, "City required"),
    shippingState: z.string().optional(),
    shippingZip: z.string().min(3, "Zip/postal code required"),
    shippingCountry: z.string().min(2, "Country required"),
  });

  const cardOrderForm = useForm<z.infer<typeof cardOrderSchema>>({
    resolver: zodResolver(cardOrderSchema),
    defaultValues: {
      shippingName: "",
      shippingAddress: "",
      shippingCity: "",
      shippingState: "",
      shippingZip: "",
      shippingCountry: "",
    },
  });

  const cardOrderMutation = useMutation({
    mutationFn: async (data: z.infer<typeof cardOrderSchema>) => {
      if (!cardOrderMember) throw new Error("No member selected");
      const res = await apiRequest("POST", `/api/members/${cardOrderMember.id}/order-card`, data);
      return res.json();
    },
    onSuccess: () => {
      setCardOrderSuccess(true);
      if (registeredMember && cardOrderMember && registeredMember.id === cardOrderMember.id) {
        setRegisteredMember({ ...registeredMember, cardOrdered: true });
      }
      if (searchResult && cardOrderMember && searchResult.id === cardOrderMember.id) {
        setSearchResult({ ...searchResult, cardOrdered: true });
      }
      cardOrderForm.reset();
    },
    onError: (err: any) => {
      toast({ title: "Card Order Failed", description: err.message, variant: "destructive" });
    },
  });

  const openCardOrder = (member: Member) => {
    setCardOrderMember(member);
    setCardOrderSuccess(false);
    cardOrderForm.reset({
      shippingName: `${member.firstName} ${member.lastName}`,
      shippingAddress: "",
      shippingCity: member.city || "",
      shippingState: "",
      shippingZip: "",
      shippingCountry: member.country || "",
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard" });
  };

  const getRegionName = (regionId: string | null) => {
    if (!regionId || !regions) return null;
    return regions.find((r) => r.id === regionId)?.name || null;
  };

  const getChapterName = (chapterId: string | null) => {
    if (!chapterId || !allChapters) return null;
    return allChapters.find((c) => c.id === chapterId)?.name || null;
  };

  const onSubmit = (data: RegistrationData) => {
    registerMutation.mutate(data);
  };

  function MemberCard({ member, showEmail }: { member: Member; showEmail?: boolean }) {
    const m = member as any;
    return (
      <div className="max-w-2xl mx-auto rounded-lg overflow-hidden shadow-xl border-2 border-gray-300 dark:border-gray-700 bg-[#faf9f6] dark:bg-gray-950" style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>
        <div className="bg-gradient-to-r from-red-700 via-red-600 to-red-700 px-4 py-3">
          <div className="flex items-center justify-between">
            <img src={nupLogo} alt="NUP" className="w-14 h-14 rounded-full border-2 border-white/50 object-contain bg-white p-0.5" />
            <div className="text-center flex-1 px-2">
              <p className="text-white font-bold text-lg tracking-wide uppercase">National Unity Platform</p>
              <p className="text-red-200 text-xs tracking-widest uppercase">Diaspora Membership Card</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={member.isActive ? "bg-white text-red-700 hover:bg-white/90 text-xs" : "bg-white/20 text-white text-xs"}>
                {member.isActive ? "Active" : "Inactive"}
              </Badge>
              <img src={peoplePowerLogo} alt="People Power" className="w-14 h-14 rounded-full border-2 border-white/50 object-contain bg-white p-0.5" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 divide-x divide-gray-300 dark:divide-gray-700">
          <div className="p-5 space-y-3">
            <div>
              <span className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold">Card No.</span>
              <div className="border-b-2 border-gray-400 dark:border-gray-600 pb-0.5 mt-0.5 flex items-center justify-between">
                <span className="font-mono text-base font-bold text-blue-800 dark:text-blue-400" data-testid="text-membership-id">{member.membershipId}</span>
                <Button variant="ghost" size="icon" className="w-6 h-6 -mr-1" onClick={() => copyToClipboard(member.membershipId)} data-testid="button-copy-id">
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>
            <div>
              <span className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold">Date of Issue</span>
              <p className="border-b-2 border-gray-400 dark:border-gray-600 pb-0.5 mt-0.5 font-medium text-blue-800 dark:text-blue-400" style={{ fontFamily: "'Segoe Script', 'Comic Sans MS', cursive" }}>
                {member.joinedAt ? new Date(member.joinedAt).toLocaleDateString("en-GB") : "—"}
              </p>
            </div>
            <div>
              <span className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold">Name</span>
              <p className="border-b-2 border-gray-400 dark:border-gray-600 pb-0.5 mt-0.5 font-bold text-lg text-blue-800 dark:text-blue-400 uppercase" style={{ fontFamily: "'Segoe Script', 'Comic Sans MS', cursive" }} data-testid="text-member-name">
                {member.lastName} {member.firstName}
              </p>
            </div>
            <div>
              <span className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold">Phone Number</span>
              <p className="border-b-2 border-gray-400 dark:border-gray-600 pb-0.5 mt-0.5 font-medium text-blue-800 dark:text-blue-400" style={{ fontFamily: "'Segoe Script', 'Comic Sans MS', cursive" }}>
                {member.phone || "—"}
              </p>
            </div>
            <div>
              <span className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold">Date of Birth (DD/MM/YYYY)</span>
              <p className="border-b-2 border-gray-400 dark:border-gray-600 pb-0.5 mt-0.5 font-medium text-blue-800 dark:text-blue-400" style={{ fontFamily: "'Segoe Script', 'Comic Sans MS', cursive" }}>
                {member.dateOfBirth ? new Date(member.dateOfBirth).toLocaleDateString("en-GB") : "—"}
              </p>
            </div>
            <div>
              <span className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold">Email</span>
              <p className="border-b-2 border-gray-400 dark:border-gray-600 pb-0.5 mt-0.5 font-medium text-blue-800 dark:text-blue-400 text-sm break-all" data-testid="text-member-email" style={{ fontFamily: "'Segoe Script', 'Comic Sans MS', cursive" }}>
                {showEmail ? member.email : "••••@••••"}
              </p>
            </div>
            <div className="pt-3">
              <svg viewBox="0 0 200 80" className="w-full max-w-[260px] h-auto">
                <polygon points="0,10 40,40 0,70" fill="#1E3A5F" />
                <polygon points="55,80 55,30 105,80" fill="#1E3A5F" />
                <polygon points="95,0 175,80 95,80" fill="#DC2626" />
                <polygon points="105,0 175,0 175,70" fill="#DC2626" />
              </svg>
            </div>
          </div>

          <div className="p-5 space-y-3">
            <div>
              <span className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold">Country</span>
              <p className="border-b-2 border-gray-400 dark:border-gray-600 pb-0.5 mt-0.5 font-medium text-blue-800 dark:text-blue-400 uppercase" style={{ fontFamily: "'Segoe Script', 'Comic Sans MS', cursive" }}>
                {member.country}
              </p>
            </div>
            <div>
              <span className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold">Region</span>
              <p className="border-b-2 border-gray-400 dark:border-gray-600 pb-0.5 mt-0.5 font-medium text-blue-800 dark:text-blue-400 uppercase" style={{ fontFamily: "'Segoe Script', 'Comic Sans MS', cursive" }}>
                {getRegionName(member.regionId) || "—"}
              </p>
            </div>
            <div>
              <span className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold">Chapter</span>
              <p className="border-b-2 border-gray-400 dark:border-gray-600 pb-0.5 mt-0.5 font-medium text-blue-800 dark:text-blue-400 uppercase" style={{ fontFamily: "'Segoe Script', 'Comic Sans MS', cursive" }}>
                {getChapterName(member.chapterId) || "—"}
              </p>
            </div>
            <div>
              <span className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold">City / State</span>
              <p className="border-b-2 border-gray-400 dark:border-gray-600 pb-0.5 mt-0.5 font-medium text-blue-800 dark:text-blue-400 uppercase" style={{ fontFamily: "'Segoe Script', 'Comic Sans MS', cursive" }}>
                {[member.city, m.mailingState].filter(Boolean).join(", ") || "—"}
              </p>
            </div>
            <div>
              <span className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold">Mailing Address</span>
              <p className="border-b-2 border-gray-400 dark:border-gray-600 pb-0.5 mt-0.5 font-medium text-blue-800 dark:text-blue-400" style={{ fontFamily: "'Segoe Script', 'Comic Sans MS', cursive" }}>
                {m.mailingAddress ? `${m.mailingAddress}${m.mailingCity ? `, ${m.mailingCity}` : ""}${m.mailingZip ? ` ${m.mailingZip}` : ""}` : "—"}
              </p>
            </div>
            <div className="pt-4 flex items-end justify-between">
              <div className="text-center">
                <div className="border-b-2 border-gray-400 dark:border-gray-600 w-28 mb-1" />
                <span className="text-[9px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">Holder's Signature</span>
              </div>
              <div className="text-center">
                <div className="border-b-2 border-gray-400 dark:border-gray-600 w-20 mb-1" />
                <span className="text-[9px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">Party President</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <SEO
        title="Become a Member"
        description="Join the National Unity Platform (NUP) Diaspora. Register as a member to connect with Ugandans worldwide, participate in chapter activities, attend events, and support the movement for democracy in Uganda."
        keywords="NUP membership, join People Power, NUP diaspora member, Uganda diaspora registration, NUP chapter member, People Power membership, join NUP, Uganda democracy membership"
      />
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">Join the Movement</Badge>
          <h1 className="text-4xl font-bold mb-4">NUP Membership</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Become part of the National Unity Platform Diaspora. Register as a member
            or retrieve your existing membership information.
          </p>
          <div className="mt-4">
            <Link href="/membership-tiers">
              <Button variant="outline" data-testid="link-membership-tiers">
                <Crown className="w-4 h-4 mr-2" />
                View Premium Membership Tiers
              </Button>
            </Link>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <Tabs defaultValue="register" className="space-y-8">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="register" data-testid="tab-register">
                <UserPlus className="w-4 h-4 mr-2" />
                Register
              </TabsTrigger>
              <TabsTrigger value="search" data-testid="tab-search">
                <Search className="w-4 h-4 mr-2" />
                Find Membership
              </TabsTrigger>
            </TabsList>

            <TabsContent value="register">
              {registeredMember ? (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2" data-testid="text-registration-success">Registration Successful!</h2>
                    <p className="text-muted-foreground">
                      Welcome to the NUP Diaspora family. Please save your membership ID below.
                    </p>
                  </div>

                  <MemberCard member={registeredMember} showEmail />

                  {!registeredMember.cardOrdered && (
                    <Card className="border-primary/20">
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                            <CreditCard className="w-6 h-6 text-primary" />
                          </div>
                          <div className="flex-1 space-y-3">
                            <div>
                              <h3 className="font-semibold text-lg">Order Physical Membership Card</h3>
                              <p className="text-sm text-muted-foreground">
                                Get an official NUP Diaspora physical membership card delivered to your address.
                              </p>
                            </div>
                            <div className="flex items-center justify-between gap-4 flex-wrap">
                              <Badge variant="secondary">$50.00</Badge>
                              <Button onClick={() => openCardOrder(registeredMember)} data-testid="button-order-card">
                                <CreditCard className="w-4 h-4 mr-2" />
                                Order Card
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <Shield className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium text-amber-800 dark:text-amber-200 mb-1">Save Your Membership ID</p>
                      <p className="text-amber-700 dark:text-amber-300">
                        Your membership ID <strong className="font-mono">{registeredMember.membershipId}</strong> is your unique identifier.
                        Use it to look up your membership status anytime. If SMTP is configured, a confirmation email will be sent to your address.
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setRegisteredMember(null)}
                    data-testid="button-register-another"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Register Another Member
                  </Button>
                </div>
              ) : (
                <div className="max-w-2xl mx-auto">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)}>
                    <div className="rounded-lg overflow-hidden shadow-2xl border-2 border-gray-300 dark:border-gray-700 bg-[#faf9f6] dark:bg-gray-950" style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>
                      <div className="bg-gradient-to-r from-red-700 via-red-600 to-red-700 px-4 py-3">
                        <div className="flex items-center justify-between">
                          <img src={nupLogo} alt="NUP" className="w-14 h-14 rounded-full border-2 border-white/50 object-contain bg-white p-0.5" />
                          <div className="text-center flex-1 px-2">
                            <p className="text-white font-bold text-lg tracking-wide uppercase">National Unity Platform</p>
                            <p className="text-red-200 text-xs tracking-widest uppercase">Diaspora Membership Registration</p>
                          </div>
                          <img src={peoplePowerLogo} alt="People Power" className="w-14 h-14 rounded-full border-2 border-white/50 object-contain bg-white p-0.5" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 md:divide-x divide-gray-300 dark:divide-gray-700">
                        <div className="p-5 space-y-4">
                          <div>
                            <span className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold">Card No.</span>
                            <div className="border-b-2 border-gray-400 dark:border-gray-600 pb-0.5 mt-0.5">
                              <span className="font-mono text-sm text-gray-400 italic">Auto-assigned on registration</span>
                            </div>
                          </div>

                          <FormField control={form.control} name="lastName" render={({ field }) => (
                            <FormItem className="space-y-0">
                              <FormLabel className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold mb-0">Name (Surname)</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="KAKONGE" className="border-b-2 border-gray-400 dark:border-gray-600 border-t-0 border-x-0 rounded-none bg-transparent focus-visible:ring-0 px-0 font-bold text-blue-800 dark:text-blue-400 uppercase h-8" style={{ fontFamily: "'Segoe Script', 'Comic Sans MS', cursive" }} data-testid="input-last-name" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />

                          <FormField control={form.control} name="firstName" render={({ field }) => (
                            <FormItem className="space-y-0">
                              <FormLabel className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold mb-0">Other Names</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="SUDAISI" className="border-b-2 border-gray-400 dark:border-gray-600 border-t-0 border-x-0 rounded-none bg-transparent focus-visible:ring-0 px-0 font-bold text-blue-800 dark:text-blue-400 uppercase h-8" style={{ fontFamily: "'Segoe Script', 'Comic Sans MS', cursive" }} data-testid="input-first-name" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />

                          <FormField control={form.control} name="phone" render={({ field }) => (
                            <FormItem className="space-y-0">
                              <FormLabel className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold mb-0">Phone Number</FormLabel>
                              <FormControl>
                                <Input type="tel" {...field} placeholder="+1 (555) 123-4567" className="border-b-2 border-gray-400 dark:border-gray-600 border-t-0 border-x-0 rounded-none bg-transparent focus-visible:ring-0 px-0 font-medium text-blue-800 dark:text-blue-400 h-8" style={{ fontFamily: "'Segoe Script', 'Comic Sans MS', cursive" }} data-testid="input-phone" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />

                          <FormField control={form.control} name="dateOfBirth" render={({ field }) => (
                            <FormItem className="space-y-0">
                              <FormLabel className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold mb-0">Date of Birth (DD/MM/YYYY)</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} className="border-b-2 border-gray-400 dark:border-gray-600 border-t-0 border-x-0 rounded-none bg-transparent focus-visible:ring-0 px-0 font-medium text-blue-800 dark:text-blue-400 h-8" data-testid="input-dob" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />

                          <FormField control={form.control} name="email" render={({ field }) => (
                            <FormItem className="space-y-0">
                              <FormLabel className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold mb-0">Email Address</FormLabel>
                              <FormControl>
                                <Input type="email" {...field} placeholder="john@example.com" className="border-b-2 border-gray-400 dark:border-gray-600 border-t-0 border-x-0 rounded-none bg-transparent focus-visible:ring-0 px-0 font-medium text-blue-800 dark:text-blue-400 h-8" style={{ fontFamily: "'Segoe Script', 'Comic Sans MS', cursive" }} data-testid="input-email" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />

                          <div className="grid grid-cols-2 gap-3">
                            <FormField control={form.control} name="sex" render={({ field }) => (
                              <FormItem className="space-y-0">
                                <FormLabel className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold mb-0">Sex</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="border-b-2 border-gray-400 dark:border-gray-600 border-t-0 border-x-0 rounded-none bg-transparent focus-visible:ring-0 px-0 font-medium text-blue-800 dark:text-blue-400 shadow-none h-8" data-testid="select-sex">
                                      <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="Male">Male</SelectItem>
                                    <SelectItem value="Female">Female</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )} />
                            <FormField control={form.control} name="nationality" render={({ field }) => (
                              <FormItem className="space-y-0">
                                <FormLabel className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold mb-0">Nationality</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="Ugandan" className="border-b-2 border-gray-400 dark:border-gray-600 border-t-0 border-x-0 rounded-none bg-transparent focus-visible:ring-0 px-0 font-medium text-blue-800 dark:text-blue-400 h-8" style={{ fontFamily: "'Segoe Script', 'Comic Sans MS', cursive" }} data-testid="input-nationality" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                          </div>

                          <div className="pt-3">
                            <svg viewBox="0 0 200 80" className="w-full max-w-[260px] h-auto">
                              <polygon points="0,10 40,40 0,70" fill="#1E3A5F" />
                              <polygon points="55,80 55,30 105,80" fill="#1E3A5F" />
                              <polygon points="95,0 175,80 95,80" fill="#DC2626" />
                              <polygon points="105,0 175,0 175,70" fill="#DC2626" />
                            </svg>
                          </div>
                        </div>

                        <div className="p-5 space-y-4 border-t md:border-t-0 border-gray-300 dark:border-gray-700">
                          <FormField control={form.control} name="country" render={({ field }) => (
                            <FormItem className="space-y-0">
                              <FormLabel className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold mb-0">Country</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger className="border-b-2 border-gray-400 dark:border-gray-600 border-t-0 border-x-0 rounded-none bg-transparent focus-visible:ring-0 px-0 font-medium text-blue-800 dark:text-blue-400 shadow-none h-8 uppercase" data-testid="select-country">
                                    <SelectValue placeholder="Select country" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {COUNTRIES.map((c) => (
                                    <SelectItem key={c} value={c}>{c}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )} />

                          <FormField control={form.control} name="regionId" render={({ field }) => (
                            <FormItem className="space-y-0">
                              <FormLabel className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold mb-0">Region</FormLabel>
                              <Select onValueChange={(val) => { field.onChange(val); form.setValue("chapterId", ""); }} value={field.value}>
                                <FormControl>
                                  <SelectTrigger className="border-b-2 border-gray-400 dark:border-gray-600 border-t-0 border-x-0 rounded-none bg-transparent focus-visible:ring-0 px-0 font-medium text-blue-800 dark:text-blue-400 shadow-none h-8 uppercase" data-testid="select-region">
                                    <SelectValue placeholder="Select region" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {regions?.map((r) => (
                                    <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )} />

                          <FormField control={form.control} name="chapterId" render={({ field }) => (
                            <FormItem className="space-y-0">
                              <FormLabel className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold mb-0">Chapter</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value} disabled={!selectedRegionId || !chaptersForRegion?.length}>
                                <FormControl>
                                  <SelectTrigger className="border-b-2 border-gray-400 dark:border-gray-600 border-t-0 border-x-0 rounded-none bg-transparent focus-visible:ring-0 px-0 font-medium text-blue-800 dark:text-blue-400 shadow-none h-8 uppercase" data-testid="select-chapter">
                                    <SelectValue placeholder={!selectedRegionId ? "Select region first" : chaptersForRegion?.length ? "Select chapter" : "No chapters available"} />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {chaptersForRegion?.map((c) => (
                                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )} />

                          <FormField control={form.control} name="city" render={({ field }) => (
                            <FormItem className="space-y-0">
                              <FormLabel className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold mb-0">City / State</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Your city" className="border-b-2 border-gray-400 dark:border-gray-600 border-t-0 border-x-0 rounded-none bg-transparent focus-visible:ring-0 px-0 font-medium text-blue-800 dark:text-blue-400 uppercase h-8" style={{ fontFamily: "'Segoe Script', 'Comic Sans MS', cursive" }} data-testid="input-city" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />

                          <FormField control={form.control} name="mailingAddress" render={({ field }) => (
                            <FormItem className="space-y-0">
                              <FormLabel className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold mb-0">Mailing Address</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="123 Main St, Apt 4" className="border-b-2 border-gray-400 dark:border-gray-600 border-t-0 border-x-0 rounded-none bg-transparent focus-visible:ring-0 px-0 font-medium text-blue-800 dark:text-blue-400 h-8" style={{ fontFamily: "'Segoe Script', 'Comic Sans MS', cursive" }} data-testid="input-mailing-address" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />

                          <div className="grid grid-cols-2 gap-3">
                            <FormField control={form.control} name="mailingCity" render={({ field }) => (
                              <FormItem className="space-y-0">
                                <FormLabel className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold mb-0">Mail City</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="City" className="border-b-2 border-gray-400 dark:border-gray-600 border-t-0 border-x-0 rounded-none bg-transparent focus-visible:ring-0 px-0 font-medium text-blue-800 dark:text-blue-400 h-8" style={{ fontFamily: "'Segoe Script', 'Comic Sans MS', cursive" }} data-testid="input-mailing-city" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                            <FormField control={form.control} name="mailingState" render={({ field }) => (
                              <FormItem className="space-y-0">
                                <FormLabel className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold mb-0">State</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="State" className="border-b-2 border-gray-400 dark:border-gray-600 border-t-0 border-x-0 rounded-none bg-transparent focus-visible:ring-0 px-0 font-medium text-blue-800 dark:text-blue-400 h-8" style={{ fontFamily: "'Segoe Script', 'Comic Sans MS', cursive" }} data-testid="input-mailing-state" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <FormField control={form.control} name="mailingZip" render={({ field }) => (
                              <FormItem className="space-y-0">
                                <FormLabel className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold mb-0">Zip Code</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="12345" className="border-b-2 border-gray-400 dark:border-gray-600 border-t-0 border-x-0 rounded-none bg-transparent focus-visible:ring-0 px-0 font-medium text-blue-800 dark:text-blue-400 h-8" style={{ fontFamily: "'Segoe Script', 'Comic Sans MS', cursive" }} data-testid="input-mailing-zip" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                            <FormField control={form.control} name="mailingCountry" render={({ field }) => (
                              <FormItem className="space-y-0">
                                <FormLabel className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold mb-0">Country</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="Country" className="border-b-2 border-gray-400 dark:border-gray-600 border-t-0 border-x-0 rounded-none bg-transparent focus-visible:ring-0 px-0 font-medium text-blue-800 dark:text-blue-400 h-8" style={{ fontFamily: "'Segoe Script', 'Comic Sans MS', cursive" }} data-testid="input-mailing-country" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                          </div>

                          <FormField control={form.control} name="membershipType" render={({ field }) => (
                            <FormItem className="space-y-0">
                              <FormLabel className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold mb-0">Membership Type</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger className="border-b-2 border-gray-400 dark:border-gray-600 border-t-0 border-x-0 rounded-none bg-transparent focus-visible:ring-0 px-0 font-medium text-blue-800 dark:text-blue-400 shadow-none h-8" data-testid="select-membership-type">
                                    <SelectValue placeholder="Select type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="regular">Regular Member</SelectItem>
                                  <SelectItem value="supporter">Supporter</SelectItem>
                                  <SelectItem value="volunteer">Volunteer</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )} />

                          <div className="pt-1 flex items-end justify-between">
                            <div className="text-center">
                              <div className="border-b-2 border-gray-400 dark:border-gray-600 w-28 mb-1" />
                              <span className="text-[9px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">Holder's Signature</span>
                            </div>
                            <div className="text-center">
                              <div className="border-b-2 border-gray-400 dark:border-gray-600 w-20 mb-1" />
                              <span className="text-[9px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">Party President</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-gray-300 dark:border-gray-700 p-4 space-y-3 bg-gray-50/50 dark:bg-gray-900/50">
                        <div className="flex items-center justify-between gap-4">
                          <div className="space-y-0.5">
                            <Label htmlFor="existing-card-toggle" className="text-xs font-medium">I have an existing membership card</Label>
                            <p className="text-[10px] text-muted-foreground">Enter your physical card number if you have one</p>
                          </div>
                          <Switch id="existing-card-toggle" checked={hasExistingCard} onCheckedChange={(checked) => { setHasExistingCard(checked); if (!checked) form.setValue("cardNumber", ""); }} data-testid="switch-existing-card" />
                        </div>
                        {hasExistingCard && (
                          <FormField control={form.control} name="cardNumber" render={({ field }) => (
                            <FormItem className="space-y-0">
                              <FormLabel className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold">Existing Card Number</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Enter your card number" className="border-b-2 border-gray-400 dark:border-gray-600 border-t-0 border-x-0 rounded-none bg-transparent focus-visible:ring-0 px-0 font-medium text-blue-800 dark:text-blue-400 h-8" data-testid="input-card-number" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                        )}

                        <Button
                          type="submit"
                          className="w-full bg-red-700 hover:bg-red-800 text-white font-bold text-base h-12 shadow-lg"
                          disabled={registerMutation.isPending}
                          data-testid="button-register"
                        >
                          {registerMutation.isPending ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Registering...</>
                          ) : (
                            <><UserPlus className="w-5 h-5 mr-2" /> Register as Member</>
                          )}
                        </Button>
                      </div>
                    </div>
                  </form>
                </Form>
              </div>
              )}
            </TabsContent>

            <TabsContent value="search">
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <IdCard className="w-5 h-5 text-primary" />
                    Find Your Membership
                  </h2>
                  <CardDescription>
                    Enter your membership ID or registered email to retrieve your membership details
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Membership ID or Email"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        data-testid="input-search-membership"
                      />
                      <Button
                        onClick={handleSearch}
                        disabled={isSearching}
                        data-testid="button-search-membership"
                      >
                        <Search className="w-4 h-4 mr-2" />
                        {isSearching ? "Searching..." : "Search"}
                      </Button>
                    </div>

                    {searchError && (
                      <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-sm">
                        {searchError}
                      </div>
                    )}

                    {searchResult && (
                      <div className="space-y-4">
                        <MemberCard member={searchResult} showEmail />
                        {!searchResult.cardOrdered && (
                          <Button variant="outline" className="w-full" onClick={() => openCardOrder(searchResult)} data-testid="button-order-card-search">
                            <CreditCard className="w-4 h-4 mr-2" />
                            Order Physical Membership Card — $50.00
                          </Button>
                        )}
                        {searchResult.cardOrdered && (
                          <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg text-sm">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-green-800 dark:text-green-200">Physical membership card ordered</span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-md">
                      <Shield className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div className="text-sm text-muted-foreground">
                        <p className="font-medium text-foreground mb-1">Secure Search</p>
                        <p>Your membership information is securely stored and can only be retrieved with your membership ID or registered email address.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Dialog open={!!cardOrderMember} onOpenChange={(open) => { if (!open) { setCardOrderMember(null); setCardOrderSuccess(false); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              <CreditCard className="w-5 h-5 inline mr-2" />
              Order Physical Membership Card
            </DialogTitle>
            <DialogDescription>
              Official NUP Diaspora membership card — $50.00
            </DialogDescription>
          </DialogHeader>

          {cardOrderSuccess ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold" data-testid="text-card-order-success">Card Order Placed!</h3>
              <p className="text-muted-foreground text-sm">
                Your physical membership card for <strong>{cardOrderMember?.firstName} {cardOrderMember?.lastName}</strong> has been ordered.
                You will receive it at the shipping address provided.
              </p>
              <Button onClick={() => { setCardOrderMember(null); setCardOrderSuccess(false); }} className="w-full" data-testid="button-close-card-order">
                Close
              </Button>
            </div>
          ) : (
            <Form {...cardOrderForm}>
              <form onSubmit={cardOrderForm.handleSubmit((data) => cardOrderMutation.mutate(data))} className="space-y-4">
                <div className="p-3 bg-muted/50 rounded-lg text-sm">
                  <p>Ordering for: <strong>{cardOrderMember?.firstName} {cardOrderMember?.lastName}</strong></p>
                  <p className="text-muted-foreground">ID: {cardOrderMember?.membershipId}</p>
                </div>

                <FormField control={cardOrderForm.control} name="shippingName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name (as on card)</FormLabel>
                    <FormControl><Input {...field} data-testid="input-card-shipping-name" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={cardOrderForm.control} name="shippingAddress" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street Address</FormLabel>
                    <FormControl><Input {...field} placeholder="123 Main St, Apt 4" data-testid="input-card-shipping-address" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="grid grid-cols-2 gap-3">
                  <FormField control={cardOrderForm.control} name="shippingCity" render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl><Input {...field} data-testid="input-card-shipping-city" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={cardOrderForm.control} name="shippingState" render={({ field }) => (
                    <FormItem>
                      <FormLabel>State/Province</FormLabel>
                      <FormControl><Input {...field} data-testid="input-card-shipping-state" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <FormField control={cardOrderForm.control} name="shippingZip" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Zip / Postal Code</FormLabel>
                      <FormControl><Input {...field} data-testid="input-card-shipping-zip" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={cardOrderForm.control} name="shippingCountry" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl><Input {...field} data-testid="input-card-shipping-country" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <Separator />

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Physical Membership Card</span>
                  <span className="font-bold text-lg">$50.00</span>
                </div>

                <Button type="submit" className="w-full" disabled={cardOrderMutation.isPending} data-testid="button-submit-card-order">
                  {cardOrderMutation.isPending ? "Processing..." : "Place Order — $50.00"}
                </Button>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
