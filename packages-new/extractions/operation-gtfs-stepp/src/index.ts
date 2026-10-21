/* * */

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { authProvider } from '@tmlmobilidade/go-providers-auth';
import { storageProvider } from '@tmlmobilidade/go-providers-storage';
import { type ExtractionTaskContext, type ExtractionTaskResult, type OperationGtfsSteppV1Extraction, OperationGtfsSteppV1ExtractionPropertiesSchema } from '@tmlmobilidade/go-types-extractions';
import { filterPermissionResourceValues } from '@tmlmobilidade/go-types-permissions';
import { OperationalDateIntSchema } from '@tmlmobilidade/go-types-shared';
import { unzipFile } from '@tmlmobilidade/go-utils-exec';
import { Logger, Timer } from '@tmlmobilidade/go-utils-telemetry';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';

import { exportPlanGtfs, type PlanExportConfig, writeSharedFiles } from './main.js';
import { createSteppWriters } from './writers.js';

/* * */

/** Extracts a merged STePP feed from the agency's Operation plans active in the date range. */
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
	Logger.info(`${prefix} Route and stop names use the latest plan by active_from, then created_at, then plan ID.`);
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
		const stageTimer = new Timer();
		const planPrefix = `${prefix}[plan ${plan._id}, ${planIndex + 1}/${plans.length}]`;
		let stage = 'download';
		// Source downloads are kept outside the worker's ZIP output and always removed.
		const workdir = fs.mkdtempSync(path.join(os.tmpdir(), 'operation-gtfs-stepp-'));
		try {
			Logger.info(`${planPrefix} Downloading normalized attachment ${JSON.stringify(attachmentId)}...`);
			const url = await storageProvider.getSignedUrl({ fileId: attachmentId });
			const response = await fetch(url);
			if (!response.ok || !response.body) throw new Error(`Cannot download plan "${plan._id}" GTFS (HTTP ${response.status})`);
			const zipPath = path.join(workdir, 'source.zip');
			await pipeline(Readable.fromWeb(response.body), fs.createWriteStream(zipPath));
			Logger.info(`${planPrefix} Downloaded ${fs.statSync(zipPath).size} bytes in ${stageTimer.get(true)}.`);
			stage = 'unzip';
			const sourceDirectory = path.join(workdir, 'source');
			Logger.info(`${planPrefix} Unzipping GTFS...`);
			await unzipFile(zipPath, sourceDirectory);
			Logger.info(`${planPrefix} Unzipped GTFS in ${stageTimer.get(true)}. Source files: ${fs.readdirSync(sourceDirectory).sort().join(', ')}.`);

			stage = 'convert and merge';
			const planTrips = await exportPlanGtfs({
				agencyCode: agency.code,
				endDate: String(Math.min(Number(properties.end_date), plan.active_until)),
				namespaceIds: plans.length > 1,
				planActiveFrom: plan.active_from,
				planCreatedAt: plan.created_at,
				planId: plan._id,
				sharedRows,
				sourceDirectory,
				startDate: String(Math.max(Number(properties.start_date), plan.active_from)),
				writers,
			});
			exportedTrips += planTrips;
			Logger.success(`${planPrefix} Finished in ${planTimer.get()}: ${planTrips} trips from this plan, ${exportedTrips} trips so far.`);
		} catch (error) {
			Logger.error({
				attributes: { attachment_id: attachmentId, duration_ms: planTimer.getMs(), extraction_id: extraction._id, plan_id: plan._id, stage },
				message: `${planPrefix} Failed during ${stage} after ${planTimer.get()}: ${error instanceof Error ? error.message : error}`,
			});
			throw error;
		} finally {
			fs.rmSync(workdir, { force: true, recursive: true });
		}
	}

	if (!exportedTrips) throw new Error('The matching plans contain no trips operating in the requested date range');
	Logger.info(`${prefix} Writing the final agency, route and stop definitions with the latest names...`);
	await writeSharedFiles(sharedRows, writers);
	Logger.info(`${prefix} Flushing ${Object.keys(writers).length} output files...`);
	for (const writer of Object.values(writers)) await writer.close();
	Logger.success(`${prefix} Prepared ${Object.keys(writers).length} files and ${exportedTrips} trips from ${plans.length} plans in ${timer.get()}. Ready for the worker to ZIP and upload.`);
}
