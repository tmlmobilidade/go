/* * */

import { getAgencyIdFromOperatorLongId } from '@/agency-map.js';
import { type PcgiTransactionEntity, type RawApexTransaction, type RawApexTransactionValidationV40, RawApexTransactionValidationV40PayloadSchema, RawApexTransactionValidationV40Schema } from '@tmlmobilidade/go-types-apex';
import { Dates } from '@tmlmobilidade/go-utils-dates';

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
		agency_code: decodedTransaction.operatorInfo.operatorLongID,
		agency_id: getAgencyIdFromOperatorLongId(decodedTransaction.operatorInfo.operatorLongID),
		created_at: transactionDateValue.unix_milliseconds,
		is_ok: pcgiTransactionEntity.isOK,
		payload: RawApexTransactionValidationV40PayloadSchema.parse(decodedTransaction),
		received_at: receivedAtValue.unix_milliseconds,
		version: 'validation-4.0',
	};

	return RawApexTransactionValidationV40Schema.parse(result);
}
