/* * */

import { RawApexTransactionBankingTapV40Schema } from '@/raw/banking-taps/banking-tap-v40.js';
import { z } from 'zod';

/* * */

export const RawApexTransactionBankingTapSchema = z.discriminatedUnion('version', [
	RawApexTransactionBankingTapV40Schema,
]);

/**
 * Represents an APEX banking tap entity, which is a transaction
 * that contains banking tap data. The structure of the banking tap data
 * varies based on the version of the transaction.
 */
export type RawApexTransactionBankingTap = z.infer<typeof RawApexTransactionBankingTapSchema>;
