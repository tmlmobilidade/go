/* * */

import { parsePcgiTransactionEntityIntoRawApexTransactionBankingTapV40 } from '@/from-pcgi-to-raw/banking-taps/banking-tap-v40.js';
import { parsePcgiTransactionEntityIntoRawApexTransactionInspectionDecisionV20 } from '@/from-pcgi-to-raw/inspections/inspection-decision-v20.js';
import { parsePcgiTransactionEntityIntoRawApexTransactionInspectionV20 } from '@/from-pcgi-to-raw/inspections/inspection-v20.js';
import { parsePcgiTransactionEntityIntoRawApexTransactionLocationV30 } from '@/from-pcgi-to-raw/locations/location-v30.js';
import { parsePcgiTransactionEntityIntoRawApexTransactionRefundV30 } from '@/from-pcgi-to-raw/refunds/refund-v30.js';
import { parsePcgiTransactionEntityIntoRawApexTransactionSaleV30 } from '@/from-pcgi-to-raw/sales/sale-v30.js';
import { parsePcgiTransactionEntityIntoRawApexTransactionValidationV20 } from '@/from-pcgi-to-raw/validations/validation-v20.js';
import { parsePcgiTransactionEntityIntoRawApexTransactionValidationV30 } from '@/from-pcgi-to-raw/validations/validation-v30.js';
import { parsePcgiTransactionEntityIntoRawApexTransactionValidationV40 } from '@/from-pcgi-to-raw/validations/validation-v40.js';
import { parsePcgiTransactionEntityIntoRawApexTransactionValidationV50 } from '@/from-pcgi-to-raw/validations/validation-v50.js';
import { type PcgiTransactionEntity, type RawApexTransaction } from '@tmlmobilidade/go-types-apex';

/* * */

export function parsePcgiTransactionEntityIntoRawApexTransaction(pcgiTransactionEntity: PcgiTransactionEntity): RawApexTransaction {
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

	if (documentTypeKey === '20|4.0') return parsePcgiTransactionEntityIntoRawApexTransactionBankingTapV40(pcgiTransactionEntity, decodedTransaction);

	//
	// If no transformation function is found, throw an error

	throw new Error(`No transformation found for key: ${documentTypeKey} in transaction: ${pcgiTransactionEntity.transactionId}.`);

	//
};
