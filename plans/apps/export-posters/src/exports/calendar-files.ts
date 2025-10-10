/* * */

import { DAY_TYPES } from '@/day-types.js';
import { type CalendarAssignmentsExt, CalendarExt, type ExportToHitouchConfig } from '@/types.js';
import { CsvWriter } from '@helperkits/writer';
import { type GtfsSQLTables } from '@tmlmobilidade/import-gtfs';
import { type GTFS_CalendarDate } from '@tmlmobilidade/types';
import { Dates, Logs } from '@tmlmobilidade/utils';

/* * */

export async function exportCalendarFiles(sqlTables: GtfsSQLTables, exportConfig: ExportToHitouchConfig) {
	//

	//
	// Export calendar-related files

	const calendarDatesCsv = new CsvWriter('calendar_dates.txt', `${exportConfig.workdir}/calendar_dates.txt`, { batch_size: 1000 });
	const dayTypesExtCsv = new CsvWriter('day_typesExt.txt', `${exportConfig.workdir}/day_typesExt.txt`, { batch_size: 1000 });
	const calendarAssignmentsExtCsv = new CsvWriter('calendar_assignmentsExt.txt', `${exportConfig.workdir}/calendar_assignmentsExt.txt`, { batch_size: 1000 });
	const calendarExtCsv = new CsvWriter('calendarExt.txt', `${exportConfig.workdir}/calendarExt.txt`, { batch_size: 1000 });

	//
	// Export the day_typesExt.txt file as it is a static file.

	for (const dayType of DAY_TYPES) {
		await dayTypesExtCsv.write(dayType);
	}

	//
	// Map service IDs to day_types based on their operational dates.
	// If a service_id operates on dates that belong to a specific day_type,
	// it should be assigned to that day_type in the calendar_assignmentsExt.txt file.

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
		for (const [dayTypeId, dates] of Object.entries(exportConfig.day_types)) {
			for (const dayTypeOperationalDate of dates) {
				if (currentServiceIdDates.includes(dayTypeOperationalDate)) {
					const data: CalendarAssignmentsExt = {
						day_type_id: dayTypeId,
						service_id: currentServiceId,
					};
					await calendarAssignmentsExtCsv.write(data);
				}
			}
		}
	}

	//
	// Now we need to handle exceptions for special service_ids.
	// These are service_ids that do not fit neatly into the day_type categories
	// based on their operational dates alone. For example, service_ids that operate
	// on single weekdays (e.g. only Mon, only Tue, etc), they should have an entry in calendarExt.txt
	// as an exception to the general day_type rules.

	for (const [currentServiceId, currentServiceIdDates] of sqlTables.calendar_dates.entries()) {
		//
		// Get the weekdays this service_id operates on

		const weekdaysSet = new Set<string>();
		for (const date of currentServiceIdDates) {
			const weekday = Dates
				.fromOperationalDate(date, 'Europe/Lisbon')
				.toFormat('c'); // '1' (Mon) to '7' (Sun)
			weekdaysSet.add(weekday);
		}
		const weekdays = Array.from(weekdaysSet).sort();

		//
		// Check if this set of weekdays matches any of the standard day_types.
		// If it does, no need to create an exception in calendarExt.txt

		const isExactDayTypeMatch = DAY_TYPES.find(dt =>
			dt.monday === weekdays.includes('1')
			&& dt.tuesday === weekdays.includes('2')
			&& dt.wednesday === weekdays.includes('3')
			&& dt.thursday === weekdays.includes('4')
			&& dt.friday === weekdays.includes('5')
			&& dt.saturday === weekdays.includes('6')
			&& dt.sunday === weekdays.includes('7'),
		);

		if (isExactDayTypeMatch) continue;

		//
		// Create a comment for this exception based on the weekdays it operates on

		const weekdayNames = weekdays.map((d) => {
			switch (d) {
				case '1': return 'Segundas';
				case '2': return 'Terças';
				case '3': return 'Quartas';
				case '4': return 'Quintas';
				case '5': return 'Sextas';
				case '6': return 'Sábados';
				case '7': return 'Domingos';
				default: return '';
			}
		});

		const comment = `Exceção: Apenas às ${weekdayNames.join(', ').replace(/, ([^,]*)$/, ' e $1')}`;

		const calendarException: CalendarExt = {
			comment: comment,
			index: weekdays.join(''),
			service_id: currentServiceId,
		};

		await calendarExtCsv.write(calendarException);

		//
	}

	//
	// Finalize CSV files

	await dayTypesExtCsv.flush();
	await calendarDatesCsv.flush();
	await calendarAssignmentsExtCsv.flush();
	await calendarExtCsv.flush();

	//
	// Log completion

	Logs.info('Exported calendar-related files');
}
