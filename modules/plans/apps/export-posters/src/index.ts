/* * */

import { PostersController } from '@/controller/poster.js';
import { importPlanToSqlite } from '@/import-plan-to-sqlite.js';
import { Dates } from '@tmlmobilidade/dates';
import { files, plans } from '@tmlmobilidade/interfaces';
import { initSentryNode, Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { runOnInterval } from '@tmlmobilidade/utils';
import fs from 'node:fs';

/* * */

const postersController = new PostersController();

/* * */

function getPostersForUpdate<T extends object>(posters: T): Omit<T, 'file'> {
	const postersForUpdate = { ...posters } as T & { file?: unknown };
	delete postersForUpdate.file;
	return postersForUpdate;
}

/* * */

async function main(): Promise<void> {
	//

	try {
		await initSentryNode();
		Logger.startNodeLogs({ app: 'export-posters', message: 'Sentry Plans Export Posters initialized', module: 'plans', severity: 'info' });
	} catch (error) {
		Logger.error({ error, message: 'Error initializing Sentry Plans Export Posters' });
	}

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
						...getPostersForUpdate(planData.apps.posters),
						status: 'processing',
						timestamp: Dates.now('Europe/Lisbon').unix_timestamp,
					},
				},
			});
		}

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
						...getPostersForUpdate(planData.apps.posters),
						file_id: null,
						job_id: null,
						status: 'processing',
						step: 'preparing',
						timestamp: Dates.now('Europe/Lisbon').unix_timestamp,
					},
				},
			});

			const exportConfig = await importPlanToSqlite(planData);

			//
			// Update the plan status to 'generating'

			planData = await plans.updateById(planData._id, {
				apps: {
					...planData.apps,
					posters: {
						...getPostersForUpdate(planData.apps.posters),
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
						...getPostersForUpdate(planData.apps.posters),
						job_id: pdfId,
						step: 'checking-status',
						timestamp: Dates.now('Europe/Lisbon').unix_timestamp,
					},
				},
			});

			//
			// Remove the staging TXT files after the job ID is persisted.
			// Keep the final ZIP at /tmp/hitouch/<plan-id>-hitouch-posters.zip.

			fs.rmSync(exportConfig.workdir, { force: true, recursive: true });
		} else {
			Logger.info({ message: `Resuming ZPHERES PDF job ${pdfId}.` });

			//
			// Update the plan status to 'checking-status'

			planData = await plans.updateById(planData._id, {
				apps: {
					...planData.apps,
					posters: {
						...getPostersForUpdate(planData.apps.posters),
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
			if (pdfStatus.status === 'failed') {
				planData = await plans.updateById(planData._id, {
					apps: {
						...planData.apps,
						posters: {
							...getPostersForUpdate(planData.apps.posters),
							status: 'error',
							step: 'checking-status',
							timestamp: Dates.now('Europe/Lisbon').unix_timestamp,
						},
					},
				});

				throw new Error(`ZPHERES PDF job ${pdfId} failed.`);
			}

			Logger.info({ message: `ZPHERES PDF job ${pdfId} is ${pdfStatus.status}.` });
			await new Promise(resolve => setTimeout(resolve, 60_000)); // Wait 60 seconds before checking the status again
			pdfStatus = await postersController.getPDFStatus(pdfId);
		}

		Logger.info({ message: `PDF generation completed.` });

		//
		// Download and upload the generated posters ZIP file

		const pdfFileUrl = pdfStatus.downloadLink;

		if (!pdfFileUrl) {
			throw new Error(`PDF generation completed without a download URL.`);
		}

		//
		// Update the plan status to 'downloading'

		planData = await plans.updateById(planData._id, {
			apps: {
				...planData.apps,
				posters: {
					...getPostersForUpdate(planData.apps.posters),
					step: 'downloading',
					timestamp: Dates.now('Europe/Lisbon').unix_timestamp,
				},
			},
		});

		//
		// Download and upload the generated posters ZIP file

		const pdfZip = await postersController.downloadPDF(pdfFileUrl);
		const pdfFile = await files.upload(pdfZip, {
			created_by: 'system',
			name: `${planData._id}-pdf.zip`,
			resource_id: planData._id,
			scope: 'plans',
			size: pdfZip.byteLength,
			type: 'application/zip',
			updated_by: 'system',
		});

		//
		// Update the plan status to 'complete'

		await plans.updateById(planData._id, {
			apps: {
				...planData.apps,
				posters: {
					...getPostersForUpdate(planData.apps.posters),
					file_id: pdfFile._id,
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

await runOnInterval(main, { intervalMs: '30s' });
