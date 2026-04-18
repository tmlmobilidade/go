import { exportGtfsV29 } from '@/main.js';
import { type ExportProgress, type GtfsV29ExportConfig } from '@/types.js';
import { Files } from '@tmlmobilidade/files';
import { fileExports, files } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { type FileExport, type GtfsExportProperties, ProcessingStatusSchema } from '@tmlmobilidade/types';
import { runOnInterval } from '@tmlmobilidade/utils';
import { CsvWriter } from '@tmlmobilidade/writers';
import AdmZip from 'adm-zip';
import fs from 'node:fs';

export * from '@/exports/index.js';
export * from '@/main.js';
export * from '@/types.js';
export * from '@/utils.js';

/* * */

function buildExportConfig(workdir: string, properties: GtfsExportProperties['properties']): GtfsV29ExportConfig {
	return {
		agency_ids: properties.agency_ids,
		calendars_clip_end_date: properties.calendars_clip_end_date,
		calendars_clip_start_date: properties.calendars_clip_start_date,
		clip_calendars: true,
		feed_end_date: properties.feed_end_date,
		feed_start_date: properties.feed_start_date,
		lines_exclude: properties.lines_exclude,
		lines_include: properties.lines_include,
		numeric_calendar_codes: properties.numeric_calendar_codes,
		stop_sequence_start: properties.stop_sequence_start,
		stops_export_all: properties.stops_export_all,
		version: new Date().toISOString().replace(/[-:T]/g, '').slice(0, 13),
		workdir,
		writers: {
			afetacao: new CsvWriter('afetacao.txt', `${workdir}/afetacao.txt`),
			agency: new CsvWriter('agency.txt', `${workdir}/agency.txt`),
			calendar_dates: new CsvWriter('calendar_dates.txt', `${workdir}/calendar_dates.txt`),
			fare_attributes: new CsvWriter('fare_attributes.txt', `${workdir}/fare_attributes.txt`),
			fare_rules: new CsvWriter('fare_rules.txt', `${workdir}/fare_rules.txt`),
			feed_info: new CsvWriter('feed_info.txt', `${workdir}/feed_info.txt`),
			routes: new CsvWriter('routes.txt', `${workdir}/routes.txt`),
			shapes: new CsvWriter('shapes.txt', `${workdir}/shapes.txt`),
			stop_times: new CsvWriter('stop_times.txt', `${workdir}/stop_times.txt`),
			stops: new CsvWriter('stops.txt', `${workdir}/stops.txt`),
			trips: new CsvWriter('trips.txt', `${workdir}/trips.txt`),
		},
	};
}

/* * */

async function processExport(fileExport: FileExport) {
	const workdir = `/tmp/gtfs_export_${fileExport._id}`;

	try {
		// Mark as processing
		await fileExports.updateById(fileExport._id, { processing_status: 'processing' });

		// Ensure working directory exists
		fs.mkdirSync(workdir, { recursive: true });

		// Build export config from properties
		const properties = fileExport.properties as GtfsExportProperties['properties'];
		const exportConfig = buildExportConfig(workdir, properties);

		const progress: ExportProgress = {
			_id: fileExport._id,
			progress_current: 0,
			progress_total: 0,
			workdir,
		};

		// Run the export
		await exportGtfsV29(progress, exportConfig);

		// Zip the exported files
		const zip = new AdmZip();
		const workdirContents = fs.readdirSync(workdir, { withFileTypes: true });
		for (const entry of workdirContents) {
			if (entry.isFile() && entry.name.endsWith('.txt')) {
				zip.addLocalFile(`${workdir}/${entry.name}`);
			}
		}

		const zipPath = `${workdir}/${fileExport.file_name}`;
		zip.writeZip(zipPath);

		// Upload to storage
		const fileStream = fs.createReadStream(zipPath);
		const file = await files.upload(fileStream, {
			created_by: 'system',
			name: fileExport.file_name,
			resource_id: fileExport._id,
			scope: 'exports',
			size: fs.statSync(zipPath).size,
			type: Files.getFileExtensionFromMimeType(Files.getFileExtension(fileExport.file_name)),
			updated_by: 'system',
		});

		// Mark as complete
		await fileExports.updateById(fileExport._id, { file_id: file._id, processing_status: 'complete' });

		Logger.success(`GTFS export ${fileExport._id} completed.`);
	} catch (error) {
		Logger.error(`Error processing GTFS export ${fileExport._id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
		await fileExports.updateById(fileExport._id, { processing_status: 'error' });
	} finally {
		// Cleanup working directory
		fs.rmSync(workdir, { force: true, recursive: true });
	}
}

/* * */

async function main() {
	Logger.init();

	const waitingExports = await fileExports.findMany({
		processing_status: ProcessingStatusSchema.enum.waiting,
		type: 'gtfs',
	});

	Logger.info(`Found ${waitingExports.length} waiting GTFS exports.`);

	for (const fileExport of waitingExports) {
		await processExport(fileExport);
	}

	Logger.terminate(`Run complete.`);
}

/* * */

await runOnInterval(main, { intervalMs: '10s' });
