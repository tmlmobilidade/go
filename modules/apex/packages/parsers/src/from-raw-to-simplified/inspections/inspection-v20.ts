/* * */

import { Dates } from '@tmlmobilidade/dates';
import { type RawApexTransactionInspectionV20, type SimplifiedApexInspection, SimplifiedApexInspectionSchema } from '@tmlmobilidade/go-types-apex';
import { toUInt64 } from '@tmlmobilidade/utils';

/* * */

export function parseRawApexTransactionInspectionV20IntoSimplifiedApexInspection(doc: RawApexTransactionInspectionV20): null | SimplifiedApexInspection {
	//

	//
	// Prepare the date field values

	const transactionDateValue = Dates
		.fromISO(doc.payload.transactionInfo.transactionDate)
		.setZone('Europe/Lisbon', 'rebase_utc');

	//
	// Validate the document structure and content

	const result: SimplifiedApexInspection = {
		_id: doc.payload.transactionInfo.transactionId,
		agency_id: doc.payload.operatorInfo.operatorLongID,
		apex_version: doc.payload.versionInfo.apexVersion,
		calendar_date: transactionDateValue.calendar_date,
		card_serial_number: toUInt64(doc.payload.cardInfo.cardSerialNumber),
		control_destination_stop_id: doc.payload.controlServiceInfo.controlDestinationStopLongID,
		control_origin_stop_id: doc.payload.controlServiceInfo.controlOriginStopLongID,
		control_status: doc.payload.controlInfo.controlStatus,
		created_at: transactionDateValue.unix_timestamp,
		device_id: doc.payload.operatorInfo.deviceID,
		environment_status: doc.payload.controlInfo.environmentStatus,
		inspection_id: null,
		is_ok: false,
		is_ok_pcgi: false,
		line_id: doc.payload.controlServiceInfo.lineLongID,
		mac_ase_counter_value: doc.payload.mac.aseCounterValue,
		mac_sam_serial_number: doc.payload.mac.samSerialNumber,
		pattern_id: doc.payload.controlServiceInfo.patternLongID,
		product_id: doc.payload.controlInfo.productLongID,
		received_at: doc.received_at,
		trip_id: doc.payload.controlServiceInfo.journeyID,
		updated_at: Dates.now('Europe/Lisbon').unix_timestamp,
		vehicle_id: doc.payload.controlServiceInfo.vehicleID,
	};

	return SimplifiedApexInspectionSchema.parse(result);
}
