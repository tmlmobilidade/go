/* * */

import { Dates } from '@tmlmobilidade/dates';
import { type PcgiTransactionEntity } from '@tmlmobilidade/go-types-apex';
import { type RawApexTransaction, type RawApexTransactionSaleV30, RawApexTransactionSaleV30PayloadSchema, RawApexTransactionSaleV30Schema } from '@tmlmobilidade/go-types-apex';

/* * */

export function parsePcgiTransactionEntityIntoRawApexTransactionSaleV30(pcgiTransactionEntity: PcgiTransactionEntity, decodedTransaction: RawApexTransaction['payload']): RawApexTransactionSaleV30 {
	//

	//
	// Validate the document structure and content

	const result: RawApexTransactionSaleV30 = {
		_id: pcgiTransactionEntity.transactionId,
		agency_id: decodedTransaction.operatorInfo.operatorLongID,
		created_at: Dates.fromISO(decodedTransaction.transactionInfo.transactionDate).unix_timestamp,
		is_ok: pcgiTransactionEntity.isOK,
		payload: RawApexTransactionSaleV30PayloadSchema.parse(decodedTransaction),
		received_at: Dates.fromJSDate(pcgiTransactionEntity.createdAt).unix_timestamp,
		version: 'sale-3.0',
	};

	return RawApexTransactionSaleV30Schema.parse(result);
}
