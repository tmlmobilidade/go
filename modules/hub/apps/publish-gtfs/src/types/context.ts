/* * */

import { type HubV1GtfsAgency, type HubV1GtfsCalendarDates, type HubV1GtfsFeedInfo, type HubV1GtfsPlans, type HubV1GtfsRoutes, type HubV1GtfsShapes, type HubV1GtfsStops, type HubV1GtfsStopTimes, type HubV1GtfsTrips } from '@tmlmobilidade/go-types-hub';
import { BatchWriter } from '@tmlmobilidade/go-utils-exec';

/* * */

export interface ExportGtfsContext {
	run_id: string
	workdir: {
		path: string
		remove: () => void
	}
	writers: {
		agency: BatchWriter<HubV1GtfsAgency>
		calendar_dates: BatchWriter<HubV1GtfsCalendarDates>
		feed_info: BatchWriter<HubV1GtfsFeedInfo>
		plans: BatchWriter<HubV1GtfsPlans>
		routes: BatchWriter<HubV1GtfsRoutes>
		shapes: BatchWriter<HubV1GtfsShapes>
		stop_times: BatchWriter<HubV1GtfsStopTimes>
		stops: BatchWriter<HubV1GtfsStops>
		trips: BatchWriter<HubV1GtfsTrips>
	}
}
