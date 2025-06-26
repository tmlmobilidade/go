/* * */

import { type SimplifiedApexValidation } from '@tmlmobilidade/types';
import { Dates } from '@tmlmobilidade/utils';

/* * */

const ALLOWED_OPERATOR_LONG_IDS = ['41', '42', '43', '44'];

const ALLOWED_APEX_TRANSACTION_VERSIONS = ['2.0', '3.0'];

const ALLOWED_APEX_TRANSACTION_TYPES = [11]; // Validation Transaction

/* * */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseSimplifiedApexValidation(pcgiDoc: any): null | SimplifiedApexValidation {
	try {
		//

		//
		// Validate the document structure and content

		if (!pcgiDoc?.transaction) throw new Error('Missing transaction in document');

		if (!pcgiDoc.transaction?.operatorLongID) throw new Error('Missing operatorLongID in transaction');

		if (!ALLOWED_OPERATOR_LONG_IDS.includes(pcgiDoc.transaction.operatorLongID)) throw new Error(`Invalid operatorLongID: ${pcgiDoc.transaction.operatorLongID}`);

		if (!ALLOWED_APEX_TRANSACTION_VERSIONS.includes(pcgiDoc.transaction.apexTransactionVersion)) throw new Error(`Invalid apexTransactionVersion: ${pcgiDoc.transaction.apexTransactionVersion}`);

		if (!ALLOWED_APEX_TRANSACTION_TYPES.includes(pcgiDoc.transaction.apexTransactionType)) throw new Error(`Invalid apexTransactionType: ${pcgiDoc.transaction.apexTransactionType}`);

		//
		// Parse the document and return the simplified APEX object

		return {
			_id: pcgiDoc.transaction.transactionId,
			agency_id: pcgiDoc.transaction.operatorLongID,
			apex_version: pcgiDoc.transaction.apexVersion,
			card_serial_number: pcgiDoc.transaction.cardSerialNumber,
			created_at: Dates
				.fromISO(pcgiDoc.transaction.transactionDate)
				.setZone('Europe/Lisbon', 'rebase_utc') // Ensure the date is interpreted in Lisbon timezone, since the original APEX value does not include timezone in ISO string.
				.unix_timestamp,
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
	}
	catch (error) {
		if (process.env.DEBUG_MODE) console.error(`Error parsing simplified APEX Validation. Transaction ID: "${pcgiDoc.transaction.transactionId}"`, error.message);
		return null;
	}
}

/* * */

export function validateIfSimplifiedApexValidationIsPassenger(validationStatus: number, eventType: number, refundId: null | string): boolean {
	const hasValidValidationStatus = [0, 4, 5, 6].includes(validationStatus);
	const hasValidEventType = true; // eventType === 'VALIDAR ESTE CAMPO';
	const hasNoRefund = refundId === null;
	return hasValidValidationStatus && hasValidEventType && hasNoRefund;
}
