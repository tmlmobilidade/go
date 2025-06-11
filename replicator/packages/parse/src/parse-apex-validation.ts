/* * */

import { type SimplifiedApexValidation } from '@tmlmobilidade/types';
import { Dates } from '@tmlmobilidade/utils';

/* * */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseSimplifiedApexValidation(pcgiDoc: any): SimplifiedApexValidation {
	//

	return {
		_id: pcgiDoc.transaction.transactionId,
		agency_id: pcgiDoc.transaction.operatorLongID,
		apex_version: pcgiDoc.transaction.apexVersion,
		card_serial_number: pcgiDoc.transaction.cardSerialNumber,
		created_at: Dates.fromISO(pcgiDoc.transaction.transactionDate).unix_timestamp,
		device_id: pcgiDoc.transaction.deviceID,
		event_type: pcgiDoc.transaction.eventType,
		is_passenger: validateIfSimplifiedApexValidationIsPassenger(pcgiDoc.transaction.validationStatus, pcgiDoc.transaction.eventType, null),
		line_id: pcgiDoc.transaction.lineLongID,
		mac_ase_counter_value: pcgiDoc.transaction.macDataFields.aseCounterValue,
		mac_sam_serial_number: pcgiDoc.transaction.macDataFields.samSerialNumber,
		on_board_refund_id: null,
		on_board_sale_id: null,
		pattern_id: pcgiDoc.transaction.patternLongID,
		product_id: pcgiDoc.transaction.productLongID,
		received_at: Dates.fromISO(pcgiDoc.createdAt).unix_timestamp,
		stop_id: pcgiDoc.transaction.stopLongID,
		trip_id: pcgiDoc.transaction.journeyID,
		units_qty: null,
		updated_at: Dates.fromISO(pcgiDoc.createdAt).unix_timestamp,
		validation_status: pcgiDoc.transaction.validationStatus,
		vehicle_id: pcgiDoc.transaction.vehicleID,
	};

	//
}

/* * */

export function validateIfSimplifiedApexValidationIsPassenger(validationStatus: number, eventType: number, refundId: null | string): boolean {
	const hasValidValidationStatus = [0, 4, 5, 6].includes(validationStatus);
	const hasValidEventType = true; // eventType === 'VALIDAR ESTE CAMPO';
	const hasNoRefund = refundId === null;
	return hasValidValidationStatus && hasValidEventType && hasNoRefund;
}
