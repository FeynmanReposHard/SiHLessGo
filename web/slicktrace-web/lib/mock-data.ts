import type {
  Incident,
  Detection,
  DriftForecast,
  VesselTrack,
  SourceAssociation,
  InvestigationData,
  IncidentIndexEntry,
} from "./types";

// Gulf of Mexico, off the Louisiana coast — sample coordinates only.
const CENTER: [number, number] = [-90.42, 28.61];

export const mockIncident: Incident = {
  id: "inc_2018_09_26_gom",
  name: "Gulf of Mexico",
  region: "Gulf of Mexico, offshore Louisiana",
  center: CENTER,
  acquiredAt: "2018-09-26T00:01:00Z",
  sensor: "Sentinel-1",
  mode: "IW",
  processing: "GRD",
  status: "investigation-ready",
  detectionId: "det_2018_09_26_gom",
};

export const mockDetection: Detection = {
  id: "det_2018_09_26_gom",
  incidentId: "inc_2018_09_26_gom",
  areaKm2: 34.1,
  confidence: 0.81,
  sarThumbnailUrl: "/sar-thumb.png",
  originWindow: {
    start: "2018-09-25T23:10:00Z",
    end: "2018-09-25T23:50:00Z",
  },
  polarization: "VV+VH",
  sceneId: "S1A_IW_GRDH_1SDV_20180926T000122",
  processingStatus: "Processed",
  modelVersion: "slick-seg v2.3.1",
  polygon: {
    type: "Polygon",
    coordinates: [
      [
        [-90.52, 28.58],
        [-90.47, 28.63],
        [-90.4, 28.65],
        [-90.33, 28.62],
        [-90.31, 28.57],
        [-90.37, 28.53],
        [-90.46, 28.52],
        [-90.52, 28.58],
      ],
    ],
  },
  originPolygon: {
    type: "Polygon",
    coordinates: [
      [
        [-90.61, 28.5],
        [-90.57, 28.53],
        [-90.55, 28.5],
        [-90.58, 28.46],
        [-90.62, 28.46],
        [-90.61, 28.5],
      ],
    ],
  },
};

export const mockDrift: DriftForecast = {
  incidentId: "inc_2018_09_26_gom",
  points: [
    {
      timestamp: "2018-09-25T12:01:00Z",
      position: [-90.63, 28.47],
      hoursFromAcquisition: -12,
      kind: "backward",
    },
    {
      timestamp: "2018-09-25T18:01:00Z",
      position: [-90.6, 28.49],
      hoursFromAcquisition: -6,
      kind: "backward",
    },
    {
      timestamp: "2018-09-25T23:30:00Z",
      position: [-90.58, 28.5],
      hoursFromAcquisition: -0.5,
      kind: "backward",
    },
    {
      timestamp: "2018-09-26T00:01:00Z",
      position: [-90.41, 28.59],
      hoursFromAcquisition: 0,
      kind: "observed",
    },
    {
      timestamp: "2018-09-26T06:01:00Z",
      position: [-90.31, 28.66],
      hoursFromAcquisition: 6,
      kind: "forecast",
    },
    {
      timestamp: "2018-09-26T12:01:00Z",
      position: [-90.22, 28.73],
      hoursFromAcquisition: 12,
      kind: "forecast",
    },
    {
      timestamp: "2018-09-27T00:01:00Z",
      position: [-90.05, 28.85],
      hoursFromAcquisition: 24,
      kind: "forecast",
    },
  ],
};

export const mockVesselTracks: VesselTrack[] = [
  {
    mmsi: "366123450",
    imo: "9481234",
    name: "MV KESTREL BAY",
    vesselType: "Tanker",
    observationWindow: { start: "2018-09-25T20:00:00Z", end: "2018-09-26T02:00:00Z" },
    // imageUrl intentionally omitted — no verified photo for this MMSI/IMO yet.
    // When one is looked up (by IMO, MMSI or name), set imageUrl + imageSource here.
    track: [
      { timestamp: "2018-09-25T20:00:00Z", position: [-90.68, 28.4], speedKn: 11.2, headingDeg: 42 },
      { timestamp: "2018-09-25T21:30:00Z", position: [-90.63, 28.45], speedKn: 10.8, headingDeg: 40 },
      { timestamp: "2018-09-25T23:12:00Z", position: [-90.59, 28.49], speedKn: 9.6, headingDeg: 38 },
      { timestamp: "2018-09-25T23:31:00Z", position: [-90.57, 28.51], speedKn: 9.1, headingDeg: 35 },
      { timestamp: "2018-09-26T00:01:00Z", position: [-90.53, 28.55], speedKn: 10.4, headingDeg: 33 },
      { timestamp: "2018-09-26T02:00:00Z", position: [-90.46, 28.63], speedKn: 12.0, headingDeg: 30 },
    ],
  },
  {
    mmsi: "356789120",
    name: "OSV MERIDIAN STAR",
    vesselType: "Offshore Supply",
    observationWindow: { start: "2018-09-25T19:00:00Z", end: "2018-09-26T01:00:00Z" },
    track: [
      { timestamp: "2018-09-25T19:00:00Z", position: [-90.75, 28.62], speedKn: 8.4, headingDeg: 120 },
      { timestamp: "2018-09-25T21:00:00Z", position: [-90.69, 28.58], speedKn: 8.9, headingDeg: 118 },
      { timestamp: "2018-09-25T23:20:00Z", position: [-90.62, 28.53], speedKn: 7.6, headingDeg: 112 },
      { timestamp: "2018-09-26T00:15:00Z", position: [-90.57, 28.5], speedKn: 7.1, headingDeg: 108 },
      { timestamp: "2018-09-26T01:00:00Z", position: [-90.52, 28.47], speedKn: 8.0, headingDeg: 105 },
    ],
  },
  {
    mmsi: "312456780",
    name: "MT COASTAL VOYAGER",
    vesselType: "Tanker",
    observationWindow: { start: "2018-09-25T22:00:00Z", end: "2018-09-26T03:00:00Z" },
    track: [
      { timestamp: "2018-09-25T22:00:00Z", position: [-90.3, 28.72], speedKn: 13.1, headingDeg: 250 },
      { timestamp: "2018-09-25T23:30:00Z", position: [-90.36, 28.67], speedKn: 12.6, headingDeg: 248 },
      { timestamp: "2018-09-26T00:30:00Z", position: [-90.41, 28.63], speedKn: 12.0, headingDeg: 245 },
      { timestamp: "2018-09-26T03:00:00Z", position: [-90.52, 28.55], speedKn: 11.4, headingDeg: 240 },
    ],
  },
  {
    mmsi: "241890330",
    name: "FV SILVER TIDE",
    vesselType: "Fishing",
    observationWindow: { start: "2018-09-25T18:00:00Z", end: "2018-09-26T04:00:00Z" },
    track: [
      { timestamp: "2018-09-25T18:00:00Z", position: [-90.15, 28.4], speedKn: 4.2, headingDeg: 300 },
      { timestamp: "2018-09-25T22:00:00Z", position: [-90.2, 28.44], speedKn: 3.8, headingDeg: 295 },
      { timestamp: "2018-09-26T04:00:00Z", position: [-90.25, 28.48], speedKn: 4.0, headingDeg: 290 },
    ],
  },
];

