/* * */

import { type AggregationPipeline } from '@tmlmobilidade/go-clients-mongo';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { authProvider } from '@tmlmobilidade/go-providers-auth';
import { type ExtractionTaskContext, type ExtractionTaskResult, type OperationAlertsV1Extraction, OperationAlertsV1ExtractionPropertiesSchema } from '@tmlmobilidade/go-types-extractions';
import { type Alert, type AlertReferenceType } from '@tmlmobilidade/go-types-operation';
import { filterPermissionResourceValues, hasPermission, PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { BatchWriter } from '@tmlmobilidade/go-utils-exec';
import { normalizeString } from '@tmlmobilidade/strings';
import { stringify as csvStringify } from 'csv-stringify/sync';
import fs from 'node:fs';
import path from 'node:path';

import { type OperationAlertsV1OutputRow, OperationAlertsV1OutputRowSchema } from './types.js';

/**
 * Exports the permitted alerts matching the filters to a CSV file.
 * @param context The extraction task context.
 * @param extraction The extraction to run.
 */
export async function extractOperationAlertsV1(context: ExtractionTaskContext, extraction: OperationAlertsV1Extraction): Promise<ExtractionTaskResult> {
	//

	const validatedProperties = OperationAlertsV1ExtractionPropertiesSchema.parse(extraction.properties);

	//
	// Adjust properties to match user permissions

	const userPermissions = await authProvider.getPermissionsFromUserId(extraction.created_by);

	const hasReadPermission = hasPermission(userPermissions, {
		action: PermissionCatalog.all.alerts.actions.read,
		scope: PermissionCatalog.all.alerts.scope,
	});

	if (!hasReadPermission) throw new Error('User does not have permission to read alerts');

	validatedProperties.agency_ids = filterPermissionResourceValues<string>({
		action: PermissionCatalog.all.alerts.actions.read,
		permissions: userPermissions,
		resourceKey: 'agency_ids',
		scope: PermissionCatalog.all.alerts.scope,
		values: validatedProperties.agency_ids,
	});

	validatedProperties.reference_type = filterPermissionResourceValues<AlertReferenceType>({
		action: PermissionCatalog.all.alerts.actions.read,
		permissions: userPermissions,
		resourceKey: 'reference_types',
		scope: PermissionCatalog.all.alerts.scope,
		values: validatedProperties.reference_type,
	});

	//
	// Build aggregation pipeline

	const activePeriodFilter = {
		...(validatedProperties.active_period_filter_start !== undefined ? { $gte: validatedProperties.active_period_filter_start } : {}),
		...(validatedProperties.active_period_filter_end !== undefined ? { $lte: validatedProperties.active_period_filter_end } : {}),
	};

	const pipeline: AggregationPipeline<Alert> = [
		{
			$match: {
				agency_id: { $in: validatedProperties.agency_ids },
				cause: { $in: validatedProperties.causes },
				effect: { $in: validatedProperties.effects },
				publish_start_date: {
					$gte: validatedProperties.publish_date_filter_start,
					$lte: validatedProperties.publish_date_filter_end,
				},
				publish_status: { $in: validatedProperties.publish_status },
				reference_type: { $in: validatedProperties.reference_type },
				...(Object.keys(activePeriodFilter).length ? { active_period_start_date: activePeriodFilter } : {}),
			},
		},
		{ $sort: { created_at: -1 } },
	];

	const aggregationResult = await goDb.operation.alerts.aggregate(pipeline);

	//
	// Prepare the CSV file and batch writer

	const columns = [
		'_id',
		'agency_id',
		'title',
		'description',
		'publish_status',
		'cause',
		'effect',
		'reference_type',
		'active_period_start_date',
		'active_period_end_date',
		'publish_start_date',
		'publish_end_date',
		'references',
		'municipality_ids',
		'coordinates',
		'info_url',
		'external_id',
		'file_id',
		'created_at',
		'created_by',
		'updated_at',
		'updated_by',
	] satisfies (keyof OperationAlertsV1OutputRow)[];

	const fileName = `operation-alerts-v1-${extraction._id}.csv`;
	const filePath = path.join(context.output_path, fileName);
	const csvHeader = csvStringify([], { columns, header: true });

	fs.writeFileSync(filePath, csvHeader, { encoding: 'utf-8', flush: true });

	const writer = new BatchWriter<OperationAlertsV1OutputRow>({
		batch_size: 100_000,
		insertFn: async (outputRows) => {
			const csvData = csvStringify(outputRows, { columns, header: false });
			fs.appendFileSync(filePath, csvData, { encoding: 'utf-8', flush: true });
		},
		max_retries: 0,
		title: 'operation_alerts_v1',
	});

	//
	// Parse the aggregation result into CSV

	const normalizedSearch = normalizeString(validatedProperties.search ?? '');

	for (const foundAlert of aggregationResult) {
		//

		//
		// Apply the same normalized search as the Alerts list

		if (normalizedSearch) {
			const normalizedAlertId = normalizeString(foundAlert._id);
			const normalizedTitle = normalizeString(foundAlert.title);
			const matchesSearch = normalizedAlertId.includes(normalizedSearch) || normalizedTitle.includes(normalizedSearch);

			if (!matchesSearch) continue;
		}

		//
		// Format the output row

		const outputRow: OperationAlertsV1OutputRow = {
			_id: foundAlert._id,
			active_period_end_date: foundAlert.active_period_end_date ? new Date(foundAlert.active_period_end_date).toISOString() : '',
			active_period_start_date: new Date(foundAlert.active_period_start_date).toISOString(),
			agency_id: foundAlert.agency_id,
			cause: foundAlert.cause,
			coordinates: foundAlert.coordinates ? JSON.stringify(foundAlert.coordinates) : '',
			created_at: new Date(foundAlert.created_at).toISOString(),
			created_by: foundAlert.created_by,
			description: foundAlert.description,
			effect: foundAlert.effect,
			external_id: foundAlert.external_id ?? '',
			file_id: foundAlert.file_id ?? '',
			info_url: foundAlert.info_url ?? '',
			municipality_ids: (foundAlert.municipality_ids ?? []).join('|'),
			publish_end_date: foundAlert.publish_end_date ? new Date(foundAlert.publish_end_date).toISOString() : '',
			publish_start_date: foundAlert.publish_start_date ? new Date(foundAlert.publish_start_date).toISOString() : '',
			publish_status: foundAlert.publish_status,
			reference_type: foundAlert.reference_type,
			references: JSON.stringify(foundAlert.references ?? []),
			title: foundAlert.title,
			updated_at: new Date(foundAlert.updated_at).toISOString(),
			updated_by: foundAlert.updated_by ?? '',
		};

		const validatedOutputRow = OperationAlertsV1OutputRowSchema.parse(outputRow);

		await writer.write(validatedOutputRow);
	}

	await writer.flush();
}
