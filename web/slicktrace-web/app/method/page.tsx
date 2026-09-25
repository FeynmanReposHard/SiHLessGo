"use client";

import TopBar from "@/components/v2/TopBar";

const SECTIONS: { n: string; title: string; body: string }[] = [
  {
    n: "01",
    title: "Sentinel-1 SAR",
    body: "Investigations begin from Sentinel-1 C-band SAR acquisitions in Interferometric Wide swath, GRD product. Radar backscatter is largely unaffected by cloud cover or daylight, which makes it the primary sensor for open-water slick detection.",
  },
  {
    n: "02",
    title: "Preprocessing",
    body: "Each scene is calibrated to sigma-nought backscatter, corrected for thermal noise, and terrain-corrected against a digital elevation model before analysis. Land and known permanent features are masked from the detection area.",
  },
  {
    n: "03",
    title: "Slick segmentation",
    body: "A segmentation model identifies candidate low-backscatter regions consistent with surface films that dampen capillary waves. Each candidate carries a per-pixel probability that is thresholded to produce a binary detection mask.",
  },
  {
    n: "04",
    title: "Polygon extraction",
    body: "Detection masks are vectorized into polygons, filtered by minimum area and shape plausibility, and attributed with estimated area and a scene-level detection confidence.",
  },
  {
    n: "05",
    title: "Drift hindcast / forecast",
    body: "Surface currents and wind fields are used to hindcast the slick's likely position back to a probable origin window, and to forecast its trajectory forward from the acquisition time. Drift points are not a guarantee of position, only a probable envelope.",
  },
  {
    n: "06",
    title: "AIS reconstruction",
    body: "Vessel tracks are reconstructed from historical AIS broadcasts within the investigation region and observation window. Tracks with sparse or gapped coverage are flagged rather than discarded.",
  },
  {
    n: "07",
    title: "Source association",
    body: "Vessels are scored for spatial, temporal, and trajectory compatibility with the probable origin window, alongside the quality of their AIS coverage. These are compatibility signals for an analyst to weigh — not a determination of responsibility.",
  },
  {
    n: "08",
    title: "Analyst review",
    body: "Every automated output — detection, drift, and association — is presented for human review alongside its underlying evidence. SlickTrace surfaces evidence; it does not issue verdicts.",
  },
];

export default function MethodPage() {
  return (
    <div className="h-screen w-screen flex flex-col bg-surface overflow-hidden">
      <TopBar />
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[680px] mx-auto px-6 pt-10 pb-20">
          <div className="eyebrow text-inkFaint mb-1.5">Method</div>
          <h1 className="font-editorial text-[26px] text-ink leading-tight">
            How an investigation is built
          </h1>
          <p className="mt-2 text-[12.5px] text-inkMuted leading-relaxed max-w-[520px]">
            From satellite acquisition to a set of potential source associations, in eight
            stages. Each stage is deterministic and auditable — an analyst can trace any
            on-screen claim back to the step that produced it.
          </p>

          <div className="mt-10 flex flex-col">
            {SECTIONS.map((s, i) => (
              <div
                key={s.n}
                className={`py-6 flex gap-6 ${i > 0 ? "border-t border-line" : ""}`}
              >
                <div className="w-8 shrink-0 text-[11px] text-inkFaint tabular-nums pt-0.5">
                  {s.n}
                </div>
                <div>
                  <div className="text-[14px] font-editorial text-ink">{s.title}</div>
                  <p className="mt-1.5 text-[12px] text-inkMuted leading-relaxed max-w-[480px]">
                    {s.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
