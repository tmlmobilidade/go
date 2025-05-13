/* * */

import { type ApexOnBoardSale } from '@tmlmobilidade/types';
import { Dates } from '@tmlmobilidade/utils';

/* * */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseApexOnBoardSales(pcgiDoc: any): ApexOnBoardSale {
	//

	return {
		//
		_id: pcgiDoc.transaction.transactionId,
		//
		is_valid: false,
		//
		agency_id: pcgiDoc.transaction.operatorLongID,
		apex_transaction_type: pcgiDoc.transaction.apexTransactionType,
		apex_version: pcgiDoc.transaction.apexVersion,
		card_physical_type: pcgiDoc.transaction.cardPhysicalType,
		card_serial_number: pcgiDoc.transaction.cardSerialNumber,
		device_id: pcgiDoc.transaction.deviceID,
		invoice_number: pcgiDoc.transaction.invoiceNumber,
		mac_ase_counter_value: pcgiDoc.transaction.macDataFields.aseCounterValue,
		mac_sam_serial_number: pcgiDoc.transaction.macDataFields.samSerialNumber,
		payment_method: pcgiDoc.transaction.paymentMethod,
		price: pcgiDoc.transaction.price,
		product_id: pcgiDoc.transaction.productLongID,
		product_qty: pcgiDoc.transaction.productQuantity,
		//
		created_at: Dates.fromISO(pcgiDoc.transaction.transactionDate).unix_timestamp,
		received_at: Dates.fromISO(pcgiDoc.createdAt).unix_timestamp,
		updated_at: Dates.fromISO(pcgiDoc.createdAt).unix_timestamp,
		//
		refund_transaction_id: undefined,
		validation_transaction_id: undefined,
		//
		line_id: undefined,
		pattern_id: undefined,
		stop_id: undefined,
		trip_id: undefined,
		vehicle_id: undefined,
		//
	};

	//
}
