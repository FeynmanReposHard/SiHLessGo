# Data contract

The frontend must depend on stable output shapes rather than Python internals.

The TypeScript source of truth currently lives in `web/slicktrace-web/lib/types.ts`. `investigation.schema.json` mirrors the aggregate shape for cross-language validation.

Scientific wording rule: `overallCompatibility` is an investigation-support score, not a probability of guilt or legal attribution.
