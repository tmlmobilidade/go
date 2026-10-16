/* eslint-disable perfectionist/sort-objects */
/* * */

import { type GtfsSteppV1ExportConfig } from '@/types.js';
import { type ServiceRegistry } from '@/utils/service-registry.js';
import { type GtfsBinary } from '@tmlmobilidade/go-types-gtfs';
import { type GtfsStrictV30SteppCalendarStepp } from '@tmlmobilidade/go-types-gtfs-strict';
import { type Holiday } from '@tmlmobilidade/go-types-offer';
import { Logger } from '@tmlmobilidade/go-utils-telemetry';

/* * */

const HOLIDAY_FIELDS = [
	'sunday_holiday',
	'monday_holiday',
	'tuesday_holiday',
	'wednesday_holiday',
	'thursday_holiday',
	'friday_holiday',
	'saturday_holiday',
] as const;

/**
 * Exports calendar_stepp.txt with one row per service exported to calendar.txt.
 * A weekday's holiday flag is '1' only when the service runs on every holiday
 * of that weekday between its first and last exported dates. Weekdays without
 * holidays in that range are '0'. Regular dates do not affect these flags.
 *
 * @param serviceRegistry - The service registry containing all service IDs and dates
 * @param holidays - The holidays applicable to the exported agency
 * @param exportConfig - Export configuration
 */
export async function exportCalendarStepp(
	serviceRegistry: ServiceRegistry,
	holidays: Holiday[],
	exportConfig: GtfsSteppV1ExportConfig,
) {
	try {
		Logger.info({ message: 'Exporting calendar STEPP...' });

		const { end_date: endDate, start_date: startDate } = exportConfig;
		if (startDate > endDate) throw new Error(`start_date (${startDate}) is after end_date (${endDate})`);

		// A date may belong to several holiday records; count it only once.
		const holidayDates = new Set(holidays.flatMap(holiday => holiday.dates));
		const holidaysByWeekday = HOLIDAY_FIELDS.map(() => [] as Holiday['dates']);
		for (const date of holidayDates) {
			if (date < startDate || date > endDate) continue;
			// Use the actual weekday: holiday-aware calendarWeekday treats all holidays as Sundays.
			const weekday = new Date(Date.UTC(Number(date.slice(0, 4)), Number(date.slice(4, 6)) - 1, Number(date.slice(6, 8)))).getUTCDay();
			holidaysByWeekday[weekday].push(date);
		}

		let totalRows = 0;

		for (const serviceInfo of serviceRegistry.getAllServices().values()) {
			const clippedDates = Array.from(serviceInfo.dates).filter(date => date >= startDate && date <= endDate).sort();
			if (clippedDates.length === 0) continue;

			const serviceStartDate = clippedDates[0];
			const serviceEndDate = clippedDates[clippedDates.length - 1];
			const weekdays = Object.fromEntries(HOLIDAY_FIELDS.map((field, index) => {
				const dates = holidaysByWeekday[index].filter(date => date >= serviceStartDate && date <= serviceEndDate);
				const runsEveryHoliday = dates.length > 0 && dates.every(date => serviceInfo.dates.has(date));
				return [field, runsEveryHoliday ? '1' : '0'];
			})) as Record<typeof HOLIDAY_FIELDS[number], GtfsBinary>;

			const row: GtfsStrictV30SteppCalendarStepp = {
				service_id: serviceInfo.serviceId,
				monday_holiday: weekdays.monday_holiday,
				tuesday_holiday: weekdays.tuesday_holiday,
				wednesday_holiday: weekdays.wednesday_holiday,
				thursday_holiday: weekdays.thursday_holiday,
				friday_holiday: weekdays.friday_holiday,
				saturday_holiday: weekdays.saturday_holiday,
				sunday_holiday: weekdays.sunday_holiday,
			};

			await exportConfig.writers.calendar_stepp.write(row);
			totalRows++;
		}

		Logger.success(`Exported ${totalRows} service IDs between ${startDate} and ${endDate} to calendar_stepp.txt`);
	} catch (error) {
		throw new Error(`Error exporting calendar STEPP: ${error}`, { cause: error });
	}
}
