/* * */

import { ExportedCalendarDatesRow, GtfsV29ExportConfig } from '@/versions/v29/types.js';
import { getDayType } from '@/versions/v29/utils/calendar-helpers.js';
import { createV29PeriodResolver } from '@/versions/v29/utils/period-mapping.js';
import { type ServiceRegistry } from '@/versions/v29/utils/service-registry.js';
import { type Holiday, type YearPeriod } from '@tmlmobilidade/go-types-offer';
import { OperationalDateIntSchema } from '@tmlmobilidade/go-types-shared';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { isHoliday } from '@tmlmobilidade/go-utils-offer';
import { Logger } from '@tmlmobilidade/go-utils-telemetry';

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
		const periodResolvers = new Map<string, ReturnType<typeof createV29PeriodResolver>>();

		let totalRows = 0;

		for (const serviceInfo of allServices.values()) {
			let resolvePeriod = periodResolvers.get(serviceInfo.agencyId);
			if (!resolvePeriod) {
				resolvePeriod = createV29PeriodResolver(serviceInfo.agencyId, periods.values());
				periodResolvers.set(serviceInfo.agencyId, resolvePeriod);
			}

			for (const date of serviceInfo.dates) {
				const dateObj = Dates.fromOperationalDateInt(date, 'Europe/Lisbon');

				const row: ExportedCalendarDatesRow = {
					date: OperationalDateIntSchema.parse(date),
					day_type: String(getDayType(date, holidaysArray)) as '1' | '2' | '3',
					exception_type: '1', // Service added (all our dates are service additions)
					holiday: isHoliday(dateObj, holidaysArray) ? '1' : '0',
					period: resolvePeriod(date),
					service_id: serviceInfo.serviceId,
				};

				await exportConfig.writers.calendar_dates.write(row);
				totalRows++;
			}
		}

		Logger.success(`Exported ${allServices.size} service IDs (${totalRows} total rows) to calendar_dates.txt`);
	} catch (error) {
		throw new Error(`Error exporting calendar dates: ${error}`, error);
	}
}
