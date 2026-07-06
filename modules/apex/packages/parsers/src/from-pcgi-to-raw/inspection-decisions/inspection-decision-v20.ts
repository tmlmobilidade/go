/* * */

import { Dates } from '@tmlmobilidade/dates';
import { type PcgiTransactionEntity } from '@tmlmobilidade/go-types-apex';
import { type RawApexTransaction, type RawApexTransactionInspectionDecisionV20, RawApexTransactionInspectionDecisionV20PayloadSchema, RawApexTransactionInspectionDecisionV20Schema } from '@tmlmobilidade/go-types-apex';

/* * */

export function parsePcgiTransactionEntityIntoRawApexTransactionInspectionDecisionV20(pcgiTransactionEntity: PcgiTransactionEntity, decodedTransaction: RawApexTransaction['payload']): RawApexTransactionInspectionDecisionV20 {
	//

	//
	// Prepare the date field values

	const transactionDateValue = Dates
		.fromFormat(decodedTransaction.transactionInfo.transactionDate, 'yyyy-MM-dd\'T\'HH:mm:ss', 'Europe/Lisbon');

	const receivedAtValue = Dates
		.fromJSDate(pcgiTransactionEntity.createdAt);

	//
	// Validate the document structure and content

	const result: RawApexTransactionInspectionDecisionV20 = {
		_id: pcgiTransactionEntity.transactionId,
		agency_id: decodedTransaction.operatorInfo.operatorLongID,
		created_at: transactionDateValue.unix_timestamp,
		is_ok: pcgiTransactionEntity.isOK,
		payload: RawApexTransactionInspectionDecisionV20PayloadSchema.parse(decodedTransaction),
		received_at: receivedAtValue.unix_timestamp,
		version: 'inspection-decision-2.0',
	};

	return RawApexTransactionInspectionDecisionV20Schema.parse(result);
}
