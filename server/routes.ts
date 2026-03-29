import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { type Member, insertMemberSchema, insertDonationSchema, insertSubscriptionSchema, insertBlogPostSchema, insertOrderSchema, insertProductSchema, insertProductRatingSchema, insertChapterSchema, insertChapterLeaderSchema, insertRegionSchema, insertConferenceSchema, insertCampaignSchema, insertMembershipTierSchema, insertAuctionItemSchema, insertReturnRequestSchema, insertGalleryPhotoSchema, insertFallenHeroSchema, insertHumanRightsReportSchema } from "@shared/schema";
import * as printful from "./printful";
import * as stripe from "./stripe";
import * as email from "./email";
import multer from "multer";
import path from "path";
import fs from "fs";
import { compressGalleryImage, compressImageFromUrl } from "./imageCompressor";
import crypto from "crypto";

function stripAccessCode<T extends Record<string, any>>(obj: T): Omit<T, 'accessCode'> {
  const { accessCode, ...rest } = obj;
  return rest;
}

function stripAccessCodes<T extends Record<string, any>>(arr: T[]): Omit<T, 'accessCode'>[] {
  return arr.map(stripAccessCode);
}

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

const songWithCoverUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const subdir = file.fieldname === "songFile" ? "songs" : "covers";
      const dir = path.join(process.cwd(), "uploads", subdir);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    },
  }),
  fileFilter: (req, file, cb) => {
    if (file.fieldname === "songFile") {
      const allowed = [".mp4", ".mp3", ".m4a", ".wav", ".ogg", ".aac"];
      const ext = path.extname(file.originalname).toLowerCase();
      if (allowed.includes(ext)) cb(null, true);
      else cb(new Error("Only audio/video files (MP4, MP3, M4A, WAV, OGG, AAC) are allowed"));
    } else {
      cb(null, true);
    }
  },
  limits: { fileSize: 100 * 1024 * 1024 },
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

const galleryUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join(process.cwd(), "uploads", "gallery");
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
  limits: { fileSize: 50 * 1024 * 1024 },
});

const customDesignUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join(process.cwd(), "uploads", "custom-designs");
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    },
  }),
  fileFilter: (req, file, cb) => {
    const allowed = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".pdf"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files (JPG, PNG, WebP, GIF, PDF) are allowed"));
    }
  },
  limits: { fileSize: 20 * 1024 * 1024 },
});

const fundraiserPhotoUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join(process.cwd(), "uploads", "fundraiser-photos");
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    },
  }),
  fileFilter: (req, file, cb) => {
    const allowed = [".jpg", ".jpeg", ".png", ".webp"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files (JPG, PNG, WebP) are allowed"));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

const RSS_FEEDS = [
  {
    org: "Human Rights Watch",
    feedUrl: "https://www.hrw.org/feeds/uganda.xml",
    baseUrl: "https://www.hrw.org",
    matchPatterns: ["uganda"],
  },
  {
    org: "Amnesty International",
    feedUrl: "https://www.amnesty.org/en/latest/news/?country=uganda&format=rss",
    baseUrl: "https://www.amnesty.org",
    matchPatterns: ["uganda"],
  },
  {
    org: "Freedom House",
    feedUrl: "https://freedomhouse.org/countries/uganda/feed",
    baseUrl: "https://freedomhouse.org",
    matchPatterns: ["uganda"],
  },
];

async function scanHumanRightsFeeds(): Promise<{ added: number; skipped: number; errors: string[] }> {
  let added = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const feed of RSS_FEEDS) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      const response = await fetch(feed.feedUrl, {
        signal: controller.signal,
        headers: { "User-Agent": "NUP-Diaspora-HRReports/1.0" },
      });
      clearTimeout(timeout);

      if (!response.ok) {
        errors.push(`${feed.org}: HTTP ${response.status}`);
        continue;
      }

      const xml = await response.text();
      const items = parseRssItems(xml);

      for (const item of items) {
        const isRelevant = feed.matchPatterns.some(
          (p) =>
            item.title.toLowerCase().includes(p) ||
            item.description.toLowerCase().includes(p)
        );
        if (!isRelevant) continue;

        const existing = await storage.getHumanRightsReportByUrl(item.link);
        if (existing) {
          skipped++;
          continue;
        }

        const year = item.pubDate
          ? new Date(item.pubDate).getFullYear().toString()
          : new Date().getFullYear().toString();

        await storage.createHumanRightsReport({
          organization: feed.org,
          title: item.title,
          year,
          url: item.link,
          description: item.description.slice(0, 500),
          status: "pending",
          source: "auto-feed",
          sortOrder: 0,
        });
        added++;
      }
    } catch (err: any) {
      errors.push(`${feed.org}: ${err.message}`);
    }
  }

  return { added, skipped, errors };
}

function parseRssItems(xml: string): Array<{ title: string; link: string; description: string; pubDate: string }> {
  const items: Array<{ title: string; link: string; description: string; pubDate: string }> = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const content = match[1];
    const title = (content.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i) || [])[1]?.trim() || "";
    const link = (content.match(/<link>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/i) || [])[1]?.trim() || "";
    const description = (content.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i) || [])[1]?.trim() || "";
    const pubDate = (content.match(/<pubDate>([\s\S]*?)<\/pubDate>/i) || [])[1]?.trim() || "";
    if (title && link) {
      items.push({ title, link, description, pubDate });
    }
  }
  return items;
}

