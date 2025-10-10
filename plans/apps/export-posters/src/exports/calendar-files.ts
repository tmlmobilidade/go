/* * */

import { DAY_TYPES } from '@/day-types.js';
import { type CalendarAssignmentsExt, type ExportToHitouchConfig } from '@/types.js';
import { CsvWriter } from '@helperkits/writer';
import { type GtfsSQLTables } from '@tmlmobilidade/import-gtfs';
import { type GTFS_CalendarDate } from '@tmlmobilidade/types';
import { Logs } from '@tmlmobilidade/utils';

/* * */

export async function exportCalendarFiles(sqlTables: GtfsSQLTables, exportConfig: ExportToHitouchConfig) {
	//
	// Export calendar-related files

	const calendarDatesCsv = new CsvWriter('calendar_dates.txt', `${exportConfig.workdir}/calendar_dates.txt`, { batch_size: 1000 });
	const dayTypesExtCsv = new CsvWriter('day_typesExt.txt', `${exportConfig.workdir}/day_typesExt.txt`, { batch_size: 1000 });
	const calendarAssignmentsExtCsv = new CsvWriter('calendar_assignmentsExt.txt', `${exportConfig.workdir}/calendar_assignmentsExt.txt`, { batch_size: 1000 });

	for (const dayType of DAY_TYPES) {
		await dayTypesExtCsv.write(dayType);
	}

	for (const [currentServiceId, currentServiceIdDates] of sqlTables.calendar_dates.entries()) {
		// Calendar-dates.txt
		for (const operationalDate of currentServiceIdDates) {
			const data: GTFS_CalendarDate = {
				date: operationalDate,
				exception_type: 1,
				service_id: currentServiceId,
			};
			await calendarDatesCsv.write(data);
		}
		// Calendar-assignmentsExt.txt
		for (const [dayTypeId, dayTypeOperationalDate] of Object.entries(exportConfig.day_types)) {
			if (currentServiceIdDates.includes(dayTypeOperationalDate)) {
				const data: CalendarAssignmentsExt = {
					day_type_id: dayTypeId,
					service_id: currentServiceId,
				};
				await calendarAssignmentsExtCsv.write(data);
			}
		}
	}

	await dayTypesExtCsv.flush();
	await calendarDatesCsv.flush();
	await calendarAssignmentsExtCsv.flush();

	Logs.info('Exported calendar-related files');
}
