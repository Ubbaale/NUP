import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMemberSchema, insertDonationSchema, insertSubscriptionSchema, insertBlogPostSchema, insertOrderSchema, insertProductRatingSchema } from "@shared/schema";
import * as printful from "./printful";
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

  // ===== MEMBERS =====
  app.post("/api/members", async (req, res) => {
    try {
      const validatedData = insertMemberSchema.parse(req.body);
      
      // Check if email already exists
      const existing = await storage.getMemberByEmail(validatedData.email);
      if (existing) {
        return res.status(400).json({ error: "Email already registered" });
      }
      
      const member = await storage.createMember(validatedData);
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
      const { title, artist, description, minimumDonation } = req.body;
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
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
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

  app.post("/api/songs/:id/play", async (req, res) => {
    try {
      await storage.incrementPlayCount(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to record play" });
    }
  });

  app.get("/api/songs/:id/stream", async (req, res) => {
    try {
      const { token } = req.query as { token?: string };
      if (!token) return res.status(401).json({ error: "Access token required" });
      const access = await storage.getSongAccessToken(token);
      if (!access || (access.expiresAt && new Date(access.expiresAt) < new Date())) {
        return res.status(403).json({ error: "Invalid or expired access token" });
      }
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
      if (!token) return res.status(401).json({ error: "Access token required" });
      const access = await storage.getSongAccessToken(token);
      if (!access) return res.status(403).json({ error: "Invalid access token" });
      if (access.expiresAt && new Date(access.expiresAt) < new Date()) {
        return res.status(403).json({ error: "Access token has expired" });
      }
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
