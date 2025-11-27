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
