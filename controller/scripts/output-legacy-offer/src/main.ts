/* * */

import { type OfferJourney, type OfferStop } from '@/types.js';
import LOGGER from '@helperkits/logger';
import TIMETRACKER from '@helperkits/timer';
import { JsonWriter } from '@helperkits/writer';
import { type OperationalDate, type Route_TMLExtended, type Trip_TMLExtended, validateOperationalDate } from '@tmlmobilidade/types';
import { Dates } from '@tmlmobilidade/utils';
import { parse as csvParser } from 'csv-parse';
import extract from 'extract-zip';
import fs from 'fs';
import { type Calendar, type CalendarDates, ExceptionType, type Stop, type StopTime } from 'gtfs-types';

/* * */

export async function generateOfferOutput(filePath: string, startDate: OperationalDate, endDate: OperationalDate, outputDir: string, feedId: null | string): Promise<void> {
	try {
		//

		LOGGER.init();

		const globalTimer = new TIMETRACKER();

		//
		// Setup the JSON batch writers to speed up the writing process and
		// reduce the number of filesystem operations. These writers keep data
		// in memory and write it to disk once the batch limit is reached.

		const offerStopsWriter = new JsonWriter<OfferStop>('offer-stops', `${outputDir}/offer-stops.json`, { add_after: '}', add_before: '{"payload":', batch_size: 100000 });
		const offerJourneysWriter = new JsonWriter<OfferJourney>('offer-journeys', `${outputDir}/offer-journeys.json`, { add_after: '}', add_before: '{"payload":', batch_size: 100000 });

		//
		// Setup the required variables to keep track of the entities
		// that should be saved as well as the original data that will
		// be used to create the OfferJourney and OfferStop objects.

		const referencedRouteIds = new Set<string>();

		const savedCalendarDates = new Map<string, OperationalDate[]>();
		const savedTrips = new Map<string, Trip_TMLExtended>();
		const savedStops = new Map<string, Stop>();
		const savedRoutes = new Map<string, Partial<Route_TMLExtended>>();
		const savedStopTimes = new Map<string, (Stop & StopTime)[]>();

		let totalOfferJourneysCounter = 0;
		let totalOfferStopsCounter = 0;

		//
		// Prepare the working directories to work with the zip file
		// and the extracted files. Try to unzip the archive.

		const workdirPath = `/tmp/legacy-offer`;
		const extractDirPath = `${workdirPath}/extracted`;

		try {
			fs.rmSync(workdirPath, { recursive: true });
			fs.mkdirSync(workdirPath, { recursive: true });
			LOGGER.success('Prepared working directory.');
			LOGGER.spacer(1);
		}
		catch (error) {
			LOGGER.error(`Error preparing workdir path "${workdirPath}".`, error);
			process.exit(1);
		}

		try {
			await unzipFile(filePath, extractDirPath);
			LOGGER.success(`Unzipped GTFS file from "${filePath}" to "${extractDirPath}".`);
			LOGGER.spacer(1);
		}
		catch (error) {
			LOGGER.error('Error unzipping the file.', error);
			process.exit(1);
		}

		//
		// The order of execution matters when parsing each .txt file.
		// This is because GTFS have a temporal validity. By first parsing calendar.txt
		// and then calendar_dates.txt, we know exactly which service_ids "were active"
		// between the start and end dates. Then, when parsing trips.txt, only trips
		// that belong to those service_ids will be included. And so on, for each file.
		// By having a list of trips we can extract only the necessary info from the other files,
		// and thus significantly reducing the amount of information to be checked.

		// --------------------------------------------------------------------------------------

		/* * */
		/* CALENDAR.TXT */

		//
		// Extract calendar.txt and filter only service_ids
		// that are valid between the given start_date and end_date.

		try {
			//

			LOGGER.info(`Reading zip entry "calendar.txt"...`);

			const parseEachRow = async (data: Calendar) => {
				//

				//
				// Validate the start and end dates to ensure
				// they are of in the OperationalDate format

				let serviceIdStartDate: OperationalDate;
				let serviceIdEndDate: OperationalDate;

				try {
					serviceIdStartDate = validateOperationalDate(data.start_date);
					serviceIdEndDate = validateOperationalDate(data.end_date);
				}
				catch (error) {
					LOGGER.error(`Error creating operational date "${data.start_date}" or "${data.end_date}" for service_id "${data.service_id}"`, error);
					return;
				}

				//
				// Check if this service_id is between the given start_date and end_date.
				// Clip the service_id's start and end dates to the given start and end dates.

				if (serviceIdEndDate < startDate || serviceIdStartDate > endDate) return;

				if (serviceIdStartDate < startDate) serviceIdStartDate = startDate;
				if (serviceIdEndDate > endDate) serviceIdEndDate = endDate;

				//
				// If we're here, it means the service_id is valid between the given dates.
				// For the configured weekly schedule, create the individual operational dates
				// for each day of the week that is active.

				const allOperationalDatesInRange = getIndividualDatesFromRange(serviceIdStartDate, serviceIdEndDate);

				const validOperationalDates: OperationalDate[] = [];

				for (const currentDate of allOperationalDatesInRange) {
					const dayOfWeek = Dates.fromOperationalDate(currentDate, 'Europe/Lisbon').toFormat('c');
					if (dayOfWeek === '1' && String(data.monday) === '1') validOperationalDates.push(currentDate);
					if (dayOfWeek === '2' && String(data.tuesday) === '1') validOperationalDates.push(currentDate);
					if (dayOfWeek === '3' && String(data.wednesday) === '1') validOperationalDates.push(currentDate);
					if (dayOfWeek === '4' && String(data.thursday) === '1') validOperationalDates.push(currentDate);
					if (dayOfWeek === '5' && String(data.friday) === '1') validOperationalDates.push(currentDate);
					if (dayOfWeek === '6' && String(data.saturday) === '1') validOperationalDates.push(currentDate);
					if (dayOfWeek === '7' && String(data.sunday) === '1') validOperationalDates.push(currentDate);
				}

				//
				// Save the valid operational dates for this service_id

				savedCalendarDates.set(data.service_id, validOperationalDates);

				//
			};

			//
			// Setup the CSV parsing operation only if the file exists

			if (fs.existsSync(`${extractDirPath}/calendar.txt`)) {
				await parseCsvFile(`${extractDirPath}/calendar.txt`, parseEachRow);
				LOGGER.success(`Finished processing "calendar.txt"`);
				LOGGER.spacer(1);
			}
			else {
				LOGGER.info(`Optional file "calendar.txt" not found. This may or may not be an error. Proceeding...`);
				LOGGER.spacer(1);
			}

			//
		}
		catch (error) {
			LOGGER.error('Error processing "calendar.txt" file.', error);
			throw new Error('✖︎ Error processing "calendar.txt" file.');
		}

		/* * */
		/* CALENDAR_DATES.TXT */

		//
		// Extract calendar_dates.txt and either update the previously saved service_ids,
		// based on the configured exception_type, or create new service_ids that were not
		// present in calendar.txt and are between the given start and end dates.

		try {
			//

			LOGGER.info(`Reading zip entry "calendar_dates.txt"...`);

			const parseEachRow = async (data: CalendarDates) => {
				//

				//
				// Validate the date to ensure it is of type OperationalDate

				let currentOperationalDate: OperationalDate;

				try {
					currentOperationalDate = validateOperationalDate(data.date);
				}
				catch (error) {
					LOGGER.error(`Error creating operational date "${data.date}" for service_id "${data.service_id}"`, error);
					return;
				}

				//
				// Skip if this row's date is not between the given start and end dates

				if (currentOperationalDate < startDate || currentOperationalDate > endDate) return;

				//
				// If we're here, it means the service_id is valid between the given dates.
				// Get the previously saved calendars and check if it exists for this service_id.

				const savedCalendar = savedCalendarDates.get(data.service_id);

				if (savedCalendar) {
					// Create a new Set to avoid duplicated dates
					const updatedCalendar = new Set(savedCalendar);
					// If this service_id was previously saved, either add or remove the current date
					// to it based on the exception_type value for this row.
					if (Number(data.exception_type) === ExceptionType.SERVICE_ADDED) updatedCalendar.add(currentOperationalDate);
					else if (Number(data.exception_type) === ExceptionType.SERVICE_REMOVED) updatedCalendar.delete(currentOperationalDate);
					// Update the service_id with the new dates
					savedCalendarDates.set(data.service_id, Array.from(updatedCalendar));
				}
				else {
					// If this is the first time we're seeing this service_id, then it is only necessary
					// to initiate a new dates array if it is a service addition
					if (Number(data.exception_type) === ExceptionType.SERVICE_ADDED) {
						savedCalendarDates.set(data.service_id, [currentOperationalDate]);
					}
				}

				//
			};

			//
			// Setup the CSV parsing operation only if the file exists

			if (fs.existsSync(`${extractDirPath}/calendar_dates.txt`)) {
				await parseCsvFile(`${extractDirPath}/calendar_dates.txt`, parseEachRow);
				LOGGER.success(`Finished processing "calendar_dates.txt"`);
				LOGGER.spacer(1);
			}
			else {
				LOGGER.info(`Optional file "calendar_dates.txt" not found. This may or may not be an error. Proceeding...`);
				LOGGER.spacer(1);
			}

			//
		}
		catch (error) {
			LOGGER.error('Error processing "calendar_dates.txt" file.', error);
			throw new Error('✖︎ Error processing "calendar_dates.txt" file.');
		}

		/* * */
		/* TRIPS.TXT */

		//
		// Next up: trips.txt
		// Now that the calendars are sorted out, the jobs is easier for the trips.
		// Only include trips which have the referenced service IDs saved before.

		try {
			//

			LOGGER.info(`Reading zip entry "trips.txt"...`);

			const parseEachRow = async (data: Trip_TMLExtended) => {
				//

				//
				// For each trip, check if the associated service_id was saved
				// in the previous step or not. Include it if yes, skip otherwise.

				if (!savedCalendarDates.has(data.service_id)) return;

				//
				// Format the exported row. Only include the minimum required data
				// to prevent memory bloat later on.

				const parsedRowData: Trip_TMLExtended = {
					direction_id: data.direction_id,
					pattern_id: data.pattern_id,
					route_id: data.route_id,
					service_id: data.service_id,
					shape_id: data.shape_id,
					trip_headsign: data.trip_headsign,
					trip_id: data.trip_id,
					wheelchair_accessible: data.wheelchair_accessible,
				};

				//
				// Save this trip for later and reference
				// the associated route_id to filter them later.

				savedTrips.set(data.trip_id, parsedRowData);

				referencedRouteIds.add(data.route_id);

				//
			};

			//
			// Setup the CSV parsing operation

			await parseCsvFile(`${extractDirPath}/trips.txt`, parseEachRow);

			LOGGER.success(`Finished processing "trips.txt"`);
			LOGGER.spacer(1);

			//
		}
		catch (error) {
			LOGGER.error('Error processing "trips.txt" file.', error);
			throw new Error('✖︎ Error processing "trips.txt" file.');
		}

		/* * */
		/* ROUTES.TXT */

		//
		// Next up: routes.txt
		// For routes, only include the ones referenced in the filtered trips.

		try {
			//

			LOGGER.info(`Reading zip entry "routes.txt"...`);

			const parseEachRow = async (data: Route_TMLExtended) => {
				//

				//
				// For each route, only save the ones referenced
				// by the previously saved trips.

				if (!referencedRouteIds.has(data.route_id)) return;

				//
				// Format and save the exported row

				const parsedRowData: Partial<Route_TMLExtended> = {
					agency_id: data.agency_id,
					line_id: data.line_id,
					line_long_name: data.line_long_name,
					line_short_name: data.line_short_name,
					path_type: data.path_type,
					route_color: data.route_color,
					route_id: data.route_id,
					route_long_name: data.route_long_name,
					route_short_name: data.route_short_name,
					route_text_color: data.route_text_color,
				};

				savedRoutes.set(data.route_id, parsedRowData);

				//
			};

			//
			// Setup the CSV parsing operation

			await parseCsvFile(`${extractDirPath}/routes.txt`, parseEachRow);

			LOGGER.success(`Finished processing "routes.txt"`);
			LOGGER.spacer(1);

			//
		}
		catch (error) {
			LOGGER.error('Error processing "routes.txt" file.', error);
			throw new Error('✖︎ Error processing "routes.txt" file.');
		}

		/* * */
		/* STOPS.TXT */

		//
		// Next up: stops.txt
		// For stops, include all of them since we don't have a way to filter them yet like trips/routes/shapes.
		// By saving all of them, we also speed up the processing of each stop_time by including the stop data right away.

		try {
			//

			LOGGER.info(`Reading zip entry "stops.txt"...`);

			const parseEachRow = async (data: Stop) => {
				//

				//
				// Save all stops, but only the mininum required data.

				const parsedRowData: Stop = {
					stop_id: data.stop_id,
					stop_lat: Number(data.stop_lat),
					stop_lon: Number(data.stop_lon),
					stop_name: data.stop_name,
				};

				savedStops.set(data.stop_id, parsedRowData);

				//
			};

			//
			// Setup the CSV parsing operation

			await parseCsvFile(`${extractDirPath}/stops.txt`, parseEachRow);

			LOGGER.success(`Finished processing "stops.txt"`);
			LOGGER.spacer(1);

			//
		}
		catch (error) {
			LOGGER.error('Error processing "stops.txt" file.', error);
			throw new Error('✖︎ Error processing "stops.txt" file.');
		}

		/* * */
		/* STOP_TIMES.TXT */

		//
		// Next up: stop_times.txt
		// Do a similiar check as the previous steps. Only include the stop_times for trips referenced before.
		// Since this is the most resource intensive operation of them all, include the associated stop data
		// right away to avoid another lookup later.

		try {
			//

			LOGGER.info(`Reading zip entry "stop_times.txt"...`);

			const parseEachRow = async (data: StopTime) => {
				//

				//
				// For each stopTime of each trip, check if the associated trip_id was saved
				// in the previous step or not. Skip if this row's trip_id was not saved before.
				// Also, check if the stop_id is valid and was saved before.

				const tripData = savedTrips.get(data.trip_id);
				if (!tripData) return;

				const stopData = savedStops.get(data.stop_id);
				if (!stopData) return;

				//
				// Format the exported row. Only include the minimum required data
				// to prevent memory bloat later on, and include the stop data right away.

				const parsedRowData: Stop & StopTime = {
					arrival_time: data.arrival_time,
					continuous_drop_off: data.continuous_drop_off,
					continuous_pickup: data.continuous_pickup,
					departure_time: data.departure_time,
					shape_dist_traveled: data.shape_dist_traveled,
					stop_headsign: data.stop_headsign,
					stop_id: data.stop_id,
					stop_lat: stopData.stop_lat,
					stop_lon: stopData.stop_lon,
					stop_name: stopData.stop_name,
					stop_sequence: data.stop_sequence,
					trip_id: data.trip_id,
					wheelchair_boarding: stopData.wheelchair_boarding,
				};

				const savedStopTime = savedStopTimes.get(data.trip_id);

				if (savedStopTime) savedStopTimes.set(data.trip_id, [...savedStopTime, parsedRowData]);
				else savedStopTimes.set(data.trip_id, [parsedRowData]);

				//
			};

			//
			// Setup the CSV parsing operation

			await parseCsvFile(`${extractDirPath}/stop_times.txt`, parseEachRow);

			LOGGER.success(`Finished processing "stop_times.txt"`);
			LOGGER.spacer(1);

			//
		}
		catch (error) {
			LOGGER.error('Error processing "stop_times.txt" file.', error);
			throw new Error('✖︎ Error processing "stop_times.txt" file.');
		}

		/* * */
		/* FINAL OUTPUT FILES */

		//
		// Actually construct the OfferJourney and OfferStop objects
		// and write them to the output files. This is the final step of the process.

		try {
			//

			for (const tripData of savedTrips.values()) {
				//

				//
				// Get associated data for the current trip

				const calendarDatesData = savedCalendarDates.get(tripData.service_id);
				const stopTimesData = savedStopTimes.get(tripData.trip_id);
				const routeData = savedRoutes.get(tripData.route_id);

				if (!stopTimesData || stopTimesData.length === 0) {
					LOGGER.error(`Trip ${tripData.trip_id} has no path data. Skipping...`);
					continue;
				}

				//
				// Build an OfferJourney object for all dates when the trip is valid

				for (const calendarDate of calendarDatesData) {
					//

					//
					// Ensure the extension data is valid and convert it to meters, if necessary.
					// Extract common use cases from the stopTimesData to avoid repeated calculations.

					const firstStopTime = stopTimesData[0];
					const lastStopTime = stopTimesData[stopTimesData.length - 1];

					const extensionScheduledInMeters = convertMetersOrKilometersToMeters(lastStopTime.shape_dist_traveled, lastStopTime.shape_dist_traveled);

					const currentDateFormated = Dates.fromOperationalDate(calendarDate, 'Europe/Lisbon').toFormat('yyyy-MM-dd');

					//

					const offerJourneyData: OfferJourney = {
						agencyId: routeData.agency_id ?? '-',
						arrivalTime: lastStopTime.arrival_time ?? '-',
						bikesAllowed: null,
						blockId: null,
						circular: null,
						continuousDropOff: null,
						continuousPickup: null,
						date: currentDateFormated,
						dayType: null,
						dayTypeName: null,
						departureTime: firstStopTime.departure_time ?? '-',
						directionId: tripData.direction_id ?? null,
						endShiftId: null,
						endStopCode: lastStopTime.stop_id ?? '-',
						endStopId: lastStopTime.stop_id ?? '-',
						endStopName: lastStopTime.stop_name ?? '-',
						feedId: feedId,
						holiday: null,
						holidayName: null,
						lineId: String(routeData.line_id ?? '-'),
						lineLongName: routeData.line_long_name ?? '-',
						lineShortName: routeData.line_short_name ?? '-',
						pathType: routeData.path_type ?? 0,
						patternId: tripData.pattern_id ?? '-',
						patternShortName: null,
						period: null,
						periodName: null,
						routeColor: null,
						routeDesc: null,
						routeDestination: null,
						routeId: tripData.route_id ?? '-',
						routeLongName: routeData.route_long_name ?? '-',
						routeOrigin: null,
						routeShortName: routeData.route_short_name ?? '-',
						routeTextColor: routeData.route_text_color ?? '-',
						routeType: String(routeData.route_type ?? '-'),
						rowId: null,
						school: null,
						shapeId: tripData.shape_id ?? '-',
						startShiftId: null,
						startStopCode: firstStopTime.stop_id ?? '-',
						startStopId: firstStopTime.stop_id ?? '-',
						startStopName: firstStopTime.stop_name ?? '-',
						tripHeadsign: tripData.trip_headsign ?? '-',
						tripId: tripData.trip_id ?? '-',
						tripLength: extensionScheduledInMeters ?? 0,
						wheelchairAccessible: tripData.wheelchair_accessible ?? 0,
					};

					offerJourneysWriter.write(offerJourneyData);

					totalOfferJourneysCounter++;

					//
					// Now, for each stop time of the current trip, create an OfferStop object

					for (const stData of stopTimesData) {
						//

						const offerStopData: OfferStop = {
							arrivalTime: stData.arrival_time,
							bench: null,
							continuousDropOff: stData.continuous_drop_off,
							continuousPickup: stData.continuous_pickup,
							date: currentDateFormated,
							departureTime: stData.departure_time,
							dropOffType: stData.drop_off_type,
							entranceRestriction: null,
							equipment: null,
							exitRestriction: null,
							feedId: feedId,
							locationType: null,
							municipality: null,
							municipalityFare1: null,
							municipalityFare2: null,
							networkMap: null,
							parentStation: null,
							pickupType: null,
							platformCode: stData.platform_code,
							preservationState: null,
							realTimeInformation: null,
							region: null,
							rowId: null,
							schedule: null,
							shapeDistTraveled: stData.shape_dist_traveled,
							shelter: null,
							signalling: null,
							slot: null,
							stopCode: stData.stop_id,
							stopDesc: null,
							stopHeadsign: stData.stop_headsign,
							stopId: stData.stop_id,
							stopIdStepp: null,
							stopLat: stData.stop_lat,
							stopLon: stData.stop_lon,
							stopName: stData.stop_name,
							stopRemarks: null,
							stopSequence: stData.stop_sequence,
							tariff: null,
							timepoint: null,
							tripId: tripData.trip_id,
							wheelchairBoarding: stData.wheelchair_boarding as number,
							zoneShift: null,
						};

						offerStopsWriter.write(offerStopData);

						totalOfferStopsCounter++;

						//
					}
				}

				//
				// Delete the already written data to free up memory sooner

				savedTrips.delete(tripData.trip_id);
				savedStopTimes.delete(tripData.trip_id);

				//
			}

			//
		}
		catch (error) {
			LOGGER.error('Error transforming or saving Offer documents.', error);
			throw new Error('✖︎ Error transforming or saving Offer documents.');
		}

		//

		offerStopsWriter.close();
		offerJourneysWriter.close();

		LOGGER.spacer(1);

		LOGGER.success(`Total OfferJourneys written: ${totalOfferJourneysCounter}`);
		LOGGER.success(`Total OfferStops written: ${totalOfferStopsCounter}`);

		LOGGER.terminate(`Finished processing GTFS file. Run took ${globalTimer.get()}`);

		//
	}
	catch (error) {
		LOGGER.error('An error occurred. Halting execution.', error);
		LOGGER.error('Retrying in 10 seconds...');
		setTimeout(() => {
			process.exit(0); // End process
		}, 10000); // after 10 seconds
	}

	//
};

