"use client";

import type { Incident } from "@/lib/types";

function formatAcquired(iso: string) {
  const d = new Date(iso);
  const date = d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const time = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" });
  return `${date} · ${time} UTC`;
}

const STATUS_LABEL: Record<Incident["status"], string> = {
  "investigation-ready": "Investigation ready",
  "under-review": "Under review",
  closed: "Closed",
};

export default function IncidentSummary({ incident }: { incident: Incident }) {
  return (
    <div className="paper pointer-events-auto bg-surfaceRaised rounded-md shadow-control px-3 py-2 w-[196px]">
      <div className="text-[12.5px] font-medium text-ink leading-tight">{incident.name}</div>
      <div className="mt-0.5 text-[11px] text-inkMuted leading-snug">
        {formatAcquired(incident.acquiredAt)} · {incident.sensor}
      </div>
      <div className="mt-1.5 flex items-center gap-1.5">
        <span className="w-1 h-1 rounded-full bg-slick" />
        <span className="text-[10.5px] text-inkMuted">{STATUS_LABEL[incident.status]}</span>
      </div>
    </div>
  );
}
