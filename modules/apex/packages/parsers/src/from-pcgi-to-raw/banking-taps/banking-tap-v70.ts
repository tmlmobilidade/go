/* * */

import { getAgencyIdFromOperatorLongId } from '@/agency-map.js';
import { type PcgiTransactionEntity, type RawApexTransaction, type RawApexTransactionBankingTapV70, RawApexTransactionBankingTapV70PayloadSchema, RawApexTransactionBankingTapV70Schema } from '@tmlmobilidade/go-types-apex';
import { Dates } from '@tmlmobilidade/go-utils-dates';

/* * */

export function parsePcgiTransactionEntityIntoRawApexTransactionBankingTapV70(pcgiTransactionEntity: PcgiTransactionEntity, decodedTransaction: RawApexTransaction['payload']): RawApexTransactionBankingTapV70 {
	//

	//
	// Prepare the date field values

	const transactionDateValue = Dates
		.fromFormat(decodedTransaction.transactionInfo.transactionDate, 'yyyy-MM-dd\'T\'HH:mm:ss', 'Europe/Lisbon');

	const receivedAtValue = Dates
		.fromJSDate(pcgiTransactionEntity.createdAt);

	//
	// Validate the document structure and content

	const result: RawApexTransactionBankingTapV70 = {
		_id: pcgiTransactionEntity.transactionId,
		agency_code: decodedTransaction.operatorInfo.operatorLongID,
		agency_id: getAgencyIdFromOperatorLongId(decodedTransaction.operatorInfo.operatorLongID),
		created_at: transactionDateValue.unix_milliseconds,
		is_ok: pcgiTransactionEntity.isOK,
		payload: RawApexTransactionBankingTapV70PayloadSchema.parse(decodedTransaction),
		received_at: receivedAtValue.unix_milliseconds,
		version: 'banking-tap-7.0',
	};

	return RawApexTransactionBankingTapV70Schema.parse(result);
}
