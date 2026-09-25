"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import maplibregl, { Map as MLMap } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import type {
  InvestigationData,
  LayerVisibility,
  Selection,
} from "@/lib/types";

interface InvestigationMapProps {
  data: InvestigationData;
  layers: LayerVisibility;
  selection: Selection;
  onSelect: (selection: Selection) => void;
  timelineHours: number; // -12 .. +24, drives which drift state is emphasized
}

export interface InvestigationMapHandle {
  zoomIn: () => void;
  zoomOut: () => void;
  resetView: () => void;
}

// No-key OpenStreetMap raster basemap.
// Satellite imagery remains available through the existing Esri layer.
const BASE_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    "osm": {
      type: "raster",
      tiles: [
        "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
      ],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors",
    },
    "esri-imagery": {
      type: "raster",
      tiles: [
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      ],
      tileSize: 256,
      attribution: "Esri, Maxar, Earthstar Geographics",
    },
  },
  layers: [
    {
      id: "osm-layer",
      type: "raster",
      source: "osm",
      paint: { "raster-opacity": 1 },
    },
    {
      id: "esri-imagery-layer",
      type: "raster",
      source: "esri-imagery",
      layout: { visibility: "none" },
      paint: { "raster-opacity": 0.85, "raster-saturation": -0.15 },
    },
  ],
};

function lineStringFromPositions(positions: [number, number][]): GeoJSON.Feature {
  return {
    type: "Feature",
    properties: {},
    geometry: { type: "LineString", coordinates: positions },
  };
}

const InvestigationMap = forwardRef<InvestigationMapHandle, InvestigationMapProps>(function InvestigationMap(
  { data, layers, selection, onSelect, timelineHours },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MLMap | null>(null);
  const loadedRef = useRef(false);

  useImperativeHandle(ref, () => ({
    zoomIn: () => mapRef.current?.zoomIn({ duration: 200 }),
    zoomOut: () => mapRef.current?.zoomOut({ duration: 200 }),
    resetView: () =>
      mapRef.current?.flyTo({ center: data.incident.center, zoom: 9.4, duration: 600 }),
  }));

  // Initialize map once.
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: BASE_STYLE,
      center: data.incident.center,
      zoom: 9.4,
      attributionControl: false,
    });

    map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");

    map.on("load", () => {
      buildSources(map, data);
      buildLayers(map);
      loadedRef.current = true;
      applyLayerVisibility(map, layers);
      applyTimeline(map, data, timelineHours);
      applySelection(map, data, selection);

      map.on("click", "slick-fill", () => onSelect({ kind: "slick" }));
      map.on("click", "origin-fill", () => onSelect({ kind: "origin" }));
      map.on("click", "vessel-points", (e) => {
        const f = e.features?.[0];
        const mmsi = f?.properties?.mmsi as string | undefined;
        if (mmsi) onSelect({ kind: "vessel", mmsi });
      });

      ["slick-fill", "origin-fill", "vessel-points"].forEach((id) => {
        map.on("mouseenter", id, () => (map.getCanvas().style.cursor = "pointer"));
        map.on("mouseleave", id, () => (map.getCanvas().style.cursor = ""));
      });
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      loadedRef.current = false;
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !loadedRef.current) return;
    applyLayerVisibility(map, layers);
  }, [layers]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !loadedRef.current) return;
    applyTimeline(map, data, timelineHours);
  }, [timelineHours, data]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !loadedRef.current) return;
    applySelection(map, data, selection);
  }, [selection, data]);

  return (
    <div className="absolute inset-0">
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
});

export default InvestigationMap;

// ---------------------------------------------------------------------------
// Source / layer construction
// ---------------------------------------------------------------------------

