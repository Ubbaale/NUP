import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/use-cart";
import { apiRequest } from "@/lib/queryClient";
import { ShoppingBag, Package, CreditCard, CheckCircle, ArrowLeft, ArrowRight, Truck, Star, Lock } from "lucide-react";
import type { Order } from "@shared/schema";

const shippingSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(7, "Phone number required"),
  address: z.string().min(5, "Address required"),
  city: z.string().min(2, "City required"),
  state: z.string().optional(),
  country: z.string().min(2, "Country required"),
  postalCode: z.string().optional(),
});

const paymentSchema = z.object({
  cardName: z.string().min(2, "Name on card required"),
  cardNumber: z.string().regex(/^\d{16}$/, "Card number must be 16 digits"),
  expiry: z.string().regex(/^\d{2}\/\d{2}$/, "Format: MM/YY"),
  cvv: z.string().regex(/^\d{3,4}$/, "CVV must be 3-4 digits"),
});

type ShippingData = z.infer<typeof shippingSchema>;
type PaymentData = z.infer<typeof paymentSchema>;

const STEPS = [
  { id: 1, label: "Cart Review", icon: ShoppingBag },
  { id: 2, label: "Shipping", icon: Truck },
  { id: 3, label: "Payment", icon: CreditCard },
  { id: 4, label: "Confirmation", icon: CheckCircle },
];

const COUNTRIES = [
  // Africa
  "Algeria", "Angola", "Botswana", "Burundi", "Cameroon", "Cape Verde",
  "Central African Republic", "Chad", "Comoros", "Congo", "Democratic Republic of Congo",
  "Djibouti", "Egypt", "Equatorial Guinea", "Eritrea", "Eswatini", "Ethiopia",
  "Gabon", "Gambia", "Ghana", "Guinea", "Guinea-Bissau", "Ivory Coast",
  "Kenya", "Lesotho", "Liberia", "Libya", "Madagascar", "Malawi", "Mali",
  "Mauritania", "Mauritius", "Morocco", "Mozambique", "Namibia", "Niger",
  "Nigeria", "Rwanda", "São Tomé and Príncipe", "Senegal", "Seychelles",
  "Sierra Leone", "Somalia", "South Africa", "South Sudan", "Sudan",
  "Tanzania", "Togo", "Tunisia", "Uganda", "Zambia", "Zimbabwe",
  // Americas
  "Antigua and Barbuda", "Argentina", "Bahamas", "Barbados", "Belize",
  "Bolivia", "Brazil", "Canada", "Chile", "Colombia", "Costa Rica", "Cuba",
  "Dominica", "Dominican Republic", "Ecuador", "El Salvador", "Grenada",
  "Guatemala", "Guyana", "Haiti", "Honduras", "Jamaica", "Mexico",
  "Nicaragua", "Panama", "Paraguay", "Peru", "Saint Kitts and Nevis",
  "Saint Lucia", "Saint Vincent and the Grenadines", "Suriname",
  "Trinidad and Tobago", "United States", "Uruguay", "Venezuela",
  // Asia
  "Afghanistan", "Armenia", "Azerbaijan", "Bahrain", "Bangladesh", "Bhutan",
  "Brunei", "Cambodia", "China", "Cyprus", "Georgia", "India", "Indonesia",
  "Iran", "Iraq", "Israel", "Japan", "Jordan", "Kazakhstan", "Kuwait",
  "Kyrgyzstan", "Laos", "Lebanon", "Malaysia", "Maldives", "Mongolia",
  "Myanmar", "Nepal", "North Korea", "Oman", "Pakistan", "Palestine",
  "Philippines", "Qatar", "Russia", "Saudi Arabia", "Singapore", "South Korea",
  "Sri Lanka", "Syria", "Taiwan", "Tajikistan", "Thailand", "Timor-Leste",
  "Turkey", "Turkmenistan", "United Arab Emirates", "Uzbekistan", "Vietnam", "Yemen",
  // Europe
  "Albania", "Andorra", "Austria", "Belarus", "Belgium", "Bosnia and Herzegovina",
  "Bulgaria", "Croatia", "Czech Republic", "Denmark", "Estonia", "Finland",
  "France", "Germany", "Greece", "Hungary", "Iceland", "Ireland", "Italy",
  "Kosovo", "Latvia", "Liechtenstein", "Lithuania", "Luxembourg", "Malta",
  "Moldova", "Monaco", "Montenegro", "Netherlands", "North Macedonia", "Norway",
  "Poland", "Portugal", "Romania", "San Marino", "Serbia", "Slovakia",
  "Slovenia", "Spain", "Sweden", "Switzerland", "Ukraine", "United Kingdom",
  // Oceania
  "Australia", "Fiji", "Kiribati", "Marshall Islands", "Micronesia", "Nauru",
  "New Zealand", "Palau", "Papua New Guinea", "Samoa", "Solomon Islands",
  "Tonga", "Tuvalu", "Vanuatu",
];