async function seedHumanRightsReports() {
  const existing = await storage.getAllHumanRightsReports();
  if (existing.length > 0) return;

  const seeds = [
    { organization: "U.S. Department of State", title: "Country Report on Human Rights Practices: Uganda", year: "2024", url: "https://www.state.gov/reports/2024-country-reports-on-human-rights-practices/uganda/", status: "approved", source: "manual", sortOrder: 0 },
    { organization: "U.S. Department of State", title: "Country Report on Human Rights Practices: Uganda", year: "2023", url: "https://www.state.gov/wp-content/uploads/2024/02/528267_UGANDA-2023-HUMAN-RIGHTS-REPORT.pdf", status: "approved", source: "manual", sortOrder: 0 },
    { organization: "U.S. Department of State", title: "Country Report on Human Rights Practices: Uganda", year: "2022", url: "https://www.state.gov/reports/2022-country-reports-on-human-rights-practices/uganda/", status: "approved", source: "manual", sortOrder: 0 },
    { organization: "U.S. Department of State", title: "Country Report on Human Rights Practices: Uganda", year: "2021", url: "https://www.state.gov/reports/2021-country-reports-on-human-rights-practices/uganda/", status: "approved", source: "manual", sortOrder: 0 },
    { organization: "U.S. Department of State", title: "Country Report on Human Rights Practices: Uganda", year: "2020", url: "https://www.state.gov/reports/2020-country-reports-on-human-rights-practices/uganda/", status: "approved", source: "manual", sortOrder: 0 },
    { organization: "U.S. Department of State", title: "Country Report on Human Rights Practices: Uganda", year: "2019", url: "https://2017-2021.state.gov/reports/2019-country-reports-on-human-rights-practices/uganda/index.html", status: "approved", source: "manual", sortOrder: 0 },
    { organization: "Human Rights Watch", title: "World Report 2025: Uganda", year: "2025", url: "https://www.hrw.org/world-report/2025/country-chapters/uganda", status: "approved", source: "manual", sortOrder: 0 },
    { organization: "Human Rights Watch", title: "World Report 2024: Uganda", year: "2024", url: "https://www.hrw.org/world-report/2024/country-chapters/uganda", status: "approved", source: "manual", sortOrder: 0 },
    { organization: "Human Rights Watch", title: "World Report 2023: Uganda", year: "2023", url: "https://www.hrw.org/world-report/2023/country-chapters/uganda", status: "approved", source: "manual", sortOrder: 0 },
    { organization: "Human Rights Watch", title: "World Report 2022: Uganda", year: "2022", url: "https://www.hrw.org/world-report/2022/country-chapters/uganda", status: "approved", source: "manual", sortOrder: 0 },
    { organization: "Human Rights Watch", title: "World Report 2021: Uganda", year: "2021", url: "https://www.hrw.org/world-report/2021/country-chapters/uganda", status: "approved", source: "manual", sortOrder: 0 },
    { organization: "Human Rights Watch", title: "World Report 2020: Uganda", year: "2020", url: "https://www.hrw.org/world-report/2020/country-chapters/uganda", status: "approved", source: "manual", sortOrder: 0 },
    { organization: "Human Rights Watch", title: "World Report 2019: Uganda", year: "2019", url: "https://www.hrw.org/world-report/2019/country-chapters/uganda", status: "approved", source: "manual", sortOrder: 0 },
    { organization: "Amnesty International", title: "Uganda: Human Rights Report", year: "2024/25", url: "https://www.amnesty.org/en/location/africa/east-africa-the-horn-and-great-lakes/uganda/report-uganda/", status: "approved", source: "manual", sortOrder: 0 },
    { organization: "Amnesty International", title: "Uganda Country Profile", year: "2023", url: "https://www.amnestyusa.org/countries/uganda/", status: "approved", source: "manual", sortOrder: 0 },
    { organization: "Freedom House", title: "Freedom in the World: Uganda", year: "2025", url: "https://freedomhouse.org/country/uganda/freedom-world/2025", status: "approved", source: "manual", sortOrder: 0 },
    { organization: "Freedom House", title: "Freedom in the World: Uganda", year: "2024", url: "https://freedomhouse.org/country/uganda/freedom-world/2024", status: "approved", source: "manual", sortOrder: 0 },
    { organization: "Freedom House", title: "Freedom in the World: Uganda", year: "2023", url: "https://freedomhouse.org/country/uganda/freedom-world/2023", status: "approved", source: "manual", sortOrder: 0 },
    { organization: "Freedom House", title: "Freedom in the World: Uganda", year: "2022", url: "https://freedomhouse.org/country/uganda/freedom-world/2022", status: "approved", source: "manual", sortOrder: 0 },
    { organization: "Freedom House", title: "Freedom in the World: Uganda", year: "2021", url: "https://freedomhouse.org/country/uganda/freedom-world/2021", status: "approved", source: "manual", sortOrder: 0 },
    { organization: "Freedom House", title: "Freedom in the World: Uganda", year: "2020", url: "https://freedomhouse.org/country/uganda/freedom-world/2020", status: "approved", source: "manual", sortOrder: 0 },
    { organization: "Freedom House", title: "Freedom in the World: Uganda", year: "2019", url: "https://freedomhouse.org/country/uganda/freedom-world/2019", status: "approved", source: "manual", sortOrder: 0 },
    { organization: "United Nations (OHCHR)", title: "OHCHR Uganda Country Page", year: "Ongoing", url: "https://www.ohchr.org/en/countries/uganda", status: "approved", source: "manual", sortOrder: 0 },
    { organization: "European Parliament", title: "Resolution on Human Rights Violations in Uganda", year: "2026", url: "https://www.europarl.europa.eu/news/en/press-room/20260205IPR33628/human-rights-violations-in-iran-turkiye-and-uganda", status: "approved", source: "manual", sortOrder: 0 },
  ];

  for (const seed of seeds) {
    await storage.createHumanRightsReport(seed);
  }
  console.log(`Seeded ${seeds.length} human rights reports`);
}

let feedScanInterval: ReturnType<typeof setInterval> | null = null;

