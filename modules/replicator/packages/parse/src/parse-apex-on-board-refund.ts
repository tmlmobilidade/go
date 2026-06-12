/* * */

import { Dates } from '@tmlmobilidade/dates';
import { getEarliestDate } from '@tmlmobilidade/go-replicator-pckg-sync';
import { type SimplifiedApexOnBoardRefund } from '@tmlmobilidade/go-types-apex';

/* * */

const ALLOWED_OPERATOR_LONG_IDS = ['41', '42', '43', '44'];

const ALLOWED_APEX_TRANSACTION_VERSIONS = ['2.0', '3.0'];

const ALLOWED_APEX_TRANSACTION_TYPES = [6]; // Refund Transaction

const ALLOWED_CARD_PHYSICAL_TYPES = [28]; // OnBoard Transaction

/* * */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseSimplifiedApexOnBoardRefund(pcgiDoc: any): null | SimplifiedApexOnBoardRefund {
	try {
		//

		//
		// Validate the document structure and content

		if (!pcgiDoc?.transaction) throw new Error('Missing transaction in document.');

		if (!pcgiDoc.transaction?.operatorLongID) throw new Error('Missing operatorLongID in transaction.');

		if (!ALLOWED_OPERATOR_LONG_IDS.includes(pcgiDoc.transaction.operatorLongID)) throw new Error(`Invalid operatorLongID: "${pcgiDoc.transaction.operatorLongID}"`);

		if (!ALLOWED_APEX_TRANSACTION_VERSIONS.includes(pcgiDoc.transaction.apexTransactionVersion)) throw new Error(`Invalid apexTransactionVersion: "${pcgiDoc.transaction.apexTransactionVersion}"`);

		if (!ALLOWED_APEX_TRANSACTION_TYPES.includes(pcgiDoc.transaction.apexTransactionType)) throw new Error(`Invalid apexTransactionType: "${pcgiDoc.transaction.apexTransactionType}"`);

		if (!ALLOWED_CARD_PHYSICAL_TYPES.includes(pcgiDoc.transaction.cardPhysicalType)) throw new Error(`Invalid cardPhysicalType: "${pcgiDoc.transaction.cardPhysicalType}"`);

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
