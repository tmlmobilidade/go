/* * */

import { type SimplifiedApexValidation, validateUnixTimestamp } from '@tmlmobilidade/types';
import { DateTime } from 'luxon';

/* * */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseSimplifiedApexValidation(pcgiDoc: any): SimplifiedApexValidation {
	//

	return {
		_id: pcgiDoc.transaction.transactionId,
		agency_id: pcgiDoc.transaction.operatorLongID,
		apex_version: pcgiDoc.transaction.apexVersion,
		card_serial_number: pcgiDoc.transaction.cardSerialNumber,
		created_at: validateUnixTimestamp(DateTime.fromISO(pcgiDoc.transaction.transactionDate).toMillis()),
		device_id: pcgiDoc.transaction.deviceID,
		is_valid: false,
		line_id: pcgiDoc.transaction.lineLongID,
		mac_ase_counter_value: pcgiDoc.transaction.macDataFields.aseCounterValue,
		mac_sam_serial_number: pcgiDoc.transaction.macDataFields.samSerialNumber,
		on_board_refund_id: null,
		on_board_sale_id: null,
		pattern_id: pcgiDoc.transaction.patternLongID,
		product_id: pcgiDoc.transaction.productLongID,
		received_at: validateUnixTimestamp(DateTime.fromISO(pcgiDoc.createdAt).toMillis()),
		stop_id: pcgiDoc.transaction.stopLongID,
		trip_id: pcgiDoc.transaction.journeyID,
		units_qty: null,
		updated_at: validateUnixTimestamp(DateTime.fromISO(pcgiDoc.createdAt).toMillis()),
		validation_status: pcgiDoc.transaction.validationStatus,
		vehicle_id: pcgiDoc.transaction.vehicleID,
	};

	//
}
