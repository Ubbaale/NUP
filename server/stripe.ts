import Stripe from "stripe";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

let stripeClient: Stripe | null = null;

function getStripe(): Stripe | null {
  if (!STRIPE_SECRET_KEY) {
    return null;
  }
  if (!stripeClient) {
    stripeClient = new Stripe(STRIPE_SECRET_KEY);
  }
  return stripeClient;
}

export function isStripeConfigured(): boolean {
  return !!STRIPE_SECRET_KEY;
}

export async function createTicketPaymentIntent(params: {
  amount: number;
  currency?: string;
  buyerEmail: string;
  buyerName: string;
  eventTitle: string;
  ticketCode: string;
}): Promise<{ clientSecret: string; paymentIntentId: string } | null> {
  const stripe = getStripe();
  if (!stripe) {
    console.log("[Stripe] Not configured — ticket recorded without payment");
    return null;
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(params.amount * 100),
    currency: params.currency || "usd",
    receipt_email: params.buyerEmail,
    metadata: {
      type: "event_ticket",
      ticketCode: params.ticketCode,
      buyerName: params.buyerName,
      eventTitle: params.eventTitle,
    },
    description: `Event Ticket: ${params.eventTitle}`,
  });

  return {
    clientSecret: paymentIntent.client_secret!,
    paymentIntentId: paymentIntent.id,
  };
}

export async function createDonationPaymentIntent(params: {
  amount: number;
  currency?: string;
  donorEmail: string;
  donorName: string;
  campaignTitle?: string;
  isRecurring?: boolean;
}): Promise<{ clientSecret: string; paymentIntentId: string } | null> {
  const stripe = getStripe();
  if (!stripe) {
    console.log("[Stripe] Not configured — donation recorded without payment");
    return null;
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(params.amount * 100),
    currency: params.currency || "usd",
    receipt_email: params.donorEmail,
    metadata: {
      type: params.campaignTitle ? "campaign_donation" : "general_donation",
      donorName: params.donorName,
      campaignTitle: params.campaignTitle || "General",
    },
    description: params.campaignTitle
      ? `Campaign Donation: ${params.campaignTitle}`
      : "NUP Diaspora Donation",
  });

  return {
    clientSecret: paymentIntent.client_secret!,
    paymentIntentId: paymentIntent.id,
  };
}

export async function createMembershipPaymentIntent(params: {
  amount: number;
  currency?: string;
  email: string;
  fullName: string;
  tierName: string;
}): Promise<{ clientSecret: string; paymentIntentId: string } | null> {
  const stripe = getStripe();
  if (!stripe) {
    console.log("[Stripe] Not configured — subscription recorded without payment");
    return null;
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(params.amount * 100),
    currency: params.currency || "usd",
    receipt_email: params.email,
    metadata: {
      type: "membership_subscription",
      fullName: params.fullName,
      tierName: params.tierName,
    },
    description: `NUP Membership: ${params.tierName}`,
  });

  return {
    clientSecret: paymentIntent.client_secret!,
    paymentIntentId: paymentIntent.id,
  };
}

export async function verifyPaymentIntent(paymentIntentId: string): Promise<{
  status: string;
  paid: boolean;
  amount: number;
}> {
  const stripe = getStripe();
  if (!stripe) {
    return { status: "simulated", paid: true, amount: 0 };
  }

  const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
  return {
    status: intent.status,
    paid: intent.status === "succeeded",
    amount: intent.amount / 100,
  };
}

export async function handleWebhookEvent(
  payload: string | Buffer,
  signature: string
): Promise<{ type: string; data: any } | null> {
  const stripeInstance = getStripe();
  if (!stripeInstance) return null;

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.warn("[Stripe] Webhook secret not configured");
    return null;
  }

  const event = stripeInstance.webhooks.constructEvent(payload, signature, webhookSecret);
  return { type: event.type, data: event.data.object };
}
