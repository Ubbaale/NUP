import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users/Members
export const members = pgTable("members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  membershipId: varchar("membership_id").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  dateOfBirth: text("date_of_birth"),
  sex: text("sex"),
  nationality: text("nationality"),
  country: text("country").notNull(),
  city: text("city"),
  regionId: varchar("region_id"),
  chapterId: varchar("chapter_id"),
  membershipType: text("membership_type").notNull().default("regular"),
  mailingAddress: text("mailing_address"),
  mailingCity: text("mailing_city"),
  mailingState: text("mailing_state"),
  mailingZip: text("mailing_zip"),
  mailingCountry: text("mailing_country"),
  cardNumber: text("card_number"),
  cardOrdered: boolean("card_ordered").notNull().default(false),
  cardOrderedAt: timestamp("card_ordered_at"),
  cardPaymentStatus: text("card_payment_status"),
  cardShippingName: text("card_shipping_name"),
  cardShippingAddress: text("card_shipping_address"),
  cardShippingCity: text("card_shipping_city"),
  cardShippingState: text("card_shipping_state"),
  cardShippingZip: text("card_shipping_zip"),
  cardShippingCountry: text("card_shipping_country"),
  isActive: boolean("is_active").notNull().default(true),
  joinedAt: timestamp("joined_at").defaultNow(),
});

export const insertMemberSchema = createInsertSchema(members).omit({ id: true, membershipId: true, joinedAt: true, cardOrdered: true, cardOrderedAt: true, cardPaymentStatus: true, cardShippingName: true, cardShippingAddress: true, cardShippingCity: true, cardShippingState: true, cardShippingZip: true, cardShippingCountry: true });
export type InsertMember = z.infer<typeof insertMemberSchema>;
export type Member = typeof members.$inferSelect;

// Regions (North America, Europe, UK, Canada, Asia, Australia)
export const regions = pgTable("regions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  leaderName: text("leader_name"),
  leaderTitle: text("leader_title"),
  leaderImage: text("leader_image"),
  leaderBio: text("leader_bio"),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  coordinates: text("coordinates"),
  accessCode: text("access_code"),
  websiteUrl: text("website_url"),
  facebookUrl: text("facebook_url"),
  twitterUrl: text("twitter_url"),
  whatsappLink: text("whatsapp_link"),
  instagramUrl: text("instagram_url"),
  youtubeUrl: text("youtube_url"),
  memberCount: integer("member_count"),
  foundedDate: text("founded_date"),
});

export const insertRegionSchema = createInsertSchema(regions).omit({ id: true });
export type InsertRegion = z.infer<typeof insertRegionSchema>;
export type Region = typeof regions.$inferSelect;

// Chapters within regions
export const chapters = pgTable("chapters", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  regionId: varchar("region_id").notNull(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  city: text("city").notNull(),
  country: text("country").notNull(),
  description: text("description"),
  iconEmoji: text("icon_emoji"),
  imageUrl: text("image_url"),
  logoUrl: text("logo_url"),
  leaderName: text("leader_name"),
  leaderTitle: text("leader_title"),
  leaderImage: text("leader_image"),
  leaderBio: text("leader_bio"),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  meetingSchedule: text("meeting_schedule"),
  address: text("address"),
  isActive: boolean("is_active").notNull().default(true),
  accessCode: text("access_code"),
  websiteUrl: text("website_url"),
  facebookUrl: text("facebook_url"),
  twitterUrl: text("twitter_url"),
  whatsappLink: text("whatsapp_link"),
  instagramUrl: text("instagram_url"),
  youtubeUrl: text("youtube_url"),
  memberCount: integer("member_count"),
  foundedDate: text("founded_date"),
});

export const insertChapterSchema = createInsertSchema(chapters).omit({ id: true });
export type InsertChapter = z.infer<typeof insertChapterSchema>;
export type Chapter = typeof chapters.$inferSelect;

// Chapter Leadership Members
export const chapterLeaders = pgTable("chapter_leaders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  chapterId: varchar("chapter_id").notNull(),
  name: text("name").notNull(),
  title: text("title").notNull(),
  image: text("image"),
  bio: text("bio"),
  email: text("email"),
  phone: text("phone"),
  displayOrder: integer("display_order").notNull().default(0),
});

