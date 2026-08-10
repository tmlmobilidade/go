/* * */

import { type ExportedCalendarDatesRow, type GtfsV29ExportConfig } from '@/types.js';
import { getDayType, getPeriodForDate } from '@/utils/calendar-helpers.js';
import { type ServiceRegistry } from '@/utils/service-registry.js';
import { Dates, isHoliday } from '@tmlmobilidade/dates';
import { Logger } from '@tmlmobilidade/logger';
import { type Holiday, type YearPeriod } from '@tmlmobilidade/types';

/* * */

/**
 * Exports calendar_dates.txt with all service_ids and their dates
 * Calculates day_type, holiday, and period for each date
 *
 * @param serviceRegistry - The service registry containing all service_ids and dates
 * @param periods - Map of all periods
 * @param holidays - Map of all holidays
 * @param exportConfig - Export configuration
 */
export async function exportCalendarDates(
	serviceRegistry: ServiceRegistry,
	periods: Map<string, YearPeriod>,
	holidays: Map<string, Holiday>,
	exportConfig: GtfsV29ExportConfig,
) {
	try {
		Logger.info({ message: 'Exporting calendar dates...' });

		const allServices = serviceRegistry.getAllServices();
		Logger.info({ message: `Exporting ${allServices.size} unique service IDs...` });

		const holidaysArray = Array.from(holidays.values());

		let totalRows = 0;

		for (const serviceInfo of allServices.values()) {
			for (const date of serviceInfo.dates) {
				const dateObj = Dates.fromOperationalDate(date, 'Europe/Lisbon');

				const row: ExportedCalendarDatesRow = {
					date,
					day_type: getDayType(date, holidaysArray),
					exception_type: 1, // Service added (all our dates are service additions)
					holiday: isHoliday(dateObj, holidaysArray) ? 1 : 0,
					period: getPeriodForDate(date, periods),
					service_id: serviceInfo.serviceId,
				};

				await exportConfig.writers.calendar_dates.write(row);
				totalRows++;
			}
		}

		Logger.success(`Exported ${allServices.size} service IDs (${totalRows} total rows) to calendar_dates.txt`);
	} catch (error) {
		throw new Error(`Error exporting calendar dates: ${error}`);
	}
}
