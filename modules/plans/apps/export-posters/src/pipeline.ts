/* * */

import { PostersController } from '@/controller/poster.js';
import { importPlanToSqlite } from '@/import-plan-to-sqlite.js';
import { type ExportToHitouchConfig } from '@/types.js';
import { Logger } from '@tmlmobilidade/logger';
import { type Plan } from '@tmlmobilidade/types';
import fs from 'node:fs';

/* * */

const PDF_STATUS_POLL_INTERVAL_MS = 60_000;

/* * */

function waitForNextStatusCheck(): Promise<void> {
	return new Promise(resolve => setTimeout(resolve, PDF_STATUS_POLL_INTERVAL_MS));
}

/* * */

function isZipFile(file: Buffer): boolean {
	return file.length >= 2 && file[0] === 0x50 && file[1] === 0x4b;
}

/* * */

export async function generatePlanPostersZip(planData: Plan, exportId: string): Promise<Buffer> {
	const postersController = new PostersController();
	let exportConfig: ExportToHitouchConfig | undefined;

	try {
		Logger.info({ message: `Preparing GTFS files for poster export ${exportId} (Plan ${planData._id}).` });
		exportConfig = await importPlanToSqlite(planData, { workdir: `/tmp/hitouch/export-${exportId}` });
		Logger.info({ message: `Submitting poster GTFS for export ${exportId} to ZPHERES.` });
		const pdfId = await postersController.generatePDF(exportConfig);
		Logger.info({ message: `Created ZPHERES PDF job ${pdfId} for poster export ${exportId}.` });

		let pdfStatus = await postersController.getPDFStatus(pdfId);

		while (pdfStatus.status !== 'done') {
			if (pdfStatus.status === 'error' || pdfStatus.status === 'failed') {
				throw new Error(`PDF job ${pdfId} failed.`);
			}

			Logger.info({ message: `ZPHERES PDF job ${pdfId} is ${pdfStatus.status}; checking again in 60 seconds.` });
			await waitForNextStatusCheck();
			pdfStatus = await postersController.getPDFStatus(pdfId);
		}

		if (!pdfStatus.downloadLink) {
			throw new Error(`PDF job ${pdfId} completed without a download URL.`);
		}

		const pdfZip = await postersController.downloadPDF(pdfStatus.downloadLink);
		if (!isZipFile(pdfZip)) {
			throw new Error(`PDF job ${pdfId} returned an invalid or empty ZIP file.`);
		}

		Logger.info({ message: `Downloaded and validated ZIP for poster export ${exportId} (${pdfZip.byteLength} bytes).` });
		return pdfZip;
	} finally {
		if (exportConfig) {
			fs.rmSync(exportConfig.workdir, { force: true, recursive: true });
			Logger.info({ message: `Cleaned temporary files for poster export ${exportId}.` });
		}
	}
}
