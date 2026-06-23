/* * */

import { PostersController } from '@/controller/poster.js';
import { exportAgencyFile } from '@/exports/agency.js';
import { exportCalendarFiles } from '@/exports/calendars.js';
import { exportDayTypesFile } from '@/exports/day_types.js';
import { exportFeedInfoFile } from '@/exports/feed_info.js';
import { exportRoutesFile } from '@/exports/routes.js';
import { exportStopTimesFile } from '@/exports/stop-times.js';
import { exportStopsFile } from '@/exports/stops.js';
import { exportTripsFile } from '@/exports/trips.js';
import { type ExportToHitouchConfig } from '@/types.js';
import { createHitouchZip } from '@/utils/create-hitouch-zip.js';
import { Dates } from '@tmlmobilidade/dates';
import { importGtfsToDatabase, type ImportGtfsToDatabaseConfig } from '@tmlmobilidade/import-gtfs';
import { files, plans } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
// import { initSentryNode } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { type Plan } from '@tmlmobilidade/types';
import { runOnInterval } from '@tmlmobilidade/utils';
import fs from 'node:fs';

// import { getFormattedDates } from './get-names.js';

/* * */

const postersController = new PostersController();

/* * */

async function prepareHitouchZip(planData: Plan): Promise<ExportToHitouchConfig> {
	//

	//
	// Import the Plan into a local SQLite database

	const operationFileUrl = await files.getFileUrl({ file_id: planData.operation_file_id });
	const feedStartDate = planData.gtfs_feed_info.feed_start_date;
	const feedEndDate = planData.gtfs_feed_info.feed_end_date;

	//
	// Check if the feed start and end dates are valid

	if (!feedStartDate || !feedEndDate) {
		throw new Error(`Plan ${planData._id} is missing feed start or end dates.`);
	}

	const importConfig: ImportGtfsToDatabaseConfig = {
		source: {
			url: operationFileUrl,
		},
		time_range: {
			date_range: {
				end: feedEndDate,
				start: feedStartDate,
			},
		},
	};

	const sqlGtfs = await importGtfsToDatabase(importConfig);

	//
	// Setup the export config

	const exportConfig: ExportToHitouchConfig = {
		date_range: {
			end: feedEndDate,
			start: feedStartDate,
		},
		output: 'hitouch-posters.zip',
		workdir: `/tmp/hitouch/${planData._id}`,
	};

	if (fs.existsSync(exportConfig.workdir)) {
		fs.rmSync(exportConfig.workdir, { recursive: true });
	}
	fs.mkdirSync(exportConfig.workdir, { recursive: true });

	//
	// Export the files required by ZPHERES

	Logger.info({ message: `Exporting Plan ${planData._id} to HiTouch GTFS...` });

	const exportTimer = new Timer();

	await exportCalendarFiles(sqlGtfs, exportConfig);
	await exportTripsFile(sqlGtfs, exportConfig);
	await exportStopTimesFile(sqlGtfs, exportConfig);
	await exportRoutesFile(sqlGtfs, exportConfig);
	await exportStopsFile(sqlGtfs, exportConfig);
	await exportAgencyFile(planData, exportConfig);
	await exportFeedInfoFile(planData, exportConfig);
	await exportDayTypesFile(exportConfig);

	Logger.info({ message: `Exported files in ${exportTimer.get()} seconds` });

	//
	// Package all exported TXT files into the HiTouch ZIP archive

	const zipTimer = new Timer();
	const outputPath = await createHitouchZip(exportConfig);

	Logger.info({ message: `Created ${outputPath} in ${zipTimer.get()} seconds` });

	return exportConfig;
}

/* * */

