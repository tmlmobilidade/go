/* * */

import { getAgencyIdFromOperatorLongId } from '@/agency-map.js';
import { type PcgiTransactionEntity, type RawApexTransaction, type RawApexTransactionSaleV30, RawApexTransactionSaleV30PayloadSchema, RawApexTransactionSaleV30Schema } from '@tmlmobilidade/go-types-apex';
import { Dates } from '@tmlmobilidade/go-utils-dates';

/* * */

export function parsePcgiTransactionEntityIntoRawApexTransactionSaleV30(pcgiTransactionEntity: PcgiTransactionEntity, decodedTransaction: RawApexTransaction['payload']): RawApexTransactionSaleV30 {
	//

	//
	// Prepare the date field values

	const transactionDateValue = Dates
		.fromFormat(decodedTransaction.transactionInfo.transactionDate, 'yyyy-MM-dd\'T\'HH:mm:ss', 'Europe/Lisbon');

	const receivedAtValue = Dates
		.fromJSDate(pcgiTransactionEntity.createdAt);

	//
	// Validate the document structure and content

	const result: RawApexTransactionSaleV30 = {
		_id: pcgiTransactionEntity.transactionId,
		agency_code: decodedTransaction.operatorInfo.operatorLongID,
		agency_id: getAgencyIdFromOperatorLongId(decodedTransaction.operatorInfo.operatorLongID),
		created_at: transactionDateValue.unix_milliseconds,
		is_ok: pcgiTransactionEntity.isOK,
		payload: RawApexTransactionSaleV30PayloadSchema.parse(decodedTransaction),
		received_at: receivedAtValue.unix_milliseconds,
		version: 'sale-3.0',
	};

	return RawApexTransactionSaleV30Schema.parse(result);
}
