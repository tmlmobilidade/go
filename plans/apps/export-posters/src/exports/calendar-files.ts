/* * */

import { DAY_TYPES } from '@/day-types.js';
import { type CalendarAssignmentsExt, type CalendarExt, DayTypesExt, type ExportToHitouchConfig, type GTFS_Date } from '@/types.js';
import { CsvWriter } from '@helperkits/writer';
import { type GtfsSQLTables } from '@tmlmobilidade/import-gtfs';
import { type GTFS_CalendarDate } from '@tmlmobilidade/types';
import { Dates, Logs } from '@tmlmobilidade/utils';
import fs from 'node:fs';
import Papa from 'papaparse';

/* * */

export async function exportCalendarFiles(sqlTables: GtfsSQLTables, exportConfig: ExportToHitouchConfig) {
	//

	//
	// Import the dates.txt file into a map of date strings and their associated categorizations

	if (!fs.existsSync('/Users/joao/Developer/tmlmobilidade/sae/plans/apps/export-posters/src/dates.txt')) {
		Logs.error(`Missing dates.txt file in ${process.cwd()}`);
	}

	const datesCat = Papa.parse<GTFS_Date>(fs.readFileSync('/Users/joao/Developer/tmlmobilidade/sae/plans/apps/export-posters/src/dates.txt', 'utf-8'), {
		header: true,
		skipEmptyLines: true,
	});

	const datesMap = new Map<string, GTFS_Date>();
	datesCat.data.forEach(d => datesMap.set(d.date, d));

	//
	// Group dates by period, day_type, and holiday status

	for (const dayTypeConfig of DAY_TYPES) {
		dayTypeConfig.dates = datesCat.data
			.filter(d => d.period === dayTypeConfig.period && d.day_type === dayTypeConfig.day_type)
			.map(d => d.date)
			.sort();
	}

	//
	// Export calendar-related files

	const calendarDatesCsv = new CsvWriter('calendar_dates.txt', `${exportConfig.workdir}/calendar_dates.txt`, { batch_size: 100000 });
	const dayTypesExtCsv = new CsvWriter('day_typesExt.txt', `${exportConfig.workdir}/day_typesExt.txt`, { batch_size: 100000 });
	const calendarAssignmentsExtCsv = new CsvWriter('calendar_assignmentsExt.txt', `${exportConfig.workdir}/calendar_assignmentsExt.txt`, { batch_size: 100000 });
	const calendarExtCsv = new CsvWriter('calendarExt.txt', `${exportConfig.workdir}/calendarExt.txt`, { batch_size: 100000 });

	//
	// Export the day_typesExt.txt file as it is a static file.

	for (const dayType of DAY_TYPES) {
		const parsedDayType: DayTypesExt = {
			day_type_id: dayType._id,
			friday: ['1', '2', '3', '4', '5'].includes(dayType.index.toString()) ? true : false,
			monday: ['1', '2', '3', '4', '5'].includes(dayType.index.toString()) ? true : false,
			name: dayType.name,
			saturday: [2, 5, 8].includes(dayType.index) ? true : false,
			sequence_number: dayType.index,
			sunday: [3, 6, 9].includes(dayType.index) ? true : false,
			thursday: ['1', '2', '3', '4', '5'].includes(dayType.index.toString()) ? true : false,
			tuesday: ['1', '2', '3', '4', '5'].includes(dayType.index.toString()) ? true : false,
			wednesday: ['1', '2', '3', '4', '5'].includes(dayType.index.toString()) ? true : false,
		};
		await dayTypesExtCsv.write(parsedDayType);
	}

	//
	// Export service IDs to calendar_dates.txt

	for (const [currentServiceId, currentServiceIdDates] of sqlTables.calendar_dates.entries()) {
		const sortedDates = currentServiceIdDates.sort();
		for (const operationalDate of sortedDates) {
			const data: GTFS_CalendarDate = {
				date: operationalDate,
				exception_type: 1,
				service_id: currentServiceId,
			};
			await calendarDatesCsv.write(data);
		}
	}

	//
	// Map service IDs to day_types based on their operational dates.
	// If a service_id operates on dates that belong to a specific day_type,
	// it should be assigned to that day_type in the calendar_assignmentsExt.txt file.

	for (const [currentServiceId, currentServiceIdDates] of sqlTables.calendar_dates.entries()) {
		// Calendar-dates.txt
		const dayTypesAssigned: string[] = [];
		// Calendar-assignmentsExt.txt
		for (const dayTypeConfig of DAY_TYPES) {
			//
			// Check if this service_id operates on any dates that belong to this day_type
			if (dayTypesAssigned.includes(dayTypeConfig._id)) continue;
			const hasMatchingDate = dayTypeConfig.dates.some(date => currentServiceIdDates.includes(date));
			if (!hasMatchingDate) continue;
			dayTypesAssigned.push(dayTypeConfig._id);
		}
		for (const dayTypeId of dayTypesAssigned) {
			const assignment: CalendarAssignmentsExt = {
				day_type_id: dayTypeId,
				service_id: currentServiceId,
			};
			await calendarAssignmentsExtCsv.write(assignment);
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

		//
		// If this service_id has only one date, set it as an exception

		if (currentServiceIdDates.length <= 2) {
			const datesFormatted = currentServiceIdDates.map((date) => {
				const formattedDate = Dates
					.fromOperationalDate(date, 'Europe/Lisbon')
					.toFormat('dd/LL/yyyy');
				return formattedDate;
			});
			const calendarException: CalendarExt = {
				comment: `Apenas ${datesFormatted.join(' e ')}`,
				index: 'º',
				service_id: currentServiceId,
			};
			await calendarExtCsv.write(calendarException);
			continue;
		}

		//
		// Get the weekdays this service_id operates on

		const weekdaysSet = new Set<string>();
		for (const date of currentServiceIdDates) {
			const weekday = Dates
				.fromOperationalDate(date, 'Europe/Lisbon')
				.toFormat('c'); // '1' (Mon) to '7' (Sun)
			const dateCategory = datesMap.get(date);
			if (!dateCategory || dateCategory.holiday === '1') continue;
			weekdaysSet.add(weekday);
		}
		const weekdays = Array.from(weekdaysSet).sort();

		//
		// Check if this set of weekdays matches any of the standard day_types.
		// If it does, no need to create an exception in calendarExt.txt

		const isBusinessDays = weekdays.includes('1') && weekdays.includes('2') && weekdays.includes('3') && weekdays.includes('4') && weekdays.includes('5');
		const isSaturdays = weekdays[0] === '6';
		const isSundays = weekdays[0] === '7';

		if (isBusinessDays || isSaturdays || isSundays) continue;

		console.log('Processing service_id:', currentServiceId, currentServiceIdDates.length, 'with weekdays:', weekdays);

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
		}).filter(Boolean);

		if (!weekdayNames.length) continue;

		console.log('weekdayNames', weekdayNames);

		const comment = `Apenas ${weekdayNames.join(', ').replace(/, ([^,]*)$/, ' e $1')}`;

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