function startAutoFeedScanner() {
  seedHumanRightsReports().catch(console.error);

  scanHumanRightsFeeds()
    .then((r) => console.log(`Initial feed scan: ${r.added} new, ${r.skipped} skipped, ${r.errors.length} errors`))
    .catch(console.error);

  feedScanInterval = setInterval(async () => {
    try {
      const result = await scanHumanRightsFeeds();
      if (result.added > 0) {
        console.log(`Auto feed scan: ${result.added} new reports found`);
      }
    } catch (err) {
      console.error("Auto feed scan error:", err);
    }
  }, 24 * 60 * 60 * 1000);
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // ===== ADMIN AUTH =====
  app.post("/api/admin/login", (req, res) => {
    const { username, password } = req.body;
    const adminUser = process.env.ADMIN_USERNAME;
    const adminPass = process.env.ADMIN_PASSWORD;
    if (!adminUser || !adminPass) {
      return res.status(500).json({ error: "Admin credentials not configured" });
    }
    if (username === adminUser && password === adminPass) {
      req.session.regenerate((err) => {
        if (err) return res.status(500).json({ error: "Session error" });
        req.session.isAdmin = true;
        req.session.save(() => {
          return res.json({ success: true });
        });
      });
      return;
    }
    return res.status(401).json({ error: "Invalid credentials" });
  });

  app.post("/api/admin/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ success: true });
    });
  });

  app.get("/api/admin/check", (req, res) => {
    res.json({ authenticated: !!req.session.isAdmin });
  });

  function requireAdmin(req: any, res: any, next: any) {
    if (req.session && req.session.isAdmin) return next();
    return res.status(401).json({ error: "Unauthorized" });
  }

  // ===== REGIONS =====
  app.get("/api/regions", async (req, res) => {
    try {
      const regions = await storage.getAllRegions();
      res.json(stripAccessCodes(regions));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch regions" });
    }
  });

  app.post("/api/regions", requireAdmin, async (req, res) => {
    try {
      const data = insertRegionSchema.parse(req.body);
      const existing = await storage.getRegionBySlug(data.slug);
      if (existing) {
        return res.status(400).json({ error: "A region with this slug already exists" });
      }
      const region = await storage.createRegion(data);
      res.status(201).json(region);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to create region" });
    }
  });

  app.get("/api/regions/:slug", async (req, res) => {
    try {
      const region = await storage.getRegionBySlug(req.params.slug);
      if (!region) {
        return res.status(404).json({ error: "Region not found" });
      }
      res.json(stripAccessCode(region));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch region" });
    }
  });

  app.patch("/api/regions/:id", requireAdmin, async (req, res) => {
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

  app.post("/api/portal/region/:slug/verify", async (req, res) => {
    try {
      const { accessCode } = req.body;
      if (!accessCode) {
        return res.status(400).json({ error: "Access code is required" });
      }
      const region = await storage.getRegionBySlug(req.params.slug);
      if (!region) {
        return res.status(404).json({ error: "Region not found" });
      }
      if (!region.accessCode) {
        return res.status(403).json({ error: "No access code has been set for this region. Contact an administrator." });
      }
      if (region.accessCode !== accessCode) {
        return res.status(401).json({ error: "Invalid access code" });
      }
      const { accessCode: _, ...safeRegion } = region;
      res.json({ verified: true, region: safeRegion });
    } catch (error: any) {
      res.status(500).json({ error: "Verification failed" });
    }
  });

  app.patch("/api/portal/region/:slug/update", async (req, res) => {
    try {
      const { accessCode, ...updateData } = req.body;
      if (!accessCode) {
        return res.status(400).json({ error: "Access code is required" });
      }
      const region = await storage.getRegionBySlug(req.params.slug);
      if (!region || !region.accessCode || region.accessCode !== accessCode) {
        return res.status(401).json({ error: "Invalid access code" });
      }
      const { accessCode: _ac, slug: _s, id: _id, ...safeFields } = updateData;
      const allowed = insertRegionSchema.partial().parse(safeFields);
      const updated = await storage.updateRegion(region.id, allowed);
      if (!updated) {
        return res.status(500).json({ error: "Failed to update" });
      }
      const { accessCode: _uac, ...safeRegion } = updated;
      res.json(safeRegion);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to update region" });
    }
  });

  app.post("/api/portal/chapter/:slug/verify", async (req, res) => {
    try {
      const { accessCode } = req.body;
      if (!accessCode) {
        return res.status(400).json({ error: "Access code is required" });
      }
      const chapter = await storage.getChapterBySlug(req.params.slug);
      if (!chapter) {
        return res.status(404).json({ error: "Chapter not found" });
      }
      if (!chapter.accessCode) {
        return res.status(403).json({ error: "No access code has been set for this chapter. Contact an administrator." });
      }
      if (chapter.accessCode !== accessCode) {
        return res.status(401).json({ error: "Invalid access code" });
      }
      const { accessCode: _, ...safeChapter } = chapter;
      res.json({ verified: true, chapter: safeChapter });
    } catch (error: any) {
      res.status(500).json({ error: "Verification failed" });
    }
  });

  app.patch("/api/portal/chapter/:slug/update", async (req, res) => {
    try {
      const { accessCode, ...updateData } = req.body;
      if (!accessCode) {
        return res.status(400).json({ error: "Access code is required" });
      }
      const chapter = await storage.getChapterBySlug(req.params.slug);
      if (!chapter || !chapter.accessCode || chapter.accessCode !== accessCode) {
        return res.status(401).json({ error: "Invalid access code" });
      }
      const { accessCode: _ac, slug: _s, id: _id, regionId: _r, ...safeFields } = updateData;
      const allowed = insertChapterSchema.partial().parse(safeFields);
      const updated = await storage.updateChapter(chapter.id, allowed);
      if (!updated) {
        return res.status(500).json({ error: "Failed to update" });
      }
      const { accessCode: _uac, ...safeChapter } = updated;
      res.json(safeChapter);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to update chapter" });
    }
  });

  app.get("/api/regions/:slug/chapters", async (req, res) => {
    try {
      const region = await storage.getRegionBySlug(req.params.slug);
      if (!region) {
        return res.status(404).json({ error: "Region not found" });
      }
      const chapters = await storage.getChaptersByRegion(region.id);
      res.json(stripAccessCodes(chapters));
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
      res.json(stripAccessCodes(chapters));
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
      res.json(stripAccessCode(chapter));
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
  app.post("/api/chapters", requireAdmin, async (req, res) => {
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

  app.patch("/api/chapters/:id", requireAdmin, async (req, res) => {
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

  app.delete("/api/chapters/:id", requireAdmin, async (req, res) => {
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

  app.post("/api/chapters/:id/leaders", requireAdmin, async (req, res) => {
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

  app.patch("/api/chapter-leaders/:id", requireAdmin, async (req, res) => {
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

  app.delete("/api/chapter-leaders/:id", requireAdmin, async (req, res) => {
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

  app.post("/api/conferences", requireAdmin, async (req, res) => {
    try {
      const data = { ...req.body };
      if (data.startDate) data.startDate = new Date(data.startDate);
      if (data.endDate) data.endDate = new Date(data.endDate);
      const conference = await storage.createConference(data);
      res.status(201).json(conference);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to create conference" });
    }
  });

  app.patch("/api/conferences/:id", requireAdmin, async (req, res) => {
    try {
      const data = { ...req.body };
      if (data.startDate) data.startDate = new Date(data.startDate);
      if (data.endDate) data.endDate = new Date(data.endDate);
      const conference = await storage.updateConference(req.params.id, data);
      if (!conference) return res.status(404).json({ error: "Conference not found" });
      res.json(conference);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to update conference" });
    }
  });

  app.delete("/api/conferences/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteConference(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to delete conference" });
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

  app.post("/api/products", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(validatedData);
      res.status(201).json(product);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to create product" });
    }
  });

  app.patch("/api/products/:id", requireAdmin, async (req, res) => {
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

  app.delete("/api/products/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteProduct(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to delete product" });
    }
  });

  app.post("/api/upload/product-image", requireAdmin, productImageUpload.single("image"), (req, res) => {
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

  app.post("/api/upload/custom-design", customDesignUpload.single("design"), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No design file provided" });
      }
      const designUrl = `/uploads/custom-designs/${req.file.filename}`;
      res.json({ designUrl });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to upload design" });
    }
  });

  app.use("/uploads/custom-designs", (await import("express")).default.static(path.join(process.cwd(), "uploads", "custom-designs")));

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

  app.get("/api/members/search", requireAdmin, async (req, res) => {
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

  app.get("/api/members/stats", requireAdmin, async (req, res) => {
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

  app.get("/api/members/export", requireAdmin, async (req, res) => {
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

  app.get("/api/members", requireAdmin, async (req, res) => {
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
  app.get("/api/donations", requireAdmin, async (req, res) => {
    try {
      const allDonations = await storage.getAllDonations();
      res.json(allDonations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch donations" });
    }
  });

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

  app.post("/api/blog", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertBlogPostSchema.parse(req.body);
      const post = await storage.createBlogPost(validatedData);
      res.status(201).json(post);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to create post" });
    }
  });

  app.patch("/api/blog/:id", requireAdmin, async (req, res) => {
    try {
      const post = await storage.updateBlogPost(req.params.id, req.body);
      if (!post) return res.status(404).json({ error: "Post not found" });
      res.json(post);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to update post" });
    }
  });

  app.delete("/api/blog/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteBlogPost(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to delete post" });
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

  app.get("/api/news/events", async (req, res) => {
    try {
      const news = await storage.getAllNewsItems();
      const eventKeywords = ["visit", "tour", "event", "appearance", "host", "meet", "welcome", "reception", "fundrais", "gala", "dinner", "concert", "convention", "conference", "gathering", "diaspora", "abroad", "rally", "speech", "address"];
      const eventNews = news.filter(item => {
        if (item.category === "Events" || item.category === "Diaspora") return true;
        const text = `${item.title} ${item.excerpt || ""}`.toLowerCase();
        return eventKeywords.some(kw => text.includes(kw));
      });
      res.json(eventNews.slice(0, 30));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch event news" });
    }
  });

  app.post("/api/news/refresh", requireAdmin, async (req, res) => {
    try {
      const { fetchNewsFromRSS } = await import("./newsFetcher");
      const count = await fetchNewsFromRSS();
      res.json({ message: `Fetched ${count} new articles`, count });
    } catch (error) {
      res.status(500).json({ error: "Failed to refresh news" });
    }
  });

  // ===== ORDERS =====
  app.post("/api/orders", async (req, res) => {
    try {
      const validatedData = insertOrderSchema.parse(req.body);
      const { isTestOrder, qualityNotes, qualityChecked, ...safeData } = validatedData;
      const order = await storage.createOrder(safeData);

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

  app.patch("/api/orders/:id/status", requireAdmin, async (req, res) => {
    try {
      const { status, trackingNumber, shippingCarrier, estimatedDelivery } = req.body;
      const validStatuses = ["pending", "processing", "shipped", "out_for_delivery", "delivered", "cancelled"];
      if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({ error: `Status must be one of: ${validStatuses.join(", ")}` });
      }
      const order = await storage.updateOrderStatus(req.params.id, status, trackingNumber, shippingCarrier, estimatedDelivery);
      if (!order) return res.status(404).json({ error: "Order not found" });
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: "Failed to update order status" });
    }
  });

  app.post("/api/admin/test-order", requireAdmin, async (req, res) => {
    try {
      const { items, notes } = req.body;
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "At least one item is required" });
      }
      const orderItems = items.map((item: any) => ({
        productId: item.productId,
        productName: item.productName,
        price: item.price,
        quantity: item.quantity || 1,
        selectedSize: item.selectedSize || null,
        selectedColor: item.selectedColor || null,
      }));
      const totalAmount = orderItems.reduce((sum: number, item: any) => sum + (Number(item.price) * item.quantity), 0).toFixed(2);
      const order = await storage.createOrder({
        email: "admin-test@diasporanup.org",
        fullName: "QC Test Order",
        phone: "",
        address: "Quality Control — Internal",
        city: "N/A",
        country: "United States",
        items: JSON.stringify(orderItems),
        totalAmount,
        status: "processing",
        isTestOrder: true,
        qualityNotes: notes || "Admin test order for quality verification",
        fulfillmentStatus: "not_submitted",
      });
      res.status(201).json(order);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to create test order" });
    }
  });

  app.patch("/api/admin/orders/:id/quality", requireAdmin, async (req, res) => {
    try {
      const { qualityNotes, qualityChecked } = req.body;
      const order = await storage.getOrder(req.params.id);
      if (!order) return res.status(404).json({ error: "Order not found" });
      const updated = await storage.updateOrderQuality(req.params.id, qualityNotes, qualityChecked);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update quality info" });
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

  app.post("/api/printful/link-product", requireAdmin, async (req, res) => {
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

  app.post("/api/printful/resubmit/:orderId", requireAdmin, async (req, res) => {
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

  // ===== PRINTFUL WEBHOOK =====
  app.post("/api/printful/webhook", async (req, res) => {
    try {
      const { type, data } = req.body;
      if (!type || !data) {
        return res.status(400).json({ error: "Invalid webhook payload" });
      }

      if (type === "package_shipped") {
        const printfulOrderId = String(data.order?.id || data.order?.external_id || "");
        const shipment = data.shipment || {};
        const trackingNumber = shipment.tracking_number || "";
        const carrier = shipment.carrier || shipment.service || "";
        const trackingUrl = shipment.tracking_url || "";
        const estimatedDelivery = shipment.estimated_delivery || "";

        if (printfulOrderId) {
          const allOrders = await storage.getAllOrders();
          const matchedOrder = allOrders.find(o =>
            o.printfulOrderId === printfulOrderId ||
            o.id === data.order?.external_id
          );

          if (matchedOrder) {
            await storage.updateOrderFulfillment(
              matchedOrder.id,
              printfulOrderId,
              "shipped",
              trackingNumber,
              carrier,
              estimatedDelivery
            );
            await storage.updateOrderStatus(matchedOrder.id, "shipped", trackingNumber, carrier, estimatedDelivery);
            console.log(`[Printful Webhook] Order ${matchedOrder.id} marked as shipped. Tracking: ${trackingNumber}`);
          } else {
            console.warn(`[Printful Webhook] No matching order for Printful ID: ${printfulOrderId}`);
          }
        }
      } else if (type === "package_returned") {
        const printfulOrderId = String(data.order?.id || "");
        if (printfulOrderId) {
          const allOrders = await storage.getAllOrders();
          const matchedOrder = allOrders.find(o => o.printfulOrderId === printfulOrderId);
          if (matchedOrder) {
            await storage.updateOrderStatus(matchedOrder.id, "cancelled");
            console.log(`[Printful Webhook] Order ${matchedOrder.id} returned/cancelled.`);
          }
        }
      }

      res.json({ received: true });
    } catch (error) {
      console.error("[Printful Webhook] Error:", error);
      res.status(500).json({ error: "Webhook processing failed" });
    }
  });

  // ===== ADMIN ORDERS =====
  app.get("/api/admin/orders", requireAdmin, async (req, res) => {
    try {
      const allOrders = await storage.getAllOrders();
      res.json(allOrders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  // ===== RETURN REQUESTS =====
  app.post("/api/returns", async (req, res) => {
    try {
      const validatedData = insertReturnRequestSchema.parse(req.body);
      validatedData.status = "pending";
      const order = await storage.getOrder(validatedData.orderId);
      if (!order) return res.status(404).json({ error: "Order not found" });
      if (order.email.toLowerCase() !== validatedData.email.toLowerCase()) {
        return res.status(403).json({ error: "Email does not match order" });
      }
      if (order.status !== "delivered" && order.status !== "shipped") {
        return res.status(400).json({ error: "Returns are only accepted for shipped or delivered orders" });
      }
      const existing = await storage.getReturnRequestsByOrder(validatedData.orderId);
      const hasPending = existing.some(r => r.status === "pending");
      if (hasPending) {
        return res.status(400).json({ error: "A return request is already pending for this order" });
      }
      const returnRequest = await storage.createReturnRequest(validatedData);
      res.status(201).json(returnRequest);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to create return request" });
    }
  });

  app.get("/api/returns/:orderId", async (req, res) => {
    try {
      const { email } = req.query as { email?: string };
      if (!email) {
        return res.status(400).json({ error: "Email required for verification" });
      }
      const order = await storage.getOrder(req.params.orderId);
      if (!order || order.email.toLowerCase() !== email.toLowerCase()) {
        return res.json([]);
      }
      const returns = await storage.getReturnRequestsByOrder(req.params.orderId);
      const sanitized = returns.map(({ adminNotes, ...rest }) => rest);
      res.json(sanitized);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch return requests" });
    }
  });

  app.get("/api/admin/returns", requireAdmin, async (req, res) => {
    try {
      const allReturns = await storage.getAllReturnRequests();
      res.json(allReturns);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch return requests" });
    }
  });

  app.patch("/api/returns/:id", requireAdmin, async (req, res) => {
    try {
      const { status, adminNotes } = req.body;
      if (!status || !["approved", "denied", "pending"].includes(status)) {
        return res.status(400).json({ error: "Valid status required (approved, denied, pending)" });
      }
      const updated = await storage.updateReturnRequest(req.params.id, status, adminNotes);
      if (!updated) return res.status(404).json({ error: "Return request not found" });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update return request" });
    }
  });

  // ===== GALLERY =====
  app.use("/uploads/gallery", (await import("express")).default.static(path.join(process.cwd(), "uploads", "gallery")));

  app.get("/api/gallery", async (req, res) => {
    try {
      const { category, page, limit } = req.query as { category?: string; page?: string; limit?: string };
      const parsedPage = parseInt(page || "1");
      const parsedLimit = parseInt(limit || "100");
      const pageNum = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
      const limitNum = Number.isFinite(parsedLimit) && parsedLimit > 0 ? Math.min(parsedLimit, 200) : 100;

      if (category && category !== "all") {
        const photos = await storage.getGalleryPhotosByCategory(category);
        const total = photos.length;
        const paginated = photos.slice((pageNum - 1) * limitNum, pageNum * limitNum);
        return res.json({ photos: paginated, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) });
      }
      const photos = await storage.getAllGalleryPhotos();
      const total = photos.length;
      const paginated = photos.slice((pageNum - 1) * limitNum, pageNum * limitNum);
      res.json({ photos: paginated, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch gallery photos" });
    }
  });

  app.post("/api/gallery", requireAdmin, galleryUpload.single("image"), async (req, res) => {
    try {
      const { title, description, category, album, tags, sortOrder, featured } = req.body;
      if (!title) return res.status(400).json({ error: "Title is required" });

      let imageUrl = "";
      let thumbnailUrl: string | null = null;
      let originalSize: number | null = null;
      let compressedSize: number | null = null;
      let width: number | null = null;
      let height: number | null = null;

      if (req.file) {
        const compressed = await compressGalleryImage(req.file.path, req.file.originalname);
        imageUrl = compressed.compressedUrl;
        thumbnailUrl = compressed.thumbnailUrl;
        originalSize = compressed.originalSize;
        compressedSize = compressed.compressedSize;
        width = compressed.width;
        height = compressed.height;
      } else if (req.body.imageUrl) {
        const compressed = await compressImageFromUrl(req.body.imageUrl);
        if (compressed) {
          imageUrl = compressed.compressedUrl;
          thumbnailUrl = compressed.thumbnailUrl;
          originalSize = compressed.originalSize;
          compressedSize = compressed.compressedSize;
          width = compressed.width;
          height = compressed.height;
        } else {
          imageUrl = req.body.imageUrl;
        }
      }

      if (!imageUrl) return res.status(400).json({ error: "Image is required" });

      const photo = await storage.createGalleryPhoto({
        title,
        description: description || null,
        imageUrl,
        thumbnailUrl,
        category: category || "events",
        album: album || null,
        tags: tags || null,
        sortOrder: sortOrder ? parseInt(sortOrder) : 0,
        featured: featured === "true" || featured === true,
        originalSize,
        compressedSize,
        width,
        height,
      });
      res.status(201).json(photo);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to create gallery photo" });
    }
  });

  app.patch("/api/gallery/:id", requireAdmin, async (req, res) => {
    try {
      const { title, description, category, album, tags, sortOrder, featured } = req.body;
      const updateData: Record<string, any> = {};
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (category !== undefined) updateData.category = category;
      if (album !== undefined) updateData.album = album;
      if (tags !== undefined) updateData.tags = tags;
      if (sortOrder !== undefined) updateData.sortOrder = parseInt(sortOrder);
      if (featured !== undefined) updateData.featured = featured === "true" || featured === true;

      const photo = await storage.updateGalleryPhoto(req.params.id, updateData);
      if (!photo) return res.status(404).json({ error: "Photo not found" });
      res.json(photo);
    } catch (error) {
      res.status(500).json({ error: "Failed to update gallery photo" });
    }
  });

  const galleryDir = path.resolve(process.cwd(), "uploads", "gallery");
  function safeGalleryDelete(filePath: string) {
    if (!filePath.startsWith("/uploads/gallery/")) return;
    const resolved = path.resolve(process.cwd(), filePath.slice(1));
    if (!resolved.startsWith(galleryDir)) return;
    if (fs.existsSync(resolved)) fs.unlinkSync(resolved);
  }

  app.delete("/api/gallery/:id", requireAdmin, async (req, res) => {
    try {
      const photo = await storage.getGalleryPhoto(req.params.id);
      if (!photo) return res.status(404).json({ error: "Photo not found" });
      safeGalleryDelete(photo.imageUrl);
      if (photo.thumbnailUrl) safeGalleryDelete(photo.thumbnailUrl);
      await storage.deleteGalleryPhoto(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete gallery photo" });
    }
  });

  // ===== FALLEN HEROES =====
  app.get("/api/fallen-heroes", async (req, res) => {
    try {
      const heroes = await storage.getAllFallenHeroes();
      res.json(heroes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch fallen heroes" });
    }
  });

  app.post("/api/fallen-heroes", requireAdmin, async (req, res) => {
    try {
      const data = insertFallenHeroSchema.parse(req.body);
      const hero = await storage.createFallenHero(data);
      res.json(hero);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to create fallen hero" });
    }
  });

  app.patch("/api/fallen-heroes/:id", requireAdmin, async (req, res) => {
    try {
      const hero = await storage.updateFallenHero(req.params.id, req.body);
      if (!hero) return res.status(404).json({ error: "Not found" });
      res.json(hero);
    } catch (error) {
      res.status(500).json({ error: "Failed to update fallen hero" });
    }
  });

  app.delete("/api/fallen-heroes/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteFallenHero(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete fallen hero" });
    }
  });

  // ===== HUMAN RIGHTS REPORTS =====
  app.get("/api/human-rights-reports", async (req, res) => {
    try {
      const reports = await storage.getApprovedHumanRightsReports();
      res.json(reports);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch reports" });
    }
  });

  app.get("/api/human-rights-reports/all", requireAdmin, async (req, res) => {
    try {
      const reports = await storage.getAllHumanRightsReports();
      res.json(reports);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch reports" });
    }
  });

  app.get("/api/human-rights-reports/pending", requireAdmin, async (req, res) => {
    try {
      const reports = await storage.getPendingHumanRightsReports();
      res.json(reports);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pending reports" });
    }
  });

  app.post("/api/human-rights-reports", requireAdmin, async (req, res) => {
    try {
      const data = insertHumanRightsReportSchema.parse(req.body);
      const report = await storage.createHumanRightsReport(data);
      res.json(report);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to create report" });
    }
  });

  app.patch("/api/human-rights-reports/:id", requireAdmin, async (req, res) => {
    try {
      const report = await storage.updateHumanRightsReport(req.params.id, req.body);
      if (!report) return res.status(404).json({ error: "Not found" });
      res.json(report);
    } catch (error) {
      res.status(500).json({ error: "Failed to update report" });
    }
  });

  app.delete("/api/human-rights-reports/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteHumanRightsReport(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete report" });
    }
  });

  app.post("/api/human-rights-reports/scan-feeds", requireAdmin, async (req, res) => {
    try {
      const results = await scanHumanRightsFeeds();
      res.json(results);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Feed scan failed" });
    }
  });

  app.post("/api/human-rights-reports/approve/:id", requireAdmin, async (req, res) => {
    try {
      const report = await storage.updateHumanRightsReport(req.params.id, { status: "approved" });
      if (!report) return res.status(404).json({ error: "Not found" });
      res.json(report);
    } catch (error) {
      res.status(500).json({ error: "Failed to approve report" });
    }
  });

  app.post("/api/human-rights-reports/reject/:id", requireAdmin, async (req, res) => {
    try {
      const report = await storage.updateHumanRightsReport(req.params.id, { status: "rejected" });
      if (!report) return res.status(404).json({ error: "Not found" });
      res.json(report);
    } catch (error) {
      res.status(500).json({ error: "Failed to reject report" });
    }
  });

  // ===== LEADER IMAGES =====
  app.use("/uploads/leaders", (await import("express")).default.static(path.join(process.cwd(), "uploads", "leaders")));
  app.use("/uploads/products", (await import("express")).default.static(path.join(process.cwd(), "uploads", "products")));
  app.use("/uploads/chapter-logos", (await import("express")).default.static(path.join(process.cwd(), "uploads", "chapter-logos")));

  app.post("/api/upload/chapter-logo", requireAdmin, chapterLogoUpload.single("image"), (req, res) => {
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

  app.post("/api/songs", requireAdmin, songWithCoverUpload.fields([
    { name: "songFile", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]), async (req, res) => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      const songFile = files?.songFile?.[0];
      const coverFile = files?.coverImage?.[0];
      if (!songFile) {
        return res.status(400).json({ error: "Song file is required" });
      }
      const { title, artist, description, minimumDonation, price, isFree } = req.body;
      if (!title || !artist) {
        return res.status(400).json({ error: "Title and artist are required" });
      }
      const song = await storage.createSong({
        title,
        artist,
        fileName: songFile.originalname,
        fileUrl: `/uploads/songs/${songFile.filename}`,
        description: description || null,
        minimumDonation: minimumDonation || "200.00",
        price: price || "5.00",
        isFree: isFree === "on" || isFree === "true" || isFree === true,
        duration: null,
        coverImageUrl: coverFile ? `/uploads/covers/${coverFile.filename}` : null,
        isActive: true,
      });
      res.status(201).json(song);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to upload song" });
    }
  });

  app.post("/api/songs/:id/cover", requireAdmin, coverUpload.single("coverImage"), async (req, res) => {
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

  app.patch("/api/songs/:id", requireAdmin, async (req, res) => {
    try {
      const song = await storage.updateSong(req.params.id, req.body);
      if (!song) return res.status(404).json({ error: "Song not found" });
      res.json(song);
    } catch (error) {
      res.status(500).json({ error: "Failed to update song" });
    }
  });

  app.delete("/api/songs/:id", requireAdmin, async (req, res) => {
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
      if (Number(amount) < 200) {
        return res.status(400).json({ error: "Minimum donation for song access is $200" });
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

  app.post("/api/events", requireAdmin, async (req, res) => {
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

  app.patch("/api/events/:id", requireAdmin, async (req, res) => {
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

  app.get("/api/admin/campaigns", requireAdmin, async (req, res) => {
    try {
      const campaignsList = await storage.getAllCampaigns();
      res.json(campaignsList);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch campaigns" });
    }
  });

  app.post("/api/campaigns", requireAdmin, async (req, res) => {
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
      const { donorName, email: donorEmail, amount, message, isAnonymous, fundraiserId } = req.body;
      if (!donorName || !donorEmail || !amount) return res.status(400).json({ error: "Name, email, and amount required" });
      const numAmount = Number(amount);
      if (isNaN(numAmount) || numAmount < 1) return res.status(400).json({ error: "Amount must be at least $1" });
      let validFundraiserId: string | null = null;
      if (fundraiserId) {
        const frs = await storage.getCampaignFundraisers(campaign.id);
        const matchedFr = frs.find(f => f.id === fundraiserId);
        if (!matchedFr) return res.status(400).json({ error: "Invalid fundraiser for this campaign" });
        validFundraiserId = fundraiserId;
      }
      const donation = await storage.createCampaignDonation({
        campaignId: campaign.id,
        fundraiserId: validFundraiserId,
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
      if (validFundraiserId) {
        const frs = await storage.getCampaignFundraisers(campaign.id);
        const fr = frs.find(f => f.id === validFundraiserId);
        if (fr) {
          const frNewRaised = (Number(fr.raisedAmount) + Number(amount)).toFixed(2);
          await storage.updateCampaignFundraiser(validFundraiserId, {
            raisedAmount: frNewRaised,
            donorCount: (fr.donorCount || 0) + 1,
          });
        }
      }

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

  app.get("/api/campaigns/:slug/donations", requireAdmin, async (req, res) => {
    try {
      const campaign = await storage.getCampaignBySlug(req.params.slug);
      if (!campaign) return res.status(404).json({ error: "Campaign not found" });
      const donations = await storage.getCampaignDonations(campaign.id);
      res.json(donations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch donations" });
    }
  });

  app.patch("/api/campaigns/:id", requireAdmin, async (req, res) => {
    try {
      const data = { ...req.body };
      if (data.startDate) data.startDate = new Date(data.startDate);
      if (data.endDate) data.endDate = new Date(data.endDate);
      const campaign = await storage.updateCampaign(req.params.id, data);
      if (!campaign) return res.status(404).json({ error: "Campaign not found" });
      res.json(campaign);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to update campaign" });
    }
  });

  app.delete("/api/campaigns/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteCampaign(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to delete campaign" });
    }
  });

  // ===== CAMPAIGN FUNDRAISERS (Peer-to-Peer) =====
  app.post("/api/upload/fundraiser-photo", fundraiserPhotoUpload.single("photo"), (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: "No photo uploaded" });
      res.json({ url: `/uploads/fundraiser-photos/${req.file.filename}` });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to upload photo" });
    }
  });

  app.get("/api/campaigns/:slug/fundraisers", async (req, res) => {
    try {
      const campaign = await storage.getCampaignBySlug(req.params.slug);
      if (!campaign) return res.status(404).json({ error: "Campaign not found" });
      const fundraisers = await storage.getCampaignFundraisers(campaign.id);
      res.json(fundraisers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch fundraisers" });
    }
  });

  app.get("/api/fundraisers/:slug", async (req, res) => {
    try {
      const fundraiser = await storage.getCampaignFundraiserBySlug(req.params.slug);
      if (!fundraiser) return res.status(404).json({ error: "Fundraiser not found" });
      const { email, ...publicData } = fundraiser;
      res.json(publicData);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch fundraiser" });
    }
  });

  app.get("/api/fundraisers/:slug/donations", async (req, res) => {
    try {
      const fundraiser = await storage.getCampaignFundraiserBySlug(req.params.slug);
      if (!fundraiser) return res.status(404).json({ error: "Fundraiser not found" });
      const donations = await storage.getFundraiserDonations(fundraiser.id);
      const publicDonations = donations.map(({ email, ...rest }) => rest);
      res.json(publicDonations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch donations" });
    }
  });

  app.post("/api/campaigns/:slug/fundraisers", async (req, res) => {
    try {
      const campaign = await storage.getCampaignBySlug(req.params.slug);
      if (!campaign) return res.status(404).json({ error: "Campaign not found" });
      if (!campaign.isActive) return res.status(400).json({ error: "Campaign is not active" });
      const { fullName, email, personalMessage, goalAmount, photoUrl } = req.body;
      if (!fullName || !email) return res.status(400).json({ error: "Name and email are required" });
      if (goalAmount && (isNaN(Number(goalAmount)) || Number(goalAmount) < 50)) return res.status(400).json({ error: "Goal must be at least $50" });
      const slug = fullName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + Date.now().toString(36);
      const existing = await storage.getCampaignFundraiserBySlug(slug);
      if (existing) return res.status(400).json({ error: "Please try again" });
      const fundraiser = await storage.createCampaignFundraiser({
        campaignId: campaign.id,
        fullName,
        email,
        slug,
        personalMessage: personalMessage || null,
        goalAmount: goalAmount ? String(goalAmount) : "500",
        photoUrl: photoUrl || null,
        isActive: true,
      });
      res.status(201).json(fundraiser);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to create fundraiser page" });
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

  app.get("/api/admin/membership-tiers", requireAdmin, async (req, res) => {
    try {
      const tiers = await storage.getAllTiers();
      res.json(tiers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tiers" });
    }
  });

  app.post("/api/membership-tiers", requireAdmin, async (req, res) => {
    try {
      const tier = await storage.createTier(req.body);
      res.status(201).json(tier);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to create tier" });
    }
  });

  app.patch("/api/membership-tiers/:id", requireAdmin, async (req, res) => {
    try {
      const tier = await storage.updateTier(req.params.id, req.body);
      if (!tier) return res.status(404).json({ error: "Tier not found" });
      res.json(tier);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to update tier" });
    }
  });

  app.delete("/api/membership-tiers/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteTier(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to delete tier" });
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

  app.get("/api/membership/subscriptions", requireAdmin, async (req, res) => {
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

  app.patch("/api/membership/subscriptions/:id/award-status", requireAdmin, async (req, res) => {
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

  app.get("/api/admin/auctions", requireAdmin, async (req, res) => {
    try {
      const items = await storage.getAllAuctionItems();
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch auctions" });
    }
  });

  app.post("/api/auctions", requireAdmin, async (req, res) => {
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

  app.patch("/api/auctions/:id", requireAdmin, async (req, res) => {
    try {
      const data = { ...req.body };
      if (data.startDate) data.startDate = new Date(data.startDate);
      if (data.endDate) data.endDate = new Date(data.endDate);
      const item = await storage.updateAuctionItem(req.params.id, data);
      if (!item) return res.status(404).json({ error: "Item not found" });
      res.json(item);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to update auction item" });
    }
  });

  app.delete("/api/auctions/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteAuctionItem(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to delete auction item" });
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

  app.get("/api/auctions/:slug/bids", requireAdmin, async (req, res) => {
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

  app.get("/api/subscriptions", requireAdmin, async (req, res) => {
    try {
      const subs = await storage.getAllSubscriptions();
      res.json(subs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/subscriptions/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteSubscription(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/subscriptions/:id", requireAdmin, async (req, res) => {
    try {
      const updated = await storage.updateSubscription(req.params.id, req.body);
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/newsletter/send", requireAdmin, async (req, res) => {
    try {
      const { subject, content, testEmail } = req.body;
      if (!subject || !content) {
        return res.status(400).json({ error: "Subject and content are required" });
      }

      if (testEmail) {
        const sent = await email.sendNewsletter({
          to: testEmail,
          subject: `[TEST] ${subject}`,
          content,
          unsubscribeId: "test",
        });
        return res.json({ sent: sent ? 1 : 0, failed: sent ? 0 : 1, total: 1, isTest: true });
      }

      const subscribers = await storage.getAllSubscriptions();
      const activeSubscribers = subscribers.filter(s => s.isActive);

      if (activeSubscribers.length === 0) {
        return res.status(400).json({ error: "No active subscribers" });
      }

      let sent = 0;
      let failed = 0;

      for (const sub of activeSubscribers) {
        const success = await email.sendNewsletter({
          to: sub.email,
          subject,
          content,
          unsubscribeId: sub.id,
        });
        if (success) sent++;
        else failed++;
      }

      res.json({ sent, failed, total: activeSubscribers.length });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to send newsletter" });
    }
  });

  startAutoFeedScanner();

  app.get("/api/manifesto/download", (req, res) => {
    const filePath = path.join(process.cwd(), "uploads", "documents", "NUP-Manifesto-2026-2031.pdf");
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "Manifesto file not found" });
    }
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="NUP-Manifesto-2026-2031.pdf"');
    const stream = fs.createReadStream(filePath);
    stream.on("error", () => {
      if (!res.headersSent) {
        res.status(500).json({ error: "Failed to read manifesto file" });
      } else {
        res.end();
      }
    });
    stream.pipe(res);
  });

  return httpServer;
}