/* * */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function parseCsvFile(filePath: string, rowParser: (rowData: any) => Promise<void>) {
	const parser = csvParser({ bom: true, columns: true, record_delimiter: ['\n', '\r', '\r\n'], skip_empty_lines: true, trim: true });
	const fileStream = fs.createReadStream(filePath);
	const stream = fileStream.pipe(parser);
	for await (const rowData of stream) {
		await rowParser(rowData);
	}
}

/* * */

const unzipFile = async (zipFilePath, outputDir) => {
	await extract(zipFilePath, { dir: outputDir });
	setDirectoryPermissions(outputDir);
};

/* * */

const setDirectoryPermissions = (dirPath, mode = 0o666) => {
	const files = fs.readdirSync(dirPath, { withFileTypes: true });
	for (const file of files) {
		const filePath = `${dirPath}/${file.name}`;
		if (file.isDirectory()) {
			setDirectoryPermissions(filePath, mode);
		}
		else {
			fs.chmodSync(filePath, mode);
		}
	}
};

/* * */

/**
 * This function checks if a value is small enough to be considered a meter value,
 * as it should be used exclusevely for trip distance values.
 * If the value is greater than 1, it is considered to be in meters.
 * Converts a value to meters if it is in kilometers, otherwise returns meters.
 *
 * @param value - The value to be checked
 * @param context - The context in which the value is being used
 * @param ballpark - A ballpark value to be used as a reference. It is recommended to use the total distance of the object.
 * @returns The value in meters
 */
