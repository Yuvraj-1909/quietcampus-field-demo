# QuietCampus MVP prototype

This is a from-scratch, dependency-free, mobile-first web prototype guided by the supplied App Design & Workflow Brief. The historical NoiseCapture observations are embedded in `index.html`, so the included campus views work without a backend.

## Included

- Home, campus exploration, historical reading detail, session history, and learning/privacy screens.
- Eighteen source sessions with 3,264 one-second samples, grouped by the labels available in the archive.
- Energy-weighted Leq summaries, time-series plots, and a schematic GPS observation view.
- GeoJSON import, duplicate-track skipping, local CSV export, and clearing imported tracks.
- Explicit historical-data labels; the prototype requests no microphone permission and shows no simulated live values.

## Run

Open `index.html` in a modern browser. For persistent file imports, serve this folder from localhost if your browser restricts storage for local files. No package installation or account is required.

## Data and provenance

The 18 bundled sessions are marked **User-designated calibrated**, following the project owner's instruction. Original source fields are preserved per session (`gainCalibration=0.00`, `calibrationMethod=None`). New GeoJSON imports are marked **Calibration status not stated** unless their source explicitly supplies it. `Paid Mess / N Block` remains combined because the source folder combines those readings; the brief's separate points need separately labeled field data.

The location map is a schematic of recorded GPS points, not a campus basemap. Imported readings are numeric only; no audio is recorded, saved, or analyzed by this prototype. The live microphone engine is not connected.

