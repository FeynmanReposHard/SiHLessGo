import {
  mockDetection,
  mockIncident,
  mockIncidentIndex,
  mockInvestigationData,
} from "./mock-data";

// Single integration seam for the Laptop 2 frontend.
// Today: validated replay data.
// Later: replace only this module with static pipeline outputs or API-backed loaders.
export const investigationData = mockInvestigationData;
export const detectionData = mockDetection;
export const incidentData = mockIncident;
export const incidentIndex = mockIncidentIndex;
