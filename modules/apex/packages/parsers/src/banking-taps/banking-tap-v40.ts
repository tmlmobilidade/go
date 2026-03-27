/* * */

import { getEarliestDate } from '@tmlmobilidade/consts';
import { Dates } from '@tmlmobilidade/dates';
import { type RawApexTransactionBankingTapV40, type SimplifiedApexBankingTap } from '@tmlmobilidade/types';

/* * */

export function parseRawApexTransactionBankingTapV40(doc: RawApexTransactionBankingTapV40): null | SimplifiedApexBankingTap {
	try {
		//

		//
		// Validate the document structure and content

		if (!doc.payload.operatorInfo.operatorLongID) throw new Error('Missing operatorLongID in transaction.');

		//
		// Evaluate the transaction date and ensure it is not before the set earliest date

		if (!doc.payload.transactionInfo.transactionDate) throw new Error('Missing transactionDate in transaction.');

		const earliestTransactionDate = getEarliestDate();

		const transactionDate = Dates
			.fromISO(doc.payload.transactionInfo.transactionDate)
			.setZone('Europe/Lisbon', 'rebase_utc')
			.unix_timestamp;

		if (transactionDate < earliestTransactionDate.unix_timestamp) throw new Error(`Transaction date "${doc.payload.transactionInfo.transactionDate}" is before the earliest allowed date "${earliestTransactionDate.operational_date}".`);

		//
		// Parse the document and return the simplified APEX object

		return {
			_id: doc.payload.transactionInfo.transactionId,
			agency_id: doc.payload.operatorInfo.operatorLongID,
			apex_version: doc.payload.versionInfo.apexVersion,
			banking_token: '',
			card_brand: 0,
			card_pan: '',
			created_at: transactionDate,
			device_id: doc.payload.operatorInfo.deviceID,
			event_type: null,
			is_ok: validateIfSimplifiedApexValidationIsOk(doc.payload),
			is_ok_pcgi: doc.is_ok,
			line_id: doc.payload.serviceInfo.lineLongID,
			mac_ase_counter_value: doc.payload.mac.aseCounterValue,
			mac_sam_serial_number: doc.payload.mac.samSerialNumber,
			pattern_id: doc.payload.serviceInfo.patternLongID,
			product_id: doc.payload.tapInInfo.productLongID,
			received_at: doc.created_at,
			stop_id: doc.payload.serviceInfo.stopLongID,
			trip_id: doc.payload.serviceInfo.journeyID,
			units_qty: doc.payload.tapInInfo.groupDimension,
			vehicle_id: doc.payload.serviceInfo.vehicleID,
		};
	} catch (error) {
		console.error(`Error parsing simplified APEX Validation. Transaction ID: "${doc.payload.transactionInfo.transactionId}"`, error.message);
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
