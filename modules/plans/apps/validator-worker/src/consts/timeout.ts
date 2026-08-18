/** Grace period between asking the validator to stop and forcibly killing it. */
export const FORCE_KILL_DELAY_MS = 60_000;

/* * */

/** Maximum time allowed for one validator process. */
export const GTFS_VALIDATION_TIMEOUT_MS = 60 * 60 * 1000;

/**
 * A processing record is retryable only after the validator timeout and its
 * forced-shutdown grace period have both elapsed.
 */
export const PROCESSING_STALE_AFTER_MS = GTFS_VALIDATION_TIMEOUT_MS + 5 * 60 * 1000;
