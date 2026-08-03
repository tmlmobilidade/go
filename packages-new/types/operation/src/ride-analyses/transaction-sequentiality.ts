/* * */

import { RideAnalysisBaseSchema } from '@/ride-analyses/analysis-base.js';
import { NonNegativeNumberSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const RideAnalysisTransactionSequentialitySchema = RideAnalysisBaseSchema.extend({
	expected_transactions_qty: NonNegativeNumberSchema.nullable(),
	found_transactions_qty: NonNegativeNumberSchema.nullable(),
	missing_transactions_qty: NonNegativeNumberSchema.nullable(),
	reason: z.enum(['NO_TRANSACTIONS', 'MISSING_TRANSACTIONS', 'ALL_TRANSACTIONS_RECEIVED']).nullable(),
});

/**
 * Tests whether there are missing APEX transactions for this ride,
 * based on the signed counters from the SAMs.
 * @param expected_transactions_qty The expected number of APEX transactions.
 * @param found_transactions_qty The number of APEX transactions found.
 * @param missing_transactions_qty The number of APEX transactions missing.
 */
export type RideAnalysisTransactionSequentiality = z.infer<typeof RideAnalysisTransactionSequentialitySchema>;
