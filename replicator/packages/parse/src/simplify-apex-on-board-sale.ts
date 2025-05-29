/* * */

import { PCGI_ApexTransaction_Sale, type PCGI_TransactionEntity, type SimplifiedApexOnBoardSale } from '@tmlmobilidade/types';
import { Dates } from '@tmlmobilidade/utils';

/* * */

export function simplifyApexOnBoardSale(doc: PCGI_TransactionEntity): SimplifiedApexOnBoardSale {
	//

	//
	// Extract the decoded transaction from the PCGI document.

	const decodedTransaction: PCGI_ApexTransaction_Sale = JSON.parse(doc.decodeValue);

	//
	// Check if the document is a version 3 transaction.

	if (decodedTransaction.transactionInfo.apexTransactionVersion === '2.0') {
		return {
			//
			_id: decodedTransaction.transactionInfo.transactionId,
			//
			_go_correlation__on_board_refund_id: null,
			_go_correlation__validation_id: null,
			//
			_go_default__created_at: Dates.fromISO(decodedTransaction.transactionInfo.transactionDate).unix_timestamp,
			_go_default__updated_at: Dates.fromISO(doc.createdAt).unix_timestamp,
			//
			_go_enriched__block_id: null,
			_go_enriched__duty_id: null,
			_go_enriched__is_valid: false,
			_go_enriched__journey_id: null,
			_go_enriched__line_long_id: null,
			_go_enriched__pattern_long_id: null,
			_go_enriched__stop_long_id: null,
			_go_enriched__vehicle_id: null,
			//
			card_info__card_physical_type: decodedTransaction.cardInfo.cardPhysicalType,
			card_info__card_serial_number: decodedTransaction.cardInfo.cardSerialNumber,
			//
			mac__ase_counter_value: decodedTransaction.mac.aseCounterValue,
			mac__sam_serial_number: decodedTransaction.mac.samSerialNumber,
			//
			operator_info__operator_long_id: decodedTransaction.operatorInfo.operatorLongID,
			//
			payment_info__invoice_number: decodedTransaction.paymentInfo.invoiceNumber ?? null,
			payment_info__payment_method: decodedTransaction.paymentInfo.paymentMethod,
			payment_info__price: decodedTransaction.paymentInfo.price,
			payment_info__vat_number: decodedTransaction.paymentInfo.vatNumber ?? null,
			//
			sale_load_info__product_long_id: decodedTransaction.saleLoadInfo.productLongID,
			sale_load_info__product_quantity: decodedTransaction.saleLoadInfo.productQuantity,
			sale_load_info__units_quantity: decodedTransaction.saleLoadInfo.unitsQuantity ?? null,
			//
			transaction_info__apex_transaction_type: 3,
			transaction_info__transaction_date: decodedTransaction.transactionInfo.transactionDate,
			//
			version_info__apex_version: decodedTransaction.versionInfo.apexVersion,
			//
		};
	}

	throw new Error(`Unsupported APEX Sale version: ${decodedTransaction.transactionInfo.apexTransactionVersion}. Expected version 2.0.`);

	//
}
