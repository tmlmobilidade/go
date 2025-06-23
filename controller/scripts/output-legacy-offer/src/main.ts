/* * */

import { type OfferJourney, type OfferStop } from '@/types.js';
import LOGGER from '@helperkits/logger';
import TIMETRACKER from '@helperkits/timer';
import { type OperationalDate, validateOperationalDate } from '@tmlmobilidade/types';
import { Dates } from '@tmlmobilidade/utils';
import { parse as csvParser } from 'csv-parse';
import extract from 'extract-zip';
import fs from 'fs';

/* * */

export async function generateOfferOutput(filePath: string, startDate: OperationalDate, endDate: OperationalDate): Promise<void> {
	try {
		//

		LOGGER.init();

		const globalTimer = new TIMETRACKER();

		//
		// Read a GTFS file from the filesystem

		try {
			//

			//
			// Setup variables to save formatted entities found in this Plan

			const referencedStopIds = new Set<string>();
			const referencedRouteIds = new Set<string>();

			const savedCalendarDates = new Map<string, OperationalDate[]>();
			const savedTrips = new Map();
			const savedStops = new Map();
			const savedRoutes = new Map();
			const savedStopTimes = new Map<string, OfferStop[]>();

			//
			// Prepare the working directories for the current plan

			const workdirPath = `/tmp/legacy-offer`;
			const extractDirPath = `${workdirPath}/extracted`;

			if (fs.existsSync(workdirPath)) {
				fs.rmSync(workdirPath, { force: true, recursive: true });
			}

			fs.mkdirSync(workdirPath, { recursive: true });

			//
			// Download and unzip the associated operation file

			await unzipFile(filePath, extractDirPath);

			//
			// The order of execution matters when parsing each file. This is because plans are valid on a set of dates.
			// By first parsing calendar_dates.txt, we know exactly which service_ids "were active" in the set of dates.
			// Then, when parsing trips.txt, only trips that belong to those service_ids will be included. And so on, for each file.
			// By having a list of trips we can extract only the necessary info from the other files, and thus reducing significantly
			// the amount of information to be checked.

			//
			// Extract calendar_dates.txt and filter only service_ids valid between the given plan start_date and end_date.

			try {
				//

				LOGGER.info(`Reading zip entry "calendar_dates.txt"...`);

				//
				// Parse each row, and save only the matching servic_ids

				const parseEachRow = async (data) => {
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
					// Skip if this row's date is before the plan's start date or after the plan's end date

					if (currentOperationalDate < startDate || currentOperationalDate > endDate) return;

					//
					// Get the previously saved calendar

					const savedCalendar = savedCalendarDates.get(data.service_id);

					if (savedCalendar) {
						// If this service_id was previously saved, add the current date to it
						savedCalendarDates.set(data.service_id, Array.from(new Set([currentOperationalDate, ...savedCalendar])));
					}
					else {
						// If this is the first time we're seeing this service_id, initiate the dates array with the current date
						savedCalendarDates.set(data.service_id, [currentOperationalDate]);
					}
					//
				};

				//
				// Setup the CSV parsing operation

				await parseCsvFile(`${extractDirPath}/calendar_dates.txt`, parseEachRow);

				LOGGER.success(`Finished processing "calendar_dates.txt"`);

				//
			}
			catch (error) {
				LOGGER.error('Error processing "calendar_dates.txt" file.', error);
				throw new Error('✖︎ Error processing "calendar_dates.txt" file.');
			}

			//
			// Next up: trips.txt
			// Now that the calendars are sorted out, the jobs is easier for the trips.
			// Only include trips which have the referenced service IDs saved before.

			try {
				//

				LOGGER.info(`Reading zip entry "trips.txt"...`);

				//
				// For each trip, check if the associated service_id was saved in the previous step or not.
				// Include it if yes, skip otherwise.

				const parseEachRow = async (data) => {
					//

					//
					// Skip if this row's service_id was not saved before
					if (!savedCalendarDates.has(data.service_id)) return;

					//
					// Format the exported row. Only include the minimum required to prevent memory bloat later on.

					const parsedRowData = {
						pattern_id: data.pattern_id,
						route_id: data.route_id,
						service_id: data.service_id,
						shape_id: data.shape_id,
						trip_headsign: data.trip_headsign,
						trip_id: data.trip_id,
					};

					//
					// Save this trip for later

					savedTrips.set(data.trip_id, parsedRowData);

					//
					// Reference the route_id to filter them later

					referencedRouteIds.add(data.route_id);

					//
				};

				// 4.8.2.
				// Setup the CSV parsing operation

				await parseCsvFile(`${extractDirPath}/trips.txt`, parseEachRow);

				LOGGER.success(`Finished processing "trips.txt"`);

				//
			}
			catch (error) {
				LOGGER.error('Error processing "trips.txt" file.', error);
				throw new Error('✖︎ Error processing "trips.txt" file.');
			}

			//
			// Next up: routes.txt
			// For routes, only include the ones referenced in the filtered trips.

			try {
				//

				LOGGER.info(`Reading zip entry "routes.txt"...`);

				// 4.9.1.
				// For each route, only save the ones referenced by previously saved trips.

				const parseEachRow = async (data) => {
					//

					//
					// Skip if this row's route_id was not saved before

					if (!referencedRouteIds.has(data.route_id)) return;

					//
					// Format the exported row

					const parsedRowData = {
						agency_id: data.agency_id,
						line_id: data.line_id,
						line_long_name: data.line_long_name,
						line_short_name: data.line_short_name,
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

				//
			}
			catch (error) {
				LOGGER.error('Error processing "routes.txt" file.', error);
				throw new Error('✖︎ Error processing "routes.txt" file.');
			}

			//
			// Next up: stops.txt
			// For stops, include all of them since we don't have a way to filter them yet like trips/routes/shapes.
			// By saving all of them, we also speed up the processing of each stop_time by including the stop data right away.

			try {
				//

				console.log(`→ Reading zip entry "stops.txt"...`);

				//
				// Save all stops, but only the mininum required data.

				const parseEachRow = async (data) => {
					//
					const parsedRowData = {
						stop_id: data.stop_id,
						stop_lat: Number(data.stop_lat),
						stop_lon: Number(data.stop_lon),
						stop_name: data.stop_name,
					};
						//
					savedStops.set(data.stop_id, parsedRowData);
					//
				};

				//
				// Setup the CSV parsing operation

				await parseCsvFile(`${extractDirPath}/stops.txt`, parseEachRow);

				LOGGER.success(`Finished processing "stops.txt"`);

				//
			}
			catch (error) {
				LOGGER.error('Error processing "stops.txt" file.', error);
				throw new Error('✖︎ Error processing "stops.txt" file.');
			}

			//
			// Next up: stop_times.txt
			// Do a similiar check as the previous steps. Only include the stop_times for trips referenced before.
			// Since this is the most resource intensive operation of them all, include the associated stop data
			// right away to avoid another lookup later.

			try {
				//

				LOGGER.info(`Reading zip entry "stop_times.txt"...`);

				//
				// For each stop of each trip, check if the associated trip_id was saved in the previous step or not.
				// Save valid stop times along with the associated stop data.

				const parseEachRow = async (data) => {
					//

					//
					// Skip if this row's trip_id was not saved before

					if (!savedTrips.has(data.trip_id)) return;

					//
					// Get the associated stop data. Skip if none found.

					const stopData = savedStops.get(data.stop_id);
					if (!stopData) return;

					const parsedRowData: OfferStop = {
						arrivalTime: '14:17:52',
						bench: 0,
						continuousDropOff: 0,
						continuousPickup: 0,
						date: '2024-09-01',
						departureTime: '14:17:52',
						dropOffType: 0,
						entranceRestriction: 0,
						equipment: 0,
						exitRestriction: 0,
						feedId: 'testeCascais',
						locationType: 0,
						municipality: 1105,
						municipalityFare1: null,
						municipalityFare2: null,
						networkMap: 0,
						parentStation: '',
						pickupType: 0,
						platformCode: '',
						preservationState: 0,
						realTimeInformation: 0,
						region: null,
						rowId: 1,
						schedule: 0,
						shapeDistTraveled: 4217.77,
						shelter: 0,
						signalling: 0,
						slot: 0,
						stopCode: '',
						stopDesc: '',
						stopHeadsign: 'Rua da Torre',
						stopId: '20811',
						stopIdStepp: 'Stepp_20811',
						stopLat: 38.69632,
						stopLon: -9.441346,
						stopName: 'Rua da Torre',
						stopRemarks: '',
						stopSequence: 11,
						tariff: 0,
						timepoint: 0,
						tripId: 'M27-1-079-A-SDF-14h05-CascaisEstacao',
						wheelchairBoarding: 0,
						zoneShift: 0,
					};

					const savedStopTime = savedStopTimes.has(data.trip_id);

					if (savedStopTime) {
						savedStopTimes.get(data.trip_id).push(parsedRowData);
					}
					else {
						savedStopTimes.set(data.trip_id, [parsedRowData]);
					}

					referencedStopIds.add(data.stop_id);

					//
				};

				//
				// Setup the CSV parsing operation

				await parseCsvFile(`${extractDirPath}/stop_times.txt`, parseEachRow);

				LOGGER.success(`Finished processing "stop_times.txt"`);

				//
			}
			catch (error) {
				LOGGER.error('Error processing "stop_times.txt" file.', error);
				throw new Error('✖︎ Error processing "stop_times.txt" file.');
			}

			//
			// Transform each trip object into the database format, and save it to the database.
			// Combine the previously extracted info from all files into a single object.

			try {
				//

				for (const tripData of savedTrips.values()) {
					//

					//
					// Get associated data

					const calendarDatesData = savedCalendarDates.get(tripData.service_id);
					const stopTimesData = savedStopTimes.get(tripData.trip_id);
					const routeData = savedRoutes.get(tripData.route_id);

					//
					// Create a trip analysis document for each day this trip is scheduled to run

					for (const calendarDate of calendarDatesData) {
						//
						if (!stopTimesData || stopTimesData.length === 0) {
							LOGGER.error(`Trip ${tripData.trip_id} has no path data. Skipping...`);
							continue;
						}
						//
						const extensionScheduledInMeters = convertMetersOrKilometersToMeters(stopTimesData[stopTimesData.length - 1].shapeDistTraveled, stopTimesData[stopTimesData.length - 1].shapeDistTraveled);
						//
						const offerJourneyData: OfferJourney = {
							agencyId: routeData.agency_id,
							arrivalTime: stopTimesData[stopTimesData.length - 1].arrivalTime,
							bikesAllowed: 0,
							blockId: '',
							circular: 0,
							continuousDropOff: 0,
							continuousPickup: 0,
							date: Dates.fromOperationalDate(calendarDate, 'Europe/Lisbon').toFormat('yyyy-MM-dd'),
							dayType: 1,
							dayTypeName: 'Workday',
							departureTime: stopTimesData[0].departureTime,
							directionId: 0,
							endShiftId: '',
							endStopCode: '',
							endStopId: stopTimesData[stopTimesData.length - 1].stopId,
							endStopName: stopTimesData[stopTimesData.length - 1].stopName,
							feedId: 'GTFS_FEED',
							holiday: 0,
							holidayName: 'Non_holiday',
							lineId: routeData.line_id,
							lineLongName: routeData.line_long_name,
							lineShortName: routeData.line_short_name,
							pathType: 1,
							patternId: tripData.pattern_id,
							patternShortName: tripData.pattern_id,
							period: 3,
							periodName: 'Summer',
							routeColor: routeData.route_color,
							routeDesc: '',
							routeDestination: stopTimesData[stopTimesData.length - 1].stopHeadsign,
							routeId: tripData.route_id,
							routeLongName: routeData.route_long_name,
							routeOrigin: stopTimesData[0].stopHeadsign,
							routeShortName: routeData.route_short_name,
							routeTextColor: routeData.route_text_color,
							routeType: '3',
							rowId: 0, // This will be set later by the database
							school: '0',
							shapeId: tripData.shape_id,
							startShiftId: '',
							startStopCode: '',
							startStopId: stopTimesData[0].stopId,
							startStopName: stopTimesData[0].stopName,
							tripHeadsign: tripData.trip_headsign,
							tripId: tripData.trip_id,
							tripLength: extensionScheduledInMeters.toFixed(2),
							wheelchairAccessible: 0,
						};
						//
						console.log(offerJourneyData);
					}

					//
					// Delete the current trip to free up memory sooner

					// savedTrips.delete(tripData.trip_id);
					// savedStopTimes.delete(tripData.trip_id);

					//
				}

				//
			}
			catch (error) {
				LOGGER.error('Error transforming or saving Shapes, Trips or Rides to database.', error);
				throw new Error('✖︎ Error transforming or saving Shapes, Trips or Rides to database.');
			}

			//

			LOGGER.success(`Finished processing GTFS file.`);

			return;

			//
		}
		catch (error) {
			LOGGER.error(`Error processing GTFS file:`, error);
			LOGGER.divider();
		}

		//

		LOGGER.terminate(`Run took ${globalTimer.get()}`);

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