export const mockSourceAssociations: SourceAssociation[] = [
  {
    id: "assoc_kestrel",
    incidentId: "inc_2018_09_26_gom",
    mmsi: "366123450",
    vesselName: "MV KESTREL BAY",
    vesselType: "Tanker",
    closestApproachKm: 1.8,
    originProximityKm: 2.1,
    scores: { spatial: 0.86, temporal: 0.91, trajectory: 0.78, aisCoverage: 0.95 },
    overallCompatibility: 0.87,
    chronology: [
      { timestamp: "2018-09-25T23:12:00Z", label: "Entered investigation region" },
      { timestamp: "2018-09-25T23:31:00Z", label: "Closest approach" },
      { timestamp: "2018-09-26T00:01:00Z", label: "Satellite acquisition" },
    ],
  },
  {
    id: "assoc_meridian",
    incidentId: "inc_2018_09_26_gom",
    mmsi: "356789120",
    vesselName: "OSV MERIDIAN STAR",
    vesselType: "Offshore Supply",
    closestApproachKm: 4.6,
    originProximityKm: 5.3,
    scores: { spatial: 0.61, temporal: 0.74, trajectory: 0.58, aisCoverage: 0.88 },
    overallCompatibility: 0.65,
    chronology: [
      { timestamp: "2018-09-25T21:00:00Z", label: "Entered investigation region" },
      { timestamp: "2018-09-25T23:20:00Z", label: "Closest approach" },
      { timestamp: "2018-09-26T00:15:00Z", label: "Exited investigation region" },
    ],
  },
  {
    id: "assoc_coastal",
    incidentId: "inc_2018_09_26_gom",
    mmsi: "312456780",
    vesselName: "MT COASTAL VOYAGER",
    vesselType: "Tanker",
    closestApproachKm: 7.9,
    originProximityKm: 12.4,
    scores: { spatial: 0.34, temporal: 0.52, trajectory: 0.41, aisCoverage: 0.9 },
    overallCompatibility: 0.42,
    chronology: [
      { timestamp: "2018-09-25T23:30:00Z", label: "Entered investigation region" },
      { timestamp: "2018-09-26T00:30:00Z", label: "Closest approach" },
    ],
  },
];

export const mockInvestigationData: InvestigationData = {
  incident: mockIncident,
  detection: mockDetection,
  drift: mockDrift,
  vesselTracks: mockVesselTracks,
  sourceAssociations: mockSourceAssociations,
};

// ---------------------------------------------------------------------------
// Incident index — for the editorial case-registry listing (Incidents page).
// Replace with a real listing endpoint; each entry is intentionally light —
// full InvestigationData for a case is only fetched once an analyst opens it.
// ---------------------------------------------------------------------------

export const mockIncidentIndex: IncidentIndexEntry[] = [
  {
    incident: mockIncident,
    detection: { areaKm2: mockDetection.areaKm2, sarThumbnailUrl: mockDetection.sarThumbnailUrl },
  },
  {
    incident: {
      id: "inc_2018_08_14_niger",
      name: "Niger Delta",
      region: "Bonny River approach, Nigeria",
      center: [7.15, 4.42],
      acquiredAt: "2018-08-14T23:41:00Z",
      sensor: "Sentinel-1",
      mode: "IW",
      processing: "GRD",
      status: "under-review",
      detectionId: "det_2018_08_14_niger",
    },
    detection: { areaKm2: 11.4, sarThumbnailUrl: "/sar-thumb.png" },
  },
  {
    incident: {
      id: "inc_2018_05_02_gom_2",
      name: "Gulf of Mexico — Mississippi Canyon",
      region: "Gulf of Mexico, offshore Louisiana",
      center: [-89.9, 28.2],
      acquiredAt: "2018-05-02T00:14:00Z",
      sensor: "Sentinel-1",
      mode: "IW",
      processing: "GRD",
      status: "closed",
      detectionId: "det_2018_05_02_gom_2",
    },
    detection: { areaKm2: 6.8, sarThumbnailUrl: "/sar-thumb.png" },
  },
];

