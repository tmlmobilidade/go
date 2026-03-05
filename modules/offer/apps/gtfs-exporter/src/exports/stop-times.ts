/* * */

import { type TripSchedule } from '@/exports/trips.js';
import { type GtfsV29ExportConfig } from '@/types.js';
import { computeSegmentTravelTimes, getMergedPath } from '@tmlmobilidade/dates';
import { Logger } from '@tmlmobilidade/logger';
import { type GTFS_StopTime, HHMM, Path, type Pattern, type StopsParameter, type StopsParameterOverride } from '@tmlmobilidade/types';

/* * */

function resolveActiveParameter(
	parameters: StopsParameter[] | undefined,
	tripSchedule: TripSchedule,
	fallbackPath: Path[],
): StopsParameter {
	const defaultParameter = parameters?.find(p => p.kind === 'default');
	const overrides = (parameters?.filter(p => p.kind === 'override') || []) as StopsParameterOverride[];

	if (overrides.length > 0) {
		for (const override of overrides) {
			const weekdayMatch = tripSchedule.weekdays.some(w => override.weekdays.includes(w));
			const periodMatch = tripSchedule.period_ids.some(p => override.year_period_ids.includes(p));
			const dayPeriodMatch = !override.day_periods?.length || override.day_periods.includes(tripSchedule.day_period);

			if (weekdayMatch && periodMatch && dayPeriodMatch) {
				return override;
			}
		}
	}

	if (defaultParameter) return defaultParameter;

	return {
		kind: 'default',
		path: fallbackPath.map(p => ({
			avg_speed: 0,
			dwell_time: 0,
			stop_id: p.stop_id,
		})),
	};
}

function timepointToSeconds(timepoint: HHMM): number {
	const [hours, minutes] = timepoint.split(':').map(Number);
	return hours * 3600 + minutes * 60;
}

function formatGtfsTime(totalSeconds: number): string {
	const safeSeconds = Math.max(0, Math.round(totalSeconds));
	const hours = Math.floor(safeSeconds / 3600);
	const minutes = Math.floor((safeSeconds % 3600) / 60);
	const seconds = safeSeconds % 60;

	const hh = String(hours).padStart(2, '0');
	const mm = String(minutes).padStart(2, '0');
	const ss = String(seconds).padStart(2, '0');

	return `${hh}:${mm}:${ss}`;
}

function roundKm(valueMeters: number): number {
	return Math.round((valueMeters / 1000) * 1000) / 1000;
}

/* * */

export async function exportStopTimesForPattern(
	patternData: Pattern,
	tripSchedules: TripSchedule[],
	exportConfig: GtfsV29ExportConfig,
) {
	try {
		if (!patternData.path?.length) return;
		if (tripSchedules.length === 0) return;

		for (const tripSchedule of tripSchedules) {
			const activeParameter = resolveActiveParameter(patternData.parameters, tripSchedule, patternData.path);
			const mergedPath = getMergedPath(patternData.path, activeParameter.path);
			const travelTimes = computeSegmentTravelTimes(mergedPath);
			const segmentTravelSeconds = travelTimes.segmentTravelSeconds.raw;
			const stopDwellSeconds = travelTimes.stopDwellSeconds.raw;

			let currentSeconds = timepointToSeconds(tripSchedule.timepoint);
			let cumulativeDistanceMeters = 0;

			for (let i = 0; i < mergedPath.length; i++) {
				const pathItem = mergedPath[i];
				const segmentSeconds = segmentTravelSeconds[i] ?? 0;
				const dwellSeconds = stopDwellSeconds[i] ?? 0;

				const arrivalSeconds = i === 0 ? currentSeconds : currentSeconds + segmentSeconds;
				const departureSeconds = arrivalSeconds + dwellSeconds;
				currentSeconds = departureSeconds;

				if (i > 0) {
					cumulativeDistanceMeters += pathItem.distance_delta ?? 0;
				}

				const stopTimeRow: GTFS_StopTime = {
					arrival_time: formatGtfsTime(arrivalSeconds),
					departure_time: formatGtfsTime(departureSeconds),
					drop_off_type: pathItem.allow_drop_off ? 0 : 1,
					pickup_type: pathItem.allow_pickup ? 0 : 1,
					shape_dist_traveled: roundKm(cumulativeDistanceMeters),
					stop_id: pathItem.stop_id,
					stop_sequence: exportConfig.stop_sequence_start + i,
					timepoint: pathItem.timepoint ? 1 : 0,
					trip_id: tripSchedule.trip_id,
				};

				await exportConfig.writers.stop_times.write(stopTimeRow);
			}
		}
	} catch (error) {
		Logger.error(`Error exporting stop_times for pattern ${patternData.code}`, error);
		throw new Error(`Error exporting stop_times for pattern ${patternData.code}: ${error}`);
	}
}
