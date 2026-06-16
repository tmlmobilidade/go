/* * */

import { Dates } from '@tmlmobilidade/dates';
import { type PcgiTransactionEntity } from '@tmlmobilidade/go-types-apex';
import { type RawApexTransaction, type RawApexTransactionInspectionDecisionV20, RawApexTransactionInspectionDecisionV20PayloadSchema, RawApexTransactionInspectionDecisionV20Schema } from '@tmlmobilidade/go-types-apex';

/* * */

export function parsePcgiTransactionEntityIntoRawApexTransactionInspectionDecisionV20(pcgiTransactionEntity: PcgiTransactionEntity, decodedTransaction: RawApexTransaction['payload']): RawApexTransactionInspectionDecisionV20 {
	//

	//
	// Validate the document structure and content

	const result: RawApexTransactionInspectionDecisionV20 = {
		_id: pcgiTransactionEntity.transactionId,
		agency_id: decodedTransaction.operatorInfo.operatorLongID,
		created_at: Dates.fromISO(decodedTransaction.transactionInfo.transactionDate).unix_timestamp,
		is_ok: pcgiTransactionEntity.isOK,
		payload: RawApexTransactionInspectionDecisionV20PayloadSchema.parse(decodedTransaction),
		received_at: Dates.fromJSDate(pcgiTransactionEntity.createdAt).unix_timestamp,
		version: 'inspection-decision-2.0',
	};

	return RawApexTransactionInspectionDecisionV20Schema.parse(result);
}
