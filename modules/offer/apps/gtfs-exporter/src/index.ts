import { exportGtfsV29 } from '@/main.js';
import { ExportProgress, GtfsV29ExportConfig } from '@/types.js';
import { Dates } from '@tmlmobilidade/dates';
import { CsvWriter } from '@tmlmobilidade/writers';

export * from '@/exports/index.js';
export * from '@/main.js';
export * from '@/types.js';
export * from '@/utils.js';

const exportConfig: GtfsV29ExportConfig = {
	agency_id: '41',
	calendars_clip_end_date: '20241231',
	calendars_clip_start_date: '20240101',
	clip_calendars: true,
	feed_end_date: Dates.fromISO('20261231').operational_date,
	feed_start_date: Dates.fromISO('20250101').operational_date,
	lines_exclude: [],
	lines_include: [],
	numeric_calendar_codes: false,
	stop_sequence_start: 1,
	stops_export_all: false,
	version: '20240101-1200',
	workdir: '/tmp/export',
	writers: {
		afetacao: new CsvWriter('afetacao.txt', '/tmp/export/afetacao.txt'),
		agency: new CsvWriter('agency.txt', '/tmp/export/agency.txt'),
		calendar_dates: new CsvWriter('calendar_dates.txt', '/tmp/export/calendar_dates.txt'),
		fare_attributes: new CsvWriter('fare_attributes.txt', '/tmp/export/fare_attributes.txt'),
		fare_rules: new CsvWriter('fare_rules.txt', '/tmp/export/fare_rules.txt'),
		feed_info: new CsvWriter('feed_info.txt', '/tmp/export/feed_info.txt'),
		routes: new CsvWriter('routes.txt', '/tmp/export/routes.txt'),
		shapes: new CsvWriter('shapes.txt', '/tmp/export/shapes.txt'),
		stop_times: new CsvWriter('stop_times.txt', '/tmp/export/stop_times.txt'),
		stops: new CsvWriter('stops.txt', '/tmp/export/stops.txt'),
		trips: new CsvWriter('trips.txt', '/tmp/export/trips.txt'),
	},
};

const progress: ExportProgress = {
	_id: 'export-progress-id',
	progress_current: 0,
	progress_total: 0,
	workdir: '/tmp/export',
};

await exportGtfsV29(progress, exportConfig);
