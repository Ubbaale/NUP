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
import { Users, Search, CheckCircle, UserPlus, IdCard, Shield, Crown } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import type { Region, Member } from "@shared/schema";

const registrationSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().optional(),
  country: z.string().min(1, "Please select your country"),
  city: z.string().optional(),
  membershipType: z.string().default("regular"),
});

type RegistrationData = z.infer<typeof registrationSchema>;

export default function Membership() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState<Member | null>(null);
  const [searchError, setSearchError] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const { data: regions } = useQuery<Region[]>({
    queryKey: ["/api/regions"],
  });

  const form = useForm<RegistrationData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      country: "",
      city: "",
      membershipType: "regular",
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegistrationData) => {
      return apiRequest("POST", "/api/members", data);
    },
    onSuccess: async (response) => {
      const member = await response.json();
      toast({
        title: "Registration Successful!",
        description: `Your membership ID is: ${member.membershipId}. Please save this for future reference.`,
      });
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

  const onSubmit = (data: RegistrationData) => {
    registerMutation.mutate(data);
  };

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

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="country"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Country</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-country">
                                    <SelectValue placeholder="Select country" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="USA">United States</SelectItem>
                                  <SelectItem value="Canada">Canada</SelectItem>
                                  <SelectItem value="UK">United Kingdom</SelectItem>
                                  <SelectItem value="Germany">Germany</SelectItem>
                                  <SelectItem value="France">France</SelectItem>
                                  <SelectItem value="Australia">Australia</SelectItem>
                                  <SelectItem value="Other">Other</SelectItem>
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

                      <FormField
                        control={form.control}
                        name="membershipType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Membership Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                      <Card className="bg-muted/50">
                        <CardContent className="p-6">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                              <CheckCircle className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-bold text-lg">
                                {searchResult.firstName} {searchResult.lastName}
                              </h3>
                              <Badge variant={searchResult.isActive ? "default" : "secondary"}>
                                {searchResult.isActive ? "Active Member" : "Inactive"}
                              </Badge>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Membership ID</p>
                              <p className="font-mono font-medium">{searchResult.membershipId}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Email</p>
                              <p className="font-medium">{searchResult.email}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Country</p>
                              <p className="font-medium">{searchResult.country}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Member Type</p>
                              <p className="font-medium capitalize">{searchResult.membershipType}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
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
