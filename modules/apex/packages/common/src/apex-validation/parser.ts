/* * */

import { getEarliestDate } from '@tmlmobilidade/consts';
import { Dates } from '@tmlmobilidade/dates';
import { type SimplifiedApexValidation } from '@tmlmobilidade/types';

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

		if (!pcgiDoc?.transaction) throw new Error('Missing transaction in document.');

		if (!pcgiDoc.transaction?.operatorLongID) throw new Error('Missing operatorLongID in transaction.');

		if (!ALLOWED_OPERATOR_LONG_IDS.includes(pcgiDoc.transaction.operatorLongID)) throw new Error(`Invalid operatorLongID: "${pcgiDoc.transaction.operatorLongID}"`);

		if (!ALLOWED_APEX_TRANSACTION_VERSIONS.includes(pcgiDoc.transaction.apexTransactionVersion)) throw new Error(`Invalid apexTransactionVersion: "${pcgiDoc.transaction.apexTransactionVersion}"`);

		if (!ALLOWED_APEX_TRANSACTION_TYPES.includes(pcgiDoc.transaction.apexTransactionType)) throw new Error(`Invalid apexTransactionType: "${pcgiDoc.transaction.apexTransactionType}"`);

		//
		// Evaluate the transaction date and ensure it is not before the set earliest date

		if (!pcgiDoc.transaction.transactionDate) throw new Error('Missing transactionDate in transaction.');

		const earliestTransactionDate = getEarliestDate();

		const transactionDate = Dates
			.fromISO(pcgiDoc.transaction.transactionDate)
			.setZone('Europe/Lisbon', 'rebase_utc')
			.unix_timestamp;

		if (transactionDate < earliestTransactionDate.unix_timestamp) throw new Error(`Transaction date "${pcgiDoc.transaction.transactionDate}" is before the earliest allowed date "${earliestTransactionDate.operational_date}".`);

		//
		// Parse the document and return the simplified APEX object

		return {
			_id: pcgiDoc.transaction.transactionId,
			agency_id: pcgiDoc.transaction.operatorLongID,
			apex_version: pcgiDoc.transaction.apexVersion,
			card_serial_number: pcgiDoc.transaction.cardSerialNumber,
			category: getSimplifiedApexValidationCategory(pcgiDoc.transaction.unitsQuantity, null),
			created_at: transactionDate,
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
			units_qty: pcgiDoc.transaction.unitsQuantity ?? null,
			updated_at: Dates.fromISO(pcgiDoc.createdAt).unix_timestamp,
			validation_status: pcgiDoc.transaction.validationStatus,
			vehicle_id: pcgiDoc.transaction.vehicleID,
		};
	} catch (error) {
		console.error(`Error parsing simplified APEX Validation. Transaction ID: "${pcgiDoc.transaction.transactionId}"`, error.message);
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

/* * */

export function getSimplifiedApexValidationCategory(unitsQuantity: null | number, onBoardSaleId: null | string): SimplifiedApexValidation['category'] {
	// Allow 0 as valid unitsQuantity value
	const hasUnitsQuantityField = !!unitsQuantity || unitsQuantity === 0;
	// Check if onBoardSaleId is present
	const hasOnBoardSaleId = !!onBoardSaleId;
	// Determine category based on the presence of fields
	if (hasUnitsQuantityField) return 'prepaid';
	if (hasOnBoardSaleId) return 'on_board_sale';
	return 'subscription';
}
