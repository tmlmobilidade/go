/* * */

import { type GtfsSteppV1ExportConfig } from '@/types.js';
import { type ServiceRegistry } from '@/utils/service-registry.js';
import { type GtfsStrictV30SteppCalendarDates } from '@tmlmobilidade/go-types-gtfs-strict';
import { OperationalDateIntSchema } from '@tmlmobilidade/go-types-shared';
import { Logger } from '@tmlmobilidade/go-utils-telemetry';

/* * */

/**
 * Exports calendar_dates.txt with all service_ids and their dates
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

		let totalRows = 0;

		for (const serviceInfo of allServices.values()) {
			for (const date of serviceInfo.dates) {
				const row: GtfsStrictV30SteppCalendarDates = {
					date: OperationalDateIntSchema.parse(date),
					exception_type: '1', // Service added (all our dates are service additions)
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
