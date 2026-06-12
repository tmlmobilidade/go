/* * */

import { Dates } from '@tmlmobilidade/dates';
import { type PcgiTransactionEntity } from '@tmlmobilidade/go-types-apex';
import { type RawApexTransaction, type RawApexTransactionValidationV50, RawApexTransactionValidationV50PayloadSchema, RawApexTransactionValidationV50Schema } from '@tmlmobilidade/go-types-apex';

/* * */

export function parsePcgiTransactionEntityIntoRawApexTransactionValidationV50(pcgiTransactionEntity: PcgiTransactionEntity, decodedTransaction: RawApexTransaction['payload']): RawApexTransactionValidationV50 {
	//

	//
	// Validate the document structure and content

	const result: RawApexTransactionValidationV50 = {
		_id: pcgiTransactionEntity.transactionId,
		agency_id: decodedTransaction.operatorInfo.operatorLongID,
		created_at: Dates.fromISO(decodedTransaction.transactionInfo.transactionDate).unix_timestamp,
		is_ok: pcgiTransactionEntity.isOK,
		payload: RawApexTransactionValidationV50PayloadSchema.parse(decodedTransaction),
		received_at: Dates.fromJSDate(pcgiTransactionEntity.createdAt).unix_timestamp,
		version: 'apex-validation-5.0',
	};

	return RawApexTransactionValidationV50Schema.parse(result);
}
