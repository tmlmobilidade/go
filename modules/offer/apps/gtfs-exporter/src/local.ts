/* * */
// Local development entrypoint — runs one export per agency directly to ./output_<agency_id>/
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

const AGENCY_IDS = ['41', '42', '43', '44'];

function buildLocalExportConfig(agencyId: string): GtfsV29ExportConfig {
	const workdir = path.resolve(`./output_${agencyId}`);

	return {
		agency_ids: [agencyId],
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
		workdir,
		writers: {
			afetacao: new CsvWriter('afetacao.csv', `${workdir}/afetacao.csv`),
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

async function main() {
	Logger.init();

	for (const agencyId of AGENCY_IDS) {
		const exportConfig = buildLocalExportConfig(agencyId);

		Logger.info(`Starting export for agency ${agencyId} → ${exportConfig.workdir}`);

		fs.mkdirSync(exportConfig.workdir, { recursive: true });

		const progress: ExportProgress = {
			_id: `local_${agencyId}`,
			progress_current: 0,
			progress_total: 0,
			workdir: exportConfig.workdir,
		};

		await exportGtfsV29(progress, exportConfig);

		Logger.success(`Agency ${agencyId} done. Files written to ${exportConfig.workdir}`);
	}

	Logger.success('All agencies exported.');
}

main().catch((error) => {
	Logger.error(`Local export failed: ${error instanceof Error ? error.message : error}`);
	process.exit(1);
});
