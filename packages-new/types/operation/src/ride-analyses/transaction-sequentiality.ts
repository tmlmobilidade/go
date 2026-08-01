/* * */

import { RideAnalysisBaseSchema } from '@/ride-analyses/analysis-base.js';
import { z } from 'zod';

/* * */

export const RideAnalysisTransactionSequentialitySchema = RideAnalysisBaseSchema.extend({
	expected_qty: z.number().nullable(),
	found_qty: z.number().nullable(),
	missing_qty: z.number().nullable(),
	reason: z.enum(['NO_TRANSACTIONS', 'MISSING_TRANSACTIONS', 'ALL_TRANSACTIONS_RECEIVED']).nullable(),
});

export type RideAnalysisTransactionSequentiality = z.infer<typeof RideAnalysisTransactionSequentialitySchema>;
