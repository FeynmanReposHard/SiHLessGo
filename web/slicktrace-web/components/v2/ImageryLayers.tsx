"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { Detection, LayerVisibility, LayerId } from "@/lib/types";

interface ImageryLayersProps {
  detection: Detection;
  layers: LayerVisibility;
  onToggle: (id: LayerId) => void;
  onOpenChange?: (open: boolean) => void;
}

const LAYER_ITEMS: { id: Exclude<LayerId, "satellite">; label: string }[] = [
  { id: "slick", label: "Detected slick" },
  { id: "origin", label: "Probable origin" },
  { id: "forecast", label: "Forecast drift" },
  { id: "ais", label: "AIS vessels" },
  { id: "wind", label: "Wind / current" },
];

function fmt(iso: string) {
  const d = new Date(iso);
  const date = d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const time = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" });
  return `${date} · ${time} UTC`;
}

export default function ImageryLayers({
  detection,
  layers,
  onToggle,
  onOpenChange,
}: ImageryLayersProps) {
  const [open, setOpen] = useState(false);

  const setPanelOpen = (next: boolean) => {
    setOpen(next);
    onOpenChange?.(next);
  };

  return (
    <div className="pointer-events-auto w-[272px]">
      <div className="paper bg-surfaceRaised rounded-md shadow-control overflow-hidden">
        <div className="h-8 px-3 flex items-center justify-between border-b border-line/70">
          <div className="flex items-center gap-2 min-w-0">
            <span className="h-1.5 w-1.5 rounded-full bg-slick shrink-0" />
            <span className="text-[12px] font-medium text-ink truncate">Sentinel-1 SAR</span>
          </div>
          <span className="text-[9.5px] uppercase tracking-[0.08em] text-inkFaint">Evidence</span>
        </div>

        {/* The SAR image remains visible at all times. */}
        <div className="p-2.5 pb-2">
          <div className="rounded-[4px] overflow-hidden bg-[#101214] aspect-[16/9] border border-black/10">
            <SarThumbnail url={detection.sarThumbnailUrl} />
          </div>
        </div>

        {/* Details are progressively disclosed under the image. */}
        <button
          type="button"
          onClick={() => setPanelOpen(!open)}
          aria-expanded={open}
          className="w-full h-8 px-3 flex items-center justify-between border-t border-line/80 text-[11px] text-ink hover:bg-black/[0.025] transition-colors"
        >
          <span>{open ? "Hide scene details" : "Scene details & layers"}</span>
          <ChevronDown
            size={12}
            strokeWidth={1.8}
            className={`text-inkFaint transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          />
        </button>

        <div
          className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
            open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden">
            <div className="px-3 pt-2.5 pb-3 border-t border-line/70">
              <div className="eyebrow text-inkFaint mb-1.5">Scene metadata</div>
              <LabelValue label="Acquisition" value={fmt(detection.originWindow.end)} />
              <LabelValue
                label="Sensor"
                value={detection.sceneId.split("_")[0].startsWith("S1A") ? "Sentinel-1A" : "Sentinel-1"}
              />
              <LabelValue label="Mode" value="IW" />
              <LabelValue label="Product" value="GRD" />
              <LabelValue label="Polarization" value={detection.polarization} />
              <LabelValue label="Scene" value={detection.sceneId} mono />
              <LabelValue label="Processing" value={detection.processingStatus} />
            </div>

            <div className="border-t border-line px-3 pt-2.5 pb-3">
              <div className="eyebrow text-inkFaint mb-1">Analysis layers</div>
              <div className="flex flex-col">
                {LAYER_ITEMS.map((item) => (
                  <label key={item.id} className="flex items-center justify-between h-7 cursor-pointer group">
                    <span className="text-[12px] text-ink group-hover:text-black transition-colors">
                      {item.label}
                    </span>
                    <Toggle checked={layers[item.id]} onChange={() => onToggle(item.id)} />
                  </label>
                ))}
              </div>

              <div className="mt-1.5 pt-2 border-t border-line flex items-center gap-3" aria-label="Map legend">
                <LegendItem label="Slick" color="#2B5D8C" style="fill" />
                <LegendItem label="Origin" color="#B5722A" style="dashed" />
                <LegendItem label="Forecast" color="#9FC3DE" style="dashed" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LabelValue({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1">
      <span className="text-[11px] text-inkFaint shrink-0">{label}</span>
      <span
        className={`text-[11px] text-ink text-right truncate ${mono ? "font-mono text-[10px]" : ""}`}
        title={value}
      >
        {value}
      </span>
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onChange();
      }}
      className={`w-7 h-4 rounded-full relative transition-colors duration-200 ${checked ? "bg-slick" : "bg-line"}`}
    >
      <span
        className={`absolute top-0.5 w-3 h-3 rounded-full bg-surfaceRaised shadow-sm transition-transform duration-200 ${
          checked ? "translate-x-3.5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

function LegendItem({ label, color, style }: { label: string; color: string; style: "fill" | "dashed" }) {
  return (
    <span className="flex items-center gap-1 text-[9.5px] text-inkFaint whitespace-nowrap">
      {style === "fill" ? (
        <span className="w-3.5 h-2 rounded-[2px]" style={{ background: color, opacity: 0.5 }} />
      ) : (
        <svg width="14" height="8" viewBox="0 0 14 8" aria-hidden="true">
          <line x1="0" y1="4" x2="14" y2="4" stroke={color} strokeWidth="1.6" strokeDasharray="2,1.6" />
        </svg>
      )}
      {label}
    </span>
  );
}

function SarThumbnail({ url }: { url?: string }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [url]);

  if (url && !failed) {
    return (
      <img
        src={url}
        alt="Sentinel-1 SAR scene preview"
        className="w-full h-full object-cover grayscale contrast-125"
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <div className="relative w-full h-full flex items-end p-2.5 overflow-hidden bg-[#111418]">
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(255,255,255,.08) 0, rgba(255,255,255,.08) 1px, transparent 1px, transparent 5px)",
        }}
      />
      <div className="relative">
        <div className="text-[9px] uppercase tracking-[0.11em] text-white/55">Sentinel-1 SAR</div>
        <div className="text-[10px] text-white/75 mt-0.5">Preview unavailable</div>
      </div>
    </div>
  );
}
