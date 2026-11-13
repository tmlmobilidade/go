/* * */

import { FileExportDownloadUrlSchema } from '@tmlmobilidade/go-types-downloads';
import { type Plan } from '@tmlmobilidade/go-types-operation';
import { Logger } from '@tmlmobilidade/go-utils-telemetry';
import fs from 'node:fs';
import path from 'node:path';

import { importPlansToSqlite } from './import-plan-to-sqlite.js';
import { type ExportHitouchConfig, type ExportHitouchOptions } from './types/export-hitouch-config.js';
import { generateToken } from './controller/generate-token.js';
import { generatePDF } from './controller/generate-pdf.js';
import { getPDFStatus } from './controller/get-pdf-status.js';

/* * */

const PDF_STATUS_POLL_INTERVAL_MS = 15_000;

/* * */

function waitForNextStatusCheck(): Promise<void> {
	return new Promise(resolve => setTimeout(resolve, PDF_STATUS_POLL_INTERVAL_MS));
}

/* * */

export async function generatePlansPostersDownloadUrl(plans: Plan[], exportId: string, options?: ExportHitouchOptions): Promise<string> {
	//

	//
	// A. setup variables

	let exportConfig: ExportHitouchConfig | undefined;

	//
	// B. import plans to sqlite

	try {
		//


		//
		// 1. Prepare the combined GTFS files

		Logger.info({ message: `Preparing combined GTFS files for poster export ${exportId} (${plans.length} plans).` });
		exportConfig = await importPlansToSqlite(plans, { ...options, workdir: `/tmp/hitouch/export-${exportId}` });

		//
		// 2. Preserve the HiTouch request ZIP file

		const requestZipPath = path.resolve(exportConfig.workdir, exportConfig.output);
		const preservedRequestZipPath = `/tmp/hitouch/export-${exportId}-request.zip`;
		fs.copyFileSync(requestZipPath, preservedRequestZipPath);
		Logger.info({ message: `Preserved HiTouch request ZIP at ${preservedRequestZipPath}.` });

		//
		// 3. Generate a new access token

		await generateToken();

		//
		// 4. Submit the poster GTFS to ZPHERES

		Logger.info({ message: `Submitting poster GTFS for export ${exportId} to ZPHERES.` });
		const pdfId = await generatePDF(exportConfig);
		Logger.info({ message: `Created ZPHERES PDF job ${pdfId} for poster export ${exportId}.` });

		//
		// 5. Wait for the PDF status

		let pdfStatus = await getPDFStatus(pdfId);

		while (pdfStatus.status !== 'done') {
			if (pdfStatus.status === 'error' || pdfStatus.status === 'failed') {
				throw new Error(`PDF job ${pdfId} failed: ${JSON.stringify(pdfStatus).slice(0, 4_000)}. Request ZIP: ${preservedRequestZipPath}`);
			}

			Logger.info({ message: `ZPHERES PDF job ${pdfId} is ${pdfStatus.status}.` });
			await waitForNextStatusCheck();
			pdfStatus = await getPDFStatus(pdfId);
		}

		//
		// 6. Return the download URL

		if (!pdfStatus.downloadLink) {
			throw new Error(`PDF job ${pdfId} completed without a download URL.`);
		}

		//
		// 7. Return the download URL

		const downloadUrl = FileExportDownloadUrlSchema.parse(pdfStatus.downloadLink);
		Logger.info({ message: `Poster export ${exportId} is ready for download from ZPHERES.` });
		return downloadUrl;
	} finally {
		if (exportConfig) {
			fs.rmSync(exportConfig.workdir, { force: true, recursive: true });
			Logger.info({ message: `Cleaned temporary files for poster export ${exportId}.` });
		}
	}
}
