/* * */

import { type OfferJourney, type OfferStop } from '@/types.js';
import { Dates, getOperationalDatesFromRange } from '@tmlmobilidade/dates';
import { toMetersFromKilometersOrMeters } from '@tmlmobilidade/geo';
import { type OperationalDate } from '@tmlmobilidade/go-types-shared';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { type GTFS_Calendar_Raw, type GTFS_CalendarDate_Raw, type GTFS_Route_Extended, type GTFS_Route_Extended_Raw, type GTFS_Stop_Extended, type GTFS_Stop_Extended_Raw, type GTFS_StopTime, type GTFS_StopTime_Raw, type GTFS_Trip_Extended, type GTFS_Trip_Extended_Raw, validateGtfsCalendar, validateGtfsCalendarDate, validateGtfsRouteExtended, validateGtfsStopExtended, validateGtfsStopTime, validateGtfsTripExtended } from '@tmlmobilidade/types';
import { JsonWriter } from '@tmlmobilidade/writers';
import { parse as csvParser } from 'csv-parse';
import extract from 'extract-zip';
import fs from 'fs';

/* * */

export async function generateOfferOutput(filePath: string, startDate: OperationalDate, endDate: OperationalDate, outputDir: string, feedId: null | string): Promise<void> {
	try {
		//

		Logger.init();

		const globalTimer = new Timer();

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
		const savedTrips = new Map<string, GTFS_Trip_Extended>();
		const savedStops = new Map<string, GTFS_Stop_Extended>();
		const savedRoutes = new Map<string, Partial<GTFS_Route_Extended>>();
		const savedStopTimes = new Map<string, GTFS_StopTime[]>();

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
			Logger.success('Prepared working directory.');
			Logger.spacer(1);
		} catch (error) {
			Logger.error(`Error preparing workdir path "${workdirPath}".`, error);
			process.exit(1);
		}

		try {
			await unzipFile(filePath, extractDirPath);
			Logger.success(`Unzipped GTFS file from "${filePath}" to "${extractDirPath}".`);
			Logger.spacer(1);
		} catch (error) {
			Logger.error('Error unzipping the file.', error);
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

			Logger.info(`Reading zip entry "calendar.txt"...`);

			const parseEachRow = async (data: GTFS_Calendar_Raw) => {
				//

				//
				// Validate the current row against the proper type

				const validatedData = validateGtfsCalendar(data);

				//
				// Check if this service_id is between the given start_date and end_date.
				// Clip the service_id's start and end dates to the given start and end dates.

				let serviceIdStartDate = validatedData.start_date;
				let serviceIdEndDate = validatedData.end_date;

				if (serviceIdEndDate < startDate || serviceIdStartDate > endDate) return;

				if (serviceIdStartDate < startDate) serviceIdStartDate = startDate;
				if (serviceIdEndDate > endDate) serviceIdEndDate = endDate;

				//
				// If we're here, it means the service_id is valid between the given dates.
				// For the configured weekly schedule, create the individual operational dates
				// for each day of the week that is active.

				const allOperationalDatesInRange = getOperationalDatesFromRange(serviceIdStartDate, serviceIdEndDate);

				const validOperationalDates: OperationalDate[] = [];

				for (const currentDate of allOperationalDatesInRange) {
					const dayOfWeek = Dates.fromOperationalDate(currentDate, 'Europe/Lisbon').toFormat('c');
					if (dayOfWeek === '1' && validatedData.monday === 1) validOperationalDates.push(currentDate);
					if (dayOfWeek === '2' && validatedData.tuesday === 1) validOperationalDates.push(currentDate);
					if (dayOfWeek === '3' && validatedData.wednesday === 1) validOperationalDates.push(currentDate);
					if (dayOfWeek === '4' && validatedData.thursday === 1) validOperationalDates.push(currentDate);
					if (dayOfWeek === '5' && validatedData.friday === 1) validOperationalDates.push(currentDate);
					if (dayOfWeek === '6' && validatedData.saturday === 1) validOperationalDates.push(currentDate);
					if (dayOfWeek === '7' && validatedData.sunday === 1) validOperationalDates.push(currentDate);
				}

				//
				// Save the valid operational dates for this service_id

				savedCalendarDates.set(validatedData.service_id, validOperationalDates);

				//
			};

			//
			// Setup the CSV parsing operation only if the file exists

			if (fs.existsSync(`${extractDirPath}/calendar.txt`)) {
				await parseCsvFile(`${extractDirPath}/calendar.txt`, parseEachRow);
				Logger.success(`Finished processing "calendar.txt"`);
				Logger.spacer(1);
			} else {
				Logger.info(`Optional file "calendar.txt" not found. This may or may not be an error. Proceeding...`);
				Logger.spacer(1);
			}

			//
		} catch (error) {
			Logger.error('Error processing "calendar.txt" file.', error);
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

			Logger.info(`Reading zip entry "calendar_dates.txt"...`);

			const parseEachRow = async (data: GTFS_CalendarDate_Raw) => {
				//

				//
				// Validate the current row against the proper type

				const validatedData = validateGtfsCalendarDate(data);

				//
				// Skip if this row's date is not between the given start and end dates

				if (validatedData.date < startDate || validatedData.date > endDate) return;

				//
				// If we're here, it means the service_id is valid between the given dates.
				// Get the previously saved calendars and check if it exists for this service_id.

				const savedCalendar = savedCalendarDates.get(validatedData.service_id);

				if (savedCalendar) {
					// Create a new Set to avoid duplicated dates
					const updatedCalendar = new Set(savedCalendar);
					// If this service_id was previously saved, either add or remove the current date
					// to it based on the exception_type value for this row.
					if (validatedData.exception_type === 1) updatedCalendar.add(validatedData.date);
					else if (validatedData.exception_type === 2) updatedCalendar.delete(validatedData.date);
					// Update the service_id with the new dates
					savedCalendarDates.set(validatedData.service_id, Array.from(updatedCalendar));
				} else {
					// If this is the first time we're seeing this service_id, then it is only necessary
					// to initiate a new dates array if it is a service addition
					if (validatedData.exception_type === 1) {
						savedCalendarDates.set(validatedData.service_id, [validatedData.date]);
					}
				}

				//
			};

			//
			// Setup the CSV parsing operation only if the file exists

			if (fs.existsSync(`${extractDirPath}/calendar_dates.txt`)) {
				await parseCsvFile(`${extractDirPath}/calendar_dates.txt`, parseEachRow);
				Logger.success(`Finished processing "calendar_dates.txt"`);
				Logger.spacer(1);
			} else {
				Logger.info(`Optional file "calendar_dates.txt" not found. This may or may not be an error. Proceeding...`);
				Logger.spacer(1);
			}

			//
		} catch (error) {
			Logger.error('Error processing "calendar_dates.txt" file.', error);
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

			Logger.info(`Reading zip entry "trips.txt"...`);

			const parseEachRow = async (data: GTFS_Trip_Extended_Raw) => {
				// Validate the current row against the proper type
				const validatedData = validateGtfsTripExtended(data);
				// For each trip, check if the associated service_id was saved
				// in the previous step or not. Include it if yes, skip otherwise.
				if (!savedCalendarDates.has(validatedData.service_id)) return;
				// Save the exported row
				savedTrips.set(validatedData.trip_id, validatedData);
				// Reference the associated entities to filter them later.
				referencedRouteIds.add(validatedData.route_id);
			};

			//
			// Setup the CSV parsing operation

			await parseCsvFile(`${extractDirPath}/trips.txt`, parseEachRow);

			Logger.success(`Finished processing "trips.txt"`);
			Logger.spacer(1);

			//
		} catch (error) {
			Logger.error('Error processing "trips.txt" file.', error);
			throw new Error('✖︎ Error processing "trips.txt" file.');
		}

		/* * */
		/* ROUTES.TXT */

		//
		// Next up: routes.txt
		// For routes, only include the ones referenced in the filtered trips.

		try {
			//

			Logger.info(`Reading zip entry "routes.txt"...`);

			const parseEachRow = async (data: GTFS_Route_Extended_Raw) => {
				// Validate the current row against the proper type
				const validatedData = validateGtfsRouteExtended(data);
				// For each route, only save the ones referenced
				// by the previously saved trips.
				if (!referencedRouteIds.has(validatedData.route_id)) return;
				// Save the exported row
				savedRoutes.set(validatedData.route_id, validatedData);
			};

			//
			// Setup the CSV parsing operation

			await parseCsvFile(`${extractDirPath}/routes.txt`, parseEachRow);

			Logger.success(`Finished processing "routes.txt"`);
			Logger.spacer(1);

			//
		} catch (error) {
			Logger.error('Error processing "routes.txt" file.', error);
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

			Logger.info(`Reading zip entry "stops.txt"...`);

			const parseEachRow = async (data: GTFS_Stop_Extended_Raw) => {
				// Validate the current row against the proper type
				const validatedData = validateGtfsStopExtended(data);
				// Save the exported row
				savedStops.set(validatedData.stop_id, validatedData);
			};

			//
			// Setup the CSV parsing operation

			await parseCsvFile(`${extractDirPath}/stops.txt`, parseEachRow);

			Logger.success(`Finished processing "stops.txt"`);
			Logger.spacer(1);

			//
		} catch (error) {
			Logger.error('Error processing "stops.txt" file.', error);
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

			Logger.info(`Reading zip entry "stop_times.txt"...`);

			const parseEachRow = async (data: GTFS_StopTime_Raw) => {
				//

				//
				// Validate the current row against the proper type

				const validatedData = validateGtfsStopTime(data);

				//
				// For each stopTime of each trip, check if the associated trip_id was saved
				// in the previous step or not. Skip if this row's trip_id was not saved before.
				// Also, check if the stop_id is valid and was saved before.

				const tripData = savedTrips.get(validatedData.trip_id);
				if (!tripData) return;

				const stopData = savedStops.get(validatedData.stop_id);
				if (!stopData) return;

				//
				// Format the exported row. Only include the minimum required data
				// to prevent memory bloat later on, and include the stop data right away.

				const savedStopTime = savedStopTimes.get(validatedData.trip_id);

				if (savedStopTime) savedStopTimes.set(validatedData.trip_id, [...savedStopTime, validatedData]);
				else savedStopTimes.set(validatedData.trip_id, [validatedData]);

				//
			};

			//
			// Setup the CSV parsing operation

			await parseCsvFile(`${extractDirPath}/stop_times.txt`, parseEachRow);

			Logger.success(`Finished processing "stop_times.txt"`);
			Logger.spacer(1);

			//
		} catch (error) {
			Logger.error('Error processing "stop_times.txt" file.', error);
			throw new Error('✖︎ Error processing "stop_times.txt" file.');
		}

		/* * */
		/* OUTPUT FILES */

		//
		// Actually construct the OfferJourney and OfferStop objects
		// and write them to the output files. This is the final step of the process.

		try {
			//

			for (const currentTrip of savedTrips.values()) {
				//

				//
				// Get associated data for the current trip

				const calendarDatesData = savedCalendarDates.get(currentTrip.service_id);
				const stopTimesData = savedStopTimes.get(currentTrip.trip_id);
				const routeData = savedRoutes.get(currentTrip.route_id);

				if (!stopTimesData || stopTimesData.length === 0) {
					Logger.error(`Trip ${currentTrip.trip_id} has no path data. Skipping...`);
					continue;
				}

				//
				// Build an OfferJourney object for all dates when the trip is valid

				for (const currentCalendarDate of calendarDatesData) {
					//

					//
					// Ensure the extension data is valid and convert it to meters, if necessary.
					// Extract common use cases from the stopTimesData to avoid repeated calculations.

					const firstStopTime = stopTimesData[0];
					const firstStopData = savedStops.get(firstStopTime.stop_id);

					const lastStopTime = stopTimesData[stopTimesData.length - 1];
					const lastStopData = savedStops.get(lastStopTime.stop_id);

					const extensionScheduledInMeters = toMetersFromKilometersOrMeters(lastStopTime.shape_dist_traveled, lastStopTime.shape_dist_traveled);

					const currentDateFormated = Dates.fromOperationalDate(currentCalendarDate, 'Europe/Lisbon').toFormat('yyyy-MM-dd');

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
						directionId: currentTrip.direction_id ?? null,
						endShiftId: null,
						endStopCode: lastStopTime.stop_id ?? '-',
						endStopId: lastStopTime.stop_id ?? '-',
						endStopName: lastStopData.stop_name ?? '-',
						feedId: feedId,
						holiday: null,
						holidayName: null,
						lineId: String(routeData.line_id ?? '-'),
						lineLongName: routeData.line_long_name ?? '-',
						lineShortName: routeData.line_short_name ?? '-',
						pathType: routeData.path_type ?? 0,
						patternId: currentTrip.pattern_id ?? '-',
						patternShortName: null,
						period: null,
						periodName: null,
						routeColor: null,
						routeDesc: null,
						routeDestination: null,
						routeId: currentTrip.route_id ?? '-',
						routeLongName: routeData.route_long_name ?? '-',
						routeOrigin: null,
						routeShortName: routeData.route_short_name ?? '-',
						routeTextColor: routeData.route_text_color ?? '-',
						routeType: String(routeData.route_type ?? '-'),
						rowId: null,
						school: null,
						shapeId: currentTrip.shape_id ?? '-',
						startShiftId: null,
						startStopCode: firstStopTime.stop_id ?? '-',
						startStopId: firstStopTime.stop_id ?? '-',
						startStopName: firstStopData.stop_name ?? '-',
						tripHeadsign: currentTrip.trip_headsign ?? '-',
						tripId: currentTrip.trip_id ?? '-',
						tripLength: extensionScheduledInMeters ?? 0,
						wheelchairAccessible: currentTrip.wheelchair_accessible ?? 0,
					};

					offerJourneysWriter.write(offerJourneyData);

					totalOfferJourneysCounter++;

					//
					// Now, for each stop time of the current trip, create an OfferStop object

					for (const currentStopTime of stopTimesData) {
						//

						const currentStop = savedStops.get(currentStopTime.stop_id);

						const shapeDistTraveledInMeters = toMetersFromKilometersOrMeters(currentStopTime.shape_dist_traveled, lastStopTime.shape_dist_traveled);

						const offerStopData: OfferStop = {
							arrivalTime: currentStopTime.arrival_time,
							bench: null,
							continuousDropOff: currentStopTime.continuous_drop_off,
							continuousPickup: currentStopTime.continuous_pickup,
							date: currentDateFormated,
							departureTime: currentStopTime.departure_time,
							dropOffType: currentStopTime.drop_off_type,
							entranceRestriction: null,
							equipment: null,
							exitRestriction: null,
							feedId: feedId,
							locationType: currentStop.location_type ?? 0,
							municipality: Number(currentStop.municipality_id ?? 0),
							municipalityFare1: null,
							municipalityFare2: null,
							networkMap: null,
							parentStation: currentStop.parent_station ?? '',
							pickupType: null,
							platformCode: currentStop.platform_code,
							preservationState: null,
							realTimeInformation: null,
							region: currentStop.region_id ?? '-',
							rowId: null,
							schedule: null,
							shapeDistTraveled: shapeDistTraveledInMeters,
							shelter: null,
							signalling: null,
							slot: null,
							stopCode: currentStopTime.stop_id,
							stopDesc: null,
							stopHeadsign: currentStopTime.stop_headsign,
							stopId: currentStopTime.stop_id,
							stopIdStepp: null,
							stopLat: currentStop.stop_lat,
							stopLon: currentStop.stop_lon,
							stopName: currentStop.stop_name,
							stopRemarks: null,
							stopSequence: currentStopTime.stop_sequence,
							tariff: null,
							timepoint: Number(currentStopTime.timepoint ?? 0),
							tripId: currentTrip.trip_id,
							wheelchairBoarding: Number(currentStop.wheelchair_boarding),
							zoneShift: null,
						};

						offerStopsWriter.write(offerStopData);

						totalOfferStopsCounter++;

						//
					}
				}

				//
				// Delete the already written data to free up memory sooner

				savedTrips.delete(currentTrip.trip_id);
				savedStopTimes.delete(currentTrip.trip_id);

				//
			}

			//
		} catch (error) {
			Logger.error('Error transforming or saving Offer documents.', error);
			throw new Error('✖︎ Error transforming or saving Offer documents.');
		}

		//

		offerStopsWriter.close();
		offerJourneysWriter.close();

		Logger.spacer(1);

		Logger.success(`Total OfferJourneys written: ${totalOfferJourneysCounter}`);
		Logger.success(`Total OfferStops written: ${totalOfferStopsCounter}`);

		Logger.terminate(`Finished processing GTFS file. Run took ${globalTimer.get()}`);

		//
	} catch (error) {
		Logger.error('An error occurred. Halting execution.', error);
		Logger.error('Retrying in 10 seconds...');
		setTimeout(() => {
			process.exit(1); // End process
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
		} else {
			fs.chmodSync(filePath, mode);
		}
	}
};
