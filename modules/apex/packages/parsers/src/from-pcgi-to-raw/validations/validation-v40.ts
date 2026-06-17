/* * */

import { Dates } from '@tmlmobilidade/dates';
import { type PcgiTransactionEntity } from '@tmlmobilidade/go-types-apex';
import { type RawApexTransaction, type RawApexTransactionValidationV40, RawApexTransactionValidationV40PayloadSchema, RawApexTransactionValidationV40Schema } from '@tmlmobilidade/go-types-apex';

/* * */

export function parsePcgiTransactionEntityIntoRawApexTransactionValidationV40(pcgiTransactionEntity: PcgiTransactionEntity, decodedTransaction: RawApexTransaction['payload']): RawApexTransactionValidationV40 {
	//

	//
	// Prepare the date field values

	const transactionDateValue = Dates
		.fromFormat(decodedTransaction.transactionInfo.transactionDate, 'yyyy-MM-dd\'T\'HH:mm:ss', 'Europe/Lisbon');

	const receivedAtValue = Dates
		.fromJSDate(pcgiTransactionEntity.createdAt);

	//
	// Validate the document structure and content

	const result: RawApexTransactionValidationV40 = {
		_id: pcgiTransactionEntity.transactionId,
		agency_id: decodedTransaction.operatorInfo.operatorLongID,
		created_at: transactionDateValue.unix_timestamp,
		is_ok: pcgiTransactionEntity.isOK,
		payload: RawApexTransactionValidationV40PayloadSchema.parse(decodedTransaction),
		received_at: receivedAtValue.unix_timestamp,
		version: 'validation-4.0',
	};

	return RawApexTransactionValidationV40Schema.parse(result);
}
