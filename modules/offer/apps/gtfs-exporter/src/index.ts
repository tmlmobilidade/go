import { exportGtfsV29 } from '@/main.js';
import { ExportProgress, GtfsV29ExportConfig } from '@/types.js';
import { Dates } from '@tmlmobilidade/dates';
import { CsvWriter } from '@tmlmobilidade/writers';

export * from '@/exports/index.js';
export * from '@/main.js';
export * from '@/types.js';
export * from '@/utils.js';

const agencyId = '41';
const workdir = `/tmp/export_${agencyId}`;

const exportConfig: GtfsV29ExportConfig = {
	agency_id: agencyId,
	calendars_clip_end_date: '20241231', // not currently used
	calendars_clip_start_date: '20240101', // not currently used
	clip_calendars: true, // not currently used
	feed_end_date: Dates.fromISO('20270102').operational_date, // fix this
	feed_start_date: Dates.fromISO('20260101').operational_date,
	lines_exclude: [],
	lines_include: [],
	numeric_calendar_codes: false,
	stop_sequence_start: 1,
	stops_export_all: false,
	version: '20240101-1200',
	workdir: workdir,
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

const progress: ExportProgress = {
	_id: 'export-progress-id',
	progress_current: 0,
	progress_total: 0,
	workdir: workdir,
};

await exportGtfsV29(progress, exportConfig);
