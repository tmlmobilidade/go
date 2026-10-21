/* * */

import { type GtfsSteppV1ExportConfig } from '@/types.js';
import { type ServiceRegistry } from '@/utils/service-registry.js';
import { type GtfsStrictV30SteppCalendarDates } from '@tmlmobilidade/go-types-gtfs-strict';
import { OperationalDateIntSchema } from '@tmlmobilidade/go-types-shared';
import { Logger } from '@tmlmobilidade/go-utils-telemetry';

/* * */

/**
 * Exports calendar_dates.txt with all service_ids and their dates,
 * clipped to the [clip_start_date, clip_end_date] range (inclusive)
 *
 * @param serviceRegistry - The service registry containing all service_ids and dates
 * @param exportConfig - Export configuration
 */
export async function exportCalendarDates(
	serviceRegistry: ServiceRegistry,
	exportConfig: GtfsSteppV1ExportConfig,
) {
	try {
		Logger.info({ message: 'Exporting calendar dates...' });

		const allServices = serviceRegistry.getAllServices();
		Logger.info({ message: `Exporting ${allServices.size} unique service IDs...` });

		// Operational dates are 'yyyyMMdd' strings, so they compare chronologically
		const { end_date: endDate, start_date: startDate } = exportConfig;
		if (startDate > endDate) throw new Error(`start_date (${startDate}) is after end_date (${endDate})`);

		let totalRows = 0;
		let exportedServices = 0;

		for (const serviceInfo of allServices.values()) {
			const clippedDates = Array.from(serviceInfo.dates).filter(date => date >= startDate && date <= endDate).sort();
			if (clippedDates.length > 0) exportedServices++;

			for (const date of clippedDates) {
				const row: GtfsStrictV30SteppCalendarDates = {
					date: OperationalDateIntSchema.parse(date),
					exception_type: '1', // Service added (all our dates are service additions)
					service_id: serviceInfo.serviceId,
				};

				await exportConfig.writers.calendar_dates.write(row);
				totalRows++;
			}
		}

		Logger.success(`Exported ${exportedServices} service IDs (${totalRows} total rows) between ${startDate} and ${endDate} to calendar_dates.txt`);
	} catch (error) {
		throw new Error(`Error exporting calendar dates: ${error}`, error);
	}
}
