/* * */

import { Dates } from '@tmlmobilidade/dates';
import { type PcgiTransactionEntity } from '@tmlmobilidade/go-types-apex';
import { type RawApexTransaction, type RawApexTransactionBankingTapV40, RawApexTransactionBankingTapV40PayloadSchema, RawApexTransactionBankingTapV40Schema } from '@tmlmobilidade/go-types-apex';

/* * */

export function parsePcgiTransactionEntityIntoRawApexTransactionBankingTapV40(pcgiTransactionEntity: PcgiTransactionEntity, decodedTransaction: RawApexTransaction['payload']): RawApexTransactionBankingTapV40 {
	//

	//
	// Validate the document structure and content

	const result: RawApexTransactionBankingTapV40 = {
		_id: pcgiTransactionEntity.transactionId,
		agency_id: decodedTransaction.operatorInfo.operatorLongID,
		created_at: Dates.fromISO(decodedTransaction.transactionInfo.transactionDate).unix_timestamp,
		is_ok: pcgiTransactionEntity.isOK,
		payload: RawApexTransactionBankingTapV40PayloadSchema.parse(decodedTransaction),
		received_at: Dates.fromJSDate(pcgiTransactionEntity.createdAt).unix_timestamp,
		version: 'apex-banking-tap-4.0',
	};

	return RawApexTransactionBankingTapV40Schema.parse(result);
}
