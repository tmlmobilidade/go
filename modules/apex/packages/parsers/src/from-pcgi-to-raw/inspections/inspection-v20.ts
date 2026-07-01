/* * */

import { Dates } from '@tmlmobilidade/dates';
import { type PcgiTransactionEntity } from '@tmlmobilidade/go-types-apex';
import { type RawApexTransaction, type RawApexTransactionInspectionV20, RawApexTransactionInspectionV20PayloadSchema, RawApexTransactionInspectionV20Schema } from '@tmlmobilidade/go-types-apex';

/* * */

export function parsePcgiTransactionEntityIntoRawApexTransactionInspectionV20(pcgiTransactionEntity: PcgiTransactionEntity, decodedTransaction: RawApexTransaction['payload']): RawApexTransactionInspectionV20 {
	//

	//
	// Prepare the date field values

	const transactionDateValue = Dates
		.fromFormat(decodedTransaction.transactionInfo.transactionDate, 'yyyy-MM-dd\'T\'HH:mm:ss', 'Europe/Lisbon');

	const receivedAtValue = Dates
		.fromJSDate(pcgiTransactionEntity.createdAt);

	//
	// Validate the document structure and content

	const result: RawApexTransactionInspectionV20 = {
		_id: pcgiTransactionEntity.transactionId,
		agency_id: decodedTransaction.operatorInfo.operatorLongID,
		created_at: transactionDateValue.unix_timestamp,
		is_ok: pcgiTransactionEntity.isOK,
		payload: RawApexTransactionInspectionV20PayloadSchema.parse(decodedTransaction),
		received_at: receivedAtValue.unix_timestamp,
		version: 'inspection-2.0',
	};

	return RawApexTransactionInspectionV20Schema.parse(result);
}
