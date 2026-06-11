/* * */

import { RawApexTransactionRefundV30Schema } from '@/raw/on-board-refunds/refund-v3-0.js';
import { z } from 'zod';

/* * */

export const RawApexOnBoardRefundSchema = z.discriminatedUnion('version', [
	RawApexTransactionRefundV30Schema,
]);

/**
 * Represents an APEX On-Board Refund entity, which is the PCGI wrapper
 * for the decoded on-board refund payload. The structure of `decodeValue`
 * is stored as a string and varies based on the version of the enclosed APEX transaction.
 */
export type RawApexOnBoardRefund = z.infer<typeof RawApexOnBoardRefundSchema>;
