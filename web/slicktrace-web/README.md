# SlickTrace — Investigation UI

Frontend shell for the SlickTrace maritime oil-spill investigation platform.
Map-first, GIS-style interface built with Next.js 14 (App Router), TypeScript,
Tailwind CSS and MapLibre GL JS. No mock backend, no fake data fetching layer —
just typed interfaces and sample objects, structured so your real JSON /
GeoJSON files drop in with minimal changes.

## 1. Install

```bash
npm install
```

## 2. Run

```bash
npm run dev
```

Open http://localhost:3000 — it redirects to `/v2`, the main investigation
view. The detection evidence view is at `/detection`.

## 3. File structure

```
app/
  page.tsx              → redirects to /v2
  layout.tsx             → root layout, loads Inter + Source Serif 4 fonts + globals.css
  globals.css             → editorial tokens: paper-grain texture, eyebrow label, serif accent
  v2/
    page.tsx              → main investigation view (map + panels + timeline)
  incidents/
    page.tsx               → editorial case index (case registry listing)
  method/
    page.tsx                → numbered research-methodology page (01–08)
  detection/
    page.tsx               → detection evidence viewer (SAR / Probability / Segmentation)

components/v2/
  TopBar.tsx               → wordmark, routed nav (Map/Incidents/Detection/Method), search field
  InvestigationMap.tsx      → MapLibre map: all layers, selection, click handling
  MapControls.tsx           → custom zoom/reset control (bottom-right, Google Maps style)
  ImageryLayers.tsx         → "Sentinel-1 SAR ▾" signature left control — image first, then
                               editorial label-value metadata, then layer toggles + legend
  IncidentSummary.tsx       → compact incident chip (upper-left)
  TimelineScrubber.tsx      → bottom-center thin cartographic playback timeline
  InvestigationPanel.tsx    → right contextual panel shell (slide in/out)
  SlickPanel.tsx            → panel content: slick / origin selected (editorial format)
  VesselPanel.tsx           → panel content: vessel selected — photo block + label-value rows

lib/
  types.ts                 → all TypeScript interfaces (see below)
  mock-data.ts              → sample InvestigationData + incident index (Gulf of Mexico, 2018-09-26)
  format.ts                  → qualitativeLabel/coverageLabel — score → editorial language
```

## 4. Where your real data plugs in

Everything the UI reads comes from a single `InvestigationData` object
(`lib/types.ts`). Today that object is `mockInvestigationData` in
`lib/mock-data.ts`. To connect your real files:

| Your file                     | Maps to                                  |
|--------------------------------|-------------------------------------------|
| `investigation_v2.json`        | `Incident` + `Detection` (minus polygons) |
| `slick_polygons.geojson`       | `Detection.polygon`, `Detection.originPolygon` |
| `drift_demo.json`              | `DriftForecast.points` (backward + forecast) |
| `vessel_tracks.geojson`        | `VesselTrack[]`                            |
| `source_associations_v2.json`  | `SourceAssociation[]`                      |

`Detection` also carries `polarization`, `sceneId`, `processingStatus`, and
`modelVersion` for the editorial Sentinel-1 inspector and the Detection page's
metadata strip — populate these from your scene metadata. `VesselTrack` has
optional `imo`, `imageUrl`, and `imageSource` fields for the vessel-photo
block in `VesselPanel.tsx`; leave them unset until you have a verified image
looked up by IMO/MMSI/name — the panel renders a clean silhouette placeholder
when no image is present, and never fabricates one.

The `/incidents` case index reads a lighter `IncidentIndexEntry[]` list
(`mockIncidentIndex` in `lib/mock-data.ts`) — swap that for your real listing
endpoint; it only needs enough per-row data to render the registry, not full
`InvestigationData`. Each row currently opens `/v2`; once you have per-case
routing, point it at `/v2/[incidentId]` instead.

Replace the import in `app/v2/page.tsx`:

```tsx
// before
import { mockInvestigationData } from "@/lib/mock-data";
const data = mockInvestigationData;

// after — e.g. loading from your own API route or static JSON
const data = await loadInvestigationData(incidentId);
```

`app/detection/page.tsx` currently reads `mockDetection` / `mockIncident`
directly for its header and confidence readout — swap those imports the same
way once evidence rasters (SAR / probability / segmentation) are served from
your backend. The evidence viewer's `EvidenceRaster` component has inline
placeholder SVGs; replace them with `<img src={detection.sarThumbnailUrl} />`
etc., or a small MapLibre instance if you want pan/zoom over georeferenced
rasters instead of a plain image viewer.

The forecast "region" polygon around the furthest drift point
(`InvestigationMap.tsx`, `circlePolygon`) is a placeholder buffer — once
`drift_demo.json` includes a real forecast polygon per timestep, source it
directly instead of approximating a circle.

## 5. Basemap

The base style (`BASE_STYLE` in `InvestigationMap.tsx`) uses CARTO's free
dark basemap for the "calm GIS" look, with an Esri World Imagery raster layer
wired to the **Satellite imagery** layer toggle. Both are keyless demo tile
sources — swap in your own MapTiler/Mapbox style and token for production use
(update the `tiles` URLs and add `?key=...` as needed).

## 6. Notes on state

- Layer visibility, current selection, and timeline position are local
  `useState` in `app/v2/page.tsx` — lift into a store (Zustand/URL state) if
  you want selections to be shareable via link or persisted across routes.
- `InvestigationMap` is intentionally the only component that touches
  MapLibre directly; every other component is presentational and driven by
  props, so they're easy to test or restyle independently of the map.
