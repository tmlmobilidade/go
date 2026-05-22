/* * */

import { ExportedAgencyRow } from '@/tasks/agencies.js';
import { ExportedCalendarDatesRow } from '@/tasks/calendar-dates.js';
import { ExportedDatesRow } from '@/tasks/dates.js';
import { ExportedFareAttributesRow } from '@/tasks/fare-attributes.js';
import { ExportedFareRulesRow } from '@/tasks/fare-rules.js';
import { ExportedFeedInfoRow } from '@/tasks/feed-info.js';
import { ExportedMunicipalitiesRow } from '@/tasks/municipalities.js';
import { ExportedPeriodsRow } from '@/tasks/periods.js';
import { ExportedPlansRow } from '@/tasks/plans.js';
import { ExportedRoutesRow } from '@/tasks/routes.js';
import { ExportedShapesRow } from '@/tasks/shapes.js';
import { ExportedStopTimesRow } from '@/tasks/stop-times.js';
import { ExportedStopsRow } from '@/tasks/stops.js';
import { ExportedTripsRow } from '@/tasks/trips.js';
import { type CsvWriter } from '@tmlmobilidade/writers';

/* * */

export interface MergedGtfsExportConfig {
	version: string
	workdir: string
	writers: {
		agency: CsvWriter<ExportedAgencyRow>
		calendar_dates: CsvWriter<ExportedCalendarDatesRow>
		dates: CsvWriter<ExportedDatesRow>
		fare_attributes: CsvWriter<ExportedFareAttributesRow>
		fare_rules: CsvWriter<ExportedFareRulesRow>
		feed_info: CsvWriter<ExportedFeedInfoRow>
		municipalities: CsvWriter<ExportedMunicipalitiesRow>
		periods: CsvWriter<ExportedPeriodsRow>
		plans: CsvWriter<ExportedPlansRow>
		routes: CsvWriter<ExportedRoutesRow>
		shapes: CsvWriter<ExportedShapesRow>
		stop_times: CsvWriter<ExportedStopTimesRow>
		stops: CsvWriter<ExportedStopsRow>
		trips: CsvWriter<ExportedTripsRow>
	}
}
