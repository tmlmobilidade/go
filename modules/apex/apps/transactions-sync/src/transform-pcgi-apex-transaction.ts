/* * */

import { parsePcgiTransactionEntityIntoRawApexTransactionInspectionDecisionV20, parsePcgiTransactionEntityIntoRawApexTransactionInspectionV20, parsePcgiTransactionEntityIntoRawApexTransactionLocationV30, parsePcgiTransactionEntityIntoRawApexTransactionRefundV30, parsePcgiTransactionEntityIntoRawApexTransactionSaleV30, parsePcgiTransactionEntityIntoRawApexTransactionValidationV20, parsePcgiTransactionEntityIntoRawApexTransactionValidationV30, parsePcgiTransactionEntityIntoRawApexTransactionValidationV40, parsePcgiTransactionEntityIntoRawApexTransactionValidationV50 } from '@tmlmobilidade/go-apex-pckg-parsers';
import { type PcgiTransactionEntity, type RawApexTransaction } from '@tmlmobilidade/go-types-apex';

/* * */

export function transformPcgiApexTransaction(pcgiTransactionEntity: PcgiTransactionEntity): RawApexTransaction {
	//

	//
	// Decode the transaction entity from the JSON string
	// and set it as any payload type, as we don't know the type yet

	const decodedTransaction: RawApexTransaction['payload'] = JSON.parse(pcgiTransactionEntity.decodeValue);

	//
	// Verify which type of transaction it is and set a key
	// for the transaction type and version number to properly
	// transform it into a typed RawApexTransaction

	if (!decodedTransaction.transactionInfo?.apexTransactionType) throw new Error(`Missing apexTransactionType in transaction: ${pcgiTransactionEntity.transactionId}.`);
	if (!decodedTransaction.transactionInfo?.apexTransactionVersion) throw new Error(`Missing apexTransactionVersion in transaction: ${pcgiTransactionEntity.transactionId}.`);

	const documentTypeKey = `${decodedTransaction.transactionInfo.apexTransactionType}|${decodedTransaction.transactionInfo.apexTransactionVersion}`;

	//
	// Transform the transaction into a typed RawApexTransaction
	// using the appropriate transformation function

	if (documentTypeKey === '3|3.0') return parsePcgiTransactionEntityIntoRawApexTransactionSaleV30(pcgiTransactionEntity, decodedTransaction);

	if (documentTypeKey === '6|3.0') return parsePcgiTransactionEntityIntoRawApexTransactionRefundV30(pcgiTransactionEntity, decodedTransaction);

	if (documentTypeKey === '11|2.0') return parsePcgiTransactionEntityIntoRawApexTransactionValidationV20(pcgiTransactionEntity, decodedTransaction);
	if (documentTypeKey === '11|3.0') return parsePcgiTransactionEntityIntoRawApexTransactionValidationV30(pcgiTransactionEntity, decodedTransaction);
	if (documentTypeKey === '11|4.0') return parsePcgiTransactionEntityIntoRawApexTransactionValidationV40(pcgiTransactionEntity, decodedTransaction);
	if (documentTypeKey === '11|5.0') return parsePcgiTransactionEntityIntoRawApexTransactionValidationV50(pcgiTransactionEntity, decodedTransaction);

	if (documentTypeKey === '15|2.0') return parsePcgiTransactionEntityIntoRawApexTransactionInspectionV20(pcgiTransactionEntity, decodedTransaction);
	if (documentTypeKey === '16|2.0') return parsePcgiTransactionEntityIntoRawApexTransactionInspectionDecisionV20(pcgiTransactionEntity, decodedTransaction);

	if (documentTypeKey === '19|3.0') return parsePcgiTransactionEntityIntoRawApexTransactionLocationV30(pcgiTransactionEntity, decodedTransaction);

	//
	// If no transformation function is found, throw an error

	throw new Error(`No transformation found for key: ${documentTypeKey} in transaction: ${pcgiTransactionEntity.transactionId}.`);

	//
};
