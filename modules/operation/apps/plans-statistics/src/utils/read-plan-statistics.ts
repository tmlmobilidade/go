/* * */

import { storageProvider } from '@tmlmobilidade/go-providers-storage';
import { type PlanStatistics } from '@tmlmobilidade/go-types-operation';
import { unzipFile } from '@tmlmobilidade/go-utils-zip';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';

import { calculatePlanStatistics } from './calculate-plan-statistics.js';

/* * */

/** Downloads the normalized GTFS, counts its trips, and removes temporary files. */
export async function readPlanStatistics(fileId: string): Promise<PlanStatistics> {
	const temporaryDirectory = fs.mkdtempDisposableSync(path.join(os.tmpdir(), 'plan-statistics-'));

	try {
		const zipPath = path.join(temporaryDirectory.path, 'gtfs.zip');
		const extractedPath = path.join(temporaryDirectory.path, 'extracted');
		const url = await storageProvider.getSignedUrl({ fileId });
		const response = await fetch(url);

		if (!response.ok || !response.body) {
			throw new Error(`Failed to download plan GTFS: HTTP ${response.status}.`);
		}

		await pipeline(response.body, fs.createWriteStream(zipPath));
		await unzipFile(zipPath, extractedPath);

		return await calculatePlanStatistics(path.join(extractedPath, 'trips.txt'));
	} finally {
		temporaryDirectory.remove();
	}
}
