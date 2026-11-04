/* * */

import { z } from 'zod';

import { RawApexTransactionBankingTapV40Schema } from './banking-tap-v40.js';
import { RawApexTransactionBankingTapV70Schema } from './banking-tap-v70.js';

/* * */

export const RawApexTransactionBankingTapSchema = z.discriminatedUnion('version', [
	RawApexTransactionBankingTapV40Schema,
	RawApexTransactionBankingTapV70Schema,
]);

/**
 * Represents an APEX banking tap entity, which is a transaction
 * that contains banking tap data. The structure of the banking tap data
 * varies based on the version of the transaction.
 */
export type RawApexTransactionBankingTap = z.infer<typeof RawApexTransactionBankingTapSchema>;