function buildSources(map: MLMap, data: InvestigationData) {
  map.addSource("slick", {
    type: "geojson",
    data: { type: "Feature", properties: {}, geometry: data.detection.polygon },
  });

  if (data.detection.originPolygon) {
    map.addSource("origin", {
      type: "geojson",
      data: { type: "Feature", properties: {}, geometry: data.detection.originPolygon },
    });
  }

  const forecastPoints = data.drift.points.filter((p) => p.kind === "forecast");
  const backwardPoints = data.drift.points.filter((p) => p.kind === "backward");
  const observed = data.drift.points.find((p) => p.kind === "observed");

  map.addSource("drift-forecast-line", {
    type: "geojson",
    data: lineStringFromPositions([
      ...(observed ? [observed.position] : []),
      ...forecastPoints.map((p) => p.position),
    ]),
  });

  map.addSource("drift-backward-line", {
    type: "geojson",
    data: lineStringFromPositions([
      ...backwardPoints.map((p) => p.position),
      ...(observed ? [observed.position] : []),
    ]),
  });

  const lastForecast = forecastPoints[forecastPoints.length - 1];
  if (lastForecast) {
    // Approximate forecast "region" as a soft buffer circle around the
    // furthest forecast point — replace with real polygon from drift_demo.json.
    map.addSource("forecast-region", {
      type: "geojson",
      data: circlePolygon(lastForecast.position, 3.2),
    });
  }

  map.addSource("vessel-tracks", {
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features: data.vesselTracks.map((v) => ({
        type: "Feature",
        properties: { mmsi: v.mmsi, name: v.name },
        geometry: {
          type: "LineString",
          coordinates: v.track.map((p) => p.position),
        },
      })),
    },
  });

  map.addSource("vessel-points", {
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features: data.vesselTracks.map((v) => {
        const last = v.track[v.track.length - 1];
        return {
          type: "Feature",
          properties: { mmsi: v.mmsi, name: v.name, vesselType: v.vesselType },
          geometry: { type: "Point", coordinates: last.position },
        };
      }),
    },
  });
}

function buildLayers(map: MLMap) {
  // Forecast region (pale translucent blue)
  if (map.getSource("forecast-region")) {
    map.addLayer({
      id: "forecast-fill",
      type: "fill",
      source: "forecast-region",
      paint: { "fill-color": "#9FC3DE", "fill-opacity": 0.22 },
    });

    map.addLayer({
      id: "forecast-outline",
      type: "line",
      source: "forecast-region",
      paint: { "line-color": "#9FC3DE", "line-width": 1.2, "line-dasharray": [2, 2] },
    });
  }

  map.addLayer({
    id: "drift-forecast-line",
    type: "line",
    source: "drift-forecast-line",
    paint: {
      "line-color": "#9FC3DE",
      "line-width": 1.6,
      "line-dasharray": [1, 1.6],
    },
  });

  map.addLayer({
    id: "drift-backward-line",
    type: "line",
    source: "drift-backward-line",
    paint: {
      "line-color": "#B5722A",
      "line-width": 1.6,
      "line-dasharray": [2.5, 1.5],
    },
  });

  // Probable origin (amber, dashed)
  if (map.getSource("origin")) {
    map.addLayer({
      id: "origin-fill",
      type: "fill",
      source: "origin",
      paint: { "fill-color": "#B5722A", "fill-opacity": 0.14 },
    });

    map.addLayer({
      id: "origin-outline",
      type: "line",
      source: "origin",
      paint: { "line-color": "#B5722A", "line-width": 1.4, "line-dasharray": [2, 1.4] },
    });
  }

  // Observed slick (marine blue, solid — the anchor state)
  map.addLayer({
    id: "slick-fill",
    type: "fill",
    source: "slick",
    paint: { "fill-color": "#2B5D8C", "fill-opacity": 0.32 },
  });

  map.addLayer({
    id: "slick-outline",
    type: "line",
    source: "slick",
    paint: { "line-color": "#2B5D8C", "line-width": 1.6 },
  });

  // AIS vessel tracks (grey, dim by default)
  map.addLayer({
    id: "vessel-tracks",
    type: "line",
    source: "vessel-tracks",
    paint: {
      "line-color": "#9B9C94",
      "line-width": 1,
      "line-opacity": 0.55,
    },
  });

  map.addLayer({
    id: "vessel-points",
    type: "circle",
    source: "vessel-points",
    paint: {
      "circle-radius": 2.5,
      "circle-color": "#9B9C94",
      "circle-stroke-width": 1,
      "circle-stroke-color": "#F7F6F2",
    },
  });
}

// ---------------------------------------------------------------------------
// Dynamic layer state
// ---------------------------------------------------------------------------

function setVis(map: MLMap, id: string, visible: boolean) {
  if (!map.getLayer(id)) return;
  map.setLayoutProperty(id, "visibility", visible ? "visible" : "none");
}

function applyLayerVisibility(map: MLMap, layers: LayerVisibility) {
  setVis(map, "esri-imagery-layer", layers.satellite);
  setVis(map, "slick-fill", layers.slick);
  setVis(map, "slick-outline", layers.slick);
  setVis(map, "origin-fill", layers.origin);
  setVis(map, "origin-outline", layers.origin);
  setVis(map, "forecast-fill", layers.forecast);
  setVis(map, "forecast-outline", layers.forecast);
  setVis(map, "drift-forecast-line", layers.forecast);
  setVis(map, "drift-backward-line", layers.origin);
  setVis(map, "vessel-tracks", layers.ais);
  setVis(map, "vessel-points", layers.ais);
}

