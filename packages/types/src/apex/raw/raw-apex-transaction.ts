/* * */

import { z } from 'zod';

/* * */

export const RawApexTransactionSchema = z.discriminatedUnion('version', [
	// RawVehicleEventCapV1Schema,
	// RawVehicleEventCcflV1Schema,
	// RawVehicleEventCmetV1Schema,
	// RawVehicleEventTtslV1Schema,
]);

/**
 * Represents an APEX transaction entity, which is the PCGI wrapper
 * for the decoded transaction payload. The structure of `decodeValue`
 * is stored as a string and varies based on the type and version
 * of the enclosed APEX transaction.
 */
export type RawApexTransaction = z.infer<typeof RawApexTransactionSchema>;
