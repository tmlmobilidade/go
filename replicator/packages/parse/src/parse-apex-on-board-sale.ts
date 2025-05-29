/* * */

import { type SimplifiedApexOnBoardSale, validateUnixTimestamp } from '@tmlmobilidade/types';
import { DateTime } from 'luxon';

/* * */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseSimplifiedApexOnBoardSale(pcgiDoc: any): SimplifiedApexOnBoardSale {
	//

	return {
		_id: pcgiDoc.transaction.transactionId,
		agency_id: pcgiDoc.transaction.operatorLongID,
		apex_version: pcgiDoc.transaction.apexVersion,
		block_id: null,
		card_physical_type: pcgiDoc.transaction.cardPhysicalType,
		card_serial_number: pcgiDoc.transaction.cardSerialNumber,
		created_at: validateUnixTimestamp(DateTime.fromISO(pcgiDoc.transaction.transactionDate).toMillis()),
		device_id: pcgiDoc.transaction.deviceID,
		duty_id: null,
		is_valid: false,
		line_id: null,
		mac_ase_counter_value: pcgiDoc.transaction.macDataFields.aseCounterValue,
		mac_sam_serial_number: pcgiDoc.transaction.macDataFields.samSerialNumber,
		on_board_refund_id: null,
		pattern_id: null,
		payment_method: pcgiDoc.transaction.paymentMethod,
		price: pcgiDoc.transaction.price,
		product_long_id: pcgiDoc.transaction.productLongID,
		product_quantity: pcgiDoc.transaction.productQuantity,
		received_at: validateUnixTimestamp(DateTime.fromISO(pcgiDoc.createdAt).toMillis()),
		stop_id: null,
		trip_id: null,
		updated_at: validateUnixTimestamp(DateTime.fromISO(pcgiDoc.createdAt).toMillis()),
		validation_id: null,
		vehicle_id: null,
	};

	//
}
