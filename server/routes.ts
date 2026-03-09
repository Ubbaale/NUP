import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { type Member, insertMemberSchema, insertDonationSchema, insertSubscriptionSchema, insertBlogPostSchema, insertOrderSchema, insertProductSchema, insertProductRatingSchema, insertChapterSchema, insertChapterLeaderSchema, insertRegionSchema } from "@shared/schema";
import * as printful from "./printful";
import * as stripe from "./stripe";
import * as email from "./email";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";

const songUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join(process.cwd(), "uploads", "songs");
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    },
  }),
  fileFilter: (req, file, cb) => {
    const allowed = [".mp4", ".mp3", ".m4a", ".wav", ".ogg", ".aac"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only audio/video files (MP4, MP3, M4A, WAV, OGG, AAC) are allowed"));
    }
  },
  limits: { fileSize: 100 * 1024 * 1024 },
});

const coverUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join(process.cwd(), "uploads", "covers");
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
});

const productImageUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join(process.cwd(), "uploads", "products");
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    },
  }),
  fileFilter: (req, file, cb) => {
    const allowed = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files (JPG, PNG, WebP, GIF) are allowed"));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

const chapterLogoUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join(process.cwd(), "uploads", "chapter-logos");
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    },
  }),
  fileFilter: (req, file, cb) => {
    const allowed = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files (JPG, PNG, WebP, GIF, SVG) are allowed"));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

const leaderImageUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join(process.cwd(), "uploads", "leaders");
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    },
  }),
  fileFilter: (req, file, cb) => {
    const allowed = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files (JPG, PNG, WebP, GIF) are allowed"));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // ===== REGIONS =====
  app.get("/api/regions", async (req, res) => {
    try {
      const regions = await storage.getAllRegions();
      res.json(regions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch regions" });
    }
  });

  app.get("/api/regions/:slug", async (req, res) => {
    try {
      const region = await storage.getRegionBySlug(req.params.slug);
      if (!region) {
        return res.status(404).json({ error: "Region not found" });
      }
      res.json(region);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch region" });
    }
  });

  app.patch("/api/regions/:id", async (req, res) => {
    try {
      const allowed = insertRegionSchema.partial().parse(req.body);
      const region = await storage.updateRegion(req.params.id, allowed);
      if (!region) {
        return res.status(404).json({ error: "Region not found" });
      }
      res.json(region);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to update region" });
    }
  });

  app.get("/api/regions/:slug/chapters", async (req, res) => {
    try {
      const region = await storage.getRegionBySlug(req.params.slug);
      if (!region) {
        return res.status(404).json({ error: "Region not found" });
      }
      const chapters = await storage.getChaptersByRegion(region.id);
      res.json(chapters);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch chapters" });
    }
  });

  app.get("/api/regions/:slug/council", async (req, res) => {
    try {
      const region = await storage.getRegionBySlug(req.params.slug);
      if (!region) {
        return res.status(404).json({ error: "Region not found" });
      }
      const councilMembers = await storage.getCouncilMembersByRegion(region.id);
      res.json(councilMembers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch council members" });
    }
  });

  // ===== CHAPTERS =====
  app.get("/api/chapters", async (req, res) => {
    try {
      const chapters = await storage.getAllChapters();
      res.json(chapters);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch chapters" });
    }
  });

  app.get("/api/chapters/:slug", async (req, res) => {
    try {
      const chapter = await storage.getChapterBySlug(req.params.slug);
      if (!chapter) {
        return res.status(404).json({ error: "Chapter not found" });
      }
      res.json(chapter);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch chapter" });
    }
  });

  app.get("/api/chapters/:slug/activities", async (req, res) => {
    try {
      const chapter = await storage.getChapterBySlug(req.params.slug);
      if (!chapter) {
        return res.status(404).json({ error: "Chapter not found" });
      }
      const activities = await storage.getActivitiesByChapter(chapter.id);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch activities" });
    }
  });

  // Chapter Admin CRUD
  app.post("/api/chapters", async (req, res) => {
    try {
      const parsed = insertChapterSchema.parse(req.body);
      const existing = await storage.getChapterBySlug(parsed.slug);
      if (existing) {
        return res.status(400).json({ error: "A chapter with this slug already exists" });
      }
      const chapter = await storage.createChapter(parsed);
      res.status(201).json(chapter);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to create chapter" });
    }
  });

  app.patch("/api/chapters/:id", async (req, res) => {
    try {
      const existing = await storage.getChapter(req.params.id);
      if (!existing) {
        return res.status(404).json({ error: "Chapter not found" });
      }
      const allowed = insertChapterSchema.partial().parse(req.body);
      if (allowed.slug && allowed.slug !== existing.slug) {
        const slugConflict = await storage.getChapterBySlug(allowed.slug);
        if (slugConflict) {
          return res.status(400).json({ error: "A chapter with this slug already exists" });
        }
      }
      const chapter = await storage.updateChapter(req.params.id, allowed);
      res.json(chapter);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to update chapter" });
    }
  });

  app.delete("/api/chapters/:id", async (req, res) => {
    try {
      await storage.deleteChapter(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to delete chapter" });
    }
  });

  // Chapter Leaders
  app.get("/api/chapters/:slug/leaders", async (req, res) => {
    try {
      const chapter = await storage.getChapterBySlug(req.params.slug);
      if (!chapter) {
        return res.status(404).json({ error: "Chapter not found" });
      }
      const leaders = await storage.getChapterLeaders(chapter.id);
      res.json(leaders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch leaders" });
    }
  });

  app.post("/api/chapters/:id/leaders", async (req, res) => {
    try {
      const chapter = await storage.getChapter(req.params.id);
      if (!chapter) {
        return res.status(404).json({ error: "Chapter not found" });
      }
      const parsed = insertChapterLeaderSchema.parse({ ...req.body, chapterId: req.params.id });
      const leader = await storage.createChapterLeader(parsed);
      res.status(201).json(leader);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to add leader" });
    }
  });

  app.patch("/api/chapter-leaders/:id", async (req, res) => {
    try {
      const allowed = insertChapterLeaderSchema.partial().omit({ chapterId: true }).parse(req.body);
      const leader = await storage.updateChapterLeader(req.params.id, allowed);
      if (!leader) {
        return res.status(404).json({ error: "Leader not found" });
      }
      res.json(leader);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to update leader" });
    }
  });

  app.delete("/api/chapter-leaders/:id", async (req, res) => {
    try {
      await storage.deleteChapterLeader(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete leader" });
    }
  });

  // ===== CONFERENCES =====
  app.get("/api/conferences", async (req, res) => {
    try {
      const conferences = await storage.getAllConferences();
      res.json(conferences);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch conferences" });
    }
  });

  app.get("/api/conferences/:slug", async (req, res) => {
    try {
      const conference = await storage.getConferenceBySlug(req.params.slug);
      if (!conference) {
        return res.status(404).json({ error: "Conference not found" });
      }
      res.json(conference);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch conference" });
    }
  });

  // ===== PRODUCTS =====
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:slug", async (req, res) => {
    try {
      const product = await storage.getProductBySlug(req.params.slug);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const validatedData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(validatedData);
      res.status(201).json(product);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to create product" });
    }
  });

  app.patch("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.updateProduct(req.params.id, req.body);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to update product" });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      await storage.deleteProduct(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to delete product" });
    }
  });

  app.post("/api/upload/product-image", productImageUpload.single("image"), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }
      const imageUrl = `/uploads/products/${req.file.filename}`;
      res.json({ imageUrl });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to upload image" });
    }
  });

  // ===== MEMBERS =====
  app.post("/api/members", async (req, res) => {
    try {
      const validatedData = insertMemberSchema.parse(req.body);
      
      // Check if email already exists
      const existing = await storage.getMemberByEmail(validatedData.email);
      if (existing) {
        return res.status(400).json({ error: "Email already registered" });
      }
      
      if (validatedData.regionId) {
        const region = await storage.getRegion(validatedData.regionId);
        if (!region) {
          return res.status(400).json({ error: "Invalid region selected" });
        }
      }
      if (validatedData.chapterId) {
        const chapters = validatedData.regionId 
          ? await storage.getChaptersByRegion(validatedData.regionId)
          : [];
        const validChapter = chapters.find(c => c.id === validatedData.chapterId);
        if (!validChapter) {
          return res.status(400).json({ error: "Invalid chapter for selected region" });
        }
      }
      
      const member = await storage.createMember(validatedData);
      
      email.sendMemberRegistration({
        email: member.email,
        fullName: `${member.firstName} ${member.lastName}`,
        membershipId: member.membershipId,
      }).catch(() => {});
      
      res.status(201).json(member);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to create member" });
    }
  });

  app.get("/api/members/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ error: "Search query required" });
      }
      
      // Search by membership ID or email
      let member = await storage.getMemberByMembershipId(query);
      if (!member) {
        member = await storage.getMemberByEmail(query);
      }
      
      if (!member) {
        return res.status(404).json({ error: "Member not found" });
      }
      
      res.json(member);
    } catch (error) {
      res.status(500).json({ error: "Search failed" });
    }
  });

  app.get("/api/members/stats", async (req, res) => {
    try {
      const totalCount = await storage.getMemberCount();
      const byRegion = await storage.getMemberCountByRegion();
      const allRegions = await storage.getAllRegions();
      const regionMap = Object.fromEntries(allRegions.map(r => [r.id, r.name]));
      const regionStats = byRegion.map(item => ({
        regionId: item.regionId,
        regionName: item.regionId ? regionMap[item.regionId] || "Unknown" : "Unassigned",
        count: item.count,
      }));
      res.json({ totalCount, byRegion: regionStats });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch member stats" });
    }
  });

  app.get("/api/members/export", async (req, res) => {
    try {
      const regionId = req.query.regionId as string | undefined;
      let memberList: Member[];
      if (regionId) {
        memberList = await storage.getMembersByRegion(regionId);
      } else {
        memberList = await storage.getAllMembers();
      }
      const allRegions = await storage.getAllRegions();
      const allChapters = await storage.getAllChapters();
      const regionMap = Object.fromEntries(allRegions.map(r => [r.id, r.name]));
      const chapterMap = Object.fromEntries(allChapters.map(c => [c.id, c.name]));

      const headers = ["Membership ID", "First Name", "Last Name", "Email", "Phone", "Country", "City", "Region", "Chapter", "Membership Type", "Card Number", "Card Ordered", "Card Payment Status", "Joined At"];
      const rows = memberList.map(m => [
        m.membershipId,
        m.firstName,
        m.lastName,
        m.email,
        m.phone || "",
        m.country,
        m.city || "",
        m.regionId ? regionMap[m.regionId] || "" : "",
        m.chapterId ? chapterMap[m.chapterId] || "" : "",
        m.membershipType,
        m.cardNumber || "",
        m.cardOrdered ? "Yes" : "No",
        m.cardPaymentStatus || "",
        m.joinedAt ? new Date(m.joinedAt).toISOString() : "",
      ]);

      const csvContent = [headers, ...rows]
        .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
        .join("\n");

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=members-export.csv");
      res.send(csvContent);
    } catch (error) {
      res.status(500).json({ error: "Failed to export members" });
    }
  });

  app.get("/api/members", async (req, res) => {
    try {
      const regionId = req.query.regionId as string | undefined;
      const search = req.query.search as string | undefined;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      let memberList: Member[];
      if (search) {
        memberList = await storage.searchMembers(search, regionId);
      } else if (regionId) {
        memberList = await storage.getMembersByRegion(regionId);
      } else {
        memberList = await storage.getAllMembers();
      }

      const total = memberList.length;
      const totalPages = Math.ceil(total / limit);
      const offset = (page - 1) * limit;
      const paginatedMembers = memberList.slice(offset, offset + limit);

      res.json({
        members: paginatedMembers,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch members" });
    }
  });

  app.post("/api/members/:id/order-card", async (req, res) => {
    try {
      const member = await storage.getMember(req.params.id);
      if (!member) {
        return res.status(404).json({ error: "Member not found" });
      }
      if (member.cardOrdered) {
        return res.status(400).json({ error: "Card already ordered" });
      }

      const { shippingName, shippingAddress, shippingCity, shippingState, shippingZip, shippingCountry } = req.body;
      if (!shippingName || !shippingAddress || !shippingCity || !shippingCountry) {
        return res.status(400).json({ error: "Shipping address is required (name, address, city, country)" });
      }

      const paymentResult = await stripe.createOrderPaymentIntent({
        amount: 50,
        email: member.email,
        fullName: `${member.firstName} ${member.lastName}`,
        orderId: `card-${member.id}`,
      });

      const updatedMember = await storage.updateMember(member.id, {
        cardOrdered: true,
        cardOrderedAt: new Date(),
        cardPaymentStatus: paymentResult ? "pending" : "completed",
        cardShippingName: shippingName,
        cardShippingAddress: shippingAddress,
        cardShippingCity: shippingCity,
        cardShippingState: shippingState || null,
        cardShippingZip: shippingZip || null,
        cardShippingCountry: shippingCountry,
      });

      res.json({
        member: updatedMember,
        payment: paymentResult ? {
          clientSecret: paymentResult.clientSecret,
          paymentIntentId: paymentResult.paymentIntentId,
          amount: 50,
        } : null,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to order card" });
    }
  });

  // ===== DONATIONS =====
  app.post("/api/donations", async (req, res) => {
    try {
      const validatedData = insertDonationSchema.parse(req.body);
      const donation = await storage.createDonation(validatedData);
      res.status(201).json(donation);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to process donation" });
    }
  });

  // ===== BLOG =====
  app.get("/api/blog", async (req, res) => {
    try {
      const posts = await storage.getAllBlogPosts();
      res.json(posts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch blog posts" });
    }
  });

  app.get("/api/blog/:slug", async (req, res) => {
    try {
      const post = await storage.getBlogPostBySlug(req.params.slug);
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }
      res.json(post);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch post" });
    }
  });

  app.post("/api/blog", async (req, res) => {
    try {
      const validatedData = insertBlogPostSchema.parse(req.body);
      const post = await storage.createBlogPost(validatedData);
      res.status(201).json(post);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to create post" });
    }
  });

  // ===== NEWS =====
  app.get("/api/news", async (req, res) => {
    try {
      const news = await storage.getAllNewsItems();
      res.json(news);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch news" });
    }
  });

  // ===== ORDERS =====
  app.post("/api/orders", async (req, res) => {
    try {
      const validatedData = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(validatedData);

      // Attempt Printful fulfillment asynchronously
      (async () => {
        try {
          const items: Array<{ productName: string; quantity: number; printfulSyncVariantId?: string | null }> = [];
          const parsedItems = JSON.parse(order.items) as any[];
          for (const item of parsedItems) {
            // Look up the product to get its Printful variant ID
            const product = await storage.getProduct(item.productId).catch(() => null);
            items.push({
              productName: item.productName,
              quantity: item.quantity,
              printfulSyncVariantId: product?.printfulSyncVariantId || null,
            });
          }

          const fulfillResult = await printful.submitOrderToFulfillment({
            id: order.id,
            fullName: order.fullName,
            email: order.email,
            phone: order.phone,
            address: order.address,
            city: order.city,
            state: order.state,
            country: order.country,
            postalCode: order.postalCode,
            items,
          });

          if (fulfillResult.success && fulfillResult.printfulOrderId) {
            await storage.updateOrderFulfillment(
              order.id,
              String(fulfillResult.printfulOrderId),
              "submitted",
              fulfillResult.trackingInfo?.number,
              fulfillResult.trackingInfo?.carrier,
              fulfillResult.trackingInfo?.estimatedDelivery,
            );
            await storage.updateOrderStatus(order.id, "processing");
          } else if (fulfillResult.skipped) {
            // No Printful variants linked yet — mark for later
            await storage.updateOrderFulfillment(order.id, "", "not_configured");
            await storage.updateOrderStatus(order.id, "processing");
          } else {
            await storage.updateOrderFulfillment(order.id, "", "failed");
            await storage.updateOrderStatus(order.id, "processing");
          }
        } catch (err) {
          console.error("[Printful] Background fulfillment error:", err);
          await storage.updateOrderStatus(order.id, "processing").catch(() => {});
        }
      })();

      res.status(201).json(order);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to create order" });
    }
  });

  app.get("/api/orders/track", async (req, res) => {
    try {
      const { orderId, email } = req.query as { orderId?: string; email?: string };
      if (!orderId && !email) {
        return res.status(400).json({ error: "Order ID or email required" });
      }
      if (orderId) {
        const order = await storage.getOrder(orderId);
        if (!order) return res.status(404).json({ error: "Order not found" });
        return res.json([order]);
      }
      if (email) {
        const orderList = await storage.getOrdersByEmail(email);
        return res.json(orderList);
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to track order" });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) return res.status(404).json({ error: "Order not found" });
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch order" });
    }
  });

  app.patch("/api/orders/:id/status", async (req, res) => {
    try {
      const { status, trackingNumber, shippingCarrier, estimatedDelivery } = req.body;
      if (!status) return res.status(400).json({ error: "Status required" });
      const order = await storage.updateOrderStatus(req.params.id, status, trackingNumber, shippingCarrier, estimatedDelivery);
      if (!order) return res.status(404).json({ error: "Order not found" });
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: "Failed to update order status" });
    }
  });

  // ===== PRODUCT RATINGS =====
  app.post("/api/ratings", async (req, res) => {
    try {
      const validatedData = insertProductRatingSchema.parse(req.body);
      // Check if already rated
      const existing = await storage.getRatingByOrderAndProduct(validatedData.orderId, validatedData.productId);
      if (existing) {
        return res.status(400).json({ error: "You have already rated this product for this order" });
      }
      const rating = await storage.createProductRating(validatedData);
      res.status(201).json(rating);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to submit rating" });
    }
  });

  app.get("/api/products/:slug/ratings", async (req, res) => {
    try {
      const product = await storage.getProductBySlug(req.params.slug);
      if (!product) return res.status(404).json({ error: "Product not found" });
      const ratings = await storage.getProductRatings(product.id);
      res.json(ratings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch ratings" });
    }
  });

  // ===== PRINTFUL INTEGRATION =====
  app.get("/api/printful/status", async (req, res) => {
    try {
      const status = await printful.getConnectionStatus();
      res.json(status);
    } catch (error) {
      res.status(500).json({ error: "Failed to check Printful status" });
    }
  });

  app.get("/api/printful/products", async (req, res) => {
    try {
      const result = await printful.getSyncedProducts();
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch Printful products" });
    }
  });

  app.post("/api/printful/link-product", async (req, res) => {
    try {
      const { productId, printfulSyncVariantId, printfulProductId, baseCost } = req.body;
      if (!productId || !printfulSyncVariantId) {
        return res.status(400).json({ error: "productId and printfulSyncVariantId required" });
      }
      const product = await storage.updateProductPrintful(productId, printfulSyncVariantId, printfulProductId || "", baseCost);
      if (!product) return res.status(404).json({ error: "Product not found" });
      res.json(product);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to link product" });
    }
  });

  app.post("/api/printful/resubmit/:orderId", async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.orderId);
      if (!order) return res.status(404).json({ error: "Order not found" });

      const parsedItems = JSON.parse(order.items) as any[];
      const items: Array<{ productName: string; quantity: number; printfulSyncVariantId?: string | null }> = [];
      for (const item of parsedItems) {
        const product = await storage.getProduct(item.productId).catch(() => null);
        items.push({
          productName: item.productName,
          quantity: item.quantity,
          printfulSyncVariantId: product?.printfulSyncVariantId || null,
        });
      }

      const fulfillResult = await printful.submitOrderToFulfillment({
        id: order.id,
        fullName: order.fullName,
        email: order.email,
        phone: order.phone,
        address: order.address,
        city: order.city,
        state: order.state,
        country: order.country,
        postalCode: order.postalCode,
        items,
      });

      if (fulfillResult.success && fulfillResult.printfulOrderId) {
        await storage.updateOrderFulfillment(
          order.id,
          String(fulfillResult.printfulOrderId),
          "submitted",
          fulfillResult.trackingInfo?.number,
          fulfillResult.trackingInfo?.carrier,
          fulfillResult.trackingInfo?.estimatedDelivery,
        );
        return res.json({ success: true, message: "Order submitted to Printful" });
      }
      res.json({ success: false, error: fulfillResult.error });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to resubmit order" });
    }
  });

  // ===== LEADER IMAGES =====
  app.use("/uploads/leaders", (await import("express")).default.static(path.join(process.cwd(), "uploads", "leaders")));
  app.use("/uploads/products", (await import("express")).default.static(path.join(process.cwd(), "uploads", "products")));
  app.use("/uploads/chapter-logos", (await import("express")).default.static(path.join(process.cwd(), "uploads", "chapter-logos")));

  app.post("/api/upload/chapter-logo", chapterLogoUpload.single("image"), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }
      const imageUrl = `/uploads/chapter-logos/${req.file.filename}`;
      res.json({ imageUrl });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to upload image" });
    }
  });

  app.post("/api/upload/leader-image", leaderImageUpload.single("image"), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }
      const imageUrl = `/uploads/leaders/${req.file.filename}`;
      res.json({ imageUrl });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to upload image" });
    }
  });

  // ===== REVOLUTIONARY SONGS =====
  app.use("/uploads/covers", (await import("express")).default.static(path.join(process.cwd(), "uploads", "covers")));

  app.get("/api/songs", async (req, res) => {
    try {
      const songs = await storage.getActiveSongs();
      res.json(songs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch songs" });
    }
  });

  app.get("/api/songs/all", async (req, res) => {
    try {
      const songs = await storage.getAllSongs();
      res.json(songs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch songs" });
    }
  });

  app.post("/api/songs", songUpload.single("songFile"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Song file is required" });
      }
      const { title, artist, description, minimumDonation, price, isFree } = req.body;
      if (!title || !artist) {
        return res.status(400).json({ error: "Title and artist are required" });
      }
      const song = await storage.createSong({
        title,
        artist,
        fileName: req.file.originalname,
        fileUrl: `/uploads/songs/${req.file.filename}`,
        description: description || null,
        minimumDonation: minimumDonation || "20.00",
        price: price || "5.00",
        isFree: isFree === "on" || isFree === "true" || isFree === true,
        duration: null,
        coverImageUrl: null,
        isActive: true,
      });
      res.status(201).json(song);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to upload song" });
    }
  });

  app.post("/api/songs/:id/cover", coverUpload.single("coverImage"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Cover image is required" });
      }
      const song = await storage.updateSong(req.params.id, {
        coverImageUrl: `/uploads/covers/${req.file.filename}`,
      });
      if (!song) return res.status(404).json({ error: "Song not found" });
      res.json(song);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to upload cover" });
    }
  });

  app.patch("/api/songs/:id", async (req, res) => {
    try {
      const song = await storage.updateSong(req.params.id, req.body);
      if (!song) return res.status(404).json({ error: "Song not found" });
      res.json(song);
    } catch (error) {
      res.status(500).json({ error: "Failed to update song" });
    }
  });

  app.delete("/api/songs/:id", async (req, res) => {
    try {
      const song = await storage.getSong(req.params.id);
      if (!song) return res.status(404).json({ error: "Song not found" });
      const filePath = path.join(process.cwd(), song.fileUrl);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      if (song.coverImageUrl) {
        const coverPath = path.join(process.cwd(), song.coverImageUrl);
        if (fs.existsSync(coverPath)) fs.unlinkSync(coverPath);
      }
      await storage.deleteSong(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete song" });
    }
  });

  app.post("/api/songs/donate-for-access", async (req, res) => {
    try {
      const { donorName, email, amount } = req.body;
      if (!donorName || !email || !amount) {
        return res.status(400).json({ error: "Name, email, and amount are required" });
      }
      if (Number(amount) < 20) {
        return res.status(400).json({ error: "Minimum donation for song access is $20" });
      }
      const donation = await storage.createDonation({
        donorName,
        email,
        amount: String(amount),
        currency: "USD",
        message: "Revolutionary Songs Access Donation",
        isRecurring: false,
        isAnonymous: false,
      });
      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1);
      const accessToken = await storage.createSongAccessToken({
        donationId: donation.id,
        email,
        token,
        amount: String(amount),
        expiresAt,
      });
      res.status(201).json({ success: true, token: accessToken.token, expiresAt });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to process donation" });
    }
  });

  app.get("/api/songs/verify-access", async (req, res) => {
    try {
      const { token, email } = req.query as { token?: string; email?: string };
      if (token) {
        const access = await storage.getSongAccessToken(token);
        if (!access) return res.json({ hasAccess: false });
        if (access.expiresAt && new Date(access.expiresAt) < new Date()) {
          return res.json({ hasAccess: false, reason: "expired" });
        }
        return res.json({ hasAccess: true, email: access.email });
      }
      if (email) {
        const tokens = await storage.getSongAccessByEmail(email);
        const validToken = tokens.find(t => !t.expiresAt || new Date(t.expiresAt) > new Date());
        return res.json({ hasAccess: !!validToken, token: validToken?.token });
      }
      res.json({ hasAccess: false });
    } catch (error) {
      res.status(500).json({ error: "Failed to verify access" });
    }
  });

  app.post("/api/songs/:id/purchase", async (req, res) => {
    try {
      const { buyerName, buyerEmail } = req.body;
      if (!buyerName || !buyerEmail) {
        return res.status(400).json({ error: "Name and email are required" });
      }
      const song = await storage.getSong(req.params.id);
      if (!song) return res.status(404).json({ error: "Song not found" });
      if (song.isFree) {
        return res.status(400).json({ error: "This song is free, no purchase needed" });
      }
      const songPrice = song.price || "5.00";
      const donation = await storage.createDonation({
        donorName: buyerName,
        email: buyerEmail,
        amount: songPrice,
        currency: "USD",
        message: `Song Purchase: ${song.title}`,
        isRecurring: false,
        isAnonymous: false,
      });
      const purchaseToken = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1);
      const purchase = await storage.createSongPurchase({
        songId: song.id,
        buyerName,
        buyerEmail,
        amount: songPrice,
        token: purchaseToken,
        expiresAt,
      });
      res.status(201).json({ success: true, token: purchase.token, expiresAt, songId: song.id });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to purchase song" });
    }
  });

  app.get("/api/songs/:id/check-access", async (req, res) => {
    try {
      const { token, email } = req.query as { token?: string; email?: string };
      const song = await storage.getSong(req.params.id);
      if (!song) return res.status(404).json({ error: "Song not found" });
      if (song.isFree) return res.json({ hasAccess: true, reason: "free" });
      if (token) {
        const allAccess = await storage.getSongAccessToken(token);
        if (allAccess && (!allAccess.expiresAt || new Date(allAccess.expiresAt) > new Date())) {
          return res.json({ hasAccess: true, reason: "all-access" });
        }
        const purchase = await storage.getSongPurchaseByToken(token);
        if (purchase && purchase.songId === song.id && (!purchase.expiresAt || new Date(purchase.expiresAt) > new Date())) {
          return res.json({ hasAccess: true, reason: "purchased" });
        }
      }
      if (email) {
        const purchases = await storage.getSongPurchasesBySongAndEmail(song.id, email);
        const validPurchase = purchases.find(p => !p.expiresAt || new Date(p.expiresAt) > new Date());
        if (validPurchase) return res.json({ hasAccess: true, reason: "purchased", token: validPurchase.token });
      }
      res.json({ hasAccess: false });
    } catch (error) {
      res.status(500).json({ error: "Failed to check access" });
    }
  });

  app.post("/api/songs/:id/play", async (req, res) => {
    try {
      await storage.incrementPlayCount(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to record play" });
    }
  });

  async function verifySongAccess(token: string | undefined, songId: string): Promise<{ allowed: boolean; reason: string }> {
    const song = await storage.getSong(songId);
    if (!song) return { allowed: false, reason: "Song not found" };
    if (song.isFree) return { allowed: true, reason: "free" };
    if (!token) return { allowed: false, reason: "Access token required" };
    const allAccess = await storage.getSongAccessToken(token);
    if (allAccess && (!allAccess.expiresAt || new Date(allAccess.expiresAt) > new Date())) {
      return { allowed: true, reason: "all-access" };
    }
    const purchase = await storage.getSongPurchaseByToken(token);
    if (purchase && purchase.songId === songId && (!purchase.expiresAt || new Date(purchase.expiresAt) > new Date())) {
      return { allowed: true, reason: "purchased" };
    }
    return { allowed: false, reason: "Invalid or expired access token" };
  }

  app.get("/api/songs/:id/stream", async (req, res) => {
    try {
      const { token } = req.query as { token?: string };
      const { allowed, reason } = await verifySongAccess(token, req.params.id);
      if (!allowed) return res.status(403).json({ error: reason });
      const song = await storage.getSong(req.params.id);
      if (!song) return res.status(404).json({ error: "Song not found" });
      const filePath = path.join(process.cwd(), song.fileUrl);
      if (!fs.existsSync(filePath)) return res.status(404).json({ error: "File not found" });
      const stat = fs.statSync(filePath);
      const range = req.headers.range;
      if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
        res.writeHead(206, {
          "Content-Range": `bytes ${start}-${end}/${stat.size}`,
          "Accept-Ranges": "bytes",
          "Content-Length": end - start + 1,
          "Content-Type": "video/mp4",
        });
        fs.createReadStream(filePath, { start, end }).pipe(res);
      } else {
        res.writeHead(200, {
          "Content-Length": stat.size,
          "Content-Type": "video/mp4",
        });
        fs.createReadStream(filePath).pipe(res);
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to stream song" });
    }
  });

  app.get("/api/songs/:id/download", async (req, res) => {
    try {
      const { token } = req.query as { token?: string };
      const { allowed, reason } = await verifySongAccess(token, req.params.id);
      if (!allowed) return res.status(403).json({ error: reason });
      const song = await storage.getSong(req.params.id);
      if (!song) return res.status(404).json({ error: "Song not found" });

      const format = (req.query.format as string) || "mp4";
      await storage.incrementDownloadCount(song.id);
      const filePath = path.join(process.cwd(), song.fileUrl);
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "File not found on server" });
      }

      const ext = format === "m4r" ? ".m4r" : format === "mp3" ? ".mp3" : ".mp4";
      const downloadName = `${song.title} - ${song.artist}${ext}`.replace(/[^a-zA-Z0-9\s\-_.]/g, "");
      res.setHeader("Content-Disposition", `attachment; filename="${downloadName}"`);
      res.setHeader("Content-Type", format === "mp3" ? "audio/mpeg" : format === "m4r" ? "audio/x-m4r" : "video/mp4");
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } catch (error) {
      res.status(500).json({ error: "Failed to download song" });
    }
  });

  // ===== VIRTUAL EVENTS & TICKETING =====
  app.get("/api/events", async (req, res) => {
    try {
      const events = await storage.getActiveEvents();
      res.json(events);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch events" });
    }
  });

  app.get("/api/events/all", async (req, res) => {
    try {
      const events = await storage.getAllEvents();
      res.json(events);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch events" });
    }
  });

  app.get("/api/events/:slug", async (req, res) => {
    try {
      const event = await storage.getEventBySlug(req.params.slug);
      if (!event) return res.status(404).json({ error: "Event not found" });
      const tickets = await storage.getTicketsByEvent(event.id);
      res.json({ ...event, ticketsSold: tickets.length });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch event" });
    }
  });

  app.post("/api/events", async (req, res) => {
    try {
      const data = { ...req.body };
      if (data.eventDate) data.eventDate = new Date(data.eventDate);
      if (data.endDate) data.endDate = new Date(data.endDate);
      const event = await storage.createEvent(data);
      res.status(201).json(event);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to create event" });
    }
  });

  app.patch("/api/events/:id", async (req, res) => {
    try {
      const event = await storage.updateEvent(req.params.id, req.body);
      if (!event) return res.status(404).json({ error: "Event not found" });
      res.json(event);
    } catch (error) {
      res.status(500).json({ error: "Failed to update event" });
    }
  });

  app.post("/api/events/:slug/tickets", async (req, res) => {
    try {
      const event = await storage.getEventBySlug(req.params.slug);
      if (!event) return res.status(404).json({ error: "Event not found" });
      const { buyerName, buyerEmail } = req.body;
      if (!buyerName || !buyerEmail) return res.status(400).json({ error: "Name and email required" });
      const existingTickets = await storage.getTicketsByEvent(event.id);
      if (event.maxAttendees && existingTickets.length >= event.maxAttendees) {
        return res.status(400).json({ error: "Event is sold out" });
      }
      const ticketCode = `NUP-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      const price = Number(event.ticketPrice || 0);

      let paymentIntent = null;
      let paymentStatus = "completed";
      let stripePaymentIntentId = null;

      if (price > 0 && stripe.isStripeConfigured()) {
        paymentIntent = await stripe.createTicketPaymentIntent({
          amount: price,
          buyerEmail,
          buyerName,
          eventTitle: event.title,
          ticketCode,
        });
        if (paymentIntent) {
          paymentStatus = "pending";
          stripePaymentIntentId = paymentIntent.paymentIntentId;
        }
      }

      const ticket = await storage.createTicket({
        eventId: event.id,
        buyerName,
        buyerEmail,
        amount: event.ticketPrice || "0",
        ticketCode,
        paymentStatus,
        stripePaymentIntentId,
      });

      email.sendTicketConfirmation({
        buyerEmail,
        buyerName,
        eventTitle: event.title,
        eventDate: new Date(event.eventDate).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
        ticketCode,
        ticketPrice: price.toFixed(2),
        meetingLink: event.meetingLink || undefined,
      }).catch(() => {});

      const responseData: any = {
        ...ticket,
        meetingLink: event.meetingLink,
        ...(paymentIntent ? { clientSecret: paymentIntent.clientSecret } : {}),
      };
      res.status(201).json(responseData);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to purchase ticket" });
    }
  });

  app.get("/api/events/tickets/verify", async (req, res) => {
    try {
      const code = req.query.code as string;
      if (!code) return res.status(400).json({ error: "Ticket code required" });
      const ticket = await storage.getTicketByCode(code);
      if (!ticket) return res.status(404).json({ error: "Ticket not found" });
      res.json(ticket);
    } catch (error) {
      res.status(500).json({ error: "Failed to verify ticket" });
    }
  });

  // ===== CROWDFUNDING CAMPAIGNS =====
  app.get("/api/campaigns", async (req, res) => {
    try {
      const campaignsList = await storage.getActiveCampaigns();
      res.json(campaignsList);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch campaigns" });
    }
  });

  app.get("/api/campaigns/:slug", async (req, res) => {
    try {
      const campaign = await storage.getCampaignBySlug(req.params.slug);
      if (!campaign) return res.status(404).json({ error: "Campaign not found" });
      res.json(campaign);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch campaign" });
    }
  });

  app.post("/api/campaigns", async (req, res) => {
    try {
      const data = { ...req.body };
      if (data.startDate) data.startDate = new Date(data.startDate);
      if (data.endDate) data.endDate = new Date(data.endDate);
      const campaign = await storage.createCampaign(data);
      res.status(201).json(campaign);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to create campaign" });
    }
  });

  app.post("/api/campaigns/:slug/donate", async (req, res) => {
    try {
      const campaign = await storage.getCampaignBySlug(req.params.slug);
      if (!campaign) return res.status(404).json({ error: "Campaign not found" });
      const { donorName, email: donorEmail, amount, message, isAnonymous } = req.body;
      if (!donorName || !donorEmail || !amount) return res.status(400).json({ error: "Name, email, and amount required" });
      const donation = await storage.createCampaignDonation({
        campaignId: campaign.id,
        donorName,
        email: donorEmail,
        amount: String(amount),
        message: message || null,
        isAnonymous: isAnonymous || false,
      });
      const newRaised = (Number(campaign.raisedAmount) + Number(amount)).toFixed(2);
      await storage.updateCampaign(campaign.id, {
        raisedAmount: newRaised,
        donorCount: (campaign.donorCount || 0) + 1,
      });

      email.sendDonationReceipt({
        donorEmail,
        donorName,
        amount: String(amount),
        campaignTitle: campaign.title,
        donationDate: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
      }).catch(() => {});

      res.status(201).json(donation);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to process donation" });
    }
  });

  app.get("/api/campaigns/:slug/donations", async (req, res) => {
    try {
      const campaign = await storage.getCampaignBySlug(req.params.slug);
      if (!campaign) return res.status(404).json({ error: "Campaign not found" });
      const donations = await storage.getCampaignDonations(campaign.id);
      res.json(donations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch donations" });
    }
  });

  // ===== MEMBERSHIP TIERS =====
  app.get("/api/membership-tiers", async (req, res) => {
    try {
      const tiers = await storage.getActiveTiers();
      res.json(tiers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tiers" });
    }
  });

  app.post("/api/membership-tiers", async (req, res) => {
    try {
      const tier = await storage.createTier(req.body);
      res.status(201).json(tier);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to create tier" });
    }
  });

  app.post("/api/membership/subscribe", async (req, res) => {
    try {
      const { tierId, email: memberEmail, fullName, shippingAddress, shippingCity, shippingState, shippingZip, shippingCountry, engravingName } = req.body;
      if (!tierId || !memberEmail || !fullName) return res.status(400).json({ error: "Tier, email, and name required" });
      const tier = await storage.getTier(tierId);
      if (!tier) return res.status(404).json({ error: "Tier not found" });
      const existing = await storage.getMemberSubscriptionByEmail(memberEmail);
      if (existing) return res.status(400).json({ error: "Already have an active subscription. Contact us to change tiers." });
      if (tier.awardType) {
        if (!shippingAddress || !shippingCity || !shippingCountry) {
          return res.status(400).json({ error: "Shipping address is required for award delivery" });
        }
        if (!engravingName && !fullName) {
          return res.status(400).json({ error: "Name for engraving is required" });
        }
      }
      const renewalDate = new Date();
      if (tier.interval === "yearly") {
        renewalDate.setFullYear(renewalDate.getFullYear() + 1);
      } else {
        renewalDate.setMonth(renewalDate.getMonth() + 1);
      }
      const sub = await storage.createMemberSubscription({
        tierId,
        email: memberEmail,
        fullName,
        status: "active",
        amount: tier.price,
        startDate: new Date(),
        renewalDate,
        shippingAddress: shippingAddress || null,
        shippingCity: shippingCity || null,
        shippingState: shippingState || null,
        shippingZip: shippingZip || null,
        shippingCountry: shippingCountry || null,
        engravingName: engravingName || fullName,
        awardStatus: tier.awardType ? "pending" : null,
      });

      let benefits: string[] = [];
      try { benefits = JSON.parse(tier.benefits || "[]"); } catch {}
      email.sendMembershipWelcome({
        email: memberEmail,
        fullName,
        tierName: tier.name,
        amount: tier.price,
        interval: tier.interval || "monthly",
        renewalDate: renewalDate.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
        benefits,
      }).catch(() => {});

      res.status(201).json(sub);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to subscribe" });
    }
  });

  app.get("/api/membership/status", async (req, res) => {
    try {
      const memberEmail = req.query.email as string;
      if (!memberEmail) return res.status(400).json({ error: "Email required" });
      const sub = await storage.getMemberSubscriptionByEmail(memberEmail);
      if (!sub) return res.json({ active: false });
      const tier = await storage.getTier(sub.tierId);
      res.json({ active: true, subscription: sub, tier });
    } catch (error) {
      res.status(500).json({ error: "Failed to check status" });
    }
  });

  app.get("/api/membership/subscriptions", async (req, res) => {
    try {
      const subs = await storage.getAllMemberSubscriptions();
      const tiers = await storage.getAllTiers();
      const tierMap = new Map(tiers.map(t => [t.id, t]));
      const enriched = subs.map(sub => ({
        ...sub,
        tierName: tierMap.get(sub.tierId)?.name || "Unknown",
        tierSlug: tierMap.get(sub.tierId)?.slug || "",
        awardType: tierMap.get(sub.tierId)?.awardType || null,
      }));
      res.json(enriched);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch subscriptions" });
    }
  });

  app.patch("/api/membership/subscriptions/:id/award-status", async (req, res) => {
    try {
      const { id } = req.params;
      const { awardStatus } = req.body;
      if (!awardStatus || !["pending", "processing", "shipped", "delivered"].includes(awardStatus)) {
        return res.status(400).json({ error: "Invalid award status" });
      }
      const updated = await storage.updateMemberSubscription(id, { awardStatus });
      if (!updated) return res.status(404).json({ error: "Subscription not found" });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update award status" });
    }
  });

  // ===== AUCTIONS & RAFFLES =====
  app.get("/api/auctions", async (req, res) => {
    try {
      const items = await storage.getActiveAuctionItems();
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch auctions" });
    }
  });

  app.get("/api/auctions/:slug", async (req, res) => {
    try {
      const item = await storage.getAuctionItemBySlug(req.params.slug);
      if (!item) return res.status(404).json({ error: "Item not found" });
      res.json(item);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch auction item" });
    }
  });

  app.post("/api/auctions", async (req, res) => {
    try {
      const data = { ...req.body };
      if (data.startDate) data.startDate = new Date(data.startDate);
      if (data.endDate) data.endDate = new Date(data.endDate);
      const item = await storage.createAuctionItem(data);
      res.status(201).json(item);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to create auction item" });
    }
  });

  app.post("/api/auctions/:slug/bid", async (req, res) => {
    try {
      const item = await storage.getAuctionItemBySlug(req.params.slug);
      if (!item) return res.status(404).json({ error: "Item not found" });
      if (item.auctionType !== "auction") return res.status(400).json({ error: "This item is a raffle, not an auction" });
      if (new Date(item.endDate) < new Date()) return res.status(400).json({ error: "Auction has ended" });
      const { bidderName, bidderEmail, amount } = req.body;
      if (!bidderName || !bidderEmail || !amount) return res.status(400).json({ error: "Name, email, and amount required" });
      const minBid = Math.max(Number(item.startingBid), Number(item.currentBid) + Number(item.bidIncrement));
      if (Number(amount) < minBid) {
        return res.status(400).json({ error: `Minimum bid is $${minBid.toFixed(2)}` });
      }
      const bid = await storage.createBid({
        auctionItemId: item.id,
        bidderName,
        bidderEmail,
        amount: String(amount),
      });
      await storage.updateAuctionItem(item.id, { currentBid: String(amount) });
      res.status(201).json(bid);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to place bid" });
    }
  });

  app.get("/api/auctions/:slug/bids", async (req, res) => {
    try {
      const item = await storage.getAuctionItemBySlug(req.params.slug);
      if (!item) return res.status(404).json({ error: "Item not found" });
      const bidsList = await storage.getBidsByItem(item.id);
      res.json(bidsList);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bids" });
    }
  });

  app.post("/api/auctions/:slug/raffle-ticket", async (req, res) => {
    try {
      const item = await storage.getAuctionItemBySlug(req.params.slug);
      if (!item) return res.status(404).json({ error: "Item not found" });
      if (item.auctionType !== "raffle") return res.status(400).json({ error: "This item is an auction, not a raffle" });
      if (new Date(item.endDate) < new Date()) return res.status(400).json({ error: "Raffle has ended" });
      const { buyerName, buyerEmail, ticketCount } = req.body;
      if (!buyerName || !buyerEmail || !ticketCount) return res.status(400).json({ error: "Name, email, and ticket count required" });
      const count = Number(ticketCount);
      const pricePerTicket = Number(item.ticketPrice || 5);
      const totalAmount = (count * pricePerTicket).toFixed(2);
      const startNum = (item.totalTicketsSold || 0) + 1;
      const ticketNumbers = Array.from({ length: count }, (_, i) => String(startNum + i).padStart(4, "0")).join(",");
      const ticket = await storage.createRaffleTicket({
        auctionItemId: item.id,
        buyerName,
        buyerEmail,
        ticketCount: count,
        amount: totalAmount,
        ticketNumbers,
      });
      await storage.updateAuctionItem(item.id, {
        totalTicketsSold: (item.totalTicketsSold || 0) + count,
      });
      res.status(201).json(ticket);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to purchase tickets" });
    }
  });

  // ===== PAYMENT & CONFIGURATION STATUS =====
  app.get("/api/config/payment", async (req, res) => {
    res.json({
      stripeConfigured: stripe.isStripeConfigured(),
      emailConfigured: email.isEmailConfigured(),
    });
  });

  app.post("/api/payments/verify", async (req, res) => {
    try {
      const { paymentIntentId } = req.body;
      if (!paymentIntentId) return res.status(400).json({ error: "Payment intent ID required" });
      const result = await stripe.verifyPaymentIntent(paymentIntentId);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to verify payment" });
    }
  });

  app.post("/api/webhooks/stripe", express.raw({ type: "application/json" }), async (req, res) => {
    try {
      const sig = req.headers["stripe-signature"] as string;
      if (!sig) return res.status(400).json({ error: "No signature" });
      const event = await stripe.handleWebhookEvent(req.body, sig);
      if (!event) return res.status(400).json({ error: "Webhook not configured" });

      if (event.type === "payment_intent.succeeded") {
        const metadata = event.data?.metadata;
        if (metadata?.type === "event_ticket" && metadata?.ticketCode) {
          const ticket = await storage.getTicketByCode(metadata.ticketCode);
          if (ticket) {
            await storage.updateTicketPaymentStatus(ticket.id, "completed");
          }
        }
      }

      res.json({ received: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ===== SUBSCRIPTIONS =====
  app.post("/api/subscriptions", async (req, res) => {
    try {
      const validatedData = insertSubscriptionSchema.parse(req.body);
      
      // Check if already subscribed
      const existing = await storage.getSubscriptionByEmail(validatedData.email);
      if (existing) {
        return res.status(400).json({ error: "Already subscribed" });
      }
      
      const subscription = await storage.createSubscription(validatedData);
      res.status(201).json(subscription);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to subscribe" });
    }
  });

  return httpServer;
}