export const insertChapterLeaderSchema = createInsertSchema(chapterLeaders).omit({ id: true });
export type InsertChapterLeader = z.infer<typeof insertChapterLeaderSchema>;
export type ChapterLeader = typeof chapterLeaders.$inferSelect;

// Chapter Activities
export const activities = pgTable("activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  chapterId: varchar("chapter_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  date: timestamp("date"),
  location: text("location"),
  imageUrl: text("image_url"),
});

export const insertActivitySchema = createInsertSchema(activities).omit({ id: true });
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Activity = typeof activities.$inferSelect;

// Conferences
export const conferences = pgTable("conferences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  year: integer("year").notNull(),
  location: text("location").notNull(),
  city: text("city").notNull(),
  country: text("country").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  description: text("description"),
  theme: text("theme"),
  registrationUrl: text("registration_url"),
  imageUrl: text("image_url"),
  isUpcoming: boolean("is_upcoming").notNull().default(true),
  speakers: text("speakers"), // JSON array of speaker names/details
  metadata: text("metadata"), // JSON object for convention-specific details
});

export const insertConferenceSchema = createInsertSchema(conferences).omit({ id: true });
export type InsertConference = z.infer<typeof insertConferenceSchema>;
export type Conference = typeof conferences.$inferSelect;

// Store Products
export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  category: text("category").notNull(),
  imageUrl: text("image_url"),
  sizes: text("sizes"), // JSON array of available sizes
  colors: text("colors"), // JSON array of available colors
  inStock: boolean("in_stock").notNull().default(true),
  featured: boolean("featured").notNull().default(false),
  printfulSyncVariantId: text("printful_sync_variant_id"), // Printful sync variant ID for fulfillment
  printfulProductId: text("printful_product_id"),           // Printful product ID
  baseCost: decimal("base_cost", { precision: 10, scale: 2 }), // Supplier base cost (profit = price - baseCost)
});

export const insertProductSchema = createInsertSchema(products).omit({ id: true });
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

// Orders
export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  memberId: varchar("member_id"),
  email: text("email").notNull(),
  fullName: text("full_name").notNull(),
  phone: text("phone"),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state"),
  country: text("country").notNull(),
  postalCode: text("postal_code"),
  items: text("items").notNull(), // JSON array of order items
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"), // pending, processing, shipped, out_for_delivery, delivered, cancelled
  trackingNumber: text("tracking_number"),
  shippingCarrier: text("shipping_carrier"),
  estimatedDelivery: text("estimated_delivery"),
  deliveredAt: timestamp("delivered_at"),
  shippingNotes: text("shipping_notes"),
  printfulOrderId: text("printful_order_id"),
  fulfillmentStatus: text("fulfillment_status").default("not_submitted"),
  isTestOrder: boolean("is_test_order").default(false),
  qualityNotes: text("quality_notes"),
  qualityChecked: boolean("quality_checked").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true, deliveredAt: true });
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

// Product Ratings
export const productRatings = pgTable("product_ratings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").notNull(),
  orderId: varchar("order_id").notNull(),
  rating: integer("rating").notNull(), // 1-5
  review: text("review"),
  reviewerName: text("reviewer_name").notNull(),
  reviewerEmail: text("reviewer_email").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertProductRatingSchema = createInsertSchema(productRatings).omit({ id: true, createdAt: true });
export type InsertProductRating = z.infer<typeof insertProductRatingSchema>;
export type ProductRating = typeof productRatings.$inferSelect;

