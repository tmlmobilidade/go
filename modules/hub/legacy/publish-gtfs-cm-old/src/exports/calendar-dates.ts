/* eslint-disable perfectionist/sort-objects */
/* eslint-disable perfectionist/sort-interfaces */

import { type MergedGtfsExportConfig } from '@/types.js';
import { type Plan } from '@tmlmobilidade/go-types-operation';
import { type OperationalDateInt, OperationalDateIntSchema } from '@tmlmobilidade/go-types-shared';
import { type GtfsSQLTables } from '@tmlmobilidade/import-gtfs';
import { Logger } from '@tmlmobilidade/logger';

/* * */

export interface ExportedCalendarDatesRow {
	service_id: string
	date: OperationalDateInt
	exception_type: 1 // Only type 1 (added) is supported in merged exports
}

/* * */

export async function exportCalendarDatesRows(planData: Plan, sqlTables: GtfsSQLTables, exportConfig: MergedGtfsExportConfig) {
	//

	for (const [serviceId, operationalDatesList] of Object.entries(sqlTables.calendar_dates)) {
		for (const operationalDate of operationalDatesList.sort()) {
			const parsedCalendarDatesRow: ExportedCalendarDatesRow = {
				service_id: `[${planData._id}]${serviceId}`,
				date: OperationalDateIntSchema.parse(operationalDate),
				exception_type: 1,
			};
			await exportConfig.writers.calendar_dates.write(parsedCalendarDatesRow);
		}
	}

	await exportConfig.writers.calendar_dates.flush();

	Logger.info({ message: 'Exported calendar_dates.txt file.' });
}
