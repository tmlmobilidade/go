/* * */

import { Dates } from '@tmlmobilidade/dates';
import { PcgiTransactionEntity } from '@tmlmobilidade/go-types-apex';
import { RawApexTransaction, type RawApexTransactionRefundV30, RawApexTransactionRefundV30PayloadSchema, RawApexTransactionRefundV30Schema } from '@tmlmobilidade/types';

/* * */

export function parsePcgiTransactionEntityIntoRawApexTransactionRefundV30(pcgiTransactionEntity: PcgiTransactionEntity, decodedTransaction: RawApexTransaction['payload']): RawApexTransactionRefundV30 {
	//

	//
	// Validate the document structure and content

	const result: RawApexTransactionRefundV30 = {
		_id: pcgiTransactionEntity.transactionId,
		agency_id: decodedTransaction.operatorInfo.operatorLongID,
		created_at: Dates.fromISO(decodedTransaction.transactionInfo.transactionDate).unix_timestamp,
		is_ok: pcgiTransactionEntity.isOK,
		payload: RawApexTransactionRefundV30PayloadSchema.parse(decodedTransaction),
		received_at: Dates.fromISO(pcgiTransactionEntity.createdAt).unix_timestamp,
		transaction_id: pcgiTransactionEntity.transactionId,
		version: 'apex-refund-3.0',
	};

	return RawApexTransactionRefundV30Schema.parse(result);
}
