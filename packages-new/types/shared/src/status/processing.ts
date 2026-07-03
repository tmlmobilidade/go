/* * */

import { z } from 'zod';

/* * */

export const ProcessingStatusValues = [
	'waiting',
	'processing',
	'complete',
	'error',
	'skipped',
] as const;

export const ProcessingStatusSchema = z.enum(ProcessingStatusValues);

export type ProcessingStatus = z.infer<typeof ProcessingStatusSchema>;
