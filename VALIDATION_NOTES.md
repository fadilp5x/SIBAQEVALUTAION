# Validation notes

- TypeScript/TSX syntax transpilation check: passed (no syntax diagnostics).
- Programme catalogue check: 12 total, 10 X-category and 2 O-category programmes.
- Rubric-point check: every programme's provisional rubric maxima sum to 100.
- Full `npm run build`: not completed in this environment because project dependencies could not be installed; no browser/runtime smoke test was possible here.
- Supabase and Gemini: not connected or deployed; real inference and persistent cloud storage require the user's own project credentials and deployment steps in `README.md`.
- Scoring weights are app-defined provisional coaching weights because the source concept note does not publish numerical weights for most programme criteria. Human confirmation is required before treating a mark as final.
