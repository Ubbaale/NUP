import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
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
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import type { Region, Chapter, Member } from "@shared/schema";

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
  country: z.string().min(1, "Please select your country"),
  city: z.string().optional(),
  regionId: z.string().optional(),
  chapterId: z.string().optional(),
  membershipType: z.string().default("regular"),
});

type RegistrationData = z.infer<typeof registrationSchema>;

export default function Membership() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState<Member | null>(null);
  const [searchError, setSearchError] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [registeredMember, setRegisteredMember] = useState<Member | null>(null);

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
      country: "",
      city: "",
      regionId: "",
      chapterId: "",
      membershipType: "regular",
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
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 overflow-hidden">
        <div className="bg-primary px-6 py-3">
          <div className="flex items-center justify-between">
            <span className="text-white/80 text-xs font-medium uppercase tracking-wider">NUP Diaspora</span>
            <Badge
              variant={member.isActive ? "default" : "secondary"}
              className={member.isActive ? "bg-white text-primary" : ""}
            >
              {member.isActive ? "Active Member" : "Inactive"}
            </Badge>
          </div>
        </div>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center">
              <CheckCircle className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-xl" data-testid="text-member-name">
                {member.firstName} {member.lastName}
              </h3>
              <p className="text-sm text-muted-foreground capitalize">{member.membershipType} Member</p>
            </div>
          </div>

          <div className="bg-background rounded-lg p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Membership ID</p>
            <div className="flex items-center justify-center gap-2">
              <p className="font-mono text-2xl font-bold text-primary" data-testid="text-membership-id">
                {member.membershipId}
              </p>
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8"
                onClick={() => copyToClipboard(member.membershipId)}
                data-testid="button-copy-id"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-3 text-sm">
            {showEmail && (
              <div className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-muted-foreground text-xs">Email</p>
                  <p className="font-medium" data-testid="text-member-email">{member.email}</p>
                </div>
              </div>
            )}
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-muted-foreground text-xs">Location</p>
                <p className="font-medium">
                  {member.city ? `${member.city}, ` : ""}{member.country}
                </p>
              </div>
            </div>
            {member.phone && (
              <div className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-muted-foreground text-xs">Phone</p>
                  <p className="font-medium">{member.phone}</p>
                </div>
              </div>
            )}
            {getRegionName(member.regionId) && (
              <div className="flex items-start gap-2">
                <Globe2 className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-muted-foreground text-xs">Region</p>
                  <p className="font-medium">{getRegionName(member.regionId)}</p>
                </div>
              </div>
            )}
            {getChapterName(member.chapterId) && (
              <div className="flex items-start gap-2">
                <Building className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-muted-foreground text-xs">Chapter</p>
                  <p className="font-medium">{getChapterName(member.chapterId)}</p>
                </div>
              </div>
            )}
            {member.dateOfBirth && (
              <div className="flex items-start gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-muted-foreground text-xs">Date of Birth</p>
                  <p className="font-medium">{new Date(member.dateOfBirth).toLocaleDateString()}</p>
                </div>
              </div>
            )}
            {member.joinedAt && (
              <div className="flex items-start gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-muted-foreground text-xs">Member Since</p>
                  <p className="font-medium">{new Date(member.joinedAt).toLocaleDateString()}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="min-h-screen py-8">
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
                <Card>
                  <CardHeader>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary" />
                      Member Registration
                    </h2>
                    <CardDescription>
                      Fill out the form below to become a registered member of NUP Diaspora
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="firstName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>First Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="John" {...field} data-testid="input-first-name" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="lastName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Last Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Doe" {...field} data-testid="input-last-name" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email Address</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="john@example.com" {...field} data-testid="input-email" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Phone Number (Optional)</FormLabel>
                                <FormControl>
                                  <Input type="tel" placeholder="+1 (555) 123-4567" {...field} data-testid="input-phone" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="dateOfBirth"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Date of Birth (Optional)</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} data-testid="input-dob" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="country"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Country</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger data-testid="select-country">
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
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="city"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>City (Optional)</FormLabel>
                                <FormControl>
                                  <Input placeholder="New York" {...field} data-testid="input-city" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <Separator />

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="regionId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Region (Optional)</FormLabel>
                                <Select
                                  onValueChange={(val) => {
                                    field.onChange(val);
                                    form.setValue("chapterId", "");
                                  }}
                                  value={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger data-testid="select-region">
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
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="chapterId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Chapter (Optional)</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value}
                                  disabled={!selectedRegionId || !chaptersForRegion?.length}
                                >
                                  <FormControl>
                                    <SelectTrigger data-testid="select-chapter">
                                      <SelectValue placeholder={
                                        !selectedRegionId
                                          ? "Select region first"
                                          : chaptersForRegion?.length
                                            ? "Select chapter"
                                            : "No chapters available"
                                      } />
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
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="membershipType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Membership Type</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-membership-type">
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
                          )}
                        />

                        <Button
                          type="submit"
                          className="w-full"
                          disabled={registerMutation.isPending}
                          data-testid="button-register"
                        >
                          {registerMutation.isPending ? "Registering..." : "Register as Member"}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
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
                      <MemberCard member={searchResult} showEmail />
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
    </div>
  );
}
