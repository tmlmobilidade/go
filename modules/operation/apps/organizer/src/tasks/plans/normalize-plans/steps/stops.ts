/* * */

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { BatchWriter, streamCsvFile } from '@tmlmobilidade/go-utils-exec';
import { Logger, Timer } from '@tmlmobilidade/go-utils-telemetry';
import { stringify as csvStringify } from 'csv-stringify/sync';
import fs from 'node:fs';
import path from 'node:path';

import { type NormalizePlansTaskContext } from '../context/init-context.js';

/* * */

interface GtfsStopsRow extends Record<string, string | undefined> {
	stop_id: string
}

/* * */

export async function updateStopsMunicipalityIds(context: NormalizePlansTaskContext): Promise<void> {
	//

	const timer = new Timer();
	const agencyId = context.data.agency._id;

	Logger.info({ message: `[${context.data.plan._id}] Adding municipality IDs to stops.txt...` });

	//
	// Build maps for canonical stop IDs and agency-specific stop IDs.

	const allStopsData = await goDb.infrastructure.stops.findMany({ 'flags.agency_ids': { $in: [agencyId] } });

	const stopIdToMunicipalityId = new Map<string, string>();
	const flagStopIdToMunicipalityId = new Map<string, string>();

	for (const stopData of allStopsData) {
		// Check if the stop has a municipality ID (DICOFRE code)
		if (!stopData.location.secondary?.code) continue;
		// Add the municipality ID to the global ID map
		stopIdToMunicipalityId.set(stopData._id, stopData.location.secondary.code);
		// Add the municipality ID to the flag ID map
		for (const flag of stopData.flags) {
			if (!flag.agency_ids.includes(agencyId)) continue;
			// Only add the municipality ID to the flag ID map if the flag is for the current agency
			flagStopIdToMunicipalityId.set(flag.stop_id, stopData.location.secondary.code);
		}
	}

	//
	// Rewrite stops.txt in batches, preserving the other columns.

	let rowCount = 0;

	const outputFilePath = path.join(context.paths.base_dir_path, 'stops-output.txt');

	const stopsWriter = new BatchWriter<GtfsStopsRow>({
		batch_size: 100_000,
		insertFn: async (data) => {
			const fileAlreadyExists = fs.existsSync(outputFilePath);
			let csvData = csvStringify(data, { header: !fileAlreadyExists });
			if (fileAlreadyExists) csvData = '\n' + csvData;
			fs.appendFileSync(outputFilePath, csvData, { encoding: 'utf-8', flush: true });
		},
		title: 'stops',
	});

	await streamCsvFile<GtfsStopsRow>(
		path.join(context.paths.extracted_dir_path, 'stops.txt'),
		async (data) => {
			const municipalityId = stopIdToMunicipalityId.get(data.stop_id) ?? flagStopIdToMunicipalityId.get(data.stop_id) ?? data.municipality_id ?? '-';
			await stopsWriter.write({ ...data, municipality_id: municipalityId });
			rowCount++;
		},
	);

	await stopsWriter.flush();

	if (rowCount === 0) {
		Logger.info({ message: `[${context.data.plan._id}] stops.txt contains no rows; municipality IDs were not added.` });
		return;
	}

	fs.rmSync(path.join(context.paths.extracted_dir_path, 'stops.txt'), { force: true });
	fs.renameSync(outputFilePath, path.join(context.paths.extracted_dir_path, 'stops.txt'));

	Logger.success({ message: `[${context.data.plan._id}] Added municipality IDs to ${rowCount} stops in ${timer.get()}.` });

	//
}
