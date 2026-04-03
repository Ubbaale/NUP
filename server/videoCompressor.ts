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
    ], { timeout: 30000 }, (err, stdout) => {
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

function runFFmpeg(args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    execFile("ffmpeg", args, { timeout: 600000 }, (err, _stdout, stderr) => {
      if (err) {
        console.error("[videoCompressor] FFmpeg error:", stderr);
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

  let info: { width: number; height: number; duration: number };
  try {
    info = await runFFprobe(inputPath);
  } catch {
    info = { width: 0, height: 0, duration: 0 };
  }

  let targetHeight = info.height;
  let scaleFilter = "";
  if (info.height > 1080) {
    targetHeight = 1080;
    scaleFilter = "-vf";
  } else if (info.height > 720 && originalSize > 100 * 1024 * 1024) {
    targetHeight = 720;
    scaleFilter = "-vf";
  }

  const ffmpegArgs = [
    "-i", inputPath,
    "-y",
    "-c:v", "libx264",
    "-preset", "medium",
    "-crf", "28",
    "-c:a", "aac",
    "-b:a", "128k",
    "-movflags", "+faststart",
  ];

  if (scaleFilter) {
    ffmpegArgs.push("-vf", `scale=-2:${targetHeight}`);
  }

  ffmpegArgs.push(compressedPath);

  try {
    await runFFmpeg(ffmpegArgs);
  } catch (e) {
    console.error("[videoCompressor] Compression failed, using original:", e);
    fs.copyFileSync(inputPath, compressedPath);
  }

  try {
    const thumbTime = Math.min(info.duration * 0.1, 2);
    await runFFmpeg([
      "-i", inputPath,
      "-y",
      "-ss", String(thumbTime),
      "-vframes", "1",
      "-vf", `scale=400:-2`,
      "-q:v", "80",
      thumbnailPath,
    ]);
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
    width: info.width,
    height: targetHeight,
    duration: info.duration,
  };
}
