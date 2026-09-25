"use client";

import Link from "next/link";
import TopBar from "@/components/v2/TopBar";
import { incidentIndex } from "@/lib/data-source";
import type { Incident } from "@/lib/types";

const STATUS_LABEL: Record<Incident["status"], string> = {
  "investigation-ready": "Investigation ready",
  "under-review": "Under review",
  closed: "Closed",
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function IncidentsPage() {
  return (
    <div className="h-screen w-screen flex flex-col bg-surface overflow-hidden">
      <TopBar />
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[840px] mx-auto px-6 pt-10 pb-16">
          <div className="eyebrow text-inkFaint mb-1.5">Case registry</div>
          <h1 className="font-editorial text-[26px] text-ink leading-tight">Incidents</h1>
          <p className="mt-1.5 text-[12.5px] text-inkMuted">
            {incidentIndex.length} detections across Sentinel-1 coverage.
          </p>

          <div className="mt-8 border-t border-line">
            {incidentIndex.map((entry) => (
              <Link
                key={entry.incident.id}
                href="/v2"
                className="flex items-center gap-4 py-4 border-b border-line hover:bg-surfaceRaised transition-colors -mx-2 px-2 rounded-sm"
              >
                <div className="w-16 h-11 shrink-0 rounded-sm overflow-hidden bg-[#101214]">
                  <SarThumb />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-[13.5px] text-ink font-editorial truncate">
                    {entry.incident.name}
                  </div>
                  <div className="mt-0.5 text-[11px] text-inkFaint truncate">
                    {entry.incident.region}
                  </div>
                </div>

                <div className="w-28 shrink-0 text-[11.5px] text-inkMuted tabular-nums">
                  {fmtDate(entry.incident.acquiredAt)}
                </div>

                <div className="w-16 shrink-0 text-[11.5px] text-ink tabular-nums text-right">
                  {entry.detection.areaKm2.toFixed(1)} km²
                </div>

                <div className="w-24 shrink-0 text-[11px] text-inkFaint text-right">
                  {entry.incident.sensor} SAR
                </div>

                <div className="w-32 shrink-0 flex items-center justify-end gap-1.5">
                  <span
                    className="w-1 h-1 rounded-full"
                    style={{
                      background:
                        entry.incident.status === "investigation-ready"
                          ? "#2B5D8C"
                          : entry.incident.status === "under-review"
                          ? "#B5722A"
                          : "#8B8E94",
                    }}
                  />
                  <span className="text-[11px] text-inkMuted">
                    {STATUS_LABEL[entry.incident.status]}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SarThumb() {
  return (
    <svg viewBox="0 0 64 44" className="w-full h-full">
      <defs>
        <filter id="n2">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.55  0 0 0 0 0.55  0 0 0 0 0.55  0 0 0 0.32 0" />
        </filter>
      </defs>
      <rect width="64" height="44" fill="#15171a" />
      <rect width="64" height="44" filter="url(#n2)" />
    </svg>
  );
}
