/* * */

import { type HubGtfsExportAgency, type HubGtfsExportCalendarDates, type HubGtfsExportFeedInfo, type HubGtfsExportPlans, type HubGtfsExportRoutes, type HubGtfsExportShapes, type HubGtfsExportStops, type HubGtfsExportStopTimes, type HubGtfsExportTrips } from '@tmlmobilidade/go-types-hub';
import { BatchWriter } from '@tmlmobilidade/go-utils-exec';

/* * */

export interface ExportGtfsContext {
	run_id: string
	workdir: {
		path: string
	}
	writers: {
		agency: BatchWriter<HubGtfsExportAgency>
		calendar_dates: BatchWriter<HubGtfsExportCalendarDates>
		feed_info: BatchWriter<HubGtfsExportFeedInfo>
		plans: BatchWriter<HubGtfsExportPlans>
		routes: BatchWriter<HubGtfsExportRoutes>
		shapes: BatchWriter<HubGtfsExportShapes>
		stop_times: BatchWriter<HubGtfsExportStopTimes>
		stops: BatchWriter<HubGtfsExportStops>
		trips: BatchWriter<HubGtfsExportTrips>
	}
}
