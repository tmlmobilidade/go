/* * */
// Local development entrypoint — runs a single export directly to ./output/
// without polling the DB or uploading to OCI.
// Usage: npm run dev:local

import { exportGtfsV29 } from '@/main.js';
import { type ExportProgress, type GtfsV29ExportConfig } from '@/types.js';
import { Logger } from '@tmlmobilidade/logger';
import { OperationalDate } from '@tmlmobilidade/types';
import { CsvWriter } from '@tmlmobilidade/writers';
import fs from 'node:fs';
import path from 'node:path';

/* * */

const WORKDIR = path.resolve('./output');

const exportConfig: GtfsV29ExportConfig = {
	agency_ids: ['41'],
	calendars_clip_end_date: '20261231' as OperationalDate,
	calendars_clip_start_date: '20260101' as OperationalDate,
	clip_calendars: true,
	feed_end_date: '20261231' as OperationalDate,
	feed_start_date: '20260101' as OperationalDate,
	lines_exclude: [],
	lines_include: [],
	numeric_calendar_codes: false,
	stop_sequence_start: 1,
	stops_export_all: false,
	version: new Date().toISOString().replace(/[-:T]/g, '').slice(0, 13),
	workdir: WORKDIR,
	writers: {
		afetacao: new CsvWriter('afetacao.txt', `${WORKDIR}/afetacao.txt`),
		agency: new CsvWriter('agency.txt', `${WORKDIR}/agency.txt`),
		calendar_dates: new CsvWriter('calendar_dates.txt', `${WORKDIR}/calendar_dates.txt`),
		fare_attributes: new CsvWriter('fare_attributes.txt', `${WORKDIR}/fare_attributes.txt`),
		fare_rules: new CsvWriter('fare_rules.txt', `${WORKDIR}/fare_rules.txt`),
		feed_info: new CsvWriter('feed_info.txt', `${WORKDIR}/feed_info.txt`),
		routes: new CsvWriter('routes.txt', `${WORKDIR}/routes.txt`),
		shapes: new CsvWriter('shapes.txt', `${WORKDIR}/shapes.txt`),
		stop_times: new CsvWriter('stop_times.txt', `${WORKDIR}/stop_times.txt`),
		stops: new CsvWriter('stops.txt', `${WORKDIR}/stops.txt`),
		trips: new CsvWriter('trips.txt', `${WORKDIR}/trips.txt`),
	},
};

/* * */

async function main() {
	Logger.init();
	Logger.info(`Local export — output directory: ${WORKDIR}`);

	fs.mkdirSync(WORKDIR, { recursive: true });

	const progress: ExportProgress = {
		_id: 'local',
		progress_current: 0,
		progress_total: 0,
		workdir: WORKDIR,
	};

	await exportGtfsV29(progress, exportConfig);

	Logger.success(`Done. Files written to ${WORKDIR}`);
}

main().catch((error) => {
	Logger.error(`Local export failed: ${error instanceof Error ? error.message : error}`);
	process.exit(1);
});
