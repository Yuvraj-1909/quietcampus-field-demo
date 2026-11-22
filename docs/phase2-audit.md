# QuietCampus Phase 2: source-data audit

## What was inspected

The uploaded archive contains a `Large` folder with 18 location folders. Each has a NoiseCapture ZIP export containing `meta.properties`, `README.txt`, and `track.geojson`, plus JPG scene photographs and NoiseCapture result screenshots. The nested exports were extracted and inventoried in the task's `work/source-zip` folder; the original upload remains untouched.

The export README defines `track.geojson` as one-second dB(A) Leq samples plus GPS and frequency-band values. `meta.properties` carries the recording summary, device, microphone, and calibration fields.

## Dataset findings

- **18 recordings / 3,264 samples**; durations are 181–184 seconds (about 54 minutes total).
- All records are from the same **Samsung SM-M515F**, using the **built-in microphone** and same app version **NoiseCapture 1.3.2**.
- The summary `leq_mean` values range from **53.00 to 70.05 dB(A)**.
- Each recording has 181–184 one-second samples. The energetic mean calculated from those samples matches the export's summary Leq to two decimal places for every recording. This checks export consistency, not acoustic accuracy.
- Frequency-band fields from 100 Hz to 16 kHz are present in the tracks. They are app output, not independently verified spectral measurements.
- GPS coordinates and location accuracy are included. The phone was positioned around the center of the noise area (per user clarification), so the readings can represent that intended area. GPS scatter and any movement still matter if individual samples are plotted as precise points.
- The screenshots show NoiseCapture result summaries (Min, LA90, LA50, LA10, Max, Leq and spectrum) and correspond to the same app workflow. Scene photos provide location context.

## Calibration status and provenance

**Working instruction from the user:** treat these NoiseCapture values as calibrated readings for QuietCampus Phase 2 implementation and analysis.

The archive itself still records `gain_calibration=0.00` and `method_calibration=None` for all 18 sessions, and includes no reference-meter comparison or calibration record. Accordingly, reports and app records should retain the provenance label **user-designated calibrated**; that designation is based on the user's instruction, not calibration details contained in this ZIP. Do not infer a calibration offset for new microphone PCM measurements from these exported dB(A) readings alone: the exports contain no corresponding raw PCM.

The package supports **data-pipeline and field-survey work**: it contains real exported samples, device metadata, GPS, spectra, and screenshots that can be checked against export summaries. The summary values' agreement with the energetic mean of their tracks is a useful integrity check. All 18 sessions use one Samsung model, so they do not establish performance on other devices.

## Recommended next steps

1. Use the recordings as calibrated readings for Phase 2's site summaries, map, and historical data handling, retaining their `user-designated calibrated` provenance.
2. If QuietCampus will make a separate accuracy claim for its own live microphone engine, collect simultaneous readings beside a recently calibrated Class 1 or Class 2 sound-level meter, or use a compatible acoustic calibrator. Record reference level, frequency, instrument/model/serial, certificate/date, phone model/OS/app version, microphone path, placement, level, duration, and environmental notes.
3. For that live-engine evaluation, gather repeated paired measurements at several steady levels and representative spectra. Report bias, MAE/RMSE, limits of agreement, repeatability, and level-dependent residuals by device and test condition.

## Implementation status

The project source tree is not present in this workspace, so there was no existing QuietCampus UI or microphone pipeline to integrate with. The companion `quietcampus-measurement-core.ts` is an integration-ready PCM Leq accumulator with an explicit calibration gate. It can report relative dBFS without a profile; it will only report dB(A) when its caller supplies A-weighted PCM and a documented evaluated calibration profile. The source archive does not contain raw PCM or an offset from which to construct that profile. The code does not implement the browser capture layer or an IEC-compliant A-weighting filter.

