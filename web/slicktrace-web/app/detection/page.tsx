"use client";

import { useRef, useState, WheelEvent, MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { detectionData, incidentData } from "@/lib/data-source";

type Tab = "SAR" | "Probability" | "Segmentation";

const TABS: Tab[] = ["SAR", "Probability", "Segmentation"];

export default function DetectionEvidencePage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("SAR");
  const [opacity, setOpacity] = useState(1);
  const [threshold, setThreshold] = useState(0.5);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [cursorCoord, setCursorCoord] = useState<string | null>(null);
  const draggingRef = useRef<{ x: number; y: number } | null>(null);
  const viewerRef = useRef<HTMLDivElement>(null);

  const onWheel = (e: WheelEvent) => {
    e.preventDefault();
    const next = Math.min(6, Math.max(1, zoom - e.deltaY * 0.0015));
    setZoom(next);
  };

  const onMouseDown = (e: MouseEvent) => {
    draggingRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };
  const onMouseMove = (e: MouseEvent) => {
    if (draggingRef.current) {
      setPan({ x: e.clientX - draggingRef.current.x, y: e.clientY - draggingRef.current.y });
    }
    const rect = viewerRef.current?.getBoundingClientRect();
    if (rect) {
      const relX = (e.clientX - rect.left) / rect.width;
      const relY = (e.clientY - rect.top) / rect.height;
      // Approximate lon/lat readout around the incident center for realism.
      const lon = incidentData.center[0] + (relX - 0.5) * 0.3;
      const lat = incidentData.center[1] - (relY - 0.5) * 0.2;
      setCursorCoord(`${lat.toFixed(4)}°, ${lon.toFixed(4)}°`);
    }
  };
  const onMouseUp = () => (draggingRef.current = null);

  return (
    <div className="h-screen w-screen flex flex-col bg-surface overflow-hidden">
      <header className="paper h-[52px] shrink-0 border-b border-line bg-surfaceRaised flex items-center px-4 gap-4 z-10">
        <button
          onClick={() => router.push("/v2")}
          className="flex items-center gap-1.5 text-[12.5px] text-inkMuted hover:text-ink transition-colors"
        >
          <ArrowLeft size={13} strokeWidth={1.8} />
          Back to investigation
        </button>
        <div className="h-3.5 w-px bg-line" />
        <span className="text-[12.5px] text-ink font-medium">Detection evidence</span>

        <div className="flex-1" />

        <div className="flex items-center gap-4">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`text-[12.5px] transition-colors ${
                tab === t ? "text-ink font-medium" : "text-inkMuted hover:text-ink"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </header>

      <div className="relative flex-1">
        <div
          ref={viewerRef}
          className="absolute inset-0 bg-[#101214] overflow-hidden cursor-grab active:cursor-grabbing"
          onWheel={onWheel}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
        >
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transition: draggingRef.current ? "none" : "transform 80ms ease-out",
            }}
          >
            <EvidenceRaster tab={tab} opacity={opacity} threshold={threshold} />
          </div>
        </div>

        {/* Coordinate readout */}
        <div className="pointer-events-none absolute bottom-3 left-3 text-[11px] text-white/70 font-mono bg-black/30 rounded-sm px-2 py-1">
          {cursorCoord ?? "—"}
        </div>

        {/* Technical metadata strip */}
        <div className="pointer-events-none absolute top-3 left-3 text-[10.5px] text-white/60 font-mono bg-black/30 rounded-sm px-2 py-1.5 leading-relaxed">
          <div>confidence {detectionData.confidence.toFixed(2)} · area {detectionData.areaKm2.toFixed(1)} km²</div>
          <div>model {detectionData.modelVersion} · threshold {threshold.toFixed(2)}</div>
          <div>acquired {new Date(incidentData.acquiredAt).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "UTC" })} UTC</div>
        </div>

        {/* Zoom controls */}
        <div className="absolute bottom-3 right-3 flex flex-col items-center gap-1.5">
          <div className="flex flex-col bg-surfaceRaised rounded shadow-control overflow-hidden w-7">
            <button
              onClick={() => setZoom((z) => Math.min(6, z + 0.4))}
              className="h-7 flex items-center justify-center text-inkMuted hover:text-ink hover:bg-surface transition-colors"
            >
              <ZoomIn size={13} strokeWidth={1.8} />
            </button>
            <div className="h-px bg-line mx-1.5" />
            <button
              onClick={() => setZoom((z) => Math.max(1, z - 0.4))}
              className="h-7 flex items-center justify-center text-inkMuted hover:text-ink hover:bg-surface transition-colors"
            >
              <ZoomOut size={13} strokeWidth={1.8} />
            </button>
          </div>
          <button
            onClick={() => {
              setZoom(1);
              setPan({ x: 0, y: 0 });
            }}
            className="w-7 h-7 flex items-center justify-center bg-surfaceRaised rounded shadow-control text-inkMuted hover:text-ink transition-colors"
          >
            <Maximize2 size={12} strokeWidth={1.8} />
          </button>
        </div>

        {/* Opacity / threshold controls */}
        <div className="absolute top-3 right-3 w-52 paper bg-surfaceRaised rounded-md shadow-control px-3 py-2.5">
          <div className={tab !== "SAR" ? "mb-2.5" : ""}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10.5px] text-inkMuted">Opacity</span>
              <span className="text-[10.5px] text-inkFaint tabular-nums">{Math.round(opacity * 100)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={opacity}
              onChange={(e) => setOpacity(parseFloat(e.target.value))}
              className="w-full accent-slick"
            />
          </div>
          {tab !== "SAR" && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10.5px] text-inkMuted">Threshold</span>
                <span className="text-[10.5px] text-inkFaint tabular-nums">{threshold.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={threshold}
                onChange={(e) => setThreshold(parseFloat(e.target.value))}
                className="w-full accent-origin"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EvidenceRaster({
  tab,
  opacity,
  threshold,
}: {
  tab: Tab;
  opacity: number;
  threshold: number;
}) {
  // Stylized placeholder rasters — wire sarThumbnailUrl / probabilityRasterUrl /
  // segmentationRasterUrl from Detection onto an <img> or MapLibre raster source here.
  if (tab === "SAR") {
    return (
      <svg width="720" height="480" viewBox="0 0 720 480" style={{ opacity }}>
        <defs>
          <filter id="sar2">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
            <feColorMatrix type="matrix" values="0 0 0 0 0.6  0 0 0 0 0.6  0 0 0 0 0.6  0 0 0 0.4 0" />
          </filter>
        </defs>
        <rect width="720" height="480" fill="#15171a" />
        <rect width="720" height="480" filter="url(#sar2)" />
      </svg>
    );
  }
  if (tab === "Probability") {
    const cut = 1 - threshold;
    return (
      <svg width="720" height="480" viewBox="0 0 720 480" style={{ opacity }}>
        <defs>
          <radialGradient id="prob" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#2B5D8C" stopOpacity={1} />
            <stop offset={`${cut * 100}%`} stopColor="#2B5D8C" stopOpacity={0.5} />
            <stop offset="100%" stopColor="#2B5D8C" stopOpacity={0} />
          </radialGradient>
        </defs>
        <rect width="720" height="480" fill="#101214" />
        <ellipse cx="410" cy="250" rx="220" ry="120" fill="url(#prob)" />
      </svg>
    );
  }
  return (
    <svg width="720" height="480" viewBox="0 0 720 480" style={{ opacity }}>
      <rect width="720" height="480" fill="#101214" />
      <path
        d="M240 200 Q330 150 420 190 Q520 220 560 280 Q520 340 420 330 Q320 350 260 300 Q220 250 240 200 Z"
        fill="#2B5D8C"
        opacity={Math.max(0.25, threshold)}
        stroke="#DCE7F0"
        strokeWidth={1}
      />
    </svg>
  );
}
