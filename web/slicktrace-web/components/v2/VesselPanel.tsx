"use client";

import { ArrowLeft, Ship } from "lucide-react";
import type { SourceAssociation, VesselTrack } from "@/lib/types";
import { qualitativeLabel, coverageLabel } from "@/lib/format";

interface VesselPanelProps {
  vessel: VesselTrack;
  association?: SourceAssociation;
  onBack: () => void;
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });
}

export default function VesselPanel({ vessel, association, onBack }: VesselPanelProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-5 pt-5 pb-4">
        <button
          onClick={onBack}
          className="text-[11px] text-inkMuted hover:text-ink transition-colors flex items-center gap-1 mb-3"
        >
          <ArrowLeft size={11} strokeWidth={1.8} />
          Back
        </button>

        <div className="eyebrow text-slick mb-1.5">Potential source association</div>
        <h2 className="font-editorial text-[19px] text-ink leading-snug pr-4">{vessel.name}</h2>
        <p className="mt-1 text-[11.5px] text-inkMuted">
          MMSI {vessel.mmsi}
          {vessel.imo ? ` · IMO ${vessel.imo}` : ""} · {vessel.vesselType}
        </p>
      </div>

      {/* Vessel photo — contextual only, never treated as evidence. */}
      <div className="px-5 pb-4">
        <div className="rounded-sm overflow-hidden bg-surface aspect-[16/9] flex items-center justify-center">
          {vessel.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={vessel.imageUrl} alt={vessel.name} className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-1.5 text-inkFaint">
              <Ship size={20} strokeWidth={1.4} />
              <span className="text-[10px]">No verified image</span>
            </div>
          )}
        </div>
        {vessel.imageUrl && vessel.imageSource && (
          <div className="mt-1 text-[10px] text-inkFaint">Image: {vessel.imageSource}</div>
        )}
      </div>

      {association && (
        <>
          <div className="px-5 py-4 border-t border-line">
            <LabelValue label="Origin proximity" value={`${association.originProximityKm.toFixed(2)} km`} />
            <LabelValue label="Closest approach" value={`${association.closestApproachKm.toFixed(2)} km`} />
            <LabelValue label="Temporal compatibility" value={qualitativeLabel(association.scores.temporal)} />
            <LabelValue label="Trajectory compatibility" value={qualitativeLabel(association.scores.trajectory)} />
            <LabelValue label="AIS coverage" value={coverageLabel(association.scores.aisCoverage)} last />
          </div>

          <div className="px-5 py-4 border-t border-line flex-1 overflow-y-auto">
            <div className="eyebrow text-inkFaint mb-3">Evidence</div>
            <ol className="flex flex-col gap-3">
              {association.chronology.map((c, i) => (
                <li key={i} className="flex gap-2.5">
                  <div className="flex flex-col items-center pt-0.5">
                    <span className="w-1 h-1 rounded-full bg-slick shrink-0" />
                    {i < association.chronology.length - 1 && (
                      <span className="w-px flex-1 bg-line mt-1" />
                    )}
                  </div>
                  <div className="pb-0.5">
                    <div className="text-[11px] text-inkFaint tabular-nums">{fmtTime(c.timestamp)}</div>
                    <div className="text-[12px] text-ink mt-0.5">{c.label}</div>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-3 text-[10.5px] text-inkFaint">
              Observed {fmtTime(vessel.observationWindow.start)}–{fmtTime(vessel.observationWindow.end)} UTC
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function LabelValue({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div className={`flex items-baseline justify-between gap-3 py-1.5 ${last ? "" : ""}`}>
      <span className="text-[11.5px] text-inkMuted">{label}</span>
      <span className="text-[11.5px] text-ink tabular-nums">{value}</span>
    </div>
  );
}
