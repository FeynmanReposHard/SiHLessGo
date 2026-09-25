"use client";

import { Plus, Minus, Compass } from "lucide-react";

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}

export default function MapControls({ onZoomIn, onZoomOut, onReset }: MapControlsProps) {
  return (
    <div className="pointer-events-auto flex flex-col items-center gap-1.5">
      <div className="flex flex-col bg-surfaceRaised rounded shadow-control overflow-hidden w-7">
        <button
          onClick={onZoomIn}
          className="h-7 flex items-center justify-center text-inkMuted hover:text-ink hover:bg-surface transition-colors"
          aria-label="Zoom in"
        >
          <Plus size={13} strokeWidth={1.8} />
        </button>
        <div className="h-px bg-line mx-1.5" />
        <button
          onClick={onZoomOut}
          className="h-7 flex items-center justify-center text-inkMuted hover:text-ink hover:bg-surface transition-colors"
          aria-label="Zoom out"
        >
          <Minus size={13} strokeWidth={1.8} />
        </button>
      </div>
      <button
        onClick={onReset}
        className="w-7 h-7 flex items-center justify-center bg-surfaceRaised rounded shadow-control text-inkMuted hover:text-ink transition-colors"
        aria-label="Reset view"
      >
        <Compass size={13} strokeWidth={1.8} />
      </button>
    </div>
  );
}
