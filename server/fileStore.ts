import { pool } from "./db";
import path from "path";
import fs from "fs";

const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png",
  ".gif": "image/gif", ".webp": "image/webp", ".svg": "image/svg+xml",
  ".mp3": "audio/mpeg", ".m4a": "audio/mp4", ".wav": "audio/wav",
  ".ogg": "audio/ogg", ".aac": "audio/aac",
  ".mp4": "video/mp4", ".mov": "video/quicktime", ".webm": "video/webm",
  ".avi": "video/x-msvideo", ".mkv": "video/x-matroska",
  ".pdf": "application/pdf",
};

function getContentType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  return MIME_TYPES[ext] || "application/octet-stream";
}

export async function storeFile(urlPath: string, data: Buffer, contentType?: string): Promise<void> {
  const ct = contentType || getContentType(urlPath);
  await pool.query(
    `INSERT INTO file_store (path, data, content_type) VALUES ($1, $2, $3)
     ON CONFLICT (path) DO UPDATE SET data = $2, content_type = $3`,
    [urlPath, data, ct]
  );
}

export async function getFile(urlPath: string): Promise<{ data: Buffer; contentType: string } | null> {
  const result = await pool.query(
    "SELECT data, content_type FROM file_store WHERE path = $1",
    [urlPath]
  );
  if (result.rows.length === 0) return null;
  return { data: result.rows[0].data, contentType: result.rows[0].content_type };
}

export async function deleteFile(urlPath: string): Promise<void> {
  await pool.query("DELETE FROM file_store WHERE path = $1", [urlPath]);
}

export async function migrateUploadsToDb(): Promise<void> {
  const uploadsDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadsDir)) return;

  const existing = await pool.query("SELECT COUNT(*) as cnt FROM file_store");
  const count = parseInt(existing.rows[0].cnt);
  if (count > 0) {
    console.log(`[file-store] ${count} files already in DB, checking for new files...`);
  }

  let migrated = 0;
  let skipped = 0;

  function walkDir(dir: string) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walkDir(fullPath);
      } else if (entry.isFile()) {
        const relativePath = "/" + path.relative(process.cwd(), fullPath).replace(/\\/g, "/");
        filesToMigrate.push({ relativePath, fullPath });
      }
    }
  }

  const filesToMigrate: { relativePath: string; fullPath: string }[] = [];
  walkDir(uploadsDir);

  for (const { relativePath, fullPath } of filesToMigrate) {
    try {
      const check = await pool.query("SELECT 1 FROM file_store WHERE path = $1", [relativePath]);
      if (check.rows.length > 0) {
        skipped++;
        continue;
      }
      const data = fs.readFileSync(fullPath);
      const contentType = getContentType(fullPath);
      await pool.query(
        "INSERT INTO file_store (path, data, content_type) VALUES ($1, $2, $3) ON CONFLICT (path) DO NOTHING",
        [relativePath, data, contentType]
      );
      migrated++;
    } catch (e) {
      console.error(`[file-store] Failed to migrate ${relativePath}:`, e);
    }
  }

  if (migrated > 0) {
    console.log(`[file-store] Migrated ${migrated} files to database (${skipped} already existed)`);
  }
}