function applyTimeline(map: MLMap, data: InvestigationData, hours: number) {
  // Emphasize the layer set matching the scrubbed time window.
  const showingBackward = hours < -0.5;
  const showingForecast = hours > 0.5;

  if (map.getLayer("origin-fill")) {
    map.setPaintProperty("origin-fill", "fill-opacity", showingBackward ? 0.24 : 0.08);
  }

  if (map.getLayer("slick-fill")) {
    map.setPaintProperty(
      "slick-fill",
      "fill-opacity",
      showingBackward || showingForecast ? 0.14 : 0.32
    );
  }

  if (map.getLayer("forecast-fill")) {
    map.setPaintProperty("forecast-fill", "fill-opacity", showingForecast ? 0.28 : 0.09);
  }
}

function applySelection(map: MLMap, data: InvestigationData, selection: Selection) {
  if (selection.kind === "vessel" && selection.mmsi) {
    map.setPaintProperty("vessel-tracks", "line-color", [
      "case",
      ["==", ["get", "mmsi"], selection.mmsi],
      "#2B5D8C",
      "#9B9C94",
    ] as any);

    map.setPaintProperty("vessel-tracks", "line-width", [
      "case",
      ["==", ["get", "mmsi"], selection.mmsi],
      2.6,
      1.1,
    ] as any);

    map.setPaintProperty("vessel-tracks", "line-opacity", [
      "case",
      ["==", ["get", "mmsi"], selection.mmsi],
      1,
      0.28,
    ] as any);

    map.setPaintProperty("vessel-points", "circle-color", [
      "case",
      ["==", ["get", "mmsi"], selection.mmsi],
      "#2B5D8C",
      "#9B9C94",
    ] as any);

    map.setPaintProperty("vessel-points", "circle-opacity", [
      "case",
      ["==", ["get", "mmsi"], selection.mmsi],
      1,
      0.35,
    ] as any);

    const vessel = data.vesselTracks.find((v) => v.mmsi === selection.mmsi);
    if (vessel) {
      const coords = vessel.track.map((p) => p.position);
      const bounds = coords.reduce(
        (b, c) => b.extend(c as [number, number]),
        new maplibregl.LngLatBounds(coords[0], coords[0])
      );
      map.fitBounds(bounds, { padding: 140, duration: 700, maxZoom: 12 });
    }
  } else {
    map.setPaintProperty("vessel-tracks", "line-color", "#9B9C94");
    map.setPaintProperty("vessel-tracks", "line-width", 1);
    map.setPaintProperty("vessel-tracks", "line-opacity", 0.55);
    map.setPaintProperty("vessel-points", "circle-color", "#9B9C94");
    map.setPaintProperty("vessel-points", "circle-opacity", 1);
  }

  if (selection.kind === "slick") {
    map.fitBounds(polygonBounds(data.detection.polygon), { padding: 160, duration: 700 });
  }

  if (selection.kind === "origin" && data.detection.originPolygon) {
    map.fitBounds(polygonBounds(data.detection.originPolygon), { padding: 160, duration: 700 });
  }
}

// ---------------------------------------------------------------------------
// Geometry helpers
// ---------------------------------------------------------------------------

function circlePolygon(center: [number, number], radiusKm: number): GeoJSON.Feature {
  const points = 48;
  const coords: [number, number][] = [];
  const distanceX = radiusKm / (111.32 * Math.cos((center[1] * Math.PI) / 180));
  const distanceY = radiusKm / 110.57;

  for (let i = 0; i < points; i++) {
    const theta = (i / points) * (2 * Math.PI);
    coords.push([
      center[0] + distanceX * Math.cos(theta),
      center[1] + distanceY * Math.sin(theta),
    ]);
  }

  coords.push(coords[0]);

  return {
    type: "Feature",
    properties: {},
    geometry: { type: "Polygon", coordinates: [coords] },
  };
}

function polygonBounds(
  geom: GeoJSON.Polygon | GeoJSON.MultiPolygon
): maplibregl.LngLatBounds {
  const rings = geom.type === "Polygon" ? geom.coordinates : geom.coordinates.flat();
  const bounds = new maplibregl.LngLatBounds();
  rings.forEach((ring) => ring.forEach((c) => bounds.extend(c as [number, number])));
  return bounds;
}
