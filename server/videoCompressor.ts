import { execFile } from "child_process";
import path from "path";
import fs from "fs";

export interface CompressedVideoResult {
  compressedPath: string;
  compressedUrl: string;
  thumbnailPath: string;
  thumbnailUrl: string;
  originalSize: number;
  compressedSize: number;
  width: number;
  height: number;
  duration: number;
}

function runFFprobe(inputPath: string): Promise<{ width: number; height: number; duration: number }> {
  return new Promise((resolve, reject) => {
    execFile("ffprobe", [
      "-v", "quiet",
      "-print_format", "json",
      "-show_streams",
      "-show_format",
      inputPath,
    ], { timeout: 60000 }, (err, stdout) => {
      if (err) return reject(err);
      try {
        const data = JSON.parse(stdout);
        const videoStream = data.streams?.find((s: any) => s.codec_type === "video");
        resolve({
          width: videoStream?.width || 0,
          height: videoStream?.height || 0,
          duration: parseFloat(data.format?.duration || "0"),
        });
      } catch (e) {
        reject(e);
      }
    });
  });
}

function runFFmpeg(args: string[], timeoutMs = 1800000): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = execFile("ffmpeg", args, { timeout: timeoutMs, maxBuffer: 50 * 1024 * 1024 }, (err, _stdout, stderr) => {
      if (err) {
        console.error("[videoCompressor] FFmpeg error:", stderr?.slice(-500));
        return reject(err);
      }
      resolve();
    });
  });
}

export async function compressGalleryVideo(
  inputPath: string,
  originalFilename: string
): Promise<CompressedVideoResult> {
  const dir = path.dirname(inputPath);
  const baseName = path.basename(inputPath, path.extname(inputPath));
  const compressedFilename = `${baseName}-compressed.mp4`;
  const thumbnailFilename = `${baseName}-thumb.webp`;
  const compressedPath = path.join(dir, compressedFilename);
  const thumbnailPath = path.join(dir, thumbnailFilename);

  const originalSize = fs.statSync(inputPath).size;
  console.log(`[videoCompressor] Starting compression: ${originalFilename} (${(originalSize / 1024 / 1024).toFixed(1)}MB)`);

  let info: { width: number; height: number; duration: number };
  try {
    info = await runFFprobe(inputPath);
  } catch {
    info = { width: 0, height: 0, duration: 0 };
  }

  let targetHeight = 720;
  if (info.height > 0 && info.height <= 480) {
    targetHeight = info.height;
  } else if (info.height > 0 && info.height <= 720) {
    targetHeight = info.height;
  }

  const needsScale = info.height > 720;

  const ffmpegArgs = [
    "-i", inputPath,
    "-y",
    "-c:v", "libx264",
    "-preset", "fast",
    "-crf", "26",
    "-c:a", "aac",
    "-b:a", "128k",
    "-movflags", "+faststart",
    "-pix_fmt", "yuv420p",
  ];

  if (needsScale) {
    ffmpegArgs.push("-vf", `scale=-2:${targetHeight}`);
  }

  ffmpegArgs.push(compressedPath);

  const estimatedTimeoutMs = Math.max(1800000, info.duration * 5000);

  try {
    await runFFmpeg(ffmpegArgs, estimatedTimeoutMs);
    const compressedSizeResult = fs.existsSync(compressedPath) ? fs.statSync(compressedPath).size : originalSize;
    console.log(`[videoCompressor] Compressed: ${(originalSize / 1024 / 1024).toFixed(1)}MB → ${(compressedSizeResult / 1024 / 1024).toFixed(1)}MB (${Math.round((1 - compressedSizeResult / originalSize) * 100)}% reduction)`);
  } catch (e) {
    console.error("[videoCompressor] Compression failed, using original:", e);
    fs.copyFileSync(inputPath, compressedPath);
  }

  try {
    const thumbTime = Math.min(info.duration * 0.1, 2);
    await runFFmpeg([
      "-i", compressedPath,
      "-y",
      "-ss", String(thumbTime),
      "-vframes", "1",
      "-vf", "scale=400:-2",
      "-q:v", "80",
      thumbnailPath,
    ], 60000);
  } catch {
    console.error("[videoCompressor] Thumbnail generation failed");
  }

  const compressedSize = fs.existsSync(compressedPath) ? fs.statSync(compressedPath).size : originalSize;

  if (fs.existsSync(inputPath) && inputPath !== compressedPath) {
    try { fs.unlinkSync(inputPath); } catch {}
  }

  const compressedUrl = `/uploads/gallery/${compressedFilename}`;
  const thumbnailUrl = fs.existsSync(thumbnailPath) ? `/uploads/gallery/${thumbnailFilename}` : "";

  return {
    compressedPath,
    compressedUrl,
    thumbnailPath,
    thumbnailUrl,
    originalSize,
    compressedSize,
    width: needsScale ? Math.round(info.width * (targetHeight / info.height)) : info.width,
    height: needsScale ? targetHeight : info.height,
    duration: info.duration,
  };
}
