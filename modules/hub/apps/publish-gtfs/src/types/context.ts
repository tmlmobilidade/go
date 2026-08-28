/* * */

import { ExportedAgencyRow } from '@/exports/agency.js';
import { ExportedCalendarDatesRow } from '@/exports/calendar-dates.js';
import { ExportedFeedInfoRow } from '@/exports/feed-info.js';
import { ExportedPlansRow } from '@/exports/plans.js';
import { ExportedRoutesRow } from '@/exports/routes.js';
import { ExportedShapesRow } from '@/exports/shapes.js';
import { ExportedStopTimesRow } from '@/exports/stop-times.js';
import { ExportedTripsRow } from '@/exports/trips.js';
import { type HubGtfsExportStops } from '@tmlmobilidade/go-types-public-info';
import { BatchWriter } from '@tmlmobilidade/go-utils-exec';

/* * */

export interface ExportGtfsContext {
	run_id: string
	workdir: {
		path: string
	}
	writers: {
		agency: BatchWriter<ExportedAgencyRow>
		calendar_dates: BatchWriter<ExportedCalendarDatesRow>
		feed_info: BatchWriter<ExportedFeedInfoRow>
		plans: BatchWriter<ExportedPlansRow>
		routes: BatchWriter<ExportedRoutesRow>
		shapes: BatchWriter<ExportedShapesRow>
		stop_times: BatchWriter<ExportedStopTimesRow>
		stops: BatchWriter<HubGtfsExportStops>
		trips: BatchWriter<ExportedTripsRow>
	}
}
