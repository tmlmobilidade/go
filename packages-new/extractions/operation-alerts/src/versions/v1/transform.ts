/* * */

import { type Alert, AlertReferenceSchema, AlertSchema } from '@tmlmobilidade/go-types-operation';
import { z } from 'zod';

import { type OperationAlertsV1OutputRowInput } from './types.js';

/* * */

// Keep valid reference IDs even when another part of a historical reference is missing.
const AlertReferencesForCsvSchema = z.array(AlertReferenceSchema.extend({
	child_ids: z.array(z.string().catch('')).catch([]),
	parent_id: z.string().catch(''),
}).catch({ child_ids: [], parent_id: '' })).catch([]);

/**
 * Formats a valid alert timestamp as UTC ISO 8601, leaving missing or invalid dates empty.
 * @param value The stored timestamp, before validation.
 * @returns The ISO date or an empty CSV cell.
 */
function formatAlertTimestamp(value: unknown): string {
	try {
		const validatedTimestamp = AlertSchema.shape.created_at.parse(value);
		return new Date(validatedTimestamp).toISOString();
	} catch {
		return '';
	}
}

/**
 * Converts an alert into a CSV output row.
 * @param alert The stored alert, which can contain missing or invalid historical fields.
 * @returns The formatted fields, ready for validation of each CSV cell.
 */
export function parseAlertsExtraction(alert: Partial<Alert>): OperationAlertsV1OutputRowInput {
	//

	//
	// Format dates independently so one missing or invalid timestamp cannot fail the export.

	const formattedActivePeriodStartDate = formatAlertTimestamp(alert.active_period_start_date);
	const formattedActivePeriodEndDate = formatAlertTimestamp(alert.active_period_end_date);
	const formattedPublishStartDate = formatAlertTimestamp(alert.publish_start_date);
	const formattedPublishEndDate = formatAlertTimestamp(alert.publish_end_date);
	const formattedCreatedAt = formatAlertTimestamp(alert.created_at);
	const formattedUpdatedAt = formatAlertTimestamp(alert.updated_at);

	//
	// Flatten the selected reference IDs into separate line and stop columns.
	// Parent and child IDs swap roles between line and stop alerts.
	// General notices and ride references leave both columns empty.

	const referencedLineIds = new Set<string>();
	const referencedStopIds = new Set<string>();
	const validatedReferences = AlertReferencesForCsvSchema.parse(alert.references);
	const referenceTypeResult = AlertSchema.shape.reference_type.safeParse(alert.reference_type);
	const validatedReferenceType = referenceTypeResult.success ? referenceTypeResult.data : undefined;

	for (const reference of validatedReferences) {
		if (validatedReferenceType === 'lines') {
			if (reference.parent_id) referencedLineIds.add(reference.parent_id);

			for (const stopId of reference.child_ids) {
				if (stopId) referencedStopIds.add(stopId);
			}
		} else if (validatedReferenceType === 'stops') {
			if (reference.parent_id) referencedStopIds.add(reference.parent_id);

			for (const lineId of reference.child_ids) {
				if (lineId) referencedLineIds.add(lineId);
			}
		}
	}

	// Keep unique IDs in their selected order, separated by "|" within each CSV cell.
	const formattedLines = Array.from(referencedLineIds).join('|');
	const formattedStops = Array.from(referencedStopIds).join('|');

	//
	// Preserve the stored coordinate order as JSON and separate municipality IDs with "|".

	const municipalityIdsResult = AlertSchema.shape.municipality_ids.safeParse(alert.municipality_ids);
	const coordinatesResult = AlertSchema.shape.coordinates.safeParse(alert.coordinates);
	const formattedMunicipalityIds = municipalityIdsResult.success ? municipalityIdsResult.data.join('|') : '';
	const formattedCoordinates = coordinatesResult.success && coordinatesResult.data?.every(Number.isFinite) ? JSON.stringify(coordinatesResult.data) : '';

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
		lines: formattedLines,
		municipality_ids: formattedMunicipalityIds,
		publish_end_date: formattedPublishEndDate,
		publish_start_date: formattedPublishStartDate,
		publish_status: alert.publish_status,
		reference_type: validatedReferenceType,
		stops: formattedStops,
		title: alert.title,
		updated_at: formattedUpdatedAt,
		updated_by: alert.updated_by ?? '',
	};
}
