import type { GtfsValidationSummary } from '@tmlmobilidade/types';

/* * */
export interface GtfsValidationResult {
	/** Arguments passed to the validator */
	args: string[]
	/** Execution time in milliseconds */
	executionTime: number
	/** Raw stderr from the validator */
	stderr: string
	/** Raw stdout from the validator */
	stdout: string
	/** Parsed validation summary */
	summary: GtfsValidationSummary
}
