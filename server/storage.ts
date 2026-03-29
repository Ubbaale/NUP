import { 
  type User, type InsertUser,
  type Member, type InsertMember, members,
  type Region, type InsertRegion, regions,
  type Chapter, type InsertChapter, chapters,
  type ChapterLeader, type InsertChapterLeader, chapterLeaders,
  type Activity, type InsertActivity, activities,
  type Conference, type InsertConference, conferences,
  type Product, type InsertProduct, products,
  type Order, type InsertOrder, orders,
  type ProductRating, type InsertProductRating, productRatings,
  type Donation, type InsertDonation, donations,
  type BlogPost, type InsertBlogPost, blogPosts,
  type NewsItem, type InsertNewsItem, newsItems,
  type Subscription, type InsertSubscription, subscriptions,
  type CouncilMember, type InsertCouncilMember, councilMembers,
  type RevolutionarySong, type InsertRevolutionarySong, revolutionarySongs,
  type SongAccessToken, type InsertSongAccessToken, songAccessTokens,
  type SongPurchase, type InsertSongPurchase, songPurchases,
  type VirtualEvent, type InsertVirtualEvent, virtualEvents,
  type EventTicket, type InsertEventTicket, eventTickets,
  type Campaign, type InsertCampaign, campaigns,
  type CampaignDonation, type InsertCampaignDonation, campaignDonations,
  type CampaignFundraiser, type InsertCampaignFundraiser, campaignFundraisers,
  type MembershipTier, type InsertMembershipTier, membershipTiers,
  type MemberSubscription, type InsertMemberSubscription, memberSubscriptions,
  type AuctionItem, type InsertAuctionItem, auctionItems,
  type Bid, type InsertBid, bids,
  type RaffleTicket, type InsertRaffleTicket, raffleTickets,
  type ReturnRequest, type InsertReturnRequest, returnRequests,
  type GalleryPhoto, type InsertGalleryPhoto, galleryPhotos,
  type FallenHero, type InsertFallenHero, fallenHeroes,
  type HumanRightsReport, type InsertHumanRightsReport, humanRightsReports,
  type CommunityEvent, type InsertCommunityEvent, communityEvents,
  users
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, and, or, lte, ilike, sql, count } from "drizzle-orm";
import { randomUUID } from "crypto";

