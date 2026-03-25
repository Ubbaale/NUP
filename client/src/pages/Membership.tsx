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
import nupLogo from "@/assets/images/nup-official-logo.png";
import peoplePowerLogo from "@assets/download_(5)_1772752192596.jpg";

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
    return (
      <div className="rounded-2xl overflow-hidden shadow-xl border-2 border-red-200 dark:border-red-900/50 max-w-xl mx-auto">
        <div className="bg-gradient-to-r from-red-700 via-red-600 to-red-700 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={nupLogo} alt="NUP" className="w-10 h-10 rounded-full border-2 border-white/30 object-cover bg-white" />
              <div>
                <p className="text-white font-extrabold text-sm tracking-wide uppercase">National Unity Platform</p>
                <p className="text-red-100 text-[10px] tracking-widest uppercase">Diaspora Membership Card</p>
              </div>
            </div>
            <Badge className={member.isActive ? "bg-white text-red-700 hover:bg-white/90" : "bg-white/20 text-white"}>
              {member.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>
        <div className="h-1 bg-gradient-to-r from-red-600 via-yellow-400 to-blue-600" />
        <div className="bg-white dark:bg-gray-950 px-6 py-5 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-red-50 dark:bg-red-950/30 rounded-full flex items-center justify-center border-2 border-red-200 dark:border-red-800">
              <CheckCircle className="w-7 h-7 text-red-600" />
            </div>
            <div>
              <h3 className="font-bold text-xl" data-testid="text-member-name">
                {member.firstName} {member.lastName}
              </h3>
              <p className="text-sm text-muted-foreground capitalize">{member.membershipType} Member</p>
            </div>
          </div>

          <div className="bg-red-50 dark:bg-red-950/20 rounded-lg p-3 text-center border border-red-100 dark:border-red-900/30">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Membership No.</p>
            <div className="flex items-center justify-center gap-2">
              <p className="font-mono text-2xl font-bold text-red-700 dark:text-red-400" data-testid="text-membership-id">
                {member.membershipId}
              </p>
              <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => copyToClipboard(member.membershipId)} data-testid="button-copy-id">
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            {showEmail && (
              <div className="space-y-0.5">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Email</p>
                <p className="font-medium" data-testid="text-member-email">{member.email}</p>
              </div>
            )}
            <div className="space-y-0.5">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Location</p>
              <p className="font-medium">{member.city ? `${member.city}, ` : ""}{member.country}</p>
            </div>
            {member.phone && (
              <div className="space-y-0.5">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Phone</p>
                <p className="font-medium">{member.phone}</p>
              </div>
            )}
            {member.dateOfBirth && (
              <div className="space-y-0.5">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Date of Birth</p>
                <p className="font-medium">{new Date(member.dateOfBirth).toLocaleDateString()}</p>
              </div>
            )}
            {(member as any).sex && (
              <div className="space-y-0.5">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Sex</p>
                <p className="font-medium">{(member as any).sex}</p>
              </div>
            )}
            {(member as any).nationality && (
              <div className="space-y-0.5">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Nationality</p>
                <p className="font-medium">{(member as any).nationality}</p>
              </div>
            )}
            {getRegionName(member.regionId) && (
              <div className="space-y-0.5">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Region</p>
                <p className="font-medium">{getRegionName(member.regionId)}</p>
              </div>
            )}
            {getChapterName(member.chapterId) && (
              <div className="space-y-0.5">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Chapter</p>
                <p className="font-medium">{getChapterName(member.chapterId)}</p>
              </div>
            )}
            {member.joinedAt && (
              <div className="space-y-0.5">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Member Since</p>
                <p className="font-medium">{new Date(member.joinedAt).toLocaleDateString()}</p>
              </div>
            )}
          </div>
        </div>
        <div className="bg-gradient-to-r from-red-700 via-red-600 to-red-700 px-6 py-2">
          <p className="text-red-100 text-[10px] text-center tracking-wide">People Power — Our Power</p>
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
                <div className="max-w-xl mx-auto">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)}>
                    <div className="rounded-2xl overflow-hidden shadow-2xl border-2 border-red-200 dark:border-red-900/50">
                      <div className="bg-gradient-to-r from-red-700 via-red-600 to-red-700 px-6 py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <img src={nupLogo} alt="NUP" className="w-12 h-12 rounded-full border-2 border-white/30 object-cover bg-white" />
                            <div>
                              <p className="text-white font-extrabold text-lg tracking-wide uppercase">National Unity Platform</p>
                              <p className="text-red-100 text-xs tracking-widest uppercase">Diaspora Membership Card</p>
                            </div>
                          </div>
                          <img src={peoplePowerLogo} alt="People Power" className="w-11 h-11 rounded-full border-2 border-white/30 object-cover" />
                        </div>
                      </div>

                      <div className="h-1.5 bg-gradient-to-r from-red-600 via-yellow-400 to-blue-600" />

                      <div className="bg-white dark:bg-gray-950 px-6 py-6 space-y-5">
                        <div className="flex items-center gap-2 mb-1">
                          <IdCard className="w-4 h-4 text-red-600" />
                          <span className="text-xs font-semibold text-red-600 uppercase tracking-wider">Member Registration</span>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <FormField control={form.control} name="lastName" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Surname</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Doe" className="border-b-2 border-t-0 border-x-0 rounded-none bg-transparent focus-visible:ring-0 px-0 font-medium" data-testid="input-last-name" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name="firstName" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Other Names</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="John" className="border-b-2 border-t-0 border-x-0 rounded-none bg-transparent focus-visible:ring-0 px-0 font-medium" data-testid="input-first-name" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <FormField control={form.control} name="dateOfBirth" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Date of Birth</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} className="border-b-2 border-t-0 border-x-0 rounded-none bg-transparent focus-visible:ring-0 px-0 font-medium text-sm" data-testid="input-dob" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name="sex" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Sex</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger className="border-b-2 border-t-0 border-x-0 rounded-none bg-transparent focus-visible:ring-0 px-0 font-medium shadow-none" data-testid="select-sex">
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
                            <FormItem>
                              <FormLabel className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Nationality</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Ugandan" className="border-b-2 border-t-0 border-x-0 rounded-none bg-transparent focus-visible:ring-0 px-0 font-medium" data-testid="input-nationality" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                        </div>

                        <FormField control={form.control} name="email" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Email Address</FormLabel>
                            <FormControl>
                              <Input type="email" {...field} placeholder="john@example.com" className="border-b-2 border-t-0 border-x-0 rounded-none bg-transparent focus-visible:ring-0 px-0 font-medium" data-testid="input-email" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />

                        <div className="grid grid-cols-2 gap-4">
                          <FormField control={form.control} name="phone" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Phone (Optional)</FormLabel>
                              <FormControl>
                                <Input type="tel" {...field} placeholder="+1 (555) 123-4567" className="border-b-2 border-t-0 border-x-0 rounded-none bg-transparent focus-visible:ring-0 px-0 font-medium" data-testid="input-phone" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name="country" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Country of Residence</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger className="border-b-2 border-t-0 border-x-0 rounded-none bg-transparent focus-visible:ring-0 px-0 font-medium shadow-none" data-testid="select-country">
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
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <FormField control={form.control} name="city" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">City (Optional)</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Your city" className="border-b-2 border-t-0 border-x-0 rounded-none bg-transparent focus-visible:ring-0 px-0 font-medium" data-testid="input-city" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name="regionId" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Region (Optional)</FormLabel>
                              <Select onValueChange={(val) => { field.onChange(val); form.setValue("chapterId", ""); }} value={field.value}>
                                <FormControl>
                                  <SelectTrigger className="border-b-2 border-t-0 border-x-0 rounded-none bg-transparent focus-visible:ring-0 px-0 font-medium shadow-none" data-testid="select-region">
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
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <FormField control={form.control} name="chapterId" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Chapter (Optional)</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value} disabled={!selectedRegionId || !chaptersForRegion?.length}>
                                <FormControl>
                                  <SelectTrigger className="border-b-2 border-t-0 border-x-0 rounded-none bg-transparent focus-visible:ring-0 px-0 font-medium shadow-none" data-testid="select-chapter">
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
                          <FormField control={form.control} name="membershipType" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Membership Type</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger className="border-b-2 border-t-0 border-x-0 rounded-none bg-transparent focus-visible:ring-0 px-0 font-medium shadow-none" data-testid="select-membership-type">
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
                        </div>

                        <div className="pt-2 space-y-3">
                          <div className="flex items-center justify-between gap-4">
                            <div className="space-y-0.5">
                              <Label htmlFor="existing-card-toggle" className="text-xs font-medium">I have an existing membership card</Label>
                              <p className="text-[10px] text-muted-foreground">Enter your physical card number if you have one</p>
                            </div>
                            <Switch id="existing-card-toggle" checked={hasExistingCard} onCheckedChange={(checked) => { setHasExistingCard(checked); if (!checked) form.setValue("cardNumber", ""); }} data-testid="switch-existing-card" />
                          </div>
                          {hasExistingCard && (
                            <FormField control={form.control} name="cardNumber" render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Card Number</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="Enter your card number" className="border-b-2 border-t-0 border-x-0 rounded-none bg-transparent focus-visible:ring-0 px-0 font-medium" data-testid="input-card-number" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                          )}
                        </div>

                        <div className="bg-muted/30 rounded-lg p-3 text-center">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Membership No. will be assigned upon registration</p>
                          <p className="font-mono text-lg text-muted-foreground/40 font-bold mt-1">NUP-XX-XXXXXX</p>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-red-700 via-red-600 to-red-700 px-6 py-4">
                        <Button
                          type="submit"
                          className="w-full bg-white text-red-700 hover:bg-red-50 font-bold text-base h-12 shadow-lg"
                          disabled={registerMutation.isPending}
                          data-testid="button-register"
                        >
                          {registerMutation.isPending ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Registering...</>
                          ) : (
                            <><UserPlus className="w-5 h-5 mr-2" /> Register as Member</>
                          )}
                        </Button>
                        <p className="text-red-100 text-[10px] text-center mt-2 tracking-wide">People Power — Our Power</p>
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
