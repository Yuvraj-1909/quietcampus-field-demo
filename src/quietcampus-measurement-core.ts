/**
 * Minimal PCM Leq core for QuietCampus integration.
 *
 * Input must be normalized Float32 PCM after the caller's A-weighting stage
 * before `addWeightedBlock` is used. Without an externally evaluated profile,
 * this module exposes dBFS only; it never labels raw phone amplitude as dB(A).
 * This is a measurement core, not an IEC 61672-compliant meter implementation.
 */

export interface CalibrationProfile {
  /** Exact phone model and audio input path this profile applies to. */
  deviceKey: string;
  /** dB(A) = weighted dBFS + offset, derived from paired reference evidence. */
  offsetDb: number;
  /** Reference run / report identifier for auditability. */
  evidenceId: string;
  /** Must be explicitly evaluated outside this module before enabling dB(A). */
  status: "evaluated";
  /** Caller must only set true when a validated A-weighting stage was applied. */
  aWeightingValidated: true;
}

export interface LeqReading {
  durationSeconds: number;
  sampleCount: number;
  /** Equivalent continuous level relative to PCM full scale. */
  dbfs: number;
  /** Present only with a matching, evaluated calibration profile. */
  dbA?: number;
  calibrationEvidenceId?: string;
}

const MIN_DURATION_SECONDS = 0.25;
const SILENCE_FLOOR_DBFS = -120;

function levelFromMeanSquare(meanSquare: number): number {
  if (!Number.isFinite(meanSquare) || meanSquare <= 0) return SILENCE_FLOOR_DBFS;
  return Math.max(SILENCE_FLOOR_DBFS, 10 * Math.log10(meanSquare));
}

/** Accumulates energy (not arithmetic dB averages) for an Leq interval. */
export class LeqAccumulator {
  private energySum = 0;
  private sampleCount = 0;

  constructor(
    private readonly sampleRateHz: number,
    private readonly deviceKey: string,
    private readonly profile?: CalibrationProfile,
  ) {
    if (!Number.isFinite(sampleRateHz) || sampleRateHz <= 0) {
      throw new RangeError("sampleRateHz must be positive");
    }
    if (profile && profile.deviceKey !== deviceKey) {
      throw new Error("Calibration profile does not match the active device/audio path");
    }
    if (profile && (!profile.evidenceId.trim() || !Number.isFinite(profile.offsetDb))) {
      throw new Error("Calibration profile must include finite offset and evidence ID");
    }
  }

  /**
   * Add a block of normalized PCM after A-weighting. Supplying this method's
   * input unweighted is a caller error; the core cannot infer weighting from PCM.
   */
  addWeightedBlock(samples: Float32Array): void {
    if (samples.length === 0) return;
    let blockEnergy = 0;
    for (const sample of samples) {
      if (!Number.isFinite(sample) || Math.abs(sample) > 1) {
        throw new RangeError("PCM samples must be finite and normalized to [-1, 1]");
      }
      blockEnergy += sample * sample;
    }
    this.energySum += blockEnergy;
    this.sampleCount += samples.length;
  }

  snapshot(): LeqReading {
    if (this.sampleCount === 0) throw new Error("No PCM samples have been collected");
    const durationSeconds = this.sampleCount / this.sampleRateHz;
    if (durationSeconds < MIN_DURATION_SECONDS) {
      throw new Error(`At least ${MIN_DURATION_SECONDS}s of audio is required`);
    }

    const dbfs = levelFromMeanSquare(this.energySum / this.sampleCount);
    const calibrated = this.profile?.status === "evaluated" && this.profile.aWeightingValidated;
    return {
      durationSeconds,
      sampleCount: this.sampleCount,
      dbfs,
      ...(calibrated
        ? { dbA: dbfs + this.profile.offsetDb, calibrationEvidenceId: this.profile.evidenceId }
        : {}),
    };
  }

  reset(): void {
    this.energySum = 0;
    this.sampleCount = 0;
  }
}
