import { 
  type User, type InsertUser,
  type Member, type InsertMember, members,
  type Region, type InsertRegion, regions,
  type Chapter, type InsertChapter, chapters,
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
  users
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or } from "drizzle-orm";
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
  getAllMembers(): Promise<Member[]>;
  
  // Regions
  getRegion(id: string): Promise<Region | undefined>;
  getRegionBySlug(slug: string): Promise<Region | undefined>;
  getAllRegions(): Promise<Region[]>;
  createRegion(region: InsertRegion): Promise<Region>;
  
  // Chapters
  getChapter(id: string): Promise<Chapter | undefined>;
  getChapterBySlug(slug: string): Promise<Chapter | undefined>;
  getChaptersByRegion(regionId: string): Promise<Chapter[]>;
  getAllChapters(): Promise<Chapter[]>;
  createChapter(chapter: InsertChapter): Promise<Chapter>;
  
  // Activities
  getActivitiesByChapter(chapterId: string): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  
  // Conferences
  getConference(id: string): Promise<Conference | undefined>;
  getConferenceBySlug(slug: string): Promise<Conference | undefined>;
  getAllConferences(): Promise<Conference[]>;
  createConference(conference: InsertConference): Promise<Conference>;
  
  // Products
  getProduct(id: string): Promise<Product | undefined>;
  getProductBySlug(slug: string): Promise<Product | undefined>;
  getAllProducts(): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  
  // Orders
  createOrder(order: InsertOrder): Promise<Order>;
  getOrder(id: string): Promise<Order | undefined>;
  getOrdersByEmail(email: string): Promise<Order[]>;
  updateOrderStatus(id: string, status: string, trackingNumber?: string, shippingCarrier?: string, estimatedDelivery?: string): Promise<Order | undefined>;
  updateOrderFulfillment(id: string, printfulOrderId: string, fulfillmentStatus: string, trackingNumber?: string, shippingCarrier?: string, estimatedDelivery?: string): Promise<Order | undefined>;
  updateProductPrintful(id: string, printfulSyncVariantId: string, printfulProductId: string, baseCost?: string): Promise<Product | undefined>;

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
  
  // News Items
  getAllNewsItems(): Promise<NewsItem[]>;
  createNewsItem(item: InsertNewsItem): Promise<NewsItem>;
  
  // Subscriptions
  createSubscription(sub: InsertSubscription): Promise<Subscription>;
  getSubscriptionByEmail(email: string): Promise<Subscription | undefined>;
  
  // Council Members
  getCouncilMembersByRegion(regionId: string): Promise<CouncilMember[]>;
  createCouncilMember(member: InsertCouncilMember): Promise<CouncilMember>;
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

  async getAllMembers(): Promise<Member[]> {
    return db.select().from(members);
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
    return db.select().from(chapters).where(eq(chapters.regionId, regionId));
  }

  async getAllChapters(): Promise<Chapter[]> {
    return db.select().from(chapters);
  }

  async createChapter(insertChapter: InsertChapter): Promise<Chapter> {
    const [chapter] = await db.insert(chapters).values(insertChapter).returning();
    return chapter;
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
    return db.select().from(conferences).orderBy(desc(conferences.year));
  }

  async createConference(insertConference: InsertConference): Promise<Conference> {
    const [conference] = await db.insert(conferences).values(insertConference).returning();
    return conference;
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

  async updateProductPrintful(id: string, printfulSyncVariantId: string, printfulProductId: string, baseCost?: string): Promise<Product | undefined> {
    const updateData: Partial<Product> = { printfulSyncVariantId, printfulProductId };
    if (baseCost) updateData.baseCost = baseCost;
    const [product] = await db.update(products).set(updateData).where(eq(products.id, id)).returning();
    return product;
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

  // Council Members
  async getCouncilMembersByRegion(regionId: string): Promise<CouncilMember[]> {
    return db.select().from(councilMembers).where(eq(councilMembers.regionId, regionId));
  }

  async createCouncilMember(insertMember: InsertCouncilMember): Promise<CouncilMember> {
    const [member] = await db.insert(councilMembers).values(insertMember).returning();
    return member;
  }
}

export const storage = new DatabaseStorage();
