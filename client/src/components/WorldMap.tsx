import { Link } from "wouter";
import type { Region, Chapter } from "@shared/schema";
import { motion } from "framer-motion";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from "react-simple-maps";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

interface WorldMapProps {
  regions: Region[];
}

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const regionMarkers: Record<string, { coordinates: [number, number]; label: string }> = {
  "north-america": { coordinates: [-95.7129, 37.0902], label: "North America" },
  "europe": { coordinates: [10.4515, 51.1657], label: "Europe" },
  "uk": { coordinates: [-3.436, 55.3781], label: "United Kingdom" },
  "canada": { coordinates: [-106.3468, 56.1304], label: "Canada" },
  "asia": { coordinates: [100.6197, 34.0479], label: "Asia" },
  "gulf-uae": { coordinates: [54.3773, 24.4539], label: "Gulf" },
  "australia": { coordinates: [133.7751, -25.2744], label: "Australia" },
  "south-africa": { coordinates: [22.9375, -30.5595], label: "South Africa" },
};

const ugandaCoordinates: [number, number] = [32.2903, 1.3733];

export function WorldMap({ regions }: WorldMapProps) {
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [hoveredChapter, setHoveredChapter] = useState<Chapter | null>(null);

  const { data: chapters = [] } = useQuery<Chapter[]>({
    queryKey: ["/api/chapters"],
  });

  const mappedChapters = chapters.filter(
    (c) => c.latitude && c.longitude && !isNaN(Number(c.latitude)) && !isNaN(Number(c.longitude))
  );

  return (
    <div className="relative w-full aspect-[2/1] bg-gradient-to-b from-sky-100 to-sky-200 dark:from-slate-800 dark:to-slate-900 rounded-lg overflow-hidden border shadow-inner">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 120,
          center: [20, 20],
        }}
        style={{ width: "100%", height: "100%" }}
      >
        <ZoomableGroup zoom={1} center={[20, 20]}>
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="#86efac"
                  stroke="#22c55e"
                  strokeWidth={0.5}
                  style={{
                    default: {
                      fill: "#86efac",
                      stroke: "#22c55e",
                      strokeWidth: 0.5,
                      outline: "none",
                    },
                    hover: {
                      fill: "#4ade80",
                      stroke: "#16a34a",
                      strokeWidth: 0.5,
                      outline: "none",
                    },
                    pressed: {
                      fill: "#22c55e",
                      outline: "none",
                    },
                  }}
                />
              ))
            }
          </Geographies>

          {regions.map((region) => {
            const marker = regionMarkers[region.slug];
            if (!marker) return null;

            return (
              <Marker
                key={region.id}
                coordinates={marker.coordinates}
                onMouseEnter={() => setHoveredRegion(region.slug)}
                onMouseLeave={() => setHoveredRegion(null)}
              >
                <Link href={`/regions/${region.slug}`}>
                  <g
                    className="cursor-pointer"
                    data-testid={`map-region-${region.slug}`}
                  >
                    <circle
                      r={8}
                      fill="#dc2626"
                      stroke="#fff"
                      strokeWidth={2}
                      className="drop-shadow-lg"
                    />
                    <circle
                      r={12}
                      fill="transparent"
                      stroke="#dc2626"
                      strokeWidth={2}
                      opacity={0.5}
                      className="animate-ping"
                    />
                  </g>
                </Link>
              </Marker>
            );
          })}

          {mappedChapters.map((chapter) => (
            <Marker
              key={chapter.id}
              coordinates={[Number(chapter.longitude), Number(chapter.latitude)]}
              onMouseEnter={() => setHoveredChapter(chapter)}
              onMouseLeave={() => setHoveredChapter(null)}
            >
              <Link href={`/chapters/${chapter.slug}`}>
                <g
                  className="cursor-pointer"
                  data-testid={`map-chapter-${chapter.slug}`}
                >
                  <circle
                    r={4}
                    fill="#fbbf24"
                    stroke="#fff"
                    strokeWidth={1.5}
                    className="drop-shadow-md hover:r-6 transition-all"
                  />
                </g>
              </Link>
            </Marker>
          ))}

          <Marker
            coordinates={ugandaCoordinates}
            onMouseEnter={() => setHoveredRegion("uganda")}
            onMouseLeave={() => setHoveredRegion(null)}
          >
            <a
              href="https://nupuganda.org/"
              target="_blank"
              rel="noopener noreferrer"
              data-testid="map-uganda-homeland"
            >
              <g className="cursor-pointer">
                <circle
                  r={12}
                  fill="#1e3a8a"
                  stroke="#fff"
                  strokeWidth={3}
                  className="drop-shadow-xl"
                />
                <circle
                  r={18}
                  fill="transparent"
                  stroke="#1e3a8a"
                  strokeWidth={3}
                  opacity={0.6}
                  className="animate-ping"
                />
                <text
                  textAnchor="middle"
                  y={4}
                  style={{ fontFamily: "system-ui", fontWeight: "bold", fontSize: "9px", fill: "#fff" }}
                >
                  HQ
                </text>
              </g>
            </a>
          </Marker>
        </ZoomableGroup>
      </ComposableMap>

      {regions.map((region) => {
        const marker = regionMarkers[region.slug];
        if (!marker || hoveredRegion !== region.slug) return null;

        return (
          <motion.div
            key={region.id}
            className="absolute pointer-events-none z-20"
            style={{
              left: "50%",
              top: "10%",
              transform: "translateX(-50%)",
            }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="px-4 py-2 bg-card border rounded-lg shadow-xl">
              <p className="font-semibold text-foreground">{region.name}</p>
              <p className="text-xs text-muted-foreground">Click to explore chapters</p>
            </div>
          </motion.div>
        );
      })}

      {hoveredRegion === "uganda" && (
        <motion.div
          className="absolute pointer-events-none z-20"
          style={{
            left: "50%",
            top: "10%",
            transform: "translateX(-50%)",
          }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-800 rounded-lg shadow-xl">
            <p className="font-bold text-foreground flex items-center gap-2">
              <span>🇺🇬</span> Headquarters Uganda
            </p>
            <p className="text-xs text-muted-foreground">Click to visit NUP Uganda</p>
          </div>
        </motion.div>
      )}

      <div className="absolute bottom-4 left-4 bg-card/95 backdrop-blur px-4 py-2 rounded-lg border shadow-lg">
        <p className="text-sm font-medium">Click a region to explore chapters</p>
      </div>

      {hoveredChapter && (
        <motion.div
          className="absolute pointer-events-none z-20"
          style={{ left: "50%", top: "10%", transform: "translateX(-50%)" }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="px-4 py-2 bg-card border-2 border-amber-500 rounded-lg shadow-xl">
            <p className="font-semibold text-foreground">{hoveredChapter.name}</p>
            <p className="text-xs text-muted-foreground">{hoveredChapter.city}, {hoveredChapter.country}</p>
          </div>
        </motion.div>
      )}

      <div className="absolute top-4 right-4 bg-card/95 backdrop-blur px-3 py-2 rounded-lg border shadow-lg space-y-1">
        <div className="flex items-center gap-2 text-sm">
          <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
          <span className="font-medium">{regions.length} Regions</span>
        </div>
        {mappedChapters.length > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2.5 h-2.5 bg-amber-400 rounded-full border border-white" />
            <span className="font-medium">{mappedChapters.length} Chapters</span>
          </div>
        )}
      </div>
    </div>
  );
}
