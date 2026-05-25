/* * */

import { type ImportGtfsToDatabaseConfig } from '@/types/config.js';
import { type ImportGtfsContext } from '@/types/context.js';
import { parseCsvFile } from '@/utils/parse-csv.js';
import { Dates, getOperationalDatesFromRange } from '@tmlmobilidade/dates';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { GTFS_Calendar_Raw, validateGtfsCalendar } from '@tmlmobilidade/types';
import { OperationalDate } from '@tmlmobilidade/types';
import fs from 'node:fs';

/**
 * Processes the calendar.txt file from the GTFS dataset.
 * It extracts service_ids that are valid between the given start_date and end_date,
 * and populates the context's calendar_dates map with operational dates for each service_id.
 * @param context The import GTFS context to populate with calendar dates.
 * @param startDate The start date of the range to filter service_ids.
 * @param endDate The end date of the range to filter service_ids.
 */
export async function processCalendarFile(context: ImportGtfsContext, config: ImportGtfsToDatabaseConfig): Promise<void> {
	try {
		//

		const calendarParseTimer = new Timer();

		Logger.info(`Reading zip entry "calendar.txt"...`);

		const parseEachRow = async (data: GTFS_Calendar_Raw) => {
			//

			//
			// Validate the current row against the proper type

			const validatedData = validateGtfsCalendar(data);

			//
			// Setup an array to keep track of the valid operational dates for this service_id
			// for the given start_date and end_date or single dates from the config.

			const allOperationalDatesInRange: OperationalDate[] = [];

			//
			// If the config is of date-range type, check if this service_id
			// is between the given start_date and end_date. Clip the service_id's
			// start and end dates to the given start and end dates.

			if ('date_range' in config && config.date_range?.start && config.date_range?.end) {
				let serviceIdStartDate = validatedData.start_date;
				let serviceIdEndDate = validatedData.end_date;

				if (serviceIdEndDate < config.date_range.start || serviceIdStartDate > config.date_range.end) return;

				if (serviceIdStartDate < config.date_range.start) serviceIdStartDate = config.date_range.start;
				if (serviceIdEndDate > config.date_range.end) serviceIdEndDate = config.date_range.end;

				const operationalDates = getOperationalDatesFromRange(serviceIdStartDate, serviceIdEndDate);

				allOperationalDatesInRange.push(...operationalDates);
			}

			//
			// If the config is of discrete-dates type, get the operational dates
			// for this service_id that are in the given discrete dates array.

			if ('discrete_dates' in config && config.discrete_dates?.length) {
				config.discrete_dates.forEach((date) => {
					if (date >= validatedData.start_date && date <= validatedData.end_date) {
						allOperationalDatesInRange.push(date);
					}
				});
			}

			//
			// If we're here, it means the service_id is valid between the given dates.
			// For the configured weekly schedule, create the individual operational dates
			// for each day of the week that is active.

			const validOperationalDates = new Set<OperationalDate>();

			for (const currentDate of allOperationalDatesInRange) {
				const dayOfWeek = Dates.fromOperationalDate(currentDate, 'Europe/Lisbon').toFormat('c');
				if (dayOfWeek === '1' && validatedData.monday === 1) validOperationalDates.add(currentDate);
				if (dayOfWeek === '2' && validatedData.tuesday === 1) validOperationalDates.add(currentDate);
				if (dayOfWeek === '3' && validatedData.wednesday === 1) validOperationalDates.add(currentDate);
				if (dayOfWeek === '4' && validatedData.thursday === 1) validOperationalDates.add(currentDate);
				if (dayOfWeek === '5' && validatedData.friday === 1) validOperationalDates.add(currentDate);
				if (dayOfWeek === '6' && validatedData.saturday === 1) validOperationalDates.add(currentDate);
				if (dayOfWeek === '7' && validatedData.sunday === 1) validOperationalDates.add(currentDate);
			}

			//
			// Save the valid operational dates for this service_id

			context.gtfs.calendar_dates[validatedData.service_id] = Array.from(validOperationalDates);

			context.counters.calendar_dates += validOperationalDates.size;

			//
		};

		//
		// Setup the CSV parsing operation only if the file exists

		if (fs.existsSync(`${context.workdir.extract_dir_path}/calendar.txt`)) {
			await parseCsvFile(`${context.workdir.extract_dir_path}/calendar.txt`, parseEachRow);
			Logger.success(`Finished processing "calendar.txt": ${context.gtfs.calendar_dates.size} rows saved in ${calendarParseTimer.get()}.`, 1);
		} else {
			Logger.info(`Optional file "calendar.txt" not found. This may or may not be an error. Proceeding...`, 1);
		}

		//
	} catch (error) {
		Logger.error('Error processing "calendar.txt" file.', error);
		throw new Error('✖︎ Error processing "calendar.txt" file.');
	}
}
