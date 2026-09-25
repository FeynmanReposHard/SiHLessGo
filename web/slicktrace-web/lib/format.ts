// Converts a 0–1 compatibility score into the qualitative language the
// editorial panels use instead of raw percentages or bar charts.

export function qualitativeLabel(value: number): "High" | "Moderate" | "Low" {
  if (value >= 0.75) return "High";
  if (value >= 0.5) return "Moderate";
  return "Low";
}

export function coverageLabel(value: number): "Good" | "Fair" | "Poor" {
  if (value >= 0.75) return "Good";
  if (value >= 0.5) return "Fair";
  return "Poor";
}