async function main(): Promise<void> {
	//

	Logger.init();

	const globalTimer = new Timer();

	//
	// Resume a processing Plan before starting a waiting Plan

	let planData = await plans.findOne({ 'apps.posters.status': 'processing' }, { sort: { 'apps.posters.timestamp': 1 } });

	if (!planData) {
		planData = await plans.findOne({ 'apps.posters.status': 'waiting' }, { sort: { 'apps.posters.timestamp': 1 } });
	}

	if (!planData) {
		Logger.info({ message: 'Plan not found. Exiting...' });
		Logger.terminate(`Run took ${globalTimer.get()}`);
		return;
	}

	Logger.info({
		message: `Found Plan ${planData._id} at step "${planData.apps.posters.step ?? 'not-started'}"${planData.apps.posters.job_id ? ` with ZPHERES job ${planData.apps.posters.job_id}` : ''}.`,
	});

	try {
		//
		// Update the plan status to 'processing' if it is not already

		if (planData.apps.posters.status !== 'processing') {
			planData = await plans.updateById(planData._id, {
				apps: {
					...planData.apps,
					posters: {
						...planData.apps.posters,
						status: 'processing',
						timestamp: Dates.now('Europe/Lisbon').unix_timestamp,
					},
				},
			});
		}

		//

		//
		// Start a new job or rebuild local files when no remote job was saved

		let pdfId = planData.apps.posters.job_id;

		if (!pdfId) {
			//
			// Update the plan status to 'processing' and 'preparing'

			planData = await plans.updateById(planData._id, {
				apps: {
					...planData.apps,
					posters: {
						...planData.apps.posters,
						file: null,
						job_id: null,
						status: 'processing',
						step: 'preparing',
						timestamp: Dates.now('Europe/Lisbon').unix_timestamp,
					},
				},
			});

			const exportConfig = await prepareHitouchZip(planData);

			//
			// Update the plan status to 'generating'

			planData = await plans.updateById(planData._id, {
				apps: {
					...planData.apps,
					posters: {
						...planData.apps.posters,
						step: 'generating',
						timestamp: Dates.now('Europe/Lisbon').unix_timestamp,
					},
				},
			});

			//
			// Generate the PDF

			pdfId = await postersController.generatePDF(exportConfig);

			Logger.info({ message: `Created ZPHERES PDF job ${pdfId}` });

			//
			// Persist the remote job immediately so a restart can resume polling

			planData = await plans.updateById(planData._id, {
				apps: {
					...planData.apps,
					posters: {
						...planData.apps.posters,
						job_id: pdfId,
						step: 'checking-status',
						timestamp: Dates.now('Europe/Lisbon').unix_timestamp,
					},
				},
			});
		} else {
			Logger.info({ message: `Resuming ZPHERES PDF job ${pdfId}.` });

			//
			// Update the plan status to 'checking-status'

			planData = await plans.updateById(planData._id, {
				apps: {
					...planData.apps,
					posters: {
						...planData.apps.posters,
						step: 'checking-status',
						timestamp: Dates.now('Europe/Lisbon').unix_timestamp,
					},
				},
			});
		}

		//
		// Check the status of the PDF generation

		let pdfStatus = await postersController.getPDFStatus(pdfId);

		//
		// Wait for the PDF generation to complete

		while (pdfStatus.status !== 'done') {
			if (pdfStatus.status === 'error') {
				planData = await plans.updateById(planData._id, {
					apps: {
						...planData.apps,
						posters: {
							...planData.apps.posters,
							status: 'error',
							step: 'checking-status',
							timestamp: Dates.now('Europe/Lisbon').unix_timestamp,
						},
					},
				});

				throw new Error(`ZPHERES PDF job ${pdfId} failed.`);
			}

			Logger.info({ message: `ZPHERES PDF job ${pdfId} is ${pdfStatus.status}.` });
			await new Promise(resolve => setTimeout(resolve, 30_000));
			pdfStatus = await postersController.getPDFStatus(pdfId);
		}

		Logger.info({ message: `PDF status: ${JSON.stringify(pdfStatus)}` });

		//
		// Download and upload the generated posters ZIP file

		const pdfFileUrl = pdfStatus.downloadLink;

		if (!pdfFileUrl) {
			throw new Error(`PDF generation completed without a download URL. Response: ${JSON.stringify(pdfStatus)}`);
		}

		//
		// Update the plan status to 'downloading'

		planData = await plans.updateById(planData._id, {
			apps: {
				...planData.apps,
				posters: {
					...planData.apps.posters,
					step: 'downloading',
					timestamp: Dates.now('Europe/Lisbon').unix_timestamp,
				},
			},
		});

		//
		// Download and upload the generated posters ZIP file

		const pdfZip = await postersController.downloadPDF(pdfFileUrl);
		const pdfFile = await files.upload(pdfZip, {
			_id: `${planData._id}-pdf`,
			created_by: 'system',
			name: `${planData._id}-pdf.zip`,
			resource_id: planData._id,
			scope: 'plans',
			size: pdfZip.byteLength,
			type: 'application/zip',
			updated_by: 'system',
		}, { override: true });

		//
		// Update the plan status to 'complete'

		await plans.updateById(planData._id, {
			apps: {
				...planData.apps,
				posters: {
					...planData.apps.posters,
					file: pdfFile,
					status: 'complete',
					step: 'complete',
					timestamp: Dates.now('Europe/Lisbon').unix_timestamp,
				},
			},
		});

		//
		// Terminate the run

		Logger.terminate(`Run took ${globalTimer.get()}`);
	} catch (error) {
		Logger.error({
			error,
			message: planData.apps.posters.status === 'processing'
				? `Plan ${planData._id} stopped at step "${planData.apps.posters.step ?? 'not-started'}". It will resume on the next run.`
				: `Plan ${planData._id} stopped at step "${planData.apps.posters.step ?? 'not-started'}" with status "${planData.apps.posters.status}".`,
		});
		throw error;
	}
}

/* * */

await runOnInterval(main, { intervalMs: '10s' });
