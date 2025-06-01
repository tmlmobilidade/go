/* * */

import { type SimplifiedApexOnBoardSale } from '@tmlmobilidade/types';
import { Dates } from '@tmlmobilidade/utils';

/* * */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseSimplifiedApexOnBoardSale(pcgiDoc: any): SimplifiedApexOnBoardSale {
	try {
		return {
			_id: pcgiDoc.transaction.transactionId,
			agency_id: pcgiDoc.transaction.operatorLongID,
			apex_version: pcgiDoc.transaction.apexVersion,
			block_id: null,
			card_physical_type: pcgiDoc.transaction.cardPhysicalType,
			card_serial_number: pcgiDoc.transaction.cardSerialNumber,
			created_at: Dates.fromISO(pcgiDoc.transaction.transactionDate).unix_timestamp,
			device_id: pcgiDoc.transaction.deviceID,
			duty_id: null,
			is_passenger: validateIfSimplifiedApexOnBoardSaleIsPassenger(null),
			line_id: null,
			mac_ase_counter_value: pcgiDoc.transaction.macDataFields.aseCounterValue,
			mac_sam_serial_number: pcgiDoc.transaction.macDataFields.samSerialNumber,
			on_board_refund_id: null,
			pattern_id: null,
			payment_method: pcgiDoc.transaction.paymentMethod,
			price: pcgiDoc.transaction.price,
			product_long_id: pcgiDoc.transaction.productLongID,
			product_quantity: pcgiDoc.transaction.productQuantity,
			received_at: Dates.fromISO(pcgiDoc.createdAt).unix_timestamp,
			stop_id: null,
			trip_id: null,
			updated_at: Dates.fromISO(pcgiDoc.createdAt).unix_timestamp,
			validation_id: null,
			vehicle_id: null,
		};
	}
	catch (error) {
		console.log(`Error parsing simplified APEX OnBoardSale. Transaction ID: "${pcgiDoc.transaction.transactionId}"`);
		throw new Error(error);
	}
}

/* * */

export function validateIfSimplifiedApexOnBoardSaleIsPassenger(refundId: null | string): boolean {
	const hasNoRefund = refundId === null;
	return hasNoRefund;
}