function generateMembershipId(): string {
  const prefix = "NUP";
  const year = new Date().getFullYear().toString().slice(-2);
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}${year}-${random}`;
}

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Members
  getMember(id: string): Promise<Member | undefined>;
  getMemberByEmail(email: string): Promise<Member | undefined>;
  getMemberByMembershipId(membershipId: string): Promise<Member | undefined>;
  createMember(member: InsertMember): Promise<Member>;
  updateMember(id: string, data: Partial<Member>): Promise<Member | undefined>;
  getAllMembers(): Promise<Member[]>;
  getMembersByRegion(regionId: string): Promise<Member[]>;
  searchMembers(query: string, regionId?: string): Promise<Member[]>;
  getMemberCount(regionId?: string): Promise<number>;
  getMemberCountByRegion(): Promise<{ regionId: string | null; count: number }[]>;
  
  // Regions
  getRegion(id: string): Promise<Region | undefined>;
  getRegionBySlug(slug: string): Promise<Region | undefined>;
  getAllRegions(): Promise<Region[]>;
  createRegion(region: InsertRegion): Promise<Region>;
  updateRegion(id: string, data: Partial<InsertRegion>): Promise<Region | undefined>;
  
  // Chapters
  getChapter(id: string): Promise<Chapter | undefined>;
  getChapterBySlug(slug: string): Promise<Chapter | undefined>;
  getChaptersByRegion(regionId: string): Promise<Chapter[]>;
  getAllChapters(): Promise<Chapter[]>;
  createChapter(chapter: InsertChapter): Promise<Chapter>;
  updateChapter(id: string, data: Partial<InsertChapter>): Promise<Chapter | undefined>;
  deleteChapter(id: string): Promise<void>;

  // Chapter Leaders
  getChapterLeaders(chapterId: string): Promise<ChapterLeader[]>;
  createChapterLeader(leader: InsertChapterLeader): Promise<ChapterLeader>;
  updateChapterLeader(id: string, data: Partial<InsertChapterLeader>): Promise<ChapterLeader | undefined>;
  deleteChapterLeader(id: string): Promise<void>;
  
  // Activities
  getActivitiesByChapter(chapterId: string): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  
  // Conferences
  getConference(id: string): Promise<Conference | undefined>;
  getConferenceBySlug(slug: string): Promise<Conference | undefined>;
  getAllConferences(): Promise<Conference[]>;
  createConference(conference: InsertConference): Promise<Conference>;
  updateConference(id: string, data: Partial<Conference>): Promise<Conference | undefined>;
  deleteConference(id: string): Promise<void>;
  
  // Products
  getProduct(id: string): Promise<Product | undefined>;
  getProductBySlug(slug: string): Promise<Product | undefined>;
  getAllProducts(): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, data: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<void>;
  
  // Orders
  createOrder(order: InsertOrder): Promise<Order>;
  getOrder(id: string): Promise<Order | undefined>;
  getAllOrders(): Promise<Order[]>;
  getOrdersByEmail(email: string): Promise<Order[]>;
  getOrdersByPrintfulStatus(status: string): Promise<Order[]>;
  updateOrderStatus(id: string, status: string, trackingNumber?: string, shippingCarrier?: string, estimatedDelivery?: string): Promise<Order | undefined>;
  updateOrderFulfillment(id: string, printfulOrderId: string, fulfillmentStatus: string, trackingNumber?: string, shippingCarrier?: string, estimatedDelivery?: string): Promise<Order | undefined>;
  updateOrderQuality(id: string, qualityNotes: string, qualityChecked: boolean): Promise<Order | undefined>;
  updateProductPrintful(id: string, printfulSyncVariantId: string, printfulProductId: string, baseCost?: string): Promise<Product | undefined>;

  // Return Requests
  createReturnRequest(request: InsertReturnRequest): Promise<ReturnRequest>;
  getReturnRequestsByOrder(orderId: string): Promise<ReturnRequest[]>;
  getAllReturnRequests(): Promise<ReturnRequest[]>;
  updateReturnRequest(id: string, status: string, adminNotes?: string): Promise<ReturnRequest | undefined>;

  // Gallery
  createGalleryPhoto(photo: InsertGalleryPhoto): Promise<GalleryPhoto>;
  getAllGalleryPhotos(): Promise<GalleryPhoto[]>;
  getGalleryPhotosByCategory(category: string): Promise<GalleryPhoto[]>;
  getGalleryPhoto(id: string): Promise<GalleryPhoto | undefined>;
  updateGalleryPhoto(id: string, data: Partial<InsertGalleryPhoto>): Promise<GalleryPhoto | undefined>;
  deleteGalleryPhoto(id: string): Promise<void>;

  // Fallen Heroes
  createFallenHero(hero: InsertFallenHero): Promise<FallenHero>;
  getAllFallenHeroes(): Promise<FallenHero[]>;
  getFallenHero(id: string): Promise<FallenHero | undefined>;
  updateFallenHero(id: string, data: Partial<InsertFallenHero>): Promise<FallenHero | undefined>;
  deleteFallenHero(id: string): Promise<void>;

  // Human Rights Reports
  createHumanRightsReport(report: InsertHumanRightsReport): Promise<HumanRightsReport>;
  getAllHumanRightsReports(): Promise<HumanRightsReport[]>;
  getApprovedHumanRightsReports(): Promise<HumanRightsReport[]>;
  getPendingHumanRightsReports(): Promise<HumanRightsReport[]>;
  getHumanRightsReport(id: string): Promise<HumanRightsReport | undefined>;
  getHumanRightsReportByUrl(url: string): Promise<HumanRightsReport | undefined>;
  updateHumanRightsReport(id: string, data: Partial<InsertHumanRightsReport>): Promise<HumanRightsReport | undefined>;
  deleteHumanRightsReport(id: string): Promise<void>;

  // Community Events
  createCommunityEvent(event: InsertCommunityEvent): Promise<CommunityEvent>;
  getAllCommunityEvents(): Promise<CommunityEvent[]>;
  getActiveCommunityEvents(): Promise<CommunityEvent[]>;
  getCommunityEvent(id: string): Promise<CommunityEvent | undefined>;
  updateCommunityEvent(id: string, data: Partial<CommunityEvent>): Promise<CommunityEvent | undefined>;
  deleteCommunityEvent(id: string): Promise<void>;

  // Product Ratings
  createProductRating(rating: InsertProductRating): Promise<ProductRating>;
  getProductRatings(productId: string): Promise<ProductRating[]>;
  getRatingByOrderAndProduct(orderId: string, productId: string): Promise<ProductRating | undefined>;
  
  // Donations
  createDonation(donation: InsertDonation): Promise<Donation>;
  getAllDonations(): Promise<Donation[]>;
  
  // Blog Posts
  getBlogPost(id: string): Promise<BlogPost | undefined>;
  getBlogPostBySlug(slug: string): Promise<BlogPost | undefined>;
  getAllBlogPosts(): Promise<BlogPost[]>;
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  updateBlogPost(id: string, data: Partial<BlogPost>): Promise<BlogPost | undefined>;
  deleteBlogPost(id: string): Promise<void>;
  
  // News Items
  getAllNewsItems(): Promise<NewsItem[]>;
  createNewsItem(item: InsertNewsItem): Promise<NewsItem>;
  
  // Subscriptions
  createSubscription(sub: InsertSubscription): Promise<Subscription>;
  getSubscriptionByEmail(email: string): Promise<Subscription | undefined>;
  getAllSubscriptions(): Promise<Subscription[]>;
  updateSubscription(id: string, data: Partial<Subscription>): Promise<Subscription | undefined>;
  deleteSubscription(id: string): Promise<void>;
  
  // Council Members
  getCouncilMembersByRegion(regionId: string): Promise<CouncilMember[]>;
  createCouncilMember(member: InsertCouncilMember): Promise<CouncilMember>;

  // Revolutionary Songs
  getAllSongs(): Promise<RevolutionarySong[]>;
  getActiveSongs(): Promise<RevolutionarySong[]>;
  getSong(id: string): Promise<RevolutionarySong | undefined>;
  createSong(song: InsertRevolutionarySong): Promise<RevolutionarySong>;
  updateSong(id: string, data: Partial<RevolutionarySong>): Promise<RevolutionarySong | undefined>;
  deleteSong(id: string): Promise<void>;
  incrementPlayCount(id: string): Promise<void>;
  incrementDownloadCount(id: string): Promise<void>;

  // Song Access Tokens
  createSongAccessToken(token: InsertSongAccessToken): Promise<SongAccessToken>;
  getSongAccessToken(token: string): Promise<SongAccessToken | undefined>;
  getSongAccessByEmail(email: string): Promise<SongAccessToken[]>;

  // Per-Song Purchases
  createSongPurchase(purchase: InsertSongPurchase): Promise<SongPurchase>;
  getSongPurchaseByToken(token: string): Promise<SongPurchase | undefined>;
  getSongPurchasesByEmail(email: string): Promise<SongPurchase[]>;
  getSongPurchasesBySongAndEmail(songId: string, email: string): Promise<SongPurchase[]>;

  // Virtual Events
  getAllEvents(): Promise<VirtualEvent[]>;
  getActiveEvents(): Promise<VirtualEvent[]>;
  getEventBySlug(slug: string): Promise<VirtualEvent | undefined>;
  createEvent(event: InsertVirtualEvent): Promise<VirtualEvent>;
  updateEvent(id: string, data: Partial<VirtualEvent>): Promise<VirtualEvent | undefined>;
  deleteEvent(id: string): Promise<void>;
  createTicket(ticket: InsertEventTicket): Promise<EventTicket>;
  getTicketsByEvent(eventId: string): Promise<EventTicket[]>;
  getTicketByCode(code: string): Promise<EventTicket | undefined>;
  updateTicketPaymentStatus(id: string, status: string): Promise<void>;

  // Campaigns
  getAllCampaigns(): Promise<Campaign[]>;
  getActiveCampaigns(): Promise<Campaign[]>;
  getCampaignBySlug(slug: string): Promise<Campaign | undefined>;
  createCampaign(campaign: InsertCampaign): Promise<Campaign>;
  updateCampaign(id: string, data: Partial<Campaign>): Promise<Campaign | undefined>;
  deleteCampaign(id: string): Promise<void>;
  createCampaignDonation(donation: InsertCampaignDonation): Promise<CampaignDonation>;
  getCampaignDonations(campaignId: string): Promise<CampaignDonation[]>;
  
  // Campaign Fundraisers
  getCampaignFundraisers(campaignId: string): Promise<CampaignFundraiser[]>;
  getCampaignFundraiserBySlug(slug: string): Promise<CampaignFundraiser | undefined>;
  createCampaignFundraiser(fundraiser: InsertCampaignFundraiser): Promise<CampaignFundraiser>;
  updateCampaignFundraiser(id: string, data: Partial<CampaignFundraiser>): Promise<CampaignFundraiser | undefined>;
  getFundraiserDonations(fundraiserId: string): Promise<CampaignDonation[]>;

  // Membership Tiers
  getAllTiers(): Promise<MembershipTier[]>;
  getActiveTiers(): Promise<MembershipTier[]>;
  getTier(id: string): Promise<MembershipTier | undefined>;
  createTier(tier: InsertMembershipTier): Promise<MembershipTier>;
  updateTier(id: string, data: Partial<MembershipTier>): Promise<MembershipTier | undefined>;
  deleteTier(id: string): Promise<void>;
  createMemberSubscription(sub: InsertMemberSubscription): Promise<MemberSubscription>;
  getMemberSubscriptionByEmail(email: string): Promise<MemberSubscription | undefined>;
  getAllMemberSubscriptions(): Promise<MemberSubscription[]>;
  updateMemberSubscription(id: string, data: Partial<MemberSubscription>): Promise<MemberSubscription | undefined>;

  // Auctions & Raffles
  getAllAuctionItems(): Promise<AuctionItem[]>;
  getActiveAuctionItems(): Promise<AuctionItem[]>;
  getAuctionItemBySlug(slug: string): Promise<AuctionItem | undefined>;
  createAuctionItem(item: InsertAuctionItem): Promise<AuctionItem>;
  updateAuctionItem(id: string, data: Partial<AuctionItem>): Promise<AuctionItem | undefined>;
  deleteAuctionItem(id: string): Promise<void>;
  createBid(bid: InsertBid): Promise<Bid>;
  getBidsByItem(auctionItemId: string): Promise<Bid[]>;
  getHighestBid(auctionItemId: string): Promise<Bid | undefined>;
  createRaffleTicket(ticket: InsertRaffleTicket): Promise<RaffleTicket>;
  getRaffleTicketsByItem(auctionItemId: string): Promise<RaffleTicket[]>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Members
  async getMember(id: string): Promise<Member | undefined> {
    const [member] = await db.select().from(members).where(eq(members.id, id));
    return member;
  }

  async getMemberByEmail(email: string): Promise<Member | undefined> {
    const [member] = await db.select().from(members).where(eq(members.email, email));
    return member;
  }

  async getMemberByMembershipId(membershipId: string): Promise<Member | undefined> {
    const [member] = await db.select().from(members).where(eq(members.membershipId, membershipId));
    return member;
  }

  async createMember(insertMember: InsertMember): Promise<Member> {
    const membershipId = generateMembershipId();
    const [member] = await db.insert(members).values({ ...insertMember, membershipId }).returning();
    return member;
  }

  async updateMember(id: string, data: Partial<Member>): Promise<Member | undefined> {
    const [member] = await db.update(members).set(data).where(eq(members.id, id)).returning();
    return member;
  }

  async getAllMembers(): Promise<Member[]> {
    return db.select().from(members).orderBy(desc(members.joinedAt));
  }

  async getMembersByRegion(regionId: string): Promise<Member[]> {
    return db.select().from(members).where(eq(members.regionId, regionId)).orderBy(desc(members.joinedAt));
  }

  async searchMembers(query: string, regionId?: string): Promise<Member[]> {
    const searchPattern = `%${query}%`;
    const searchConditions = or(
      ilike(members.firstName, searchPattern),
      ilike(members.lastName, searchPattern),
      ilike(members.email, searchPattern),
      ilike(members.membershipId, searchPattern),
      ilike(members.city, searchPattern),
    );
    const conditions = regionId
      ? and(searchConditions, eq(members.regionId, regionId))
      : searchConditions;
    return db.select().from(members).where(conditions!).orderBy(desc(members.joinedAt));
  }

  async getMemberCount(regionId?: string): Promise<number> {
    const condition = regionId ? eq(members.regionId, regionId) : undefined;
    const [result] = await db.select({ count: count() }).from(members).where(condition);
    return result?.count ?? 0;
  }

  async getMemberCountByRegion(): Promise<{ regionId: string | null; count: number }[]> {
    const result = await db
      .select({ regionId: members.regionId, count: count() })
      .from(members)
      .groupBy(members.regionId);
    return result;
  }

  // Regions
  async getRegion(id: string): Promise<Region | undefined> {
    const [region] = await db.select().from(regions).where(eq(regions.id, id));
    return region;
  }

  async getRegionBySlug(slug: string): Promise<Region | undefined> {
    const [region] = await db.select().from(regions).where(eq(regions.slug, slug));
    return region;
  }

  async getAllRegions(): Promise<Region[]> {
    return db.select().from(regions);
  }

  async createRegion(insertRegion: InsertRegion): Promise<Region> {
    const [region] = await db.insert(regions).values(insertRegion).returning();
    return region;
  }

  async updateRegion(id: string, data: Partial<InsertRegion>): Promise<Region | undefined> {
    const [region] = await db.update(regions).set(data).where(eq(regions.id, id)).returning();
    return region;
  }

  // Chapters
  async getChapter(id: string): Promise<Chapter | undefined> {
    const [chapter] = await db.select().from(chapters).where(eq(chapters.id, id));
    return chapter;
  }

  async getChapterBySlug(slug: string): Promise<Chapter | undefined> {
    const [chapter] = await db.select().from(chapters).where(eq(chapters.slug, slug));
    return chapter;
  }

  async getChaptersByRegion(regionId: string): Promise<Chapter[]> {
    return db.select().from(chapters).where(eq(chapters.regionId, regionId)).orderBy(asc(chapters.name));
  }

  async getAllChapters(): Promise<Chapter[]> {
    return db.select().from(chapters).orderBy(asc(chapters.name));
  }

  async createChapter(insertChapter: InsertChapter): Promise<Chapter> {
    const [chapter] = await db.insert(chapters).values(insertChapter).returning();
    return chapter;
  }

  async updateChapter(id: string, data: Partial<InsertChapter>): Promise<Chapter | undefined> {
    const [chapter] = await db.update(chapters).set(data).where(eq(chapters.id, id)).returning();
    return chapter;
  }

  async deleteChapter(id: string): Promise<void> {
    await db.delete(chapterLeaders).where(eq(chapterLeaders.chapterId, id));
    await db.delete(activities).where(eq(activities.chapterId, id));
    await db.delete(chapters).where(eq(chapters.id, id));
  }

  // Chapter Leaders
  async getChapterLeaders(chapterId: string): Promise<ChapterLeader[]> {
    return db.select().from(chapterLeaders).where(eq(chapterLeaders.chapterId, chapterId)).orderBy(chapterLeaders.displayOrder);
  }

  async createChapterLeader(leader: InsertChapterLeader): Promise<ChapterLeader> {
    const [created] = await db.insert(chapterLeaders).values(leader).returning();
    return created;
  }

  async updateChapterLeader(id: string, data: Partial<InsertChapterLeader>): Promise<ChapterLeader | undefined> {
    const [updated] = await db.update(chapterLeaders).set(data).where(eq(chapterLeaders.id, id)).returning();
    return updated;
  }

  async deleteChapterLeader(id: string): Promise<void> {
    await db.delete(chapterLeaders).where(eq(chapterLeaders.id, id));
  }

  // Activities
  async getActivitiesByChapter(chapterId: string): Promise<Activity[]> {
    return db.select().from(activities).where(eq(activities.chapterId, chapterId)).orderBy(desc(activities.date));
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const [activity] = await db.insert(activities).values(insertActivity).returning();
    return activity;
  }

  // Conferences
  async getConference(id: string): Promise<Conference | undefined> {
    const [conference] = await db.select().from(conferences).where(eq(conferences.id, id));
    return conference;
  }

  async getConferenceBySlug(slug: string): Promise<Conference | undefined> {
    const [conference] = await db.select().from(conferences).where(eq(conferences.slug, slug));
    return conference;
  }

  async getAllConferences(): Promise<Conference[]> {
    const fourMonthsAgo = new Date();
    fourMonthsAgo.setMonth(fourMonthsAgo.getMonth() - 4);

    await db
      .update(conferences)
      .set({ isUpcoming: false })
      .where(
        and(
          eq(conferences.isUpcoming, true),
          lte(conferences.endDate, fourMonthsAgo)
        )
      );

    return db.select().from(conferences).orderBy(desc(conferences.year));
  }

  async createConference(insertConference: InsertConference): Promise<Conference> {
    const [conference] = await db.insert(conferences).values(insertConference).returning();
    return conference;
  }

  async updateConference(id: string, data: Partial<Conference>): Promise<Conference | undefined> {
    const [conference] = await db.update(conferences).set(data).where(eq(conferences.id, id)).returning();
    return conference;
  }

  async deleteConference(id: string): Promise<void> {
    await db.delete(conferences).where(eq(conferences.id, id));
  }

  // Products
  async getProduct(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async getProductBySlug(slug: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.slug, slug));
    return product;
  }

  async getAllProducts(): Promise<Product[]> {
    return db.select().from(products);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db.insert(products).values(insertProduct).returning();
    return product;
  }

  async updateProduct(id: string, data: Partial<InsertProduct>): Promise<Product | undefined> {
    const [product] = await db.update(products).set(data).where(eq(products.id, id)).returning();
    return product;
  }

  async deleteProduct(id: string): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  // Orders
  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const [order] = await db.insert(orders).values(insertOrder).returning();
    return order;
  }

  async getOrder(id: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async getOrdersByEmail(email: string): Promise<Order[]> {
    return db.select().from(orders).where(eq(orders.email, email)).orderBy(desc(orders.createdAt));
  }

  async updateOrderStatus(id: string, status: string, trackingNumber?: string, shippingCarrier?: string, estimatedDelivery?: string): Promise<Order | undefined> {
    const updateData: Partial<Order> = { status };
    if (trackingNumber) updateData.trackingNumber = trackingNumber;
    if (shippingCarrier) updateData.shippingCarrier = shippingCarrier;
    if (estimatedDelivery) updateData.estimatedDelivery = estimatedDelivery;
    if (status === "delivered") updateData.deliveredAt = new Date();
    const [order] = await db.update(orders).set(updateData).where(eq(orders.id, id)).returning();
    return order;
  }

  async updateOrderFulfillment(id: string, printfulOrderId: string, fulfillmentStatus: string, trackingNumber?: string, shippingCarrier?: string, estimatedDelivery?: string): Promise<Order | undefined> {
    const updateData: Partial<Order> = { printfulOrderId, fulfillmentStatus };
    if (trackingNumber) updateData.trackingNumber = trackingNumber;
    if (shippingCarrier) updateData.shippingCarrier = shippingCarrier;
    if (estimatedDelivery) updateData.estimatedDelivery = estimatedDelivery;
    const [order] = await db.update(orders).set(updateData).where(eq(orders.id, id)).returning();
    return order;
  }

  async updateOrderQuality(id: string, qualityNotes: string, qualityChecked: boolean): Promise<Order | undefined> {
    const [order] = await db.update(orders).set({ qualityNotes, qualityChecked }).where(eq(orders.id, id)).returning();
    return order;
  }

  async updateProductPrintful(id: string, printfulSyncVariantId: string, printfulProductId: string, baseCost?: string): Promise<Product | undefined> {
    const updateData: Partial<Product> = { printfulSyncVariantId, printfulProductId };
    if (baseCost) updateData.baseCost = baseCost;
    const [product] = await db.update(products).set(updateData).where(eq(products.id, id)).returning();
    return product;
  }

  async getAllOrders(): Promise<Order[]> {
    return db.select().from(orders).orderBy(desc(orders.createdAt));
  }

  async getOrdersByPrintfulStatus(status: string): Promise<Order[]> {
    return db.select().from(orders).where(eq(orders.fulfillmentStatus, status)).orderBy(desc(orders.createdAt));
  }

  async createReturnRequest(request: InsertReturnRequest): Promise<ReturnRequest> {
    const [rr] = await db.insert(returnRequests).values(request).returning();
    return rr;
  }

  async getReturnRequestsByOrder(orderId: string): Promise<ReturnRequest[]> {
    return db.select().from(returnRequests).where(eq(returnRequests.orderId, orderId)).orderBy(desc(returnRequests.createdAt));
  }

  async getAllReturnRequests(): Promise<ReturnRequest[]> {
    return db.select().from(returnRequests).orderBy(desc(returnRequests.createdAt));
  }

  async updateReturnRequest(id: string, status: string, adminNotes?: string): Promise<ReturnRequest | undefined> {
    const updateData: Partial<ReturnRequest> = { status };
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;
    if (status === "approved" || status === "denied") updateData.resolvedAt = new Date();
    const [rr] = await db.update(returnRequests).set(updateData).where(eq(returnRequests.id, id)).returning();
    return rr;
  }

  async createGalleryPhoto(photo: InsertGalleryPhoto): Promise<GalleryPhoto> {
    const [p] = await db.insert(galleryPhotos).values(photo).returning();
    return p;
  }

  async getAllGalleryPhotos(): Promise<GalleryPhoto[]> {
    return db.select().from(galleryPhotos).orderBy(asc(galleryPhotos.sortOrder), desc(galleryPhotos.createdAt));
  }

  async getGalleryPhotosByCategory(category: string): Promise<GalleryPhoto[]> {
    return db.select().from(galleryPhotos).where(eq(galleryPhotos.category, category)).orderBy(asc(galleryPhotos.sortOrder), desc(galleryPhotos.createdAt));
  }

  async getGalleryPhoto(id: string): Promise<GalleryPhoto | undefined> {
    const [p] = await db.select().from(galleryPhotos).where(eq(galleryPhotos.id, id));
    return p;
  }

  async updateGalleryPhoto(id: string, data: Partial<InsertGalleryPhoto>): Promise<GalleryPhoto | undefined> {
    const [p] = await db.update(galleryPhotos).set(data).where(eq(galleryPhotos.id, id)).returning();
    return p;
  }

  async deleteGalleryPhoto(id: string): Promise<void> {
    await db.delete(galleryPhotos).where(eq(galleryPhotos.id, id));
  }

  // Fallen Heroes
  async createFallenHero(hero: InsertFallenHero): Promise<FallenHero> {
    const [h] = await db.insert(fallenHeroes).values(hero).returning();
    return h;
  }

  async getAllFallenHeroes(): Promise<FallenHero[]> {
    return db.select().from(fallenHeroes).orderBy(asc(fallenHeroes.sortOrder), desc(fallenHeroes.createdAt));
  }

  async getFallenHero(id: string): Promise<FallenHero | undefined> {
    const [h] = await db.select().from(fallenHeroes).where(eq(fallenHeroes.id, id));
    return h;
  }

  async updateFallenHero(id: string, data: Partial<InsertFallenHero>): Promise<FallenHero | undefined> {
    const [h] = await db.update(fallenHeroes).set(data).where(eq(fallenHeroes.id, id)).returning();
    return h;
  }

  async deleteFallenHero(id: string): Promise<void> {
    await db.delete(fallenHeroes).where(eq(fallenHeroes.id, id));
  }

  async createHumanRightsReport(report: InsertHumanRightsReport): Promise<HumanRightsReport> {
    const [r] = await db.insert(humanRightsReports).values(report).returning();
    return r;
  }

  async getAllHumanRightsReports(): Promise<HumanRightsReport[]> {
    return db.select().from(humanRightsReports).orderBy(desc(humanRightsReports.year), asc(humanRightsReports.organization));
  }

  async getApprovedHumanRightsReports(): Promise<HumanRightsReport[]> {
    return db.select().from(humanRightsReports).where(eq(humanRightsReports.status, "approved")).orderBy(desc(humanRightsReports.year), asc(humanRightsReports.organization));
  }

  async getPendingHumanRightsReports(): Promise<HumanRightsReport[]> {
    return db.select().from(humanRightsReports).where(eq(humanRightsReports.status, "pending")).orderBy(desc(humanRightsReports.year));
  }

  async getHumanRightsReport(id: string): Promise<HumanRightsReport | undefined> {
    const [r] = await db.select().from(humanRightsReports).where(eq(humanRightsReports.id, id));
    return r;
  }

  async getHumanRightsReportByUrl(url: string): Promise<HumanRightsReport | undefined> {
    const [r] = await db.select().from(humanRightsReports).where(eq(humanRightsReports.url, url));
    return r;
  }

  async updateHumanRightsReport(id: string, data: Partial<InsertHumanRightsReport>): Promise<HumanRightsReport | undefined> {
    const [r] = await db.update(humanRightsReports).set(data).where(eq(humanRightsReports.id, id)).returning();
    return r;
  }

  async deleteHumanRightsReport(id: string): Promise<void> {
    await db.delete(humanRightsReports).where(eq(humanRightsReports.id, id));
  }

  // Community Events
  async createCommunityEvent(event: InsertCommunityEvent): Promise<CommunityEvent> {
    const [created] = await db.insert(communityEvents).values(event).returning();
    return created;
  }

  async getAllCommunityEvents(): Promise<CommunityEvent[]> {
    return await db.select().from(communityEvents).orderBy(desc(communityEvents.createdAt));
  }

  async getActiveCommunityEvents(): Promise<CommunityEvent[]> {
    return await db.select().from(communityEvents).where(eq(communityEvents.status, "active")).orderBy(desc(communityEvents.createdAt));
  }

  async getCommunityEvent(id: string): Promise<CommunityEvent | undefined> {
    const [event] = await db.select().from(communityEvents).where(eq(communityEvents.id, id));
    return event;
  }

  async updateCommunityEvent(id: string, data: Partial<CommunityEvent>): Promise<CommunityEvent | undefined> {
    const [updated] = await db.update(communityEvents).set(data).where(eq(communityEvents.id, id)).returning();
    return updated;
  }

  async deleteCommunityEvent(id: string): Promise<void> {
    await db.delete(communityEvents).where(eq(communityEvents.id, id));
  }

  // Product Ratings
  async createProductRating(insertRating: InsertProductRating): Promise<ProductRating> {
    const [rating] = await db.insert(productRatings).values(insertRating).returning();
    return rating;
  }

  async getProductRatings(productId: string): Promise<ProductRating[]> {
    return db.select().from(productRatings).where(eq(productRatings.productId, productId)).orderBy(desc(productRatings.createdAt));
  }

  async getRatingByOrderAndProduct(orderId: string, productId: string): Promise<ProductRating | undefined> {
    const [rating] = await db.select().from(productRatings).where(
      and(eq(productRatings.orderId, orderId), eq(productRatings.productId, productId))
    );
    return rating;
  }

  // Donations
  async createDonation(insertDonation: InsertDonation): Promise<Donation> {
    const [donation] = await db.insert(donations).values(insertDonation).returning();
    return donation;
  }

  async getAllDonations(): Promise<Donation[]> {
    return db.select().from(donations).orderBy(desc(donations.createdAt));
  }

  // Blog Posts
  async getBlogPost(id: string): Promise<BlogPost | undefined> {
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.id, id));
    return post;
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug));
    return post;
  }

  async getAllBlogPosts(): Promise<BlogPost[]> {
    return db.select().from(blogPosts).orderBy(desc(blogPosts.createdAt));
  }

  async createBlogPost(insertPost: InsertBlogPost): Promise<BlogPost> {
    const [post] = await db.insert(blogPosts).values(insertPost).returning();
    return post;
  }

  async updateBlogPost(id: string, data: Partial<BlogPost>): Promise<BlogPost | undefined> {
    const [post] = await db.update(blogPosts).set(data).where(eq(blogPosts.id, id)).returning();
    return post;
  }

  async deleteBlogPost(id: string): Promise<void> {
    await db.delete(blogPosts).where(eq(blogPosts.id, id));
  }

  // News Items
  async getAllNewsItems(): Promise<NewsItem[]> {
    return db.select().from(newsItems).orderBy(desc(newsItems.publishedAt));
  }

  async createNewsItem(insertItem: InsertNewsItem): Promise<NewsItem> {
    const [item] = await db.insert(newsItems).values(insertItem).returning();
    return item;
  }

  // Subscriptions
  async createSubscription(insertSub: InsertSubscription): Promise<Subscription> {
    const [sub] = await db.insert(subscriptions).values(insertSub).returning();
    return sub;
  }

  async getSubscriptionByEmail(email: string): Promise<Subscription | undefined> {
    const [sub] = await db.select().from(subscriptions).where(eq(subscriptions.email, email));
    return sub;
  }

  async getAllSubscriptions(): Promise<Subscription[]> {
    return db.select().from(subscriptions).orderBy(desc(subscriptions.subscribedAt));
  }

  async updateSubscription(id: string, data: Partial<Subscription>): Promise<Subscription | undefined> {
    const [sub] = await db.update(subscriptions).set(data).where(eq(subscriptions.id, id)).returning();
    return sub;
  }

  async deleteSubscription(id: string): Promise<void> {
    await db.delete(subscriptions).where(eq(subscriptions.id, id));
  }

  // Council Members
  async getCouncilMembersByRegion(regionId: string): Promise<CouncilMember[]> {
    return db.select().from(councilMembers).where(eq(councilMembers.regionId, regionId));
  }

  async createCouncilMember(insertMember: InsertCouncilMember): Promise<CouncilMember> {
    const [member] = await db.insert(councilMembers).values(insertMember).returning();
    return member;
  }

  // Revolutionary Songs
  async getAllSongs(): Promise<RevolutionarySong[]> {
    return db.select().from(revolutionarySongs).orderBy(desc(revolutionarySongs.createdAt));
  }

  async getActiveSongs(): Promise<RevolutionarySong[]> {
    return db.select().from(revolutionarySongs).where(eq(revolutionarySongs.isActive, true)).orderBy(desc(revolutionarySongs.createdAt));
  }

  async getSong(id: string): Promise<RevolutionarySong | undefined> {
    const [song] = await db.select().from(revolutionarySongs).where(eq(revolutionarySongs.id, id));
    return song;
  }

  async createSong(insertSong: InsertRevolutionarySong): Promise<RevolutionarySong> {
    const [song] = await db.insert(revolutionarySongs).values(insertSong).returning();
    return song;
  }

  async updateSong(id: string, data: Partial<RevolutionarySong>): Promise<RevolutionarySong | undefined> {
    const [song] = await db.update(revolutionarySongs).set(data).where(eq(revolutionarySongs.id, id)).returning();
    return song;
  }

  async deleteSong(id: string): Promise<void> {
    await db.delete(revolutionarySongs).where(eq(revolutionarySongs.id, id));
  }

  async incrementPlayCount(id: string): Promise<void> {
    const song = await this.getSong(id);
    if (song) {
      await db.update(revolutionarySongs).set({ playCount: (song.playCount || 0) + 1 }).where(eq(revolutionarySongs.id, id));
    }
  }

  async incrementDownloadCount(id: string): Promise<void> {
    const song = await this.getSong(id);
    if (song) {
      await db.update(revolutionarySongs).set({ downloadCount: (song.downloadCount || 0) + 1 }).where(eq(revolutionarySongs.id, id));
    }
  }

  // Song Access Tokens
  async createSongAccessToken(insertToken: InsertSongAccessToken): Promise<SongAccessToken> {
    const [token] = await db.insert(songAccessTokens).values(insertToken).returning();
    return token;
  }

  async getSongAccessToken(token: string): Promise<SongAccessToken | undefined> {
    const [access] = await db.select().from(songAccessTokens).where(eq(songAccessTokens.token, token));
    return access;
  }

  async getSongAccessByEmail(email: string): Promise<SongAccessToken[]> {
    return db.select().from(songAccessTokens).where(eq(songAccessTokens.email, email)).orderBy(desc(songAccessTokens.createdAt));
  }

  // Per-Song Purchases
  async createSongPurchase(purchase: InsertSongPurchase): Promise<SongPurchase> {
    const [result] = await db.insert(songPurchases).values(purchase).returning();
    return result;
  }

  async getSongPurchaseByToken(token: string): Promise<SongPurchase | undefined> {
    const [purchase] = await db.select().from(songPurchases).where(eq(songPurchases.token, token));
    return purchase;
  }

  async getSongPurchasesByEmail(email: string): Promise<SongPurchase[]> {
    return db.select().from(songPurchases).where(eq(songPurchases.buyerEmail, email)).orderBy(desc(songPurchases.createdAt));
  }

  async getSongPurchasesBySongAndEmail(songId: string, email: string): Promise<SongPurchase[]> {
    return db.select().from(songPurchases)
      .where(and(eq(songPurchases.songId, songId), eq(songPurchases.buyerEmail, email)))
      .orderBy(desc(songPurchases.createdAt));
  }

  // Virtual Events
  async getAllEvents(): Promise<VirtualEvent[]> {
    return db.select().from(virtualEvents).orderBy(desc(virtualEvents.eventDate));
  }
  async getActiveEvents(): Promise<VirtualEvent[]> {
    return db.select().from(virtualEvents).where(eq(virtualEvents.isActive, true)).orderBy(virtualEvents.eventDate);
  }
  async getEventBySlug(slug: string): Promise<VirtualEvent | undefined> {
    const [event] = await db.select().from(virtualEvents).where(eq(virtualEvents.slug, slug));
    return event;
  }
  async createEvent(insertEvent: InsertVirtualEvent): Promise<VirtualEvent> {
    const [event] = await db.insert(virtualEvents).values(insertEvent).returning();
    return event;
  }
  async updateEvent(id: string, data: Partial<VirtualEvent>): Promise<VirtualEvent | undefined> {
    const [event] = await db.update(virtualEvents).set(data).where(eq(virtualEvents.id, id)).returning();
    return event;
  }
  async deleteEvent(id: string): Promise<void> {
    await db.delete(virtualEvents).where(eq(virtualEvents.id, id));
  }
  async createTicket(insertTicket: InsertEventTicket): Promise<EventTicket> {
    const [ticket] = await db.insert(eventTickets).values(insertTicket).returning();
    return ticket;
  }
  async getTicketsByEvent(eventId: string): Promise<EventTicket[]> {
    return db.select().from(eventTickets).where(eq(eventTickets.eventId, eventId)).orderBy(desc(eventTickets.purchasedAt));
  }
  async getTicketByCode(code: string): Promise<EventTicket | undefined> {
    const [ticket] = await db.select().from(eventTickets).where(eq(eventTickets.ticketCode, code));
    return ticket;
  }
  async updateTicketPaymentStatus(id: string, status: string): Promise<void> {
    await db.update(eventTickets).set({ paymentStatus: status }).where(eq(eventTickets.id, id));
  }

  // Campaigns
  async getAllCampaigns(): Promise<Campaign[]> {
    return db.select().from(campaigns).orderBy(desc(campaigns.createdAt));
  }
  async getActiveCampaigns(): Promise<Campaign[]> {
    return db.select().from(campaigns).where(eq(campaigns.isActive, true)).orderBy(desc(campaigns.createdAt));
  }
  async getCampaignBySlug(slug: string): Promise<Campaign | undefined> {
    const [campaign] = await db.select().from(campaigns).where(eq(campaigns.slug, slug));
    return campaign;
  }
  async createCampaign(insertCampaign: InsertCampaign): Promise<Campaign> {
    const [campaign] = await db.insert(campaigns).values(insertCampaign).returning();
    return campaign;
  }
  async updateCampaign(id: string, data: Partial<Campaign>): Promise<Campaign | undefined> {
    const [campaign] = await db.update(campaigns).set(data).where(eq(campaigns.id, id)).returning();
    return campaign;
  }
  async deleteCampaign(id: string): Promise<void> {
    await db.delete(campaignDonations).where(eq(campaignDonations.campaignId, id));
    await db.delete(campaignFundraisers).where(eq(campaignFundraisers.campaignId, id));
    await db.delete(campaigns).where(eq(campaigns.id, id));
  }
  async createCampaignDonation(insertDonation: InsertCampaignDonation): Promise<CampaignDonation> {
    const [donation] = await db.insert(campaignDonations).values(insertDonation).returning();
    return donation;
  }
  async getCampaignDonations(campaignId: string): Promise<CampaignDonation[]> {
    return db.select().from(campaignDonations).where(eq(campaignDonations.campaignId, campaignId)).orderBy(desc(campaignDonations.createdAt));
  }

  // Campaign Fundraisers
  async getCampaignFundraisers(campaignId: string): Promise<CampaignFundraiser[]> {
    return db.select().from(campaignFundraisers).where(eq(campaignFundraisers.campaignId, campaignId)).orderBy(desc(campaignFundraisers.raisedAmount));
  }
  async getCampaignFundraiserBySlug(slug: string): Promise<CampaignFundraiser | undefined> {
    const [fundraiser] = await db.select().from(campaignFundraisers).where(eq(campaignFundraisers.slug, slug));
    return fundraiser;
  }
  async createCampaignFundraiser(data: InsertCampaignFundraiser): Promise<CampaignFundraiser> {
    const [fundraiser] = await db.insert(campaignFundraisers).values(data).returning();
    return fundraiser;
  }
  async updateCampaignFundraiser(id: string, data: Partial<CampaignFundraiser>): Promise<CampaignFundraiser | undefined> {
    const [fundraiser] = await db.update(campaignFundraisers).set(data).where(eq(campaignFundraisers.id, id)).returning();
    return fundraiser;
  }
  async getFundraiserDonations(fundraiserId: string): Promise<CampaignDonation[]> {
    return db.select().from(campaignDonations).where(eq(campaignDonations.fundraiserId, fundraiserId)).orderBy(desc(campaignDonations.createdAt));
  }

  // Membership Tiers
  async getAllTiers(): Promise<MembershipTier[]> {
    return db.select().from(membershipTiers).orderBy(membershipTiers.displayOrder);
  }
  async getActiveTiers(): Promise<MembershipTier[]> {
    return db.select().from(membershipTiers).where(eq(membershipTiers.isActive, true)).orderBy(membershipTiers.displayOrder);
  }
  async getTier(id: string): Promise<MembershipTier | undefined> {
    const [tier] = await db.select().from(membershipTiers).where(eq(membershipTiers.id, id));
    return tier;
  }
  async createTier(insertTier: InsertMembershipTier): Promise<MembershipTier> {
    const [tier] = await db.insert(membershipTiers).values(insertTier).returning();
    return tier;
  }
  async updateTier(id: string, data: Partial<MembershipTier>): Promise<MembershipTier | undefined> {
    const [tier] = await db.update(membershipTiers).set(data).where(eq(membershipTiers.id, id)).returning();
    return tier;
  }
  async deleteTier(id: string): Promise<void> {
    await db.delete(membershipTiers).where(eq(membershipTiers.id, id));
  }
  async createMemberSubscription(insertSub: InsertMemberSubscription): Promise<MemberSubscription> {
    const [sub] = await db.insert(memberSubscriptions).values(insertSub).returning();
    return sub;
  }
  async getMemberSubscriptionByEmail(email: string): Promise<MemberSubscription | undefined> {
    const [sub] = await db.select().from(memberSubscriptions).where(and(eq(memberSubscriptions.email, email), eq(memberSubscriptions.status, "active")));
    return sub;
  }
  async getAllMemberSubscriptions(): Promise<MemberSubscription[]> {
    return db.select().from(memberSubscriptions).orderBy(desc(memberSubscriptions.createdAt));
  }
  async updateMemberSubscription(id: string, data: Partial<MemberSubscription>): Promise<MemberSubscription | undefined> {
    const [sub] = await db.update(memberSubscriptions).set(data).where(eq(memberSubscriptions.id, id)).returning();
    return sub;
  }

  // Auctions & Raffles
  async getAllAuctionItems(): Promise<AuctionItem[]> {
    return db.select().from(auctionItems).orderBy(desc(auctionItems.createdAt));
  }
  async getActiveAuctionItems(): Promise<AuctionItem[]> {
    return db.select().from(auctionItems).where(eq(auctionItems.isActive, true)).orderBy(auctionItems.endDate);
  }
  async getAuctionItemBySlug(slug: string): Promise<AuctionItem | undefined> {
    const [item] = await db.select().from(auctionItems).where(eq(auctionItems.slug, slug));
    return item;
  }
  async createAuctionItem(insertItem: InsertAuctionItem): Promise<AuctionItem> {
    const [item] = await db.insert(auctionItems).values(insertItem).returning();
    return item;
  }
  async updateAuctionItem(id: string, data: Partial<AuctionItem>): Promise<AuctionItem | undefined> {
    const [item] = await db.update(auctionItems).set(data).where(eq(auctionItems.id, id)).returning();
    return item;
  }
  async deleteAuctionItem(id: string): Promise<void> {
    await db.delete(bids).where(eq(bids.auctionItemId, id));
    await db.delete(raffleTickets).where(eq(raffleTickets.auctionItemId, id));
    await db.delete(auctionItems).where(eq(auctionItems.id, id));
  }
  async createBid(insertBid: InsertBid): Promise<Bid> {
    const [bid] = await db.insert(bids).values(insertBid).returning();
    return bid;
  }
  async getBidsByItem(auctionItemId: string): Promise<Bid[]> {
    return db.select().from(bids).where(eq(bids.auctionItemId, auctionItemId)).orderBy(desc(bids.amount));
  }
  async getHighestBid(auctionItemId: string): Promise<Bid | undefined> {
    const [bid] = await db.select().from(bids).where(eq(bids.auctionItemId, auctionItemId)).orderBy(desc(bids.amount)).limit(1);
    return bid;
  }
  async createRaffleTicket(insertTicket: InsertRaffleTicket): Promise<RaffleTicket> {
    const [ticket] = await db.insert(raffleTickets).values(insertTicket).returning();
    return ticket;
  }
  async getRaffleTicketsByItem(auctionItemId: string): Promise<RaffleTicket[]> {
    return db.select().from(raffleTickets).where(eq(raffleTickets.auctionItemId, auctionItemId)).orderBy(desc(raffleTickets.createdAt));
  }
}

export const storage = new DatabaseStorage();
