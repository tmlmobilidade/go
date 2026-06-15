/* * */

import { getEarliestDate } from '@tmlmobilidade/consts';
import { Dates } from '@tmlmobilidade/dates';
import { type RawApexTransactionRefundV30, type SimplifiedApexOnBoardRefund } from '@tmlmobilidade/go-types-apex';

/* * */

export function parseRawApexTransactionRefundV30(doc: RawApexTransactionRefundV30): null | SimplifiedApexOnBoardRefund {
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
			block_id: '',
			card_physical_type: doc.payload.cardInfo.cardPhysicalType,
			card_serial_number: doc.payload.cardInfo.cardSerialNumber,
			created_at: transactionDate,
			device_id: doc.payload.operatorInfo.deviceID,
			duty_id: '',
			line_id: '',
			mac_ase_counter_value: doc.payload.mac.aseCounterValue,
			mac_sam_serial_number: doc.payload.mac.samSerialNumber,
			on_board_sale_id: null,
			pattern_id: '',
			payment_method: 0,
			price: 0,
			product_long_id: '',
			product_quantity: 0,
			received_at: doc.created_at,
			stop_id: '',
			trip_id: '',
			validation_id: '',
			vehicle_id: 0,
		};
	} catch (error) {
		console.error(`Error parsing simplified APEX Refund. Transaction ID: "${doc.payload.transactionInfo.transactionId}"`, error.message);
		return null;
	}
}
