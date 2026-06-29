import { type Alert, type AlertExportData } from '@tmlmobilidade/types';

export type AlertExportCsvData = AlertExportData;

/**
 * The ordered fields of the alerts of the vehicle export CSV data.
 * The order is important because it determines the order of the fields in the CSV file.
 */
export const ALERT_EXPORT_ORDERED_FIELDS = [
// GENERAL
	'_id',
	'agency_id',
	'auto_texts',
	'cause',
	'coordinates',
	'description',
	'effect',
	'external_id',
	'file_id',
	'info_url',
	'is_locked',
	'municipality_ids',
	'title',
	'user_instructions',

	// PUBLISH
	'publish_end_date',
	'publish_start_date',
	'publish_status',

	// REFERENCE
	'reference_type',
	'references',

	// DATES
	'active_period_end_date',
	'active_period_start_date',

	// CREATION AND UPDATE
	'created_at',
	'created_by',
	'updated_at',
	'updated_by',
] as const satisfies ReadonlyArray<keyof AlertExportCsvData>;

/***/

interface ParseAlertRow {
	_id?: null | string
	alert: Alert
}

function toOrderedCsvData(source: AlertExportCsvData): AlertExportCsvData {
	const orderedEntries = ALERT_EXPORT_ORDERED_FIELDS.map(field => [field, source[field]] as const);
	return Object.fromEntries(orderedEntries) as AlertExportCsvData;
}

/***/

export function parseAlerts(row: ParseAlertRow): AlertExportCsvData {
	const { _id, alert } = row;

	return toOrderedCsvData({
		_id: _id ?? alert._id,
		active_period_end_date: alert.active_period_end_date,
		active_period_start_date: alert.active_period_start_date,
		agency_id: alert.agency_id,
		auto_texts: alert.auto_texts,
		cause: alert.cause,
		coordinates: alert.coordinates,
		created_at: alert.created_at,
		created_by: alert.created_by,
		description: alert.description,
		effect: alert.effect,
		external_id: alert.external_id,
		file_id: alert.file_id,
		info_url: alert.info_url,
		is_locked: alert.is_locked,
		municipality_ids: alert.municipality_ids,
		publish_end_date: alert.publish_end_date,
		publish_start_date: alert.publish_start_date,
		publish_status: alert.publish_status,
		reference_type: alert.reference_type,
		references: alert.references,
		title: alert.title,
		updated_at: alert.updated_at,
		updated_by: alert.updated_by,
		user_instructions: alert.user_instructions,
	});
}
