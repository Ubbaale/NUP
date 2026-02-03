import { Link } from "wouter";
import type { Region } from "@shared/schema";
import { motion } from "framer-motion";

interface WorldMapProps {
  regions: Region[];
}

const regionPositions: Record<string, { x: number; y: number; label: string }> = {
  "north-america": { x: 22, y: 38, label: "North America" },
  "europe": { x: 52, y: 32, label: "Europe" },
  "uk": { x: 47, y: 28, label: "UK" },
  "canada": { x: 20, y: 28, label: "Canada" },
  "asia": { x: 75, y: 38, label: "Asia" },
  "australia": { x: 85, y: 72, label: "Australia" },
};

export function WorldMap({ regions }: WorldMapProps) {
  return (
    <div className="relative w-full aspect-[2/1] bg-gradient-to-b from-blue-50 to-blue-100 dark:from-slate-800 dark:to-slate-900 rounded-lg overflow-hidden border">
      <svg
        viewBox="0 0 1000 500"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="oceanGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#e0f2fe" />
            <stop offset="100%" stopColor="#bae6fd" />
          </linearGradient>
          <linearGradient id="oceanGradientDark" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
        </defs>
        
        <rect width="1000" height="500" className="fill-blue-100 dark:fill-slate-800" />
        
        <g className="fill-emerald-200 dark:fill-emerald-900 stroke-emerald-300 dark:stroke-emerald-700" strokeWidth="1">
          <path d="M140,60 L180,55 L220,60 L250,80 L270,120 L280,160 L260,200 L230,230 L200,260 L170,280 L140,290 L110,280 L80,250 L60,210 L50,170 L55,130 L70,100 L100,70 Z" />
          <path d="M70,100 L50,120 L30,150 L25,190 L35,230 L60,270 L90,300 L120,320 L150,330 L180,320 L200,290 L210,260 L200,230 L180,200 L160,180 L140,170 L120,175 L100,190 L80,200 L60,190 L50,170 L55,140 Z" />
          <path d="M200,290 L220,310 L250,340 L280,360 L300,370 L320,360 L330,340 L320,310 L290,280 L260,260 L230,250 L210,260 Z" />
          
          <path d="M160,65 L200,50 L260,45 L320,50 L360,65 L380,55 L400,50 L380,75 L350,90 L320,85 L280,90 L240,85 L200,80 L170,75 Z" />
        </g>
        
        <g className="fill-emerald-200 dark:fill-emerald-900 stroke-emerald-300 dark:stroke-emerald-700" strokeWidth="1">
          <path d="M420,80 L460,75 L500,80 L530,100 L550,130 L560,160 L550,190 L520,210 L480,220 L440,210 L410,190 L400,160 L405,130 L415,100 Z" />
          <path d="M480,220 L520,240 L550,270 L570,310 L560,350 L530,380 L490,400 L450,410 L410,400 L380,370 L370,330 L380,290 L400,260 L430,240 L460,225 Z" />
        </g>
        
        <g className="fill-emerald-200 dark:fill-emerald-900 stroke-emerald-300 dark:stroke-emerald-700" strokeWidth="1">
          <path d="M460,120 L490,115 L520,120 L545,135 L555,155 L550,175 L535,190 L510,195 L485,190 L465,175 L455,155 L460,135 Z" />
          <path d="M440,130 L450,125 L455,140 L450,155 L440,160 L430,155 L425,140 L430,130 Z" />
        </g>
        
        <g className="fill-emerald-200 dark:fill-emerald-900 stroke-emerald-300 dark:stroke-emerald-700" strokeWidth="1">
          <path d="M560,90 L620,70 L700,60 L780,70 L840,100 L880,140 L900,190 L890,250 L860,300 L810,340 L750,360 L690,350 L640,320 L600,280 L570,230 L560,180 L565,130 Z" />
          <path d="M700,60 L750,45 L800,50 L840,70 L870,55 L900,60 L920,80 L910,100 L880,110 L850,100 L820,90 L780,85 L740,80 L710,75 Z" />
          <path d="M600,280 L580,310 L570,350 L590,390 L630,420 L680,440 L730,450 L780,440 L820,410 L840,370 L830,330 L800,300 L760,290 L720,295 L680,310 L640,300 L610,290 Z" />
          <path d="M840,180 L880,170 L920,180 L950,210 L960,250 L950,290 L920,320 L880,330 L850,320 L830,290 L825,250 L835,210 Z" />
        </g>
        
        <g className="fill-emerald-200 dark:fill-emerald-900 stroke-emerald-300 dark:stroke-emerald-700" strokeWidth="1">
          <path d="M800,360 L850,350 L900,360 L940,390 L960,430 L950,470 L910,490 L860,495 L810,480 L780,450 L775,410 L790,380 Z" />
          <path d="M920,400 L945,395 L965,410 L970,435 L960,455 L940,460 L920,450 L915,425 Z" />
        </g>
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
              whileHover={{ scale: 1.2 }}
              data-testid={`map-region-${region.slug}`}
            >
              <div className="relative">
                <div className="w-5 h-5 bg-primary rounded-full shadow-lg border-2 border-white dark:border-slate-700" />
                <div className="absolute inset-0 w-5 h-5 bg-primary rounded-full animate-ping opacity-50" />
              </div>
              <div className="absolute left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 bg-card border rounded-lg text-sm font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-xl z-10">
                {region.name}
                <div className="text-xs font-normal text-muted-foreground">Click to explore</div>
              </div>
            </motion.div>
          </Link>
        );
      })}

      <div className="absolute bottom-4 left-4 bg-card/95 backdrop-blur px-4 py-2 rounded-lg border shadow-lg">
        <p className="text-sm font-medium">Click a region to explore chapters</p>
      </div>
      
      <div className="absolute top-4 right-4 bg-card/95 backdrop-blur px-3 py-2 rounded-lg border shadow-lg">
        <div className="flex items-center gap-2 text-sm">
          <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
          <span className="font-medium">{regions.length} Active Regions</span>
        </div>
      </div>
    </div>
  );
}
