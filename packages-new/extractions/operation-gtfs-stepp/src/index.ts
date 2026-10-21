/* * */

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { authProvider } from '@tmlmobilidade/go-providers-auth';
import { storageProvider } from '@tmlmobilidade/go-providers-storage';
import { type ExtractionTaskContext, type ExtractionTaskResult, type OperationGtfsSteppV1Extraction, OperationGtfsSteppV1ExtractionPropertiesSchema } from '@tmlmobilidade/go-types-extractions';
import { filterPermissionResourceValues } from '@tmlmobilidade/go-types-permissions';
import { OperationalDateIntSchema } from '@tmlmobilidade/go-types-shared';
import { unzipFile } from '@tmlmobilidade/go-utils-exec';
import { Logger } from '@tmlmobilidade/go-utils-telemetry';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';

import { exportPlanGtfs } from './main.js';
import { createSteppWriters } from './writers.js';

/* * */

/** Extracts a merged STePP feed from the agency's Operation plans active in the date range. */
export async function extractOperationGtfsSteppV1(context: ExtractionTaskContext, extraction: OperationGtfsSteppV1Extraction): Promise<ExtractionTaskResult> {
	const properties = OperationGtfsSteppV1ExtractionPropertiesSchema.parse(extraction.properties);
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

	if (!plans.length) throw new Error('No normalized Operation plans are available for this agency and date range');

	const agency = await goDb.core.agencies.findById(agencyId);
	if (!agency) throw new Error(`Agency "${agencyId}" was not found`);

	const writers = await createSteppWriters(context.output_path);
	const sharedRows = new Map<string, string>();
	let exportedTrips = 0;

	for (const plan of plans) {
		const attachmentId = plan.attachments.operation_gtfs_normalized;
		if (!attachmentId) throw new Error(`Plan "${plan._id}" has no normalized Operation GTFS attachment`);
		// Source downloads are kept outside the worker's ZIP output and always removed.
		const workdir = fs.mkdtempSync(path.join(os.tmpdir(), 'operation-gtfs-stepp-'));
		try {
			const url = await storageProvider.getSignedUrl({ fileId: attachmentId });
			const response = await fetch(url);
			if (!response.ok || !response.body) throw new Error(`Cannot download plan "${plan._id}" GTFS (HTTP ${response.status})`);
			const zipPath = path.join(workdir, 'source.zip');
			await pipeline(Readable.fromWeb(response.body), fs.createWriteStream(zipPath));
			const sourceDirectory = path.join(workdir, 'source');
			await unzipFile(zipPath, sourceDirectory);

			exportedTrips += await exportPlanGtfs({
				agencyCode: agency.code,
				endDate: String(Math.min(Number(properties.end_date), plan.active_until)),
				namespaceIds: plans.length > 1,
				planId: plan._id,
				sharedRows,
				sourceDirectory,
				startDate: String(Math.max(Number(properties.start_date), plan.active_from)),
				writers,
			});
			Logger.success(`Exported Operation plan "${plan._id}" to STePP`);
		} finally {
			fs.rmSync(workdir, { force: true, recursive: true });
		}
	}

	if (!exportedTrips) throw new Error('The matching plans contain no trips operating in the requested date range');
	for (const writer of Object.values(writers)) await writer.close();
}
