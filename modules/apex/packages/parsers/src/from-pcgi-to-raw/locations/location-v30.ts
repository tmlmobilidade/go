/* * */

import { Dates } from '@tmlmobilidade/dates';
import { type PcgiTransactionEntity } from '@tmlmobilidade/go-types-apex';
import { type RawApexTransaction, type RawApexTransactionLocationV30, RawApexTransactionLocationV30PayloadSchema, RawApexTransactionLocationV30Schema } from '@tmlmobilidade/go-types-apex';

/* * */

export function parsePcgiTransactionEntityIntoRawApexTransactionLocationV30(pcgiTransactionEntity: PcgiTransactionEntity, decodedTransaction: RawApexTransaction['payload']): RawApexTransactionLocationV30 {
	//

	//
	// Validate the document structure and content

	const result: RawApexTransactionLocationV30 = {
		_id: pcgiTransactionEntity.transactionId,
		agency_id: decodedTransaction.operatorInfo.operatorLongID,
		created_at: Dates.fromISO(decodedTransaction.transactionInfo.transactionDate).unix_timestamp,
		is_ok: pcgiTransactionEntity.isOK,
		payload: RawApexTransactionLocationV30PayloadSchema.parse(decodedTransaction),
		received_at: Dates.fromJSDate(pcgiTransactionEntity.createdAt).unix_timestamp,
		version: 'location-3.0',
	};

	return RawApexTransactionLocationV30Schema.parse(result);
}
