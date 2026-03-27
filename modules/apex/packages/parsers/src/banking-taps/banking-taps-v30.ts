/* * */

import { getEarliestDate } from '@tmlmobilidade/consts';
import { Dates } from '@tmlmobilidade/dates';
import { ApexTransactionEntity, RawApexValidationV20, type SimplifiedApexValidation } from '@tmlmobilidade/types';

/* * */

const ALLOWED_OPERATOR_LONG_IDS = ['41', '42', '43', '44'];

/* * */

export function parseApexValidationV20(txEntity: ApexTransactionEntity): null | SimplifiedApexValidation {
	try {
		//

		if (txEntity.decodeValue._version !== 'apex-validation-v2.0') return null;

		const doc = txEntity.decodeValue as RawApexValidationV20;

		//
		// Validate the document structure and content

		if (!doc.operatorInfo.operatorLongID) throw new Error('Missing operatorLongID in transaction.');

		if (!ALLOWED_OPERATOR_LONG_IDS.includes(doc.operatorInfo.operatorLongID)) throw new Error(`Invalid operatorLongID: "${doc.operatorInfo.operatorLongID}"`);

		//
		// Evaluate the transaction date and ensure it is not before the set earliest date

		if (!doc.transactionInfo.transactionDate) throw new Error('Missing transactionDate in transaction.');

		const earliestTransactionDate = getEarliestDate();

		const transactionDate = Dates
			.fromISO(doc.transactionInfo.transactionDate)
			.setZone('Europe/Lisbon', 'rebase_utc')
			.unix_timestamp;

		if (transactionDate < earliestTransactionDate.unix_timestamp) throw new Error(`Transaction date "${doc.transactionInfo.transactionDate}" is before the earliest allowed date "${earliestTransactionDate.operational_date}".`);

		//
		// Parse the document and return the simplified APEX object

		return {
			_id: doc.transactionInfo.transactionId,
			agency_id: doc.operatorInfo.operatorLongID,
			apex_version: doc.versionInfo.apexVersion,
			card_serial_number: doc.cardInfo.cardSerialNumber,
			category: getSimplifiedApexValidationCategory(doc.validationInfo.unitsQuantity, null),
			created_at: transactionDate,
			device_id: doc.operatorInfo.deviceID,
			event_type: doc.validationInfo.eventType,
			is_ok: validateIfSimplifiedApexValidationIsOk(txEntity.decodeValue),
			is_ok_pcgi: txEntity.isOK,
			is_passenger: validateIfSimplifiedApexValidationIsPassenger(doc.validationInfo.validationStatus, doc.validationInfo.eventType, null),
			line_id: doc.serviceInfo.lineLongID,
			mac_ase_counter_value: doc.mac.aseCounterValue,
			mac_sam_serial_number: doc.mac.samSerialNumber,
			on_board_refund_id: null,
			on_board_sale_id: null,
			pattern_id: doc.serviceInfo.patternLongID,
			product_id: doc.validationInfo.productLongID,
			received_at: Dates.fromISO(txEntity.createdAt).unix_timestamp,
			stop_id: doc.serviceInfo.stopLongID,
			trip_id: doc.serviceInfo.journeyID,
			units_qty: doc.validationInfo.unitsQuantity ?? null,
			validation_status: 0,
			// validation_status: doc.validationInfo.validationStatus,
			vehicle_id: doc.serviceInfo.vehicleID,
		};
	} catch (error) {
		console.error(`Error parsing simplified APEX Validation. Transaction ID: "${txEntity._id}"`, error.message);
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

export function getSimplifiedApexValidationCategory(unitsQuantity: null | number | undefined, onBoardSaleId: null | string): SimplifiedApexValidation['category'] {
	// Allow 0 as valid unitsQuantity value
	const hasUnitsQuantityField = !!unitsQuantity || unitsQuantity === 0;
	// Check if onBoardSaleId is present
	const hasOnBoardSaleId = !!onBoardSaleId;
	// Determine category based on the presence of fields
	if (hasUnitsQuantityField) return 'prepaid';
	if (hasOnBoardSaleId) return 'on_board_sale';
	return 'subscription';
}

/* * */

export function validateIfSimplifiedApexValidationIsOk(doc: RawApexValidationV20): boolean {
	if (!doc.validationInfo.productLongID) return true;
	if (!doc.serviceInfo.lineLongID) return true;
	if (!doc.serviceInfo.patternLongID) return true;
	if (!doc.serviceInfo.stopLongID) return true;
	if (!doc.cardInfo.cardSerialNumber) return true;
	if (!doc.mac.aseCounterValue) return true;
	if (!doc.mac.samSerialNumber) return true;
	if (!doc.operatorInfo.deviceID) return true;
	return true;
}
