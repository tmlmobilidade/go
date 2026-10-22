/* * */

import { type Alert } from '@tmlmobilidade/go-types-operation';

import { type OperationAlertsV1OutputRow } from './types.js';

/**
 * Converts an alert into a CSV output row.
 * @param alert The alert selected for export.
 * @returns The alert fields formatted for CSV serialization.
 */
export function parseAlertsExtraction(alert: Alert): OperationAlertsV1OutputRow {
	//

	//
	// Format dates as UTC ISO 8601 strings, leaving absent optional dates empty

	const formattedActivePeriodStartDate = new Date(alert.active_period_start_date).toISOString();
	const formattedActivePeriodEndDate = alert.active_period_end_date ? new Date(alert.active_period_end_date).toISOString() : '';
	const formattedPublishStartDate = alert.publish_start_date ? new Date(alert.publish_start_date).toISOString() : '';
	const formattedPublishEndDate = alert.publish_end_date ? new Date(alert.publish_end_date).toISOString() : '';
	const formattedCreatedAt = new Date(alert.created_at).toISOString();
	const formattedUpdatedAt = new Date(alert.updated_at).toISOString();

	//
	// Preserve the reference hierarchy and stored coordinate order as JSON.
	// Separate municipality IDs with "|" in a single CSV cell.

	const formattedReferences = JSON.stringify(alert.references ?? []);
	const formattedMunicipalityIds = (alert.municipality_ids ?? []).join('|');
	const formattedCoordinates = alert.coordinates ? JSON.stringify(alert.coordinates) : '';

	//
	// Build the output row

	return {
		_id: alert._id,
		active_period_end_date: formattedActivePeriodEndDate,
		active_period_start_date: formattedActivePeriodStartDate,
		agency_id: alert.agency_id,
		cause: alert.cause,
		coordinates: formattedCoordinates,
		created_at: formattedCreatedAt,
		created_by: alert.created_by,
		description: alert.description,
		effect: alert.effect,
		external_id: alert.external_id ?? '',
		file_id: alert.file_id ?? '',
		info_url: alert.info_url ?? '',
		municipality_ids: formattedMunicipalityIds,
		publish_end_date: formattedPublishEndDate,
		publish_start_date: formattedPublishStartDate,
		publish_status: alert.publish_status,
		reference_type: alert.reference_type,
		references: formattedReferences,
		title: alert.title,
		updated_at: formattedUpdatedAt,
		updated_by: alert.updated_by ?? '',
	};
}
