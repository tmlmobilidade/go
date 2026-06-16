/* * */

import { Dates } from '@tmlmobilidade/dates';
import { type RawApexTransactionInspectionDecisionV20, type SimplifiedApexInspectionDecision, SimplifiedApexInspectionDecisionSchema } from '@tmlmobilidade/go-types-apex';

/* * */

export function parseRawApexTransactionInspectionDecisionV20IntoSimplifiedApexInspectionDecision(doc: RawApexTransactionInspectionDecisionV20): null | SimplifiedApexInspectionDecision {
	//

	//
	// Prepare the date field values

	const transactionDateValue = Dates
		.fromISO(doc.payload.transactionInfo.transactionDate)
		.setZone('Europe/Lisbon', 'rebase_utc');

	//
	// Validate the document structure and content

	const result: SimplifiedApexInspectionDecision = {
		_id: doc.payload.transactionInfo.transactionId,
		agency_id: doc.payload.operatorInfo.operatorLongID,
		apex_version: doc.payload.versionInfo.apexVersion,
		calendar_date: transactionDateValue.calendar_date,
		created_at: transactionDateValue.unix_timestamp,
		device_id: doc.payload.operatorInfo.deviceID,
		final_control_status: doc.payload.controlAckInfo.finalControlStatus,
		inspection_decision_id: doc.payload.controlAckInfo.corrControlTransactionID,
		is_ok: false,
		is_ok_pcgi: doc.is_ok,
		mac_ase_counter_value: doc.payload.mac.aseCounterValue,
		mac_sam_serial_number: doc.payload.mac.samSerialNumber,
		received_at: doc.received_at,
	};

	return SimplifiedApexInspectionDecisionSchema.parse(result);
}
