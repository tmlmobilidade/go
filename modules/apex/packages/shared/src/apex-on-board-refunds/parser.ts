/* * */

import { APEX_ON_BOARD_REFUNDS_SETTINGS } from '@/apex-on-board-refunds/settings.js';
import { getEarliestDate } from '@tmlmobilidade/consts';
import { Dates } from '@tmlmobilidade/dates';
import { type SimplifiedApexOnBoardRefund } from '@tmlmobilidade/types';

/* * */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseSimplifiedApexOnBoardRefund(pcgiDoc: any): null | SimplifiedApexOnBoardRefund {
	try {
		//

		//
		// Validate the document structure and content

		if (!pcgiDoc?.transaction) throw new Error('Missing transaction in document.');

		if (!pcgiDoc.transaction?.operatorLongID) throw new Error('Missing operatorLongID in transaction.');

		if (!APEX_ON_BOARD_REFUNDS_SETTINGS.allowed_operator_long_ids.includes(pcgiDoc.transaction.operatorLongID)) throw new Error(`Invalid operatorLongID: "${pcgiDoc.transaction.operatorLongID}"`);

		if (!APEX_ON_BOARD_REFUNDS_SETTINGS.allowed_apex_transaction_versions.includes(pcgiDoc.transaction.apexTransactionVersion)) throw new Error(`Invalid apexTransactionVersion: "${pcgiDoc.transaction.apexTransactionVersion}"`);

		if (pcgiDoc.transaction.apexTransactionType !== APEX_ON_BOARD_REFUNDS_SETTINGS.allowed_apex_transaction_type) throw new Error(`Invalid apexTransactionType: "${pcgiDoc.transaction.apexTransactionType}"`);

		if (pcgiDoc.transaction.cardPhysicalType !== APEX_ON_BOARD_REFUNDS_SETTINGS.allowed_card_physical_type) throw new Error(`Invalid cardPhysicalType: "${pcgiDoc.transaction.cardPhysicalType}"`);

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
			block_id: null,
			card_physical_type: pcgiDoc.transaction.cardPhysicalType,
			card_serial_number: pcgiDoc.transaction.cardSerialNumber,
			created_at: transactionDate,
			device_id: pcgiDoc.transaction.deviceID,
			duty_id: null,
			line_id: null,
			mac_ase_counter_value: pcgiDoc.transaction.macDataFields.aseCounterValue,
			mac_sam_serial_number: pcgiDoc.transaction.macDataFields.samSerialNumber,
			on_board_sale_id: pcgiDoc.transaction.corrTransactionId,
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

		//
	} catch (error) {
		console.error(`Error parsing simplified APEX OnBoardRefund. Transaction ID: "${pcgiDoc.transaction.transactionId}"`, error.message);
		return null;
	}
}
