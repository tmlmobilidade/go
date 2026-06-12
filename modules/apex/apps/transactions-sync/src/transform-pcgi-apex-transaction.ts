/* * */

import { parsePcgiTransactionEntityIntoRawApexTransactionLocationV30, parsePcgiTransactionEntityIntoRawApexTransactionRefundV30, parsePcgiTransactionEntityIntoRawApexTransactionValidationV30 } from '@tmlmobilidade/go-apex-pckg-parsers';
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
	// Setup a result object for the transaction

	if (documentTypeKey === '3|3.0') return parsePcgiTransactionEntityIntoRawApexTransactionSaleV30(pcgiTransactionEntity, decodedTransaction);

	if (documentTypeKey === '6|3.0') return parsePcgiTransactionEntityIntoRawApexTransactionRefundV30(pcgiTransactionEntity, decodedTransaction);

	if (documentTypeKey === '11|3.0') return parsePcgiTransactionEntityIntoRawApexTransactionValidationV30(pcgiTransactionEntity, decodedTransaction);

	if (documentTypeKey === '19|3.0') return parsePcgiTransactionEntityIntoRawApexTransactionLocationV30(pcgiTransactionEntity, decodedTransaction);

	//
	// If no transformation is found, throw an error

	throw new Error(`No transformation found for key: ${documentTypeKey} in transaction: ${pcgiTransactionEntity.transactionId}.`);

	//
};
