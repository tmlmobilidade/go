/* * */

import { type ExportedCalendarMapRow, type GtfsV29ExportConfig } from '@/types.js';
import { Logger } from '@tmlmobilidade/logger';

/* * */

/**
 * Exports calendar_map.txt — maps numeric service IDs back to their original text labels.
 * Only called when numeric_calendar_codes is enabled.
 * @param mapping - Map from text service ID to numeric string (e.g. "ALL" -> "1")
 * @param exportConfig - The export configuration
 */
export async function exportCalendarMap(
	mapping: Map<string, string>,
	exportConfig: GtfsV29ExportConfig,
): Promise<void> {
	try {
		Logger.info({ message: 'Exporting calendar_map.txt...' });

		// Sort entries by numeric value ascending for a clean output
		const sorted = Array.from(mapping.entries()).sort(([, a], [, b]) => Number(a) - Number(b));

		for (const [serviceLabel, serviceId] of sorted) {
			const row: ExportedCalendarMapRow = { service_id: serviceId, service_label: serviceLabel };
			await exportConfig.writers.calendar_map.write(row);
		}

		Logger.success(`Exported ${sorted.length} entries to calendar_map.txt`);
	} catch (error) {
		throw new Error(`Error exporting calendar map: ${error}`);
	}
}
