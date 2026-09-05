/* * */

import { type GtfsStrictV29ExtCalendar, GtfsStrictV29ExtCalendarSchema } from '@tmlmobilidade/go-types-gtfs-strict';
import { type OperationalDateInt, OperationalDateIntSchema } from '@tmlmobilidade/go-types-shared';
import { Dates, getOperationalDatesFromRange } from '@tmlmobilidade/go-utils-dates';
import { streamCsvFile } from '@tmlmobilidade/go-utils-exec';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import fs from 'node:fs';

import { type ImportGtfsContext } from '../../../shared/init-context.js';
import { type GtfsStrictV29ExtSQLTables } from '../types.js';

/**
 * Processes the calendar.txt file from the GTFS dataset.
 * It extracts service_ids that are valid between the given start_date and end_date,
 * and populates the context's calendar_dates map with operational dates for each service_id.
 * @param context The import GTFS context to populate with calendar dates.
 * @param startDate The start date of the range to filter service_ids.
 * @param endDate The end date of the range to filter service_ids.
 */
export async function processGtfsStrictV29ExtCalendar(context: ImportGtfsContext<GtfsStrictV29ExtSQLTables>): Promise<void> {
	try {
		//

		const calendarParseTimer = new Timer();

		Logger.info({ message: 'Reading zip entry "calendar.txt"...' });

		const parseEachRow = async (data: GtfsStrictV29ExtCalendar) => {
			//

			//
			// Validate the current row against the proper type

			const validatedData = GtfsStrictV29ExtCalendarSchema.safeParse(data);

			//
			// Setup an array to keep track of the valid operational dates for this service_id
			// for the given start_date and end_date or single dates from the config.

			const allDatesInRange = new Set<OperationalDateInt>();

			//
			// If the config is of date-range type, check if this service_id
			// is between the given start_date and end_date. Clip the service_id's
			// start and end dates to the given start and end dates.

			if ('time_range' in context.config && context.config.time_range?.date_range?.start && context.config.time_range?.date_range?.end) {
				let serviceIdStartDate = validatedData.data.start_date;
				let serviceIdEndDate = validatedData.data.end_date;

				if (serviceIdEndDate < context.config.time_range.date_range.start || serviceIdStartDate > context.config.time_range.date_range.end) return;

				if (serviceIdStartDate < context.config.time_range.date_range.start) serviceIdStartDate = context.config.time_range.date_range.start;
				if (serviceIdEndDate > context.config.time_range.date_range.end) serviceIdEndDate = context.config.time_range.date_range.end;

				const operationalDates = getOperationalDatesFromRange(OperationalDateIntSchema.parse(serviceIdStartDate), OperationalDateIntSchema.parse(serviceIdEndDate));

				operationalDates.forEach(date => allDatesInRange.add(OperationalDateIntSchema.parse(date)));
			}

			//
			// If the config is of discrete-dates type, get the operational dates
			// for this service_id that are in the given discrete dates array.

			if ('time_range' in context.config && context.config.time_range?.discrete_dates?.length) {
				context.config.time_range.discrete_dates.forEach((date) => {
					if (date >= validatedData.data.start_date && date <= validatedData.data.end_date) {
						allDatesInRange.add(date);
					}
				});
			}

			//
			// If we're here, it means the service_id is valid between the given dates.
			// For the configured weekly schedule, create the individual operational dates
			// for each day of the week that is active.

			const validOperationalDates = new Set<OperationalDateInt>();

			for (const currentDate of allDatesInRange) {
				const dayOfWeek = Dates.fromOperationalDateInt(currentDate, 'Europe/Lisbon').toFormat('c');
				if (dayOfWeek === '1' && validatedData.data.monday === '1') validOperationalDates.add(currentDate);
				if (dayOfWeek === '2' && validatedData.data.tuesday === '1') validOperationalDates.add(currentDate);
				if (dayOfWeek === '3' && validatedData.data.wednesday === '1') validOperationalDates.add(currentDate);
				if (dayOfWeek === '4' && validatedData.data.thursday === '1') validOperationalDates.add(currentDate);
				if (dayOfWeek === '5' && validatedData.data.friday === '1') validOperationalDates.add(currentDate);
				if (dayOfWeek === '6' && validatedData.data.saturday === '1') validOperationalDates.add(currentDate);
				if (dayOfWeek === '7' && validatedData.data.sunday === '1') validOperationalDates.add(currentDate);
			}

			//
			// Save the valid operational dates for this service_id

			context.gtfs.calendar_dates[validatedData.data.service_id] = Array.from(validOperationalDates);

			context.counters.calendar_dates += validOperationalDates.size;

			//
		};

		//
		// Setup the CSV parsing operation only if the file exists

		if (fs.existsSync(`${context.workdir.extract_dir_path}/calendar.txt`)) {
			await streamCsvFile(`${context.workdir.extract_dir_path}/calendar.txt`, parseEachRow);
			Logger.success(`Finished processing "calendar.txt": ${context.gtfs.calendar_dates.size} rows saved in ${calendarParseTimer.get()}.`, 1);
		} else {
			Logger.info({ message: 'Optional file "calendar.txt" not found. This may or may not be an error. Proceeding...' });
		}

		//
	} catch (error) {
		Logger.error({ error, message: `Error processing "calendar.txt" file: ${error.message}` });
		throw new Error('✖︎ Error processing "calendar.txt" file.', error);
	}
}
