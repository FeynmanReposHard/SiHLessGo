"use client";

import { useCallback, useRef, useState } from "react";

interface TimelineScrubberProps {
  hours: number; // -12 .. 24
  onChange: (hours: number) => void;
}

const MIN = -12;
const MAX = 24;

const STOPS: { hours: number; label: string; group: "backward" | "observed" | "forecast" }[] = [
  { hours: -12, label: "Past", group: "backward" },
  { hours: -0.5, label: "Origin", group: "backward" },
  { hours: 0, label: "Observation", group: "observed" },
  { hours: 6, label: "+6h", group: "forecast" },
  { hours: 12, label: "+12h", group: "forecast" },
  { hours: 24, label: "+24h", group: "forecast" },
];

const GROUP_COLOR: Record<string, string> = {
  backward: "#B5722A",
  observed: "#2B5D8C",
  forecast: "#9FC3DE",
};

function pct(h: number) {
  return ((h - MIN) / (MAX - MIN)) * 100;
}

export default function TimelineScrubber({ hours, onChange }: TimelineScrubberProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  const setFromClientX = useCallback(
    (clientX: number) => {
      const track = trackRef.current;
      if (!track) return;
      const rect = track.getBoundingClientRect();
      const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
      const h = MIN + ratio * (MAX - MIN);
      onChange(Math.round(h * 2) / 2);
    },
    [onChange]
  );

  const onPointerDown = (e: React.PointerEvent) => {
    setDragging(true);
    (e.target as Element).setPointerCapture(e.pointerId);
    setFromClientX(e.clientX);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    setFromClientX(e.clientX);
  };
  const onPointerUp = () => setDragging(false);

  const activeGroup = hours < -0.25 ? "backward" : hours > 0.25 ? "forecast" : "observed";
  const activeStop = STOPS.find((s) => Math.abs(hours - s.hours) < 0.26);

  return (
    <div className="paper pointer-events-auto bg-surfaceRaised rounded-md shadow-control px-4 pt-2 pb-2.5 w-[460px] select-none">
      <div className="h-3.5 mb-0.5 relative">
        <span
          className="absolute -translate-x-1/2 text-[10px] font-medium whitespace-nowrap transition-colors"
          style={{ left: `${pct(hours)}%`, color: GROUP_COLOR[activeGroup] }}
        >
          {activeStop ? activeStop.label : hours < 0 ? `${Math.abs(hours)}h before` : `+${hours}h`}
        </span>
      </div>

      <div
        ref={trackRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        className="relative h-4 flex items-center cursor-pointer"
      >
        <div className="absolute left-0 right-0 h-px bg-line" />
        <div
          className="absolute h-px"
          style={{
            left: `${pct(MIN)}%`,
            width: `${pct(0) - pct(MIN)}%`,
            background: "#B5722A",
            opacity: 0.45,
          }}
        />
        <div
          className="absolute h-px"
          style={{
            left: `${pct(0)}%`,
            width: `${pct(MAX) - pct(0)}%`,
            background: "#9FC3DE",
            opacity: 0.6,
          }}
        />

        {STOPS.map((s) => (
          <button
            key={s.label}
            onClick={() => onChange(s.hours)}
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2.5 h-2.5 flex items-center justify-center"
            style={{ left: `${pct(s.hours)}%` }}
            aria-label={s.label}
            title={s.label}
          >
            <span className="w-px h-2 bg-inkFaint" />
          </button>
        ))}

        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2 h-2 rotate-45 pointer-events-none"
          style={{ left: `${pct(hours)}%`, background: GROUP_COLOR[activeGroup] }}
        />
      </div>
    </div>
  );
}
