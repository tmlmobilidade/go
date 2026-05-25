/* * */

import { ExportedAgencyRow } from '@/exports/agency.js';
import { ExportedCalendarDatesRow } from '@/exports/calendar-dates.js';
import { ExportedDatesRow } from '@/exports/dates.js';
import { ExportedFareAttributesRow } from '@/exports/fare-attributes.js';
import { ExportedFareRulesRow } from '@/exports/fare-rules.js';
import { ExportedFeedInfoRow } from '@/exports/feed-info.js';
import { ExportedMunicipalitiesRow } from '@/exports/municipalities.js';
import { ExportedPeriodsRow } from '@/exports/periods.js';
import { ExportedPlansRow } from '@/exports/plans.js';
import { ExportedRoutesRow } from '@/exports/routes.js';
import { ExportedShapesRow } from '@/exports/shapes.js';
import { ExportedStopTimesRow } from '@/exports/stop-times.js';
import { ExportedStopsRow } from '@/exports/stops.js';
import { ExportedTripsRow } from '@/exports/trips.js';
import { BatchWriter } from '@tmlmobilidade/utils';

/* * */

export interface ExportGtfsContext {
	run_id: string
	workdir: {
		path: string
	}
	writers: {
		agency: BatchWriter<ExportedAgencyRow>
		calendar_dates: BatchWriter<ExportedCalendarDatesRow>
		dates: BatchWriter<ExportedDatesRow>
		fare_attributes: BatchWriter<ExportedFareAttributesRow>
		fare_rules: BatchWriter<ExportedFareRulesRow>
		feed_info: BatchWriter<ExportedFeedInfoRow>
		municipalities: BatchWriter<ExportedMunicipalitiesRow>
		periods: BatchWriter<ExportedPeriodsRow>
		plans: BatchWriter<ExportedPlansRow>
		routes: BatchWriter<ExportedRoutesRow>
		shapes: BatchWriter<ExportedShapesRow>
		stop_times: BatchWriter<ExportedStopTimesRow>
		stops: BatchWriter<ExportedStopsRow>
		trips: BatchWriter<ExportedTripsRow>
	}
}
