import { Link } from "wouter";
import type { Region } from "@shared/schema";
import { motion } from "framer-motion";

interface WorldMapProps {
  regions: Region[];
}

const regionPositions: Record<string, { x: number; y: number; label: string }> = {
  "north-america": { x: 20, y: 35, label: "North America" },
  "europe": { x: 48, y: 28, label: "Europe" },
  "uk": { x: 45, y: 25, label: "UK" },
  "canada": { x: 22, y: 22, label: "Canada" },
  "asia": { x: 72, y: 40, label: "Asia" },
  "australia": { x: 82, y: 70, label: "Australia" },
};

export function WorldMap({ regions }: WorldMapProps) {
  return (
    <div className="relative w-full aspect-[2/1] bg-gradient-to-b from-primary/5 to-primary/10 rounded-lg overflow-hidden">
      <svg
        viewBox="0 0 100 50"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <pattern id="grid" width="5" height="5" patternUnits="userSpaceOnUse">
            <circle cx="2.5" cy="2.5" r="0.3" fill="currentColor" className="text-primary/20" />
          </pattern>
        </defs>
        <rect width="100" height="50" fill="url(#grid)" />
        
        <path
          d="M15,12 Q25,8 35,15 L40,25 Q35,35 25,38 L15,35 Q10,25 15,12"
          fill="currentColor"
          className="text-primary/10"
          stroke="currentColor"
          strokeWidth="0.3"
        />
        <path
          d="M42,18 Q52,12 58,18 L55,32 Q48,38 42,32 Z"
          fill="currentColor"
          className="text-primary/10"
          stroke="currentColor"
          strokeWidth="0.3"
        />
        <path
          d="M60,25 Q75,20 88,30 L85,45 Q70,50 60,40 Z"
          fill="currentColor"
          className="text-primary/10"
          stroke="currentColor"
          strokeWidth="0.3"
        />
        <path
          d="M75,55 Q85,52 92,60 L88,72 Q80,78 72,70 Z"
          fill="currentColor"
          className="text-primary/10"
          stroke="currentColor"
          strokeWidth="0.3"
        />
        <path
          d="M45,38 Q55,35 60,42 L55,52 Q48,55 42,48 Z"
          fill="currentColor"
          className="text-primary/15"
          stroke="currentColor"
          strokeWidth="0.4"
        />
      </svg>

      {regions.map((region, index) => {
        const pos = regionPositions[region.slug];
        if (!pos) return null;

        return (
          <Link key={region.id} href={`/regions/${region.slug}`}>
            <motion.div
              className="absolute cursor-pointer group"
              style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: "translate(-50%, -50%)" }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1, type: "spring" }}
              whileHover={{ scale: 1.1 }}
              data-testid={`map-region-${region.slug}`}
            >
              <div className="relative">
                <div className="w-4 h-4 bg-primary rounded-full animate-pulse" />
                <div className="absolute inset-0 w-4 h-4 bg-primary rounded-full animate-ping opacity-75" />
              </div>
              <div className="absolute left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-card border rounded-md text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                {region.name}
              </div>
            </motion.div>
          </Link>
        );
      })}

      <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur px-3 py-2 rounded-md border">
        <p className="text-xs font-medium">Click a region to explore chapters</p>
      </div>
    </div>
  );
}
