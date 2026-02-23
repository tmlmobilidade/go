import { type GtfsV29ExportConfig } from '@/types.js';
import { ServiceId, type ServiceRegistry, Timepoint } from '@/utils/service-registry.js';
import { buildAffectedDaysDetails, Dates, datesFromCalendarKey } from '@tmlmobilidade/dates';
import { GtfsBikesAllowed, GtfsTMLTrip, GtfsWheelchairBoarding, type OperationalDate, type Pattern, type Period, type Route } from '@tmlmobilidade/types';

/* * */

/**
 * Builds a map of timepoint -> set of dates for a pattern
 * @param patternData - The pattern data
 * @param periods - All periods
 * @param startDate - Start date of export
 * @param endDate - End date of export
 * @returns Map of timepoint to set of operational dates
 */
function buildTimepointSchedules(
	patternData: Pattern,
	periods: Period[],
	startDate: Dates,
	endDate: Dates,
): Map<Timepoint, Set<OperationalDate>> {
	const timepointSchedules = new Map<Timepoint, Set<OperationalDate>>();

	// Get affected days (dates with active timepoints)
	const affectedDays = buildAffectedDaysDetails(startDate, endDate, patternData.rules, periods);

	// Invert the structure: from date->timepoints to timepoint->dates
	for (const [calendarKey, dayScheduleDetail] of affectedDays) {
		const date = datesFromCalendarKey(calendarKey).operational_date;

		for (const timepoint of dayScheduleDetail.finalTimePoints) {
			if (!timepointSchedules.has(timepoint)) {
				timepointSchedules.set(timepoint, new Set());
			}
			const timepointSet = timepointSchedules.get(timepoint);
			if (timepointSet) {
				timepointSet.add(date);
			}
		}
	}

	return timepointSchedules;
}

/**
 * Converts a timepoint (HH:mm) to minutes since operational day start (04:00)
 * Times before 04:00 are considered part of the previous operational day
 * @param timepoint - Time in HH:mm format
 * @returns Minutes since 04:00
 */
function timepointToOperationalMinutes(timepoint: Timepoint): number {
	const [hours, minutes] = timepoint.split(':').map(Number);
	let totalMinutes = hours * 60 + minutes;

	// Operational day starts at 04:00 (240 minutes)
	// Times before 04:00 are considered end of previous day, so add 24 hours
	if (totalMinutes < 240) {
		totalMinutes += 24 * 60;
	}

	return totalMinutes;
}

/**
 * Groups timepoints by their date sets and assigns service_ids
 * @param timepointSchedules - Map of timepoint to dates
 * @param serviceRegistry - Global service registry
 * @returns Map of timepoint to service_id
 */
function assignServiceIds(
	timepointSchedules: Map<Timepoint, Set<OperationalDate>>,
	serviceRegistry: ServiceRegistry,
): Map<Timepoint, ServiceId> {
	const timepointToServiceId = new Map<Timepoint, ServiceId>();

	// For each timepoint, get or create a service_id based on its date set
	for (const [timepoint, dates] of timepointSchedules) {
		const service_id = serviceRegistry.getOrCreateServiceId(dates);
		timepointToServiceId.set(timepoint, service_id);
	}

	return timepointToServiceId;
}

/**
 * Exports trips for a pattern
 * @param routeData - The route data
 * @param patternData - The pattern data
 * @param shapeId - The shape ID
 * @param periods - All periods
 * @param startDate - Start date of export
 * @param endDate - End date of export
 * @param serviceRegistry - Global service registry
 * @param exportConfig - Export configuration
 */
export async function exportTripsForPattern(
	routeData: Route,
	patternData: Pattern,
	shapeId: string,
	periods: Period[],
	startDate: Dates,
	endDate: Dates,
	serviceRegistry: ServiceRegistry,
	exportConfig: GtfsV29ExportConfig,
) {
	try {
		// Step 1: Build timepoint -> dates map
		const timepointSchedules = buildTimepointSchedules(patternData, periods, startDate, endDate);

		if (timepointSchedules.size === 0) {
			// No timepoints for this pattern, skip
			return;
		}

		// Step 2: Assign service_ids to timepoints (deduplicating by date sets)
		const timepointToServiceId = assignServiceIds(timepointSchedules, serviceRegistry);

		// Step 3: Export trips
		const headsign = patternData.headsign.replaceAll(',', '').replace(/  +/g, ' ').trim();

		// Sort timepoints by operational time (accounting for 04:00 start)
		const sortedTimepoints = Array.from(timepointToServiceId.entries()).sort((a, b) => {
			return timepointToOperationalMinutes(a[0]) - timepointToOperationalMinutes(b[0]);
		});

		for (const [timepoint, service_id] of sortedTimepoints) {
			// Remove the : from this schedules start_time to use it as the identifier for this trip.
			// Associate the pattern_code, resulting calendar_code and start_time of the current schedule.
			const startTimeStripped = timepoint.split(':').join('');
			const trip_id = `${patternData.code}|${service_id}|${startTimeStripped}`;

			const tripData: GtfsTMLTrip = {
				bikes_allowed: 0 as GtfsBikesAllowed,
				calendar_desc: '', // TODO: Calculate from rules/periods
				direction_id: patternData.direction,
				pattern_id: patternData.code,
				pattern_short_name: headsign,
				route_id: routeData.code,
				service_id,
				shape_id: shapeId,
				trip_headsign: headsign,
				trip_id,
				wheelchair_accessible: 0 as GtfsWheelchairBoarding,
			};

			await exportConfig.writers.trips.write(tripData);
		}
	}
	catch (error) {
		throw new Error(`Error exporting trips for pattern ${patternData.code}: ${error}`);
	}
}
