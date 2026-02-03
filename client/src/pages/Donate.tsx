import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Heart, DollarSign, Users, Globe, CheckCircle, Shield } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const donationSchema = z.object({
  donorName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 1, {
    message: "Please enter a valid amount (minimum $1)",
  }),
  message: z.string().optional(),
  isRecurring: z.boolean().default(false),
  isAnonymous: z.boolean().default(false),
});

type DonationData = z.infer<typeof donationSchema>;

const suggestedAmounts = [10, 25, 50, 100, 250, 500];

export default function Donate() {
  const { toast } = useToast();
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const form = useForm<DonationData>({
    resolver: zodResolver(donationSchema),
    defaultValues: {
      donorName: "",
      email: "",
      amount: "",
      message: "",
      isRecurring: false,
      isAnonymous: false,
    },
  });

  const donateMutation = useMutation({
    mutationFn: async (data: DonationData) => {
      return apiRequest("POST", "/api/donations", {
        ...data,
        amount: data.amount,
        currency: "USD",
      });
    },
    onSuccess: () => {
      setShowSuccess(true);
      form.reset();
      setSelectedAmount(null);
      queryClient.invalidateQueries({ queryKey: ["/api/donations"] });
    },
    onError: (error: any) => {
      toast({
        title: "Donation Failed",
        description: error.message || "Could not process donation. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: DonationData) => {
    donateMutation.mutate(data);
  };

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    form.setValue("amount", amount.toString());
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen py-16 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4 text-center">
          <CardContent className="p-8">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Thank You!</h2>
            <p className="text-muted-foreground mb-6">
              Your generous donation has been received. Together, we are building a better Uganda.
            </p>
            <Button onClick={() => setShowSuccess(false)} data-testid="button-donate-again">
              Make Another Donation
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">Support the Cause</Badge>
          <h1 className="text-4xl font-bold mb-4">Donate to NUP Diaspora</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Your donation supports our initiatives for democracy, justice, and a better future for Uganda. 
            Every contribution makes a difference.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Heart className="w-5 h-5 text-primary" />
                  Make a Donation
                </h2>
                <CardDescription>
                  Choose an amount or enter a custom donation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                      <FormLabel className="mb-3 block">Select Amount</FormLabel>
                      <div className="grid grid-cols-3 gap-3 mb-3">
                        {suggestedAmounts.map((amount) => (
                          <Button
                            key={amount}
                            type="button"
                            variant={selectedAmount === amount ? "default" : "outline"}
                            onClick={() => handleAmountSelect(amount)}
                            data-testid={`button-amount-${amount}`}
                          >
                            ${amount}
                          </Button>
                        ))}
                      </div>
                      <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Custom Amount</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input 
                                  type="number" 
                                  placeholder="Enter amount" 
                                  className="pl-10"
                                  {...field}
                                  onChange={(e) => {
                                    field.onChange(e);
                                    setSelectedAmount(null);
                                  }}
                                  data-testid="input-custom-amount"
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="donorName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Your Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John Doe" {...field} data-testid="input-donor-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="john@example.com" {...field} data-testid="input-donor-email" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Message (Optional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Leave a message of support..." 
                              {...field} 
                              data-testid="input-message"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="isRecurring"
                        render={({ field }) => (
                          <FormItem className="flex items-start gap-3 space-y-0">
                            <FormControl>
                              <Checkbox 
                                checked={field.value} 
                                onCheckedChange={field.onChange}
                                data-testid="checkbox-recurring"
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Make this a monthly donation</FormLabel>
                              <FormDescription>
                                Become a sustaining supporter with automatic monthly contributions
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="isAnonymous"
                        render={({ field }) => (
                          <FormItem className="flex items-start gap-3 space-y-0">
                            <FormControl>
                              <Checkbox 
                                checked={field.value} 
                                onCheckedChange={field.onChange}
                                data-testid="checkbox-anonymous"
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Donate anonymously</FormLabel>
                              <FormDescription>
                                Your name will not be displayed publicly
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button 
                      type="submit" 
                      size="lg"
                      className="w-full" 
                      disabled={donateMutation.isPending}
                      data-testid="button-submit-donation"
                    >
                      <Heart className="w-5 h-5 mr-2" />
                      {donateMutation.isPending ? "Processing..." : `Donate ${form.watch("amount") ? `$${form.watch("amount")}` : ""}`}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold mb-4">Your Impact</h3>
                <div className="space-y-4">
                  {[
                    { icon: Users, label: "Support mobilization efforts" },
                    { icon: Globe, label: "Fund global advocacy campaigns" },
                    { icon: Heart, label: "Aid community initiatives" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-md flex items-center justify-center">
                        <item.icon className="w-5 h-5 text-primary" />
                      </div>
                      <p className="text-sm">{item.label}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-muted/50">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-foreground mb-1">Secure Donation</p>
                    <p className="text-muted-foreground">
                      Your payment information is processed securely. We never store your card details.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-sm text-muted-foreground mb-2">Need help donating?</p>
                <a href="mailto:info@diasporanup.org" className="text-primary hover:underline text-sm">
                  Contact us at info@diasporanup.org
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
