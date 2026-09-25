"use client";

import { X } from "lucide-react";
import type { InvestigationData, Selection } from "@/lib/types";
import SlickPanel from "./SlickPanel";
import VesselPanel from "./VesselPanel";

interface InvestigationPanelProps {
  data: InvestigationData;
  selection: Selection;
  onSelect: (selection: Selection) => void;
  onClose: () => void;
  onViewEvidence: () => void;
}

export default function InvestigationPanel({
  data,
  selection,
  onSelect,
  onClose,
  onViewEvidence,
}: InvestigationPanelProps) {
  const open = selection.kind !== null;
  const vessel =
    selection.kind === "vessel"
      ? data.vesselTracks.find((v) => v.mmsi === selection.mmsi)
      : undefined;
  const association =
    vessel && data.sourceAssociations.find((a) => a.mmsi === vessel.mmsi);

  return (
    <aside
      className={`paper absolute top-0 right-0 h-full w-[336px] bg-surfaceRaised border-l border-line shadow-panel transition-transform duration-300 ease-out z-20 ${
        open ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <button
        onClick={onClose}
        className="absolute top-3.5 right-3.5 z-10 text-inkFaint hover:text-ink transition-colors"
        aria-label="Close panel"
      >
        <X size={14} strokeWidth={1.8} />
      </button>

      {open && (
        <>
          {(selection.kind === "slick" || selection.kind === "origin") && (
            <SlickPanel
              incident={data.incident}
              detection={data.detection}
              associations={data.sourceAssociations}
              onViewEvidence={onViewEvidence}
              onSelectVessel={(mmsi) => onSelect({ kind: "vessel", mmsi })}
            />
          )}
          {selection.kind === "vessel" && vessel && (
            <VesselPanel
              vessel={vessel}
              association={association}
              onBack={() => onSelect({ kind: "slick" })}
            />
          )}
        </>
      )}
    </aside>
  );
}
