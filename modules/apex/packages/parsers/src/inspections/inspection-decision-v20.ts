/* * */

import { getEarliestDate } from '@tmlmobilidade/consts';
import { Dates } from '@tmlmobilidade/dates';
import { type RawApexTransactionInspectionDecisionV20, type SimplifiedApexInspectionDecision } from '@tmlmobilidade/types';

/* * */

export function parseRawApexTransactionInspectionDecisionV20(doc: RawApexTransactionInspectionDecisionV20): null | SimplifiedApexInspectionDecision {
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
			created_at: transactionDate,
			device_id: doc.payload.operatorInfo.deviceID,
			final_control_status: doc.payload.controlAckInfo.finalControlStatus,
			inspection_decision_id: doc.payload.controlAckInfo.corrControlTransactionID,
			is_ok: false,
			is_ok_pcgi: doc.is_ok,
			mac_ase_counter_value: doc.payload.mac.aseCounterValue,
			mac_sam_serial_number: doc.payload.mac.samSerialNumber,
			received_at: doc.created_at,
		};
	} catch (error) {
		console.error(`Error parsing simplified APEX Validation. Transaction ID: "${doc.payload.transactionInfo.transactionId}"`, error.message);
		return null;
	}
}
