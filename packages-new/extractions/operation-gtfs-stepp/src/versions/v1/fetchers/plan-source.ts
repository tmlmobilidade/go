/* * */

import { storageProvider } from '@tmlmobilidade/go-providers-storage';
import { unzipFile } from '@tmlmobilidade/go-utils-exec';
import { Logger, Timer } from '@tmlmobilidade/go-utils-telemetry';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';

/* * */

/** Download a normalized plan, process its CSVs, and always remove the source workspace. */
export async function withPlanSource<T>(
	config: { attachmentId: string, extractionId: string, planId: string, planPrefix: string, timer: Timer },
	callback: (sourceDirectory: string) => Promise<T>,
): Promise<T> {
	const { attachmentId, extractionId, planId, planPrefix, timer } = config;
	const stageTimer = new Timer();
	let stage = 'download';
	// Source downloads are kept outside the worker's ZIP output and always removed.
	const workdir = fs.mkdtempSync(path.join(os.tmpdir(), 'operation-gtfs-stepp-'));
	try {
		Logger.info(`${planPrefix} Downloading normalized attachment ${JSON.stringify(attachmentId)}...`);
		const url = await storageProvider.getSignedUrl({ fileId: attachmentId });
		const response = await fetch(url);
		if (!response.ok || !response.body) throw new Error(`Cannot download plan "${planId}" GTFS (HTTP ${response.status})`);
		const zipPath = path.join(workdir, 'source.zip');
		await pipeline(response.body, fs.createWriteStream(zipPath));
		Logger.info(`${planPrefix} Downloaded ${fs.statSync(zipPath).size} bytes in ${stageTimer.get(true)}.`);
		stage = 'unzip';
		const sourceDirectory = path.join(workdir, 'source');
		Logger.info(`${planPrefix} Unzipping GTFS...`);
		await unzipFile(zipPath, sourceDirectory);
		Logger.info(`${planPrefix} Unzipped GTFS in ${stageTimer.get(true)}. Source files: ${fs.readdirSync(sourceDirectory).sort().join(', ')}.`);

		stage = 'convert and merge';
		return await callback(sourceDirectory);
	} catch (error) {
		Logger.error({
			attributes: { attachment_id: attachmentId, duration_ms: timer.getMs(), extraction_id: extractionId, plan_id: planId, stage },
			message: `${planPrefix} Failed during ${stage} after ${timer.get()}: ${error instanceof Error ? error.message : error}`,
		});
		throw error;
	} finally {
		fs.rmSync(workdir, { force: true, recursive: true });
	}
}
