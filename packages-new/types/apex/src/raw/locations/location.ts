/* * */

import { RawApexTransactionLocationV30Schema } from '@/raw/locations/location-v30.js';
import { z } from 'zod';

/* * */

export const RawApexTransactionLocationSchema = z.discriminatedUnion('version', [
	RawApexTransactionLocationV30Schema,
]);

/**
 * Represents an APEX location entity, which is a transaction
 * that contains location data. The structure of the location data
 * varies based on the version of the transaction.
 */
export type RawApexTransactionLocation = z.infer<typeof RawApexTransactionLocationSchema>;
