/* * */

import { getAgencyIdFromOperatorLongId } from '@/agency-map.js';
import { type PcgiTransactionEntity, type RawApexTransaction, type RawApexTransactionValidationV20, RawApexTransactionValidationV20PayloadSchema, RawApexTransactionValidationV20Schema } from '@tmlmobilidade/go-types-apex';
import { Dates } from '@tmlmobilidade/go-utils-dates';

/* * */

export function parsePcgiTransactionEntityIntoRawApexTransactionValidationV20(pcgiTransactionEntity: PcgiTransactionEntity, decodedTransaction: RawApexTransaction['payload']): RawApexTransactionValidationV20 {
	//

	//
	// Prepare the date field values

	const transactionDateValue = Dates
		.fromFormat(decodedTransaction.transactionInfo.transactionDate, 'yyyy-MM-dd\'T\'HH:mm:ss', 'Europe/Lisbon');

	const receivedAtValue = Dates
		.fromJSDate(pcgiTransactionEntity.createdAt);

	//
	// Validate the document structure and content

	const result: RawApexTransactionValidationV20 = {
		_id: pcgiTransactionEntity.transactionId,
		agency_code: decodedTransaction.operatorInfo.operatorLongID,
		agency_id: getAgencyIdFromOperatorLongId(decodedTransaction.operatorInfo.operatorLongID),
		created_at: transactionDateValue.unix_milliseconds,
		is_ok: pcgiTransactionEntity.isOK,
		payload: RawApexTransactionValidationV20PayloadSchema.parse(decodedTransaction),
		received_at: receivedAtValue.unix_milliseconds,
		version: 'validation-2.0',
	};

	return RawApexTransactionValidationV20Schema.parse(result);
}
