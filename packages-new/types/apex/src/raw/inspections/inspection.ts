/* * */

import { RawApexTransactionInspectionV20Schema } from '@/raw/inspections/inspection-v20.js';
import { z } from 'zod';

/* * */

export const RawApexTransactionInspectionSchema = z.discriminatedUnion('version', [
	RawApexTransactionInspectionV20Schema,
]);

/**
 * Represents an APEX inspection entity, which is a transaction
 * that contains inspection data. The structure of the inspection data
 * varies based on the version of the transaction.
 */
export type RawApexTransactionInspection = z.infer<typeof RawApexTransactionInspectionSchema>;
