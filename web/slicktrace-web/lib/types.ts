// SlickTrace core domain types.
// These are shaped to map directly onto the real backend outputs:
//   investigation_v2.json        -> Incident + Detection
//   drift_demo.json              -> DriftForecast (backward + forward points)
//   source_associations_v2.json  -> SourceAssociation[]
//   vessel_tracks.geojson        -> VesselTrack[] (as GeoJSON FeatureCollection)
//   slick_polygons.geojson       -> Detection.polygon / Detection.originPolygon

export type LngLat = [number, number];

// ---------------------------------------------------------------------------
// Incident / Detection
// ---------------------------------------------------------------------------

export interface Incident {
  id: string;
  name: string; // e.g. "Gulf of Mexico"
  region: string;
  center: LngLat;
  acquiredAt: string; // ISO timestamp of satellite acquisition
  sensor: "Sentinel-1";
  mode: "IW" | "EW" | "SM";
  processing: "GRD" | "SLC";
  status: "investigation-ready" | "under-review" | "closed";
  detectionId: string;
}

export interface Detection {
  id: string;
  incidentId: string;
  polygon: GeoJSON.Polygon | GeoJSON.MultiPolygon; // observed slick, current
  areaKm2: number;
  confidence: number; // 0-1
  sarThumbnailUrl: string;
  probabilityRasterUrl?: string;
  segmentationRasterUrl?: string;
  originWindow: {
    start: string; // ISO
    end: string; // ISO
  };
  originPolygon?: GeoJSON.Polygon | GeoJSON.MultiPolygon; // probable origin area
  polarization: string; // e.g. "VV+VH"
  sceneId: string; // Sentinel-1 scene identifier
  processingStatus: "Processed" | "Processing" | "Queued";
  modelVersion: string; // segmentation / detection model version
}

// ---------------------------------------------------------------------------
// Drift
// ---------------------------------------------------------------------------

export interface DriftPoint {
  timestamp: string; // ISO
  position: LngLat;
  hoursFromAcquisition: number; // negative = backward (origin), 0 = acquisition, positive = forecast
  polygon?: GeoJSON.Polygon | GeoJSON.MultiPolygon;
  kind: "backward" | "observed" | "forecast";
}

export interface DriftForecast {
  incidentId: string;
  points: DriftPoint[]; // ordered by hoursFromAcquisition ascending
}

// ---------------------------------------------------------------------------
// Vessels / AIS
// ---------------------------------------------------------------------------

export interface AisPing {
  timestamp: string; // ISO
  position: LngLat;
  speedKn?: number;
  headingDeg?: number;
}

export interface VesselTrack {
  mmsi: string;
  imo?: string;
  name: string;
  vesselType: string; // e.g. "Tanker", "Cargo", "Fishing"
  track: AisPing[];
  observationWindow: {
    start: string;
    end: string;
  };
  imageUrl?: string; // verified vessel photo, if one exists — never fabricated
  imageSource?: string; // attribution for imageUrl
}

// ---------------------------------------------------------------------------
// Source association (analyst-facing, never accusatory)
// ---------------------------------------------------------------------------

export interface CompatibilityScores {
  spatial: number; // 0-1
  temporal: number; // 0-1
  trajectory: number; // 0-1
  aisCoverage: number; // 0-1
}

export interface SourceAssociation {
  id: string;
  incidentId: string;
  mmsi: string;
  vesselName: string;
  vesselType: string;
  closestApproachKm: number;
  originProximityKm: number;
  scores: CompatibilityScores;
  overallCompatibility: number; // 0-1, summary only — not a verdict
  chronology: {
    timestamp: string;
    label: string;
  }[];
}

// ---------------------------------------------------------------------------
// Aggregate payload the frontend consumes
// ---------------------------------------------------------------------------

export interface InvestigationData {
  incident: Incident;
  detection: Detection;
  drift: DriftForecast;
  vesselTracks: VesselTrack[];
  sourceAssociations: SourceAssociation[];
}

// ---------------------------------------------------------------------------
// UI-only state
// ---------------------------------------------------------------------------

export type LayerId =
  | "satellite"
  | "slick"
  | "origin"
  | "forecast"
  | "ais"
  | "wind";

export interface LayerVisibility {
  satellite: boolean;
  slick: boolean;
  origin: boolean;
  forecast: boolean;
  ais: boolean;
  wind: boolean;
}

export type SelectionKind = "slick" | "vessel" | "origin" | "forecast" | null;

export interface Selection {
  kind: SelectionKind;
  mmsi?: string; // set when kind === "vessel"
}

export type TimelineStop =
  | "past"
  | "origin"
  | "observation"
  | "+6h"
  | "+12h"
  | "+24h";

// ---------------------------------------------------------------------------
// Incident case index (for the Incidents editorial listing page)
// ---------------------------------------------------------------------------

export interface IncidentIndexEntry {
  incident: Incident;
  detection: Pick<Detection, "areaKm2" | "sarThumbnailUrl">;
}
