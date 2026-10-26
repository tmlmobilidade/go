/* * */

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { authProvider } from '@tmlmobilidade/go-providers-auth';
import { type ExtractionTaskContext, type ExtractionTaskResult, type OperationGtfsSteppV1Extraction, OperationGtfsSteppV1ExtractionPropertiesSchema } from '@tmlmobilidade/go-types-extractions';
import { filterPermissionResourceValues } from '@tmlmobilidade/go-types-permissions';
import { OperationalDateIntSchema } from '@tmlmobilidade/go-types-shared';
import { Logger, Timer } from '@tmlmobilidade/go-utils-telemetry';

import { writeSharedFiles } from './exports/index.js';
import { withPlanSource } from './fetchers/plan-source.js';
import { exportPlanGtfs } from './main.js';
import { type PlanExportConfig } from './types.js';
import { createSteppWriters } from './utils/writers.js';

/* * */

/**
 * Extracts a merged STePP feed from the agency's Operation plans active in the date range.
 * @param context - The context of the extraction task.
 * @param extraction - The extraction task.
 * @returns The result of the extraction task.
 */
export async function extractOperationGtfsSteppV1(context: ExtractionTaskContext, extraction: OperationGtfsSteppV1Extraction): Promise<ExtractionTaskResult> {
	const properties = OperationGtfsSteppV1ExtractionPropertiesSchema.parse(extraction.properties);
	const timer = new Timer();
	const prefix = `[STePP extraction ${extraction._id}]`;
	Logger.info({
		attributes: { agency_id: properties.agency_id, end_date: properties.end_date, extraction_id: extraction._id, start_date: properties.start_date },
		message: `${prefix} Starting agency ${JSON.stringify(properties.agency_id)}, requested dates ${properties.start_date}–${properties.end_date}.`,
	});
	const permissions = await authProvider.getPermissionsFromUserId(extraction.created_by);
	const [agencyId] = filterPermissionResourceValues<string>({
		action: 'read',
		permissions,
		resourceKey: 'agency_ids',
		scope: 'plans',
		values: [properties.agency_id],
	});
	if (!agencyId) throw new Error(`User "${extraction.created_by}" cannot read plans of agency "${properties.agency_id}"`);

	const plans = await goDb.operation.plans.findMany({
		'active_from': { $lte: OperationalDateIntSchema.parse(properties.end_date) },
		'active_until': { $gte: OperationalDateIntSchema.parse(properties.start_date) },
		'agency_id': agencyId,
		'attachments.operation_gtfs_normalized': { $ne: '', $type: 'string' },
	}, { sort: { active_from: 1 } });

	Logger.info(`${prefix} Found ${plans.length} normalized plans overlapping the requested range.`);
	Logger.info(`${prefix} Repeated IDs use the latest plan by active_from, then created_at, then plan ID.`);
	if (!plans.length) throw new Error('No normalized Operation plans are available for this agency and date range');
	for (const plan of plans) {
		Logger.info({
			attributes: { active_from: plan.active_from, active_until: plan.active_until, attachment_id: plan.attachments.operation_gtfs_normalized, extraction_id: extraction._id, plan_id: plan._id },
			message: `${prefix} Included plan ${JSON.stringify(plan._id)}: active ${plan.active_from}–${plan.active_until}, export ${Math.max(Number(properties.start_date), plan.active_from)}–${Math.min(Number(properties.end_date), plan.active_until)}, normalized attachment ${JSON.stringify(plan.attachments.operation_gtfs_normalized)}.`,
		});
	}

	const agency = await goDb.core.agencies.findById(agencyId);
	if (!agency) throw new Error(`Agency "${agencyId}" was not found`);

	const writers = await createSteppWriters(context.output_path);
	const sharedRows: PlanExportConfig['sharedRows'] = new Map();
	let exportedTrips = 0;

	for (const [planIndex, plan] of plans.entries()) {
		const attachmentId = plan.attachments.operation_gtfs_normalized;
		if (!attachmentId) throw new Error(`Plan "${plan._id}" has no normalized Operation GTFS attachment`);
		const planTimer = new Timer();
		const planPrefix = `${prefix}[plan ${plan._id}, ${planIndex + 1}/${plans.length}]`;
		const planTrips = await withPlanSource({ attachmentId, extractionId: extraction._id, planId: plan._id, planPrefix, timer: planTimer }, async (sourceDirectory) => {
			return exportPlanGtfs({
				agencyCode: agency.code,
				endDate: String(Math.min(Number(properties.end_date), plan.active_until)),
				planActiveFrom: plan.active_from,
				planCreatedAt: plan.created_at,
				planId: plan._id,
				sharedRows,
				sourceDirectory,
				startDate: String(Math.max(Number(properties.start_date), plan.active_from)),
				writers,
			});
		});
		exportedTrips += planTrips;
		Logger.success(`${planPrefix} Finished in ${planTimer.get()}: ${planTrips} trips from this plan, ${exportedTrips} trips so far.`);
	}

	if (!exportedTrips) throw new Error('The matching plans contain no trips operating in the requested date range');
	Logger.info(`${prefix} Writing final definitions and calendars with original IDs and latest-plan precedence...`);
	const mergedTrips = await writeSharedFiles(sharedRows, writers);
	if (!mergedTrips) throw new Error('The merged plans contain no trips operating in the requested date range');
	Logger.info(`${prefix} Flushing ${Object.keys(writers).length} output files...`);
	for (const writer of Object.values(writers)) await writer.close();
	Logger.success(`${prefix} Prepared ${Object.keys(writers).length} files and ${mergedTrips} trips from ${plans.length} plans in ${timer.get()}. Ready for the worker to ZIP and upload.`);
}
