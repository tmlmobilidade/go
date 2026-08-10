/* * */

import { RawApexTransactionRefundV30Schema } from '@/raw/refunds/refund-v30.js';
import { z } from 'zod';

/* * */

export const RawApexTransactionRefundSchema = z.discriminatedUnion('version', [
	RawApexTransactionRefundV30Schema,
]);

/**
 * Represents an APEX refund entity, which is a transaction
 * that contains refund data. The structure of the refund data
 * varies based on the version of the transaction.
 */
export type RawApexTransactionRefund = z.infer<typeof RawApexTransactionRefundSchema>;
