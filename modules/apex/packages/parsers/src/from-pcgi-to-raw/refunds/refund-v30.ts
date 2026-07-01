/* * */

import { Dates } from '@tmlmobilidade/dates';
import { type PcgiTransactionEntity } from '@tmlmobilidade/go-types-apex';
import { type RawApexTransaction, type RawApexTransactionRefundV30, RawApexTransactionRefundV30PayloadSchema, RawApexTransactionRefundV30Schema } from '@tmlmobilidade/go-types-apex';

/* * */

export function parsePcgiTransactionEntityIntoRawApexTransactionRefundV30(pcgiTransactionEntity: PcgiTransactionEntity, decodedTransaction: RawApexTransaction['payload']): RawApexTransactionRefundV30 {
	//

	//
	// Prepare the date field values

	const transactionDateValue = Dates
		.fromFormat(decodedTransaction.transactionInfo.transactionDate, 'yyyy-MM-dd\'T\'HH:mm:ss', 'Europe/Lisbon');

	const receivedAtValue = Dates
		.fromJSDate(pcgiTransactionEntity.createdAt);

	//
	// Validate the document structure and content

	const result: RawApexTransactionRefundV30 = {
		_id: pcgiTransactionEntity.transactionId,
		agency_id: decodedTransaction.operatorInfo.operatorLongID,
		created_at: transactionDateValue.unix_timestamp,
		is_ok: pcgiTransactionEntity.isOK,
		payload: RawApexTransactionRefundV30PayloadSchema.parse(decodedTransaction),
		received_at: receivedAtValue.unix_timestamp,
		version: 'refund-3.0',
	};

	return RawApexTransactionRefundV30Schema.parse(result);
}