// Donations
export const donations = pgTable("donations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  donorName: text("donor_name").notNull(),
  email: text("email").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("USD"),
  message: text("message"),
  isRecurring: boolean("is_recurring").notNull().default(false),
  isAnonymous: boolean("is_anonymous").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertDonationSchema = createInsertSchema(donations).omit({ id: true, createdAt: true });
export type InsertDonation = z.infer<typeof insertDonationSchema>;
export type Donation = typeof donations.$inferSelect;

// Blog Posts
export const blogPosts = pgTable("blog_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  authorId: varchar("author_id").notNull(),
  authorName: text("author_name").notNull(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  imageUrl: text("image_url"),
  isPublished: boolean("is_published").notNull().default(false),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({ id: true, createdAt: true });
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type BlogPost = typeof blogPosts.$inferSelect;

// News Feed (from Uganda)
export const newsItems = pgTable("news_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  source: text("source").notNull(),
  url: text("url"),
  excerpt: text("excerpt"),
  imageUrl: text("image_url"),
  category: text("category"),
  publishedAt: timestamp("published_at").defaultNow(),
});

export const insertNewsItemSchema = createInsertSchema(newsItems).omit({ id: true });
export type InsertNewsItem = z.infer<typeof insertNewsItemSchema>;
export type NewsItem = typeof newsItems.$inferSelect;

// Subscriptions
export const subscriptions = pgTable("subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  name: text("name"),
  isActive: boolean("is_active").notNull().default(true),
  subscribedAt: timestamp("subscribed_at").defaultNow(),
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({ id: true, subscribedAt: true });
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type Subscription = typeof subscriptions.$inferSelect;

// Diaspora Council Members
export const councilMembers = pgTable("council_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  regionId: varchar("region_id").notNull(),
  name: text("name").notNull(),
  title: text("title").notNull(),
  role: text("role").notNull(),
  imageUrl: text("image_url"),
  bio: text("bio"),
  email: text("email"),
  order: integer("order").notNull().default(0),
});

export const insertCouncilMemberSchema = createInsertSchema(councilMembers).omit({ id: true });
export type InsertCouncilMember = z.infer<typeof insertCouncilMemberSchema>;
export type CouncilMember = typeof councilMembers.$inferSelect;

// Revolutionary Songs
export const revolutionarySongs = pgTable("revolutionary_songs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  artist: text("artist").notNull(),
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  duration: integer("duration"),
  coverImageUrl: text("cover_image_url"),
  description: text("description"),
  minimumDonation: decimal("minimum_donation", { precision: 10, scale: 2 }).notNull().default("200.00"),
  price: decimal("price", { precision: 10, scale: 2 }).default("5.00"),
  isFree: boolean("is_free").notNull().default(false),
  downloadCount: integer("download_count").notNull().default(0),
  playCount: integer("play_count").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertRevolutionarySongSchema = createInsertSchema(revolutionarySongs).omit({ id: true, createdAt: true, downloadCount: true, playCount: true });
export type InsertRevolutionarySong = z.infer<typeof insertRevolutionarySongSchema>;
export type RevolutionarySong = typeof revolutionarySongs.$inferSelect;

// Song Access Tokens (granted after all-access donation)
export const songAccessTokens = pgTable("song_access_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  donationId: varchar("donation_id").notNull(),
  email: text("email").notNull(),
  token: text("token").notNull().unique(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
});

export const insertSongAccessTokenSchema = createInsertSchema(songAccessTokens).omit({ id: true, createdAt: true });
export type InsertSongAccessToken = z.infer<typeof insertSongAccessTokenSchema>;
export type SongAccessToken = typeof songAccessTokens.$inferSelect;

// Per-Song Purchases
export const songPurchases = pgTable("song_purchases", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  songId: varchar("song_id").notNull(),
  buyerName: text("buyer_name").notNull(),
  buyerEmail: text("buyer_email").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
});

export const insertSongPurchaseSchema = createInsertSchema(songPurchases).omit({ id: true, createdAt: true });
export type InsertSongPurchase = z.infer<typeof insertSongPurchaseSchema>;
export type SongPurchase = typeof songPurchases.$inferSelect;

// ===== FUNDRAISING FEATURES =====

// Virtual Events & Ticketing
export const virtualEvents = pgTable("virtual_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  eventDate: timestamp("event_date").notNull(),
  endDate: timestamp("end_date"),
  eventType: text("event_type").notNull().default("webinar"),
  meetingLink: text("meeting_link"),
  ticketPrice: decimal("ticket_price", { precision: 10, scale: 2 }).notNull().default("0"),
  maxAttendees: integer("max_attendees"),
  hostName: text("host_name"),
  hostTitle: text("host_title"),
  imageUrl: text("image_url"),
  isFeatured: boolean("is_featured").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertVirtualEventSchema = createInsertSchema(virtualEvents).omit({ id: true, createdAt: true });
export type InsertVirtualEvent = z.infer<typeof insertVirtualEventSchema>;
export type VirtualEvent = typeof virtualEvents.$inferSelect;

export const eventTickets = pgTable("event_tickets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").notNull(),
  buyerName: text("buyer_name").notNull(),
  buyerEmail: text("buyer_email").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  ticketCode: text("ticket_code").notNull().unique(),
  paymentStatus: text("payment_status").notNull().default("pending"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  purchasedAt: timestamp("purchased_at").defaultNow(),
});

export const insertEventTicketSchema = createInsertSchema(eventTickets).omit({ id: true, purchasedAt: true });
export type InsertEventTicket = z.infer<typeof insertEventTicketSchema>;
export type EventTicket = typeof eventTickets.$inferSelect;

// Crowdfunding Campaigns
export const campaigns = pgTable("campaigns", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  goalAmount: decimal("goal_amount", { precision: 10, scale: 2 }).notNull(),
  raisedAmount: decimal("raised_amount", { precision: 10, scale: 2 }).notNull().default("0"),
  donorCount: integer("donor_count").notNull().default(0),
  category: text("category").notNull().default("general"),
  imageUrl: text("image_url"),
  startDate: timestamp("start_date").defaultNow(),
  endDate: timestamp("end_date"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCampaignSchema = createInsertSchema(campaigns).omit({ id: true, createdAt: true, raisedAmount: true, donorCount: true });
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;
export type Campaign = typeof campaigns.$inferSelect;

export const campaignDonations = pgTable("campaign_donations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  campaignId: varchar("campaign_id").notNull(),
  fundraiserId: varchar("fundraiser_id"),
  donorName: text("donor_name").notNull(),
  email: text("email").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  message: text("message"),
  isAnonymous: boolean("is_anonymous").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCampaignDonationSchema = createInsertSchema(campaignDonations).omit({ id: true, createdAt: true });
export type InsertCampaignDonation = z.infer<typeof insertCampaignDonationSchema>;
export type CampaignDonation = typeof campaignDonations.$inferSelect;

// Campaign Fundraisers (peer-to-peer)
export const campaignFundraisers = pgTable("campaign_fundraisers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  campaignId: varchar("campaign_id").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  slug: text("slug").notNull().unique(),
  personalMessage: text("personal_message"),
  goalAmount: decimal("goal_amount", { precision: 10, scale: 2 }).default("500"),
  raisedAmount: decimal("raised_amount", { precision: 10, scale: 2 }).notNull().default("0"),
  donorCount: integer("donor_count").notNull().default(0),
  photoUrl: text("photo_url"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCampaignFundraiserSchema = createInsertSchema(campaignFundraisers).omit({ id: true, createdAt: true, raisedAmount: true, donorCount: true });
export type InsertCampaignFundraiser = z.infer<typeof insertCampaignFundraiserSchema>;
export type CampaignFundraiser = typeof campaignFundraisers.$inferSelect;

// Membership Tiers
export const membershipTiers = pgTable("membership_tiers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  interval: text("interval").notNull().default("monthly"),
  description: text("description"),
  benefits: text("benefits"),
  badgeColor: text("badge_color"),
  awardType: text("award_type"),
  awardDescription: text("award_description"),
  isPopular: boolean("is_popular").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  displayOrder: integer("display_order").notNull().default(0),
});

export const insertMembershipTierSchema = createInsertSchema(membershipTiers).omit({ id: true });
export type InsertMembershipTier = z.infer<typeof insertMembershipTierSchema>;
export type MembershipTier = typeof membershipTiers.$inferSelect;

export const memberSubscriptions = pgTable("member_subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tierId: varchar("tier_id").notNull(),
  email: text("email").notNull(),
  fullName: text("full_name").notNull(),
  status: text("status").notNull().default("active"),
  startDate: timestamp("start_date").defaultNow(),
  renewalDate: timestamp("renewal_date"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  shippingAddress: text("shipping_address"),
  shippingCity: text("shipping_city"),
  shippingState: text("shipping_state"),
  shippingZip: text("shipping_zip"),
  shippingCountry: text("shipping_country"),
  engravingName: text("engraving_name"),
  awardStatus: text("award_status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMemberSubscriptionSchema = createInsertSchema(memberSubscriptions).omit({ id: true, createdAt: true });
export type InsertMemberSubscription = z.infer<typeof insertMemberSubscriptionSchema>;
export type MemberSubscription = typeof memberSubscriptions.$inferSelect;

// Auctions & Raffles
export const auctionItems = pgTable("auction_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  imageUrl: text("image_url"),
  startingBid: decimal("starting_bid", { precision: 10, scale: 2 }).notNull().default("10"),
  currentBid: decimal("current_bid", { precision: 10, scale: 2 }).notNull().default("0"),
  buyNowPrice: decimal("buy_now_price", { precision: 10, scale: 2 }),
  bidIncrement: decimal("bid_increment", { precision: 10, scale: 2 }).notNull().default("5"),
  ticketPrice: decimal("ticket_price", { precision: 10, scale: 2 }).default("5"),
  totalTicketsSold: integer("total_tickets_sold").notNull().default(0),
  auctionType: text("auction_type").notNull().default("auction"),
  startDate: timestamp("start_date").defaultNow(),
  endDate: timestamp("end_date").notNull(),
  winnerName: text("winner_name"),
  winnerEmail: text("winner_email"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAuctionItemSchema = createInsertSchema(auctionItems).omit({ id: true, createdAt: true, currentBid: true, totalTicketsSold: true });
export type InsertAuctionItem = z.infer<typeof insertAuctionItemSchema>;
export type AuctionItem = typeof auctionItems.$inferSelect;

export const bids = pgTable("bids", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  auctionItemId: varchar("auction_item_id").notNull(),
  bidderName: text("bidder_name").notNull(),
  bidderEmail: text("bidder_email").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertBidSchema = createInsertSchema(bids).omit({ id: true, createdAt: true });
export type InsertBid = z.infer<typeof insertBidSchema>;
export type Bid = typeof bids.$inferSelect;

export const raffleTickets = pgTable("raffle_tickets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  auctionItemId: varchar("auction_item_id").notNull(),
  buyerName: text("buyer_name").notNull(),
  buyerEmail: text("buyer_email").notNull(),
  ticketCount: integer("ticket_count").notNull().default(1),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  ticketNumbers: text("ticket_numbers"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertRaffleTicketSchema = createInsertSchema(raffleTickets).omit({ id: true, createdAt: true });
export type InsertRaffleTicket = z.infer<typeof insertRaffleTicketSchema>;
export type RaffleTicket = typeof raffleTickets.$inferSelect;

// Legacy Users table for compatibility
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const returnRequests = pgTable("return_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").notNull(),
  email: text("email").notNull(),
  fullName: text("full_name").notNull(),
  reason: text("reason").notNull(),
  items: text("items").notNull(),
  status: text("status").notNull().default("pending"),
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  resolvedAt: timestamp("resolved_at"),
});

export const insertReturnRequestSchema = createInsertSchema(returnRequests).omit({ id: true, createdAt: true, resolvedAt: true });
export type InsertReturnRequest = z.infer<typeof insertReturnRequestSchema>;
export type ReturnRequest = typeof returnRequests.$inferSelect;

export const galleryPhotos = pgTable("gallery_photos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  imageUrl: text("image_url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  category: text("category").notNull().default("events"),
  album: text("album"),
  tags: text("tags"),
  sortOrder: integer("sort_order").default(0),
  featured: boolean("featured").default(false),
  originalSize: integer("original_size"),
  compressedSize: integer("compressed_size"),
  width: integer("width"),
  height: integer("height"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertGalleryPhotoSchema = createInsertSchema(galleryPhotos).omit({ id: true, createdAt: true });
export type InsertGalleryPhoto = z.infer<typeof insertGalleryPhotoSchema>;
export type GalleryPhoto = typeof galleryPhotos.$inferSelect;

export const fallenHeroes = pgTable("fallen_heroes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fullName: text("full_name").notNull(),
  photoUrl: text("photo_url"),
  dateOfBirth: text("date_of_birth"),
  dateOfDeath: text("date_of_death"),
  biography: text("biography"),
  location: text("location"),
  causeOfDeath: text("cause_of_death"),
  sortOrder: integer("sort_order").default(0),
  featured: boolean("featured").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertFallenHeroSchema = createInsertSchema(fallenHeroes).omit({ id: true, createdAt: true });
export type InsertFallenHero = z.infer<typeof insertFallenHeroSchema>;
export type FallenHero = typeof fallenHeroes.$inferSelect;

export const humanRightsReports = pgTable("human_rights_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organization: text("organization").notNull(),
  title: text("title").notNull(),
  year: text("year").notNull(),
  url: text("url").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  status: text("status").notNull().default("approved"),
  source: text("source").notNull().default("manual"),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertHumanRightsReportSchema = createInsertSchema(humanRightsReports).omit({ id: true, createdAt: true });
export type InsertHumanRightsReport = z.infer<typeof insertHumanRightsReportSchema>;
export type HumanRightsReport = typeof humanRightsReports.$inferSelect;
