/* * */

import { z } from 'zod';

/* * */

export const ApexTransactionEntitySchema = z.object({
	_id: z.string(),
	createdAt: z.string(),
	decodeValue: z.string(),
	isOK: z.boolean(),
});

/**
 * Represents an APEX transaction entity, which is the PCGI wrapper
 * for the decoded transaction payload. The structure of `decodeValue`
 * is stored as a string and varies based on the type and version
 * of the enclosed APEX transaction.
 */
export type ApexTransactionEntity = z.infer<typeof ApexTransactionEntitySchema>;
