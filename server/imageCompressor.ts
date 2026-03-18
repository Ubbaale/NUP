import sharp from "sharp";
import path from "path";
import fs from "fs";

export interface CompressedImageResult {
  compressedPath: string;
  thumbnailPath: string;
  compressedUrl: string;
  thumbnailUrl: string;
  originalSize: number;
  compressedSize: number;
  width: number;
  height: number;
}

const GALLERY_DIR = path.join(process.cwd(), "uploads", "gallery");
const MAX_WIDTH = 2400;
const MAX_HEIGHT = 2400;
const THUMBNAIL_WIDTH = 400;
const THUMBNAIL_HEIGHT = 400;
const QUALITY = 85;

export async function compressGalleryImage(
  inputPath: string,
  originalFilename: string
): Promise<CompressedImageResult> {
  if (!fs.existsSync(GALLERY_DIR)) {
    fs.mkdirSync(GALLERY_DIR, { recursive: true });
  }

  const originalSize = fs.statSync(inputPath).size;
  const baseName = path.parse(originalFilename).name;
  const uniqueId = Date.now() + "-" + Math.round(Math.random() * 1e9);
  const compressedName = `${uniqueId}-${baseName}.webp`;
  const thumbnailName = `${uniqueId}-${baseName}-thumb.webp`;
  const compressedPath = path.join(GALLERY_DIR, compressedName);
  const thumbnailPath = path.join(GALLERY_DIR, thumbnailName);

  const image = sharp(inputPath);
  const metadata = await image.metadata();

  await image
    .resize(MAX_WIDTH, MAX_HEIGHT, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: QUALITY, effort: 4 })
    .toFile(compressedPath);

  const compressedMeta = await sharp(compressedPath).metadata();

  await sharp(inputPath)
    .resize(THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT, {
      fit: "cover",
      position: "centre",
    })
    .webp({ quality: 75, effort: 4 })
    .toFile(thumbnailPath);

  if (inputPath !== compressedPath && fs.existsSync(inputPath)) {
    fs.unlinkSync(inputPath);
  }

  return {
    compressedPath,
    thumbnailPath,
    compressedUrl: `/uploads/gallery/${compressedName}`,
    thumbnailUrl: `/uploads/gallery/${thumbnailName}`,
    originalSize,
    compressedSize: fs.statSync(compressedPath).size,
    width: compressedMeta.width || metadata.width || 0,
    height: compressedMeta.height || metadata.height || 0,
  };
}

const MAX_DOWNLOAD_SIZE = 50 * 1024 * 1024;

function isAllowedUrl(urlStr: string): boolean {
  try {
    const parsed = new URL(urlStr);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return false;
    const host = parsed.hostname.toLowerCase();
    if (
      host === "localhost" ||
      host === "127.0.0.1" ||
      host === "0.0.0.0" ||
      host.startsWith("10.") ||
      host.startsWith("172.") ||
      host.startsWith("192.168.") ||
      host === "[::1]" ||
      host.endsWith(".internal") ||
      host.endsWith(".local")
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export async function compressImageFromUrl(
  imageUrl: string
): Promise<CompressedImageResult | null> {
  try {
    if (!isAllowedUrl(imageUrl)) return null;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(imageUrl, { signal: controller.signal });
    clearTimeout(timeout);

    if (!response.ok) return null;

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.startsWith("image/")) return null;

    const contentLength = parseInt(response.headers.get("content-length") || "0");
    if (contentLength > MAX_DOWNLOAD_SIZE) return null;

    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.length > MAX_DOWNLOAD_SIZE) return null;

    const originalSize = buffer.length;
    const uniqueId = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const tempPath = path.join(GALLERY_DIR, `${uniqueId}-temp.tmp`);

    if (!fs.existsSync(GALLERY_DIR)) {
      fs.mkdirSync(GALLERY_DIR, { recursive: true });
    }

    fs.writeFileSync(tempPath, buffer);

    try {
      const result = await compressGalleryImage(tempPath, `url-image-${uniqueId}`);
      return { ...result, originalSize };
    } catch {
      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
      return null;
    }
  } catch {
    return null;
  }
}
