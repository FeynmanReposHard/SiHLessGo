"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import TopBar from "@/components/v2/TopBar";
import InvestigationMap, { InvestigationMapHandle } from "@/components/v2/InvestigationMap";
import ImageryLayers from "@/components/v2/ImageryLayers";
import IncidentSummary from "@/components/v2/IncidentSummary";
import TimelineScrubber from "@/components/v2/TimelineScrubber";
import InvestigationPanel from "@/components/v2/InvestigationPanel";
import MapControls from "@/components/v2/MapControls";
import { investigationData } from "@/lib/data-source";
import type { LayerId, LayerVisibility, Selection } from "@/lib/types";

const DEFAULT_LAYERS: LayerVisibility = {
  satellite: false,
  slick: true,
  origin: true,
  forecast: true,
  ais: true,
  wind: false,
};

export default function InvestigationView() {
  const router = useRouter();
  const data = investigationData;

  const [layers, setLayers] = useState<LayerVisibility>(DEFAULT_LAYERS);
  const [selection, setSelection] = useState<Selection>({ kind: null });
  const [timelineHours, setTimelineHours] = useState(0);
  const [imageryOpen, setImageryOpen] = useState(false);

  const mapRef = useRef<InvestigationMapHandle>(null);

  const toggleLayer = (id: LayerId) =>
    setLayers((prev) => ({ ...prev, [id]: !prev[id] }));

  const setBasemap = (satellite: boolean) =>
    setLayers((prev) => ({ ...prev, satellite }));

  return (
    <div className="h-screen w-screen flex flex-col bg-surface overflow-hidden">
      <TopBar />

      <div className="relative flex-1">
        <InvestigationMap
          ref={mapRef}
          data={data}
          layers={layers}
          selection={selection}
          onSelect={setSelection}
          timelineHours={timelineHours}
        />

        {/* Top-left evidence cluster. SAR image is always visible; metadata/layers expand below it. */}
        <div className="pointer-events-none absolute top-3 left-3 flex flex-col items-start gap-2 z-10">
          <ImageryLayers
            detection={data.detection}
            layers={layers}
            onToggle={toggleLayer}
            onOpenChange={setImageryOpen}
          />
          <IncidentSummary incident={data.incident} />
        </div>

        {/*
          Basemap mode control: when the SAR panel is expanded it docks beside the panel.
          When collapsed it glides back under the compact image card in the left corner.
        */}
        <div
          className="pointer-events-none absolute top-3 left-3 z-20 transition-transform duration-300 ease-[cubic-bezier(.2,.8,.2,1)]"
          style={{
            transform: imageryOpen ? "translate(284px, 0px)" : "translate(0px, 218px)",
          }}
        >
          <BasemapToggle
            satellite={layers.satellite}
            onChange={setBasemap}
          />
        </div>

        {/* Bottom-right map controls */}
        <div className="pointer-events-none absolute bottom-3 right-3 z-10">
          <MapControls
            onZoomIn={() => mapRef.current?.zoomIn()}
            onZoomOut={() => mapRef.current?.zoomOut()}
            onReset={() => mapRef.current?.resetView()}
          />
        </div>

        {/* Bottom-center timeline */}
        <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 z-10">
          <TimelineScrubber hours={timelineHours} onChange={setTimelineHours} />
        </div>

        <InvestigationPanel
          data={data}
          selection={selection}
          onSelect={setSelection}
          onClose={() => setSelection({ kind: null })}
          onViewEvidence={() => router.push("/detection")}
        />
      </div>
    </div>
  );
}

function BasemapToggle({
  satellite,
  onChange,
}: {
  satellite: boolean;
  onChange: (satellite: boolean) => void;
}) {
  return (
    <div className="pointer-events-auto paper inline-flex items-center rounded-md bg-surfaceRaised shadow-control p-[3px] border border-line/70">
      <button
        type="button"
        aria-pressed={!satellite}
        onClick={() => onChange(false)}
        className={`h-7 px-3 rounded-[4px] text-[11px] transition-all duration-200 ${
          !satellite
            ? "bg-ink text-surfaceRaised shadow-sm"
            : "text-inkFaint hover:text-ink hover:bg-black/[0.025]"
        }`}
      >
        Normal
      </button>
      <button
        type="button"
        aria-pressed={satellite}
        onClick={() => onChange(true)}
        className={`h-7 px-3 rounded-[4px] text-[11px] transition-all duration-200 ${
          satellite
            ? "bg-ink text-surfaceRaised shadow-sm"
            : "text-inkFaint hover:text-ink hover:bg-black/[0.025]"
        }`}
      >
        Satellite
      </button>
    </div>
  );
}
