# SLICK TRACE

SLICK TRACE is an analyst-support system for investigating suspected marine oil slicks using Sentinel-1 SAR observations and vessel AIS trajectories.

The project does **not** treat a dark SAR region as confirmed oil, and it does **not** treat the highest-ranked vessel as proof of responsibility. Outputs are evidence for analyst review.

## Repository layout

```text
SlickTrace/
├── web/
│   └── slicktrace-web/     # Laptop 2 — Next.js investigation product
├── ml/                     # Laptop 1 — training/inference code only
├── drift/                  # Drift modelling code
├── data-contract/          # Shared JSON contract between pipeline and UI
├── outputs/                # Small JSON/GeoJSON integration artifacts only
├── .gitignore
└── README.md
```

## Branch workflow

- `main` — stable integration branch
- `ml-v2` — Laptop 1 ML work
- `web-v2` — Laptop 2 frontend/product work

Large datasets, GeoTIFFs, checkpoints and archives stay outside Git. They belong on local/Drive storage.

## Laptop 2

```bash
cd web/slicktrace-web
npm install
npm run dev
```

The web app currently runs as a validated investigation replay. The editorial UI is intentionally preserved while its data source is being separated from the view layer so it can later consume the final pipeline outputs.
