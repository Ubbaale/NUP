import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMemberSchema, insertDonationSchema, insertSubscriptionSchema, insertBlogPostSchema, insertOrderSchema, insertProductRatingSchema } from "@shared/schema";
import * as printful from "./printful";

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
