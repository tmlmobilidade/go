/* * */

import { RawApexTransactionInspectionDecisionV20Schema } from '@/raw/inspection-decisions/inspection-decision-v20.js';
import { z } from 'zod';

/* * */

export const RawApexTransactionInspectionDecisionSchema = z.discriminatedUnion('version', [
	RawApexTransactionInspectionDecisionV20Schema,
]);

/**
 * Represents an APEX inspection decision entity, which is a transaction
 * that contains inspection decision data. The structure of the inspection decision data
 * varies based on the version of the transaction.
 */
export type RawApexTransactionInspectionDecision = z.infer<typeof RawApexTransactionInspectionDecisionSchema>;
