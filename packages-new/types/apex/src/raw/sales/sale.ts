/* * */

import { RawApexTransactionSaleV30Schema } from '@/raw/sales/sale-v30.js';
import { z } from 'zod';

/* * */

export const RawApexTransactionSaleSchema = z.discriminatedUnion('version', [
	RawApexTransactionSaleV30Schema,
]);

/**
 * Represents an APEX sale entity, which is a transaction
 * that contains sale data. The structure of the sale data
 * varies based on the version of the transaction.
 */
export type RawApexTransactionSale = z.infer<typeof RawApexTransactionSaleSchema>;
