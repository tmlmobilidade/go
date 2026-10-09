/* eslint-disable perfectionist/sort-objects */
/* * */

import { type GtfsSteppV1ExportConfig } from '@/types.js';
import { type ServiceRegistry } from '@/utils/service-registry.js';
import { type GtfsBinary } from '@tmlmobilidade/go-types-gtfs';
import { type GtfsStrictV30SteppCalendar } from '@tmlmobilidade/go-types-gtfs-strict';
import { type OperationalDate, OperationalDateIntSchema } from '@tmlmobilidade/go-types-shared';
import { Logger } from '@tmlmobilidade/go-utils-telemetry';

/* * */

const WEEKDAY_FIELDS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;

const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;

/**
 * Converts a 'yyyyMMdd' operational date to a UTC timestamp at midnight
 */
function toUtcTimestamp(date: OperationalDate): number {
	return Date.UTC(Number(date.slice(0, 4)), Number(date.slice(4, 6)) - 1, Number(date.slice(6, 8)));
}

/* * */

/**
 * Exports calendar.txt with one row per service_id, built from the same dates
 * that are written to calendar_dates.txt (clipped to the export's [start_date, end_date] range).
 *
 * - start_date / end_date are the first and last dates of the service inside that range.
 * - A weekday is set to '1' only if the service runs on every occurrence of that weekday
 *   between start_date and end_date. This guarantees calendar.txt never activates a date
 *   that is not listed in calendar_dates.txt.
 *
 * @param serviceRegistry - The service registry containing all service_ids and dates
 * @param exportConfig - Export configuration
 */
export async function exportCalendar(
	serviceRegistry: ServiceRegistry,
	exportConfig: GtfsSteppV1ExportConfig,
) {
	try {
		Logger.info({ message: 'Exporting calendar...' });

		const allServices = serviceRegistry.getAllServices();

		// Operational dates are 'yyyyMMdd' strings, so they compare chronologically
		const { end_date: endDate, start_date: startDate } = exportConfig;
		if (startDate > endDate) throw new Error(`start_date (${startDate}) is after end_date (${endDate})`);

		let totalRows = 0;

		for (const serviceInfo of allServices.values()) {
			const clippedDates = Array.from(serviceInfo.dates).filter(date => date >= startDate && date <= endDate).sort();
			if (clippedDates.length === 0) continue;

			const serviceStartDate = clippedDates[0];
			const serviceEndDate = clippedDates[clippedDates.length - 1];

			// Count how many times each weekday is served (0 = Sunday, 6 = Saturday)
			const servedByWeekday = [0, 0, 0, 0, 0, 0, 0];
			for (const date of clippedDates) {
				servedByWeekday[new Date(toUtcTimestamp(date)).getUTCDay()]++;
			}

			// Count how many times each weekday occurs between start_date and end_date
			const occurrencesByWeekday = [0, 0, 0, 0, 0, 0, 0];
			const endTimestamp = toUtcTimestamp(serviceEndDate);
			for (let timestamp = toUtcTimestamp(serviceStartDate); timestamp <= endTimestamp; timestamp += ONE_DAY_IN_MS) {
				occurrencesByWeekday[new Date(timestamp).getUTCDay()]++;
			}

			const weekdays = Object.fromEntries(WEEKDAY_FIELDS.map((field, index) => {
				const runsEveryOccurrence = servedByWeekday[index] > 0 && servedByWeekday[index] === occurrencesByWeekday[index];
				return [field, runsEveryOccurrence ? '1' : '0'];
			})) as Record<typeof WEEKDAY_FIELDS[number], GtfsBinary>;

			const row: GtfsStrictV30SteppCalendar = {
				service_id: serviceInfo.serviceId,
				monday: weekdays.monday,
				tuesday: weekdays.tuesday,
				wednesday: weekdays.wednesday,
				thursday: weekdays.thursday,
				friday: weekdays.friday,
				saturday: weekdays.saturday,
				sunday: weekdays.sunday,
				end_date: OperationalDateIntSchema.parse(serviceEndDate),
				start_date: OperationalDateIntSchema.parse(serviceStartDate),
			};

			await exportConfig.writers.calendar.write(row);
			totalRows++;
		}

		Logger.success(`Exported ${totalRows} service IDs between ${startDate} and ${endDate} to calendar.txt`);
	} catch (error) {
		throw new Error(`Error exporting calendar: ${error}`, error);
	}
}
