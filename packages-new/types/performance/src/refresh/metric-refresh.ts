/* * */

import { OperationalDateIntSchema, UnixTimestampSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const MetricRefreshTypeSchema = z.enum(['backfill', 'incremental', 'reconciliation']);
export const MetricRefreshStatusSchema = z.enum(['failed', 'running', 'succeeded']);

/**
 * Observable state for one bounded metric refresh run.
 * All `_at` and watermark values are Unix milliseconds.
 */
export const MetricRefreshSchema = z.object({
	completed_at: UnixTimestampSchema.nullable(),
	definition_version: z.string(),
	error_message: z.string().nullable(),
	metric_name: z.string(),
	range_end: OperationalDateIntSchema,
	range_start: OperationalDateIntSchema,
	refresh_id: z.string().uuid(),
	refresh_type: MetricRefreshTypeSchema,
	result_rows_qty: z.number().int().nonnegative(),
	source_rows_qty: z.number().int().nonnegative(),
	source_watermark: UnixTimestampSchema.nullable(),
	started_at: UnixTimestampSchema,
	status: MetricRefreshStatusSchema,
	updated_at: UnixTimestampSchema,
});

export type MetricRefresh = z.infer<typeof MetricRefreshSchema>;
export type MetricRefreshStatus = z.infer<typeof MetricRefreshStatusSchema>;
export type MetricRefreshType = z.infer<typeof MetricRefreshTypeSchema>;
