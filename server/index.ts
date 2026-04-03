import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import ConnectPgSimple from "connect-pg-simple";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { seedDatabase } from "./seed";
import { startNewsFetcher } from "./newsFetcher";
import crypto from "crypto";

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

declare module "express-session" {
  interface SessionData {
    isAdmin?: boolean;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

app.set("trust proxy", 1);

const PgStore = ConnectPgSimple(session);
app.use(
  session({
    store: new PgStore({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET || crypto.randomBytes(32).toString("hex"),
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: "lax",
    },
  })
);

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  await seedDatabase();

  const { pool } = await import("./db");
  await pool.query(`ALTER TABLE gallery_photos ADD COLUMN IF NOT EXISTS image_data bytea`);
  await pool.query(`ALTER TABLE gallery_photos ADD COLUMN IF NOT EXISTS thumbnail_data bytea`);
  await pool.query(`CREATE TABLE IF NOT EXISTS file_store (path TEXT PRIMARY KEY, data BYTEA NOT NULL, content_type TEXT NOT NULL DEFAULT 'application/octet-stream', created_at TIMESTAMP DEFAULT NOW())`);

  const { migrateUploadsToDb, getFile, storeFile: storeFileToDb } = await import("./fileStore");
  await migrateUploadsToDb();

  // One-time cleanup: remove records whose files are permanently lost
  try {
    const orphanGallery = await pool.query(
      `DELETE FROM gallery_photos WHERE image_data IS NULL AND image_url LIKE '/uploads/gallery/%' RETURNING id, title`
    );
    if (orphanGallery.rowCount && orphanGallery.rowCount > 0) {
      console.log(`[cleanup] Removed ${orphanGallery.rowCount} gallery items with lost files:`,
        orphanGallery.rows.map((r: any) => r.title).join(", "));
    }

    const orphanProducts = await pool.query(
      `DELETE FROM products WHERE image_url LIKE '/uploads/products/%' 
       AND NOT EXISTS (SELECT 1 FROM file_store WHERE file_store.path = products.image_url)
       AND image_url ~ '^/uploads/products/[0-9]'
       RETURNING id, name`
    );
    if (orphanProducts.rowCount && orphanProducts.rowCount > 0) {
      console.log(`[cleanup] Removed ${orphanProducts.rowCount} products with lost files:`,
        orphanProducts.rows.map((r: any) => r.name).join(", "));
    }

    const orphanSongs = await pool.query(
      `DELETE FROM revolutionary_songs WHERE file_url LIKE '/uploads/songs/%'
       AND NOT EXISTS (SELECT 1 FROM file_store WHERE file_store.path = revolutionary_songs.file_url)
       RETURNING id, title`
    );
    if (orphanSongs.rowCount && orphanSongs.rowCount > 0) {
      console.log(`[cleanup] Removed ${orphanSongs.rowCount} songs with lost files:`,
        orphanSongs.rows.map((r: any) => r.title).join(", "));
    }
  } catch (e) {
    console.error("[cleanup] Error cleaning orphan records:", e);
  }

  const pathMod = await import("path");
  const fsMod = await import("fs");
  app.use((req: any, res, next) => {
    res.on("finish", async () => {
      try {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          if (req.file) {
            const urlPath = "/" + pathMod.relative(process.cwd(), req.file.path).replace(/\\/g, "/");
            if (fsMod.existsSync(req.file.path)) {
              const data = fsMod.readFileSync(req.file.path);
              await storeFileToDb(urlPath, data);
            }
          }
          if (req.files) {
            const files = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();
            for (const file of files as any[]) {
              const urlPath = "/" + pathMod.relative(process.cwd(), file.path).replace(/\\/g, "/");
              if (fsMod.existsSync(file.path)) {
                const data = fsMod.readFileSync(file.path);
                await storeFileToDb(urlPath, data);
              }
            }
          }
        }
      } catch (e) {
        console.error("[file-store] Auto-persist failed:", e);
      }
    });
    next();
  });

  app.use("/uploads", async (req, res, next) => {
    const filePath = "/uploads" + req.path;
    const fsPath = pathMod.join(process.cwd(), "uploads", req.path);
    if (fsMod.existsSync(fsPath)) {
      return next();
    }
    const file = await getFile(filePath);
    if (file) {
      res.set("Content-Type", file.contentType);
      res.set("Cache-Control", "public, max-age=31536000, immutable");
      return res.send(file.data);
    }
    next();
  });

  startNewsFetcher();
  
  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error("Internal Server Error:", err);

    if (res.headersSent) {
      return next(err);
    }

    return res.status(status).json({ message });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`serving on port ${port}`);
    },
  );
})();
