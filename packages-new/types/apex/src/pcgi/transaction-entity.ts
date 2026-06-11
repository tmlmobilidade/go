/* * */

import { z } from 'zod';

/* * */

export const PcgiTransactionEntitySchema = z.object({
	_id: z.string(),
	createdAt: z.string(),
	csvValue: z.string(),
	decodeValue: z.string(),
	fileId: z.string(),
	isOK: z.boolean(),
	transaction: z.string(),
	transactionId: z.string(),
});

export type PcgiTransactionEntity = z.infer<typeof PcgiTransactionEntitySchema>;
