import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Link } from "wouter";
import {
  Shield, Truck, RotateCcw, PackageCheck, Clock, CheckCircle,
  AlertTriangle, Mail, Phone, ArrowLeft, ShoppingBag, Globe,
  Star, CreditCard, Printer
} from "lucide-react";

const QUALITY_STANDARDS = [
  { title: "Material Inspection", desc: "All apparel items are sourced from trusted suppliers and inspected for fabric quality, stitching, and color accuracy before being listed." },
  { title: "Print Quality", desc: "Custom designs and official NUP merchandise use high-resolution printing techniques (DTG or screen printing) to ensure crisp, durable graphics that withstand washing." },
  { title: "Printful Integration", desc: "Many of our products are fulfilled through Printful, a trusted print-on-demand partner with built-in quality checks at every production stage." },
  { title: "Sample Testing", desc: "Our admin team places test orders for new products to verify quality, fit, and print accuracy before making them available to the public." },
];

const DELIVERY_TIMELINES = [
  { region: "United States", standard: "5–7 business days", express: "2–3 business days", icon: "🇺🇸" },
  { region: "Canada", standard: "7–10 business days", express: "3–5 business days", icon: "🇨🇦" },
  { region: "United Kingdom", standard: "7–12 business days", express: "4–6 business days", icon: "🇬🇧" },
  { region: "Australia", standard: "10–14 business days", express: "5–7 business days", icon: "🇦🇺" },
  { region: "Europe", standard: "10–18 business days", express: "5–8 business days", icon: "🇪🇺" },
  { region: "Africa", standard: "14–28 business days", express: "7–14 business days", icon: "🌍" },
  { region: "Rest of World", standard: "14–28 business days", express: "7–14 business days", icon: "🌏" },
];

const RETURN_STEPS = [
  { step: 1, title: "Submit a Return Request", desc: "Go to your Order Tracking page and click 'Request Return'. Select the items and provide a reason." },
  { step: 2, title: "Await Approval", desc: "Our team reviews your request within 2–3 business days. You'll receive an email notification with the decision." },
  { step: 3, title: "Ship Items Back", desc: "Once approved, ship the items back using the provided return address. Items must be in original, unused condition." },
  { step: 4, title: "Receive Refund", desc: "After we receive and inspect the returned items, your refund will be processed within 5–7 business days to your original payment method." },
];