const convertMetersOrKilometersToMeters = (value: number | string, ballpark: number | string): number => {
	//

	const valueAsNumber = Number(value);
	const ballparkAsNumber = Number(ballpark);

	if (Number.isNaN(valueAsNumber)) return -1;
	if (Number.isNaN(ballparkAsNumber)) return -1;

	// If the ballpark is bigger than 800, then the value is in meters
	// Otherwise, the value is in kilometers. This is because it is unlikely
	// that a trip will be smaller than 800 meters, and longer than 800 kilometers.

	if (ballparkAsNumber > 800) {
		return valueAsNumber;
	}
	else {
		return valueAsNumber * 1000;
	}

	//
};

/* * */

export function getIndividualDatesFromRange(start: OperationalDate, end: OperationalDate): OperationalDate[] {
	if (end < start) throw new Error(`End date "${end}" must be after start date "${start}"`);
	// Parse the start and end dates to ensure they are in the correct format
	const startDate = Dates.fromOperationalDate(start, 'Europe/Lisbon');
	const endDate = Dates.fromOperationalDate(end, 'Europe/Lisbon');

	const dates: OperationalDate[] = [];

	let current = startDate;

	while (current.operational_date <= endDate.operational_date) {
		dates.push(current.operational_date);
		current = current.plus({ days: 1 });
	}

	return dates;
}
