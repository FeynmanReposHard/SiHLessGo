"use client";

import { ArrowRight } from "lucide-react";
import type { Detection, Incident, SourceAssociation } from "@/lib/types";
import { qualitativeLabel } from "@/lib/format";

interface SlickPanelProps {
  incident: Incident;
  detection: Detection;
  associations: SourceAssociation[];
  onViewEvidence: () => void;
  onSelectVessel: (mmsi: string) => void;
}

function formatWindow(startIso: string, endIso: string) {
  const s = new Date(startIso);
  const e = new Date(endIso);
  const fmt = (d: Date) =>
    d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" });
  return `${fmt(s)}–${fmt(e)} UTC`;
}

export default function SlickPanel({
  incident,
  detection,
  associations,
  onViewEvidence,
  onSelectVessel,
}: SlickPanelProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-5 pt-5 pb-4">
        <div className="eyebrow text-slick mb-1.5">Investigation</div>
        <h2 className="font-editorial text-[19px] text-ink leading-snug pr-4">
          Detected oil slick
        </h2>
        <p className="mt-1 text-[11.5px] text-inkMuted leading-relaxed">
          {new Date(incident.acquiredAt).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}{" "}
          ·{" "}
          {new Date(incident.acquiredAt).toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "UTC",
          })}{" "}
          UTC · {incident.sensor} SAR
        </p>

        <div className="mt-4 flex items-baseline gap-6">
          <div>
            <span className="text-[17px] text-ink tabular-nums font-editorial">
              {detection.areaKm2.toFixed(1)}
            </span>
            <span className="text-[11px] text-inkMuted"> km² area</span>
          </div>
          <div>
            <span className="text-[17px] text-ink tabular-nums font-editorial">
              {detection.confidence.toFixed(2)}
            </span>
            <span className="text-[11px] text-inkMuted"> confidence</span>
          </div>
        </div>

        <div className="mt-3 text-[11.5px] text-inkMuted">
          <span className="text-origin">Probable origin</span>{" "}
          {formatWindow(detection.originWindow.start, detection.originWindow.end)}
        </div>

        <button
          onClick={onViewEvidence}
          className="mt-3 text-[12px] text-slick hover:text-ink transition-colors flex items-center gap-1"
        >
          View detection evidence
          <ArrowRight size={12} strokeWidth={1.8} />
        </button>
      </div>

      <div className="px-5 py-4 border-t border-line flex-1 overflow-y-auto">
        <div className="eyebrow text-inkFaint mb-3">Potential source associations</div>

        <div className="flex flex-col">
          {associations.map((a, i) => (
            <button
              key={a.id}
              onClick={() => onSelectVessel(a.mmsi)}
              className={`text-left py-3 ${
                i > 0 ? "border-t border-line" : ""
              } hover:opacity-70 transition-opacity`}
            >
              <div className="text-[13px] text-ink font-editorial">{a.vesselName}</div>
              <div className="mt-0.5 text-[11px] text-inkFaint">
                {a.vesselType} · {qualitativeLabel(a.overallCompatibility)} compatibility
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