export default function StorePolicies() {
  return (
    <div className="min-h-screen py-8 bg-muted/30">
      <SEO
        title="Store Policies — Quality, Shipping & Returns"
        description="NUP Diaspora store policies including quality guarantee, shipping timelines, and return/refund procedures."
      />
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild data-testid="button-back-to-store">
            <Link href="/store"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Store</Link>
          </Button>
        </div>

        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-3" data-testid="text-policies-title">Store Policies</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We're committed to providing high-quality NUP merchandise with transparent shipping and hassle-free returns. Read our full policies below.
          </p>
        </div>

        <div className="space-y-8">
          <section id="quality" data-testid="section-quality">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Shield className="w-5 h-5 text-primary" />
                  Quality Guarantee
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  Every product in the NUP Diaspora store is backed by our quality commitment. We want you to wear and use your NUP merchandise with pride, knowing it meets the highest standards.
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  {QUALITY_STANDARDS.map((item, i) => (
                    <div key={i} className="p-4 rounded-lg bg-muted/50 border" data-testid={`quality-item-${i}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <h4 className="font-semibold text-sm">{item.title}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  ))}
                </div>
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="text-sm font-medium">
                    <Star className="w-4 h-4 inline mr-1 text-yellow-500" />
                    Not satisfied? If a product doesn't meet your quality expectations, contact us within 14 days for a replacement or full refund — no questions asked.
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>

          <section id="shipping" data-testid="section-shipping">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Truck className="w-5 h-5 text-primary" />
                  Shipping & Delivery Timelines
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  We ship worldwide to support our global NUP community. Delivery times vary by destination. All orders include tracking information once shipped.
                </p>

                <div className="grid gap-3">
                  <div className="grid grid-cols-4 gap-2 text-sm font-semibold pb-2 border-b">
                    <span>Region</span>
                    <span>Standard Shipping</span>
                    <span>Express Shipping</span>
                    <span>Cost</span>
                  </div>
                  {DELIVERY_TIMELINES.map((item, i) => (
                    <div key={i} className="grid grid-cols-4 gap-2 text-sm py-2 border-b border-muted" data-testid={`shipping-row-${i}`}>
                      <span className="font-medium">{item.icon} {item.region}</span>
                      <span className="text-muted-foreground">{item.standard}</span>
                      <span className="text-muted-foreground">{item.express}</span>
                      <span className="text-muted-foreground">
                        {["United States", "Canada", "United Kingdom", "Australia"].includes(item.region) ? "$9.99" : "$19.99"}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="grid sm:grid-cols-2 gap-4 mt-4">
                  <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                    <h4 className="font-semibold text-sm flex items-center gap-2 mb-1">
                      <Clock className="w-4 h-4 text-blue-600" /> Processing Time
                    </h4>
                    <p className="text-sm text-muted-foreground">Orders are processed within 1–3 business days. Custom design orders may take an additional 2–3 days for production.</p>
                  </div>
                  <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                    <h4 className="font-semibold text-sm flex items-center gap-2 mb-1">
                      <PackageCheck className="w-4 h-4 text-green-600" /> Tracking
                    </h4>
                    <p className="text-sm text-muted-foreground">A tracking number and carrier info will be emailed once your order ships. Track your order anytime on our site.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          <section id="returns" data-testid="section-returns">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <RotateCcw className="w-5 h-5 text-primary" />
                  Returns & Refund Policy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-muted-foreground leading-relaxed">
                  We want you to be completely satisfied with your purchase. If something isn't right, we'll make it right.
                </p>

                <div>
                  <h3 className="font-semibold mb-3">Eligibility</h3>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                      <span>Items can be returned within <strong>30 days</strong> of delivery</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                      <span>Items must be in original, unworn/unused condition with tags attached</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                      <span>Defective or incorrect items are always eligible for return regardless of timeframe</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 shrink-0" />
                      <span>Custom-designed items (with uploaded artwork) are <strong>non-returnable</strong> unless defective</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 shrink-0" />
                      <span>Sale items and sticker packs are <strong>final sale</strong></span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-4">How to Return an Item</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {RETURN_STEPS.map((item) => (
                      <div key={item.step} className="flex gap-3" data-testid={`return-step-${item.step}`}>
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="text-sm font-bold text-primary">{item.step}</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm">{item.title}</h4>
                          <p className="text-sm text-muted-foreground">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-3">Refund Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <CreditCard className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <span>Refunds are issued to the original payment method (Stripe)</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Clock className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <span>Processing takes 5–7 business days after we receive returned items</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Truck className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <span>Return shipping costs are the customer's responsibility unless the item was defective or we made an error</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          <section id="contact" data-testid="section-contact">
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="pt-6 text-center">
                <h3 className="text-lg font-bold mb-2">Need Help?</h3>
                <p className="text-muted-foreground mb-4">
                  Our support team is here to help with any store-related questions.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <a href="mailto:info@diasporanup.org" className="flex items-center gap-2 text-sm text-primary hover:underline" data-testid="link-support-email">
                    <Mail className="w-4 h-4" /> info@diasporanup.org
                  </a>
                  <a href="tel:+16512786724" className="flex items-center gap-2 text-sm text-primary hover:underline" data-testid="link-support-phone">
                    <Phone className="w-4 h-4" /> +1 (651) 278-6724
                  </a>
                </div>
                <div className="flex items-center justify-center gap-3 mt-4">
                  <Button variant="outline" size="sm" asChild data-testid="button-track-order-link">
                    <Link href="/order-tracking">Track My Order</Link>
                  </Button>
                  <Button size="sm" asChild data-testid="button-shop-now">
                    <Link href="/store">Shop Now</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}
