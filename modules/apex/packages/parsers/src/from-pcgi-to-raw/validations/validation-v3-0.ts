/* * */

import { Dates } from '@tmlmobilidade/dates';
import { type PcgiTransactionEntity } from '@tmlmobilidade/go-types-apex';
import { type RawApexTransaction, type RawApexTransactionValidationV30, RawApexTransactionValidationV30PayloadSchema, RawApexTransactionValidationV30Schema } from '@tmlmobilidade/go-types-apex';

/* * */

export function parsePcgiTransactionEntityIntoRawApexTransactionValidationV30(pcgiTransactionEntity: PcgiTransactionEntity, decodedTransaction: RawApexTransaction['payload']): RawApexTransactionValidationV30 {
	//

	//
	// Validate the document structure and content

	const payload = RawApexTransactionValidationV30PayloadSchema.safeParse(decodedTransaction);

	if (!payload.success) {
		console.log(payload.error.errors);
		console.log(decodedTransaction);
		process.exit();
	}

	const result: RawApexTransactionValidationV30 = {
		_id: pcgiTransactionEntity.transactionId,
		agency_id: decodedTransaction.operatorInfo.operatorLongID,
		created_at: Dates.fromISO(decodedTransaction.transactionInfo.transactionDate).unix_timestamp,
		is_ok: pcgiTransactionEntity.isOK,
		payload: RawApexTransactionValidationV30PayloadSchema.parse(decodedTransaction),
		received_at: Dates.fromJSDate(pcgiTransactionEntity.createdAt).unix_timestamp,
		transaction_id: pcgiTransactionEntity.transactionId,
		version: 'apex-validation-3.0',
	};

	const validated = RawApexTransactionValidationV30Schema.safeParse(result);

	if (!validated.success) {
		console.log(validated.error.errors);
		console.log(decodedTransaction);
		process.exit();
	}

	return validated.data;
}
