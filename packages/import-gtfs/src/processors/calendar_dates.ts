/* * */

import { type ImportGtfsToDatabaseConfig } from '@/types/config.js';
import { type ImportGtfsContext } from '@/types/context.js';
import { parseCsvFile } from '@/utils/parse-csv.js';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { GTFS_CalendarDate_Raw, validateGtfsCalendarDate } from '@tmlmobilidade/types';
import fs from 'node:fs';

/**
 * Processes the calendar_dates.txt file from the GTFS dataset.
 * It extracts service_ids that are valid between the given start_date and end_date,
 * and updates the context's calendar_dates map with the new dates.
 * @param context The import GTFS context to populate with calendar dates.
 * @param startDate The start date of the range to filter service_ids.
 * @param endDate The end date of the range to filter service_ids.
 */
export async function processCalendarDatesFile(context: ImportGtfsContext, config: ImportGtfsToDatabaseConfig): Promise<void> {
	try {
		//

		const calendarDatesParseTimer = new Timer();

		Logger.info(`Reading zip entry "calendar_dates.txt"...`);

		const parseEachRow = async (data: GTFS_CalendarDate_Raw) => {
			//

			//
			// Validate the current row against the proper type

			const validatedData = validateGtfsCalendarDate(data);

			//
			// Skip if this row's date is not between the given start and end dates
			// if they are provided in the config.

			if ('time_range' in config && config.time_range.date_range?.start && config.time_range.date_range?.end) {
				if (validatedData.date < config.time_range.date_range.start || validatedData.date > config.time_range.date_range.end) return;
			}

			//
			// Skip if this row's date is not in the given discrete dates array
			// if it is provided in the config.

			if ('time_range' in config && config.time_range.discrete_dates?.length) {
				if (!config.time_range.discrete_dates.includes(validatedData.date)) return;
			}

			//
			// If we're here, it means the service_id is valid between the given dates.
			// Get the previously saved calendars and check if it exists for this service_id.

			const savedCalendar = context.gtfs.calendar_dates[validatedData.service_id];

			if (savedCalendar) {
				// Create a new Set to avoid duplicated dates
				const updatedCalendar = new Set(savedCalendar);
				// If this service_id was previously saved, either add or remove the current date
				// to it based on the exception_type value for this row.
				if (validatedData.exception_type === 1) {
					updatedCalendar.add(validatedData.date);
					context.counters.calendar_dates++;
				} else if (validatedData.exception_type === 2) {
					updatedCalendar.delete(validatedData.date);
					context.counters.calendar_dates--;
				}
				// Update the service_id with the new dates
				context.gtfs.calendar_dates[validatedData.service_id] = Array.from(updatedCalendar);
			} else {
				// If this is the first time we're seeing this service_id, then it is only necessary
				// to initiate a new dates array if it is a service addition
				if (validatedData.exception_type === 1) {
					context.gtfs.calendar_dates[validatedData.service_id] = [validatedData.date];
					context.counters.calendar_dates++;
				}
			}

			//
		};

		//
		// Setup the CSV parsing operation only if the file exists

		if (fs.existsSync(`${context.workdir.extract_dir_path}/calendar_dates.txt`)) {
			await parseCsvFile(`${context.workdir.extract_dir_path}/calendar_dates.txt`, parseEachRow);
			Logger.success(`Finished processing "calendar_dates.txt": ${Object.keys(context.gtfs.calendar_dates).length} rows saved in ${calendarDatesParseTimer.get()}.`, 1);
		} else {
			Logger.info(`Optional file "calendar_dates.txt" not found. This may or may not be an error. Proceeding...`, 1);
		}

		//
	} catch (error) {
		Logger.error('Error processing "calendar_dates.txt" file.', error);
		throw new Error('✖︎ Error processing "calendar_dates.txt" file.');
	}
}