export default function Checkout() {
  const [, navigate] = useLocation();
  const { cart, cartTotal, clearCart, updateQuantity, removeFromCart } = useCart();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [shippingData, setShippingData] = useState<ShippingData | null>(null);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  const shippingForm = useForm<ShippingData>({
    resolver: zodResolver(shippingSchema),
    defaultValues: { fullName: "", email: "", phone: "", address: "", city: "", state: "", country: "", postalCode: "" },
  });

  const paymentForm = useForm<PaymentData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: { cardName: "", cardNumber: "", expiry: "", cvv: "" },
  });

  const orderMutation = useMutation({
    mutationFn: async (data: { shipping: ShippingData }) => {
      const items = cart.map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        size: item.selectedSize,
        color: item.selectedColor,
      }));
      const shipping = getShippingCost();
      const total = (cartTotal + shipping).toFixed(2);
      const payload = {
        ...data.shipping,
        items: JSON.stringify(items),
        totalAmount: total,
        status: "pending",
      };
      return apiRequest<Order>("POST", "/api/orders", payload);
    },
    onSuccess: (order) => {
      setPlacedOrder(order);
      clearCart();
      setStep(4);
    },
    onError: (err: any) => {
      toast({ title: "Order failed", description: err.message || "Please try again", variant: "destructive" });
    },
  });

  const getShippingCost = () => {
    if (!shippingData) return 9.99;
    const domestic = ["United States", "Canada", "United Kingdom", "Australia"];
    return domestic.includes(shippingData.country) ? 9.99 : 19.99;
  };

  const getEstimatedDelivery = () => {
    const today = new Date();
    const min = new Date(today);
    const max = new Date(today);
    const isInternational = shippingData && !["United States", "Canada", "United Kingdom", "Australia"].includes(shippingData.country);
    min.setDate(today.getDate() + (isInternational ? 10 : 5));
    max.setDate(today.getDate() + (isInternational ? 21 : 10));
    return `${min.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${max.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
  };

  if (cart.length === 0 && step < 4) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">Add some items to your cart before checking out.</p>
          <Button onClick={() => navigate("/store")}>Browse Store</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 bg-muted/30">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="mb-8">
          <Button variant="ghost" size="sm" onClick={() => step > 1 && step < 4 ? setStep(s => s - 1) : navigate("/store")} data-testid="button-back">
            <ArrowLeft className="w-4 h-4 mr-2" /> {step === 1 || step === 4 ? "Back to Store" : "Back"}
          </Button>
          <h1 className="text-3xl font-bold mt-4">Checkout</h1>
        </div>

        <div className="flex items-center justify-between mb-8 overflow-x-auto pb-2">
          {STEPS.map((s, idx) => (
            <div key={s.id} className="flex items-center">
              <div className={`flex items-center gap-2 ${step >= s.id ? "text-primary" : "text-muted-foreground"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${step === s.id ? "bg-primary text-white border-primary" : step > s.id ? "bg-primary/20 border-primary text-primary" : "border-muted-foreground"}`}>
                  {step > s.id ? <CheckCircle className="w-4 h-4" /> : s.id}
                </div>
                <span className="text-sm font-medium hidden sm:block">{s.label}</span>
              </div>
              {idx < STEPS.length - 1 && (
                <div className={`h-0.5 w-8 sm:w-16 mx-2 transition-colors ${step > s.id ? "bg-primary" : "bg-muted"}`} />
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {step === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5" /> Cart Review
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cart.map((item, idx) => (
                    <div key={idx} className="flex gap-4 p-4 bg-muted/50 rounded-lg">
                      <div className="w-16 h-16 bg-muted rounded-md shrink-0 overflow-hidden">
                        {item.product.imageUrl ? (
                          <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag className="w-6 h-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold truncate">{item.product.name}</h4>
                        <div className="flex gap-2 mt-1 flex-wrap">
                          {item.selectedSize && <Badge variant="outline" className="text-xs">{item.selectedSize}</Badge>}
                          {item.selectedColor && <Badge variant="outline" className="text-xs">{item.selectedColor}</Badge>}
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2">
                            <Button size="icon" variant="outline" className="w-7 h-7" onClick={() => updateQuantity(item.product.id, -1, item.selectedSize, item.selectedColor)} data-testid={`button-decrease-${item.product.id}`}>-</Button>
                            <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                            <Button size="icon" variant="outline" className="w-7 h-7" onClick={() => updateQuantity(item.product.id, 1, item.selectedSize, item.selectedColor)} data-testid={`button-increase-${item.product.id}`}>+</Button>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-bold">${(Number(item.product.price) * item.quantity).toFixed(2)}</span>
                            <Button size="icon" variant="ghost" className="w-7 h-7 text-destructive" onClick={() => removeFromCart(item.product.id, item.selectedSize, item.selectedColor)} data-testid={`button-remove-${item.product.id}`}>✕</Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button className="w-full mt-4" onClick={() => setStep(2)} data-testid="button-to-shipping">
                    Continue to Shipping <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            )}

            {step === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="w-5 h-5" /> Shipping Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...shippingForm}>
                    <form onSubmit={shippingForm.handleSubmit((data) => { setShippingData(data); setStep(3); })} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField control={shippingForm.control} name="fullName" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl><Input placeholder="John Doe" data-testid="input-fullname" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={shippingForm.control} name="email" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl><Input placeholder="john@example.com" type="email" data-testid="input-email" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>
                      <FormField control={shippingForm.control} name="phone" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl><Input placeholder="+1 (555) 000-0000" data-testid="input-phone" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={shippingForm.control} name="address" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Street Address</FormLabel>
                          <FormControl><Input placeholder="123 Main Street, Apt 4B" data-testid="input-address" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField control={shippingForm.control} name="city" render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl><Input placeholder="New York" data-testid="input-city" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={shippingForm.control} name="state" render={({ field }) => (
                          <FormItem>
                            <FormLabel>State / Province</FormLabel>
                            <FormControl><Input placeholder="NY" data-testid="input-state" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField control={shippingForm.control} name="country" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Country</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-country"><SelectValue placeholder="Select country" /></SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={shippingForm.control} name="postalCode" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Postal / ZIP Code</FormLabel>
                            <FormControl><Input placeholder="10001" data-testid="input-postal" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>
                      <Button type="submit" className="w-full mt-2" data-testid="button-to-payment">
                        Continue to Payment <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            )}

            {step === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" /> Payment Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mb-4 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg text-green-700 dark:text-green-400 text-sm">
                    <Lock className="w-4 h-4 shrink-0" />
                    <span>Your payment information is encrypted and secure</span>
                  </div>
                  <Form {...paymentForm}>
                    <form onSubmit={paymentForm.handleSubmit(() => {
                      if (shippingData) orderMutation.mutate({ shipping: shippingData });
                    })} className="space-y-4">
                      <FormField control={paymentForm.control} name="cardName" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name on Card</FormLabel>
                          <FormControl><Input placeholder="John Doe" data-testid="input-card-name" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={paymentForm.control} name="cardNumber" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Card Number</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="1234 5678 9012 3456"
                              maxLength={16}
                              data-testid="input-card-number"
                              {...field}
                              onChange={e => field.onChange(e.target.value.replace(/\D/g, ""))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField control={paymentForm.control} name="expiry" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Expiry Date</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="MM/YY"
                                maxLength={5}
                                data-testid="input-expiry"
                                {...field}
                                onChange={e => {
                                  let v = e.target.value.replace(/\D/g, "");
                                  if (v.length >= 2) v = v.slice(0, 2) + "/" + v.slice(2);
                                  field.onChange(v.slice(0, 5));
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={paymentForm.control} name="cvv" render={({ field }) => (
                          <FormItem>
                            <FormLabel>CVV</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="123"
                                maxLength={4}
                                type="password"
                                data-testid="input-cvv"
                                {...field}
                                onChange={e => field.onChange(e.target.value.replace(/\D/g, ""))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>
                      <Button type="submit" className="w-full mt-2" disabled={orderMutation.isPending} data-testid="button-place-order">
                        {orderMutation.isPending ? "Processing..." : `Place Order · $${(cartTotal + getShippingCost()).toFixed(2)}`}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            )}

            {step === 4 && placedOrder && (
              <Card className="border-green-200 dark:border-green-800">
                <CardContent className="pt-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Order Placed Successfully!</h2>
                  <p className="text-muted-foreground mb-4">Thank you for your purchase. We've received your order and will begin processing it shortly.</p>
                  <div className="bg-muted/50 rounded-lg p-4 mb-6 text-left space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Order ID</span>
                      <span className="font-mono font-semibold text-xs">{placedOrder.id}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Confirmation sent to</span>
                      <span className="font-medium">{placedOrder.email}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total charged</span>
                      <span className="font-bold">${Number(placedOrder.totalAmount).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Status</span>
                      <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Processing</Badge>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button onClick={() => navigate(`/order-tracking?orderId=${placedOrder.id}`)} data-testid="button-track-order">
                      <Package className="w-4 h-4 mr-2" /> Track Your Order
                    </Button>
                    <Button variant="outline" onClick={() => navigate("/store")} data-testid="button-continue-shopping">
                      Continue Shopping
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {step < 4 && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {cart.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-muted-foreground truncate mr-2">
                        {item.product.name} {item.selectedSize ? `(${item.selectedSize})` : ""} ×{item.quantity}
                      </span>
                      <span className="font-medium shrink-0">${(Number(item.product.price) * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <Separator />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>${getShippingCost().toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>${(cartTotal + getShippingCost()).toFixed(2)}</span>
                  </div>
                  {step >= 2 && shippingData && (
                    <div className="mt-2 pt-2 border-t text-sm text-muted-foreground">
                      <p className="font-medium text-foreground mb-1">Estimated Delivery</p>
                      <p>{getEstimatedDelivery()}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Lock className="w-4 h-4 text-green-600" />
                    <span>Secure 256-bit SSL encryption</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                    <Package className="w-4 h-4 text-primary" />
                    <span>Free returns within 30 days</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span>Rate products after delivery</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
