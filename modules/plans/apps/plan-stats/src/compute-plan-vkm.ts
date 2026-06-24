/**
 * Cálculo de VKM por plano — lógica extraída de index.ts + shape-dist-units.ts + normalize-shape-dist.ts.
 * Chamar depois de importGtfsToDatabase; o VKM lê trips.txt / calendar_dates.txt / shapes.txt em /tmp/{planId}/extracted.
 */

import { GtfsSQLTables, importGtfsToDatabase } from '@tmlmobilidade/import-gtfs';
import { Logger } from '@tmlmobilidade/logger';
import { type OperationalDate, type Plan } from '@tmlmobilidade/types';
import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import Papa from 'papaparse';

/* * */

const METERS_TO_KM_THRESHOLD = 1000;

export interface VkmPerPatternStats {
	annual_circulations: number
	extension_km: number
	num_trips: number
	vkm_km: number
}

export interface CirculationGroupBreakdown {
	day_type: string
	num_dates: number
	num_trip_ids: number
	pattern_id: string
	period: string
	runs: number
	service_id: string
}

export interface PlanVkmResult {
	analysisRange: { end: OperationalDate, start: OperationalDate }
	circulationGroups: CirculationGroupBreakdown[]
	patterns_skipped_no_extension: number
	statsByPattern: Map<string, VkmPerPatternStats>
	total_vkm_km: number
}

interface CalendarDateForVkm {
	date: OperationalDate
	day_type: string
	period: string
	service_id: string
}

interface VkmTripRow {
	pattern_id: string
	service_id: string
	trip_id: string
}

/* * */

function formatKm(km: number): string {
	return km.toFixed(3);
}

function quantile(values: number[], q: number): number {
	if (values.length === 0) return 0;

	const sorted = [...values].sort((a, b) => a - b);
	const pos = (sorted.length - 1) * q;
	const lower = Math.floor(pos);
	const upper = Math.ceil(pos);

	if (lower === upper) {
		return sorted[lower] ?? 0;
	}

	const weight = pos - lower;

	return (sorted[lower] ?? 0) * (1 - weight) + (sorted[upper] ?? 0) * weight;
}

function isShapeDistTraveledInMeters(distances: number[]): boolean {
	if (distances.length === 0) return false;

	return quantile(distances, 0.95) > METERS_TO_KM_THRESHOLD;
}

function convertShapeDistMetersToKm(value: number): number {
	return value / 1000;
}

function buildShapeDistancesByShapeId(shapesContent: string): Map<string, number[]> {
	const shapeDistancesByShapeId = new Map<string, number[]>();

	for (const row of Papa.parse<Record<string, string>>(shapesContent, { header: true, skipEmptyLines: true }).data) {
		const shapeId = row.shape_id ?? '';

		if (!shapeId) continue;

		const shapeDist = Number(row.shape_dist_traveled);

		if (!Number.isFinite(shapeDist)) continue;

		const entries = shapeDistancesByShapeId.get(shapeId) ?? [];

		entries.push(shapeDist);
		shapeDistancesByShapeId.set(shapeId, entries);
	}

	return shapeDistancesByShapeId;
}

function buildShapeIdsByPattern(tripsContent: string): Map<string, Set<string>> {
	const shapeIdsByPattern = new Map<string, Set<string>>();

	for (const trip of Papa.parse<Record<string, string>>(tripsContent, { header: true, skipEmptyLines: true }).data) {
		const patternId = trip.pattern_id ?? '';
		const shapeId = trip.shape_id ?? '';

		if (!patternId || !shapeId) continue;

		const shapeIds = shapeIdsByPattern.get(patternId) ?? new Set<string>();

		shapeIds.add(shapeId);
		shapeIdsByPattern.set(patternId, shapeIds);
	}

	return shapeIdsByPattern;
}

function buildTripIdToShapeId(tripsContent: string): Map<string, string> {
	const tripIdToShapeId = new Map<string, string>();

	for (const trip of Papa.parse<Record<string, string>>(tripsContent, { header: true, skipEmptyLines: true }).data) {
		const tripId = trip.trip_id ?? '';
		const shapeId = trip.shape_id ?? '';

		if (!tripId || !shapeId) continue;

		tripIdToShapeId.set(tripId, shapeId);
	}

	return tripIdToShapeId;
}

function shapeIdsNeedingMeterToKmConversion(shapeDistancesByShapeId: Map<string, number[]>): Set<string> {
	const shapesToConvert = new Set<string>();

	for (const [shapeId, distances] of shapeDistancesByShapeId) {
		if (isShapeDistTraveledInMeters(distances)) {
			shapesToConvert.add(shapeId);
		}
	}

	return shapesToConvert;
}

function maxShapeDistTraveledKm(distances: number[]): number {
	if (distances.length === 0) return 0;

	const p95 = quantile(distances, 0.95);
	const scale = p95 > METERS_TO_KM_THRESHOLD ? 1000 : 1;
	let maxKm = 0;

	for (const distance of distances) {
		maxKm = Math.max(maxKm, distance / scale);
	}

	return maxKm;
}

function computePatternExtensionKmFromShapeDistances(
	shapeDistancesByShapeId: Map<string, number[]>,
	shapeIdsByPattern: Map<string, Set<string>>,
): Map<string, number> {
	const extensionKmByPattern = new Map<string, number>();

	for (const [patternId, shapeIds] of shapeIdsByPattern) {
		let patternMaxKm = 0;

		for (const shapeId of shapeIds) {
			const distances = shapeDistancesByShapeId.get(shapeId);

			if (!distances?.length) continue;

			patternMaxKm = Math.max(patternMaxKm, maxShapeDistTraveledKm(distances));
		}

		if (patternMaxKm > 0) {
			extensionKmByPattern.set(patternId, patternMaxKm);
		}
	}

	return extensionKmByPattern;
}

async function convertShapeDistTraveledColumn(
	filePath: string,
	shouldConvertRow: (row: Record<string, string>) => boolean,
): Promise<number> {
	const content = await readFile(filePath, 'utf-8');
	const parsed = Papa.parse<Record<string, string>>(content, { header: true, skipEmptyLines: true });
	let convertedRows = 0;

	for (const row of parsed.data) {
		if (!shouldConvertRow(row)) continue;

		const raw = row.shape_dist_traveled;

		if (raw === undefined || raw === '') continue;

		const value = Number(raw);

		if (!Number.isFinite(value)) continue;

		row.shape_dist_traveled = String(convertShapeDistMetersToKm(value));
		convertedRows++;
	}

	const columns = parsed.meta.fields ?? Object.keys(parsed.data[0] ?? {});

	await writeFile(filePath, Papa.unparse(parsed.data, { columns, newline: '\n' }));

	return convertedRows;
}

async function normalizeAgency42ShapeDistTraveledToKm(extractDir: string, plan: Plan): Promise<void> {
	const agencyId = plan.gtfs_agency?.agency_id ?? '';

	if (!agencyId.startsWith('42')) return;

	const shapesPath = join(extractDir, 'shapes.txt');
	const tripsPath = join(extractDir, 'trips.txt');

	if (!existsSync(shapesPath)) {
		Logger.info(`A2 shape_dist_traveled: shapes.txt not found for plan ${plan._id}`);
		return;
	}

	if (!existsSync(tripsPath)) {
		Logger.info(`A2 shape_dist_traveled: trips.txt not found for plan ${plan._id}`);
		return;
	}

	const [shapesContent, tripsContent] = await Promise.all([
		readFile(shapesPath, 'utf-8'),
		readFile(tripsPath, 'utf-8'),
	]);

	const shapeDistancesByShapeId = buildShapeDistancesByShapeId(shapesContent);
	const shapesToConvert = shapeIdsNeedingMeterToKmConversion(shapeDistancesByShapeId);

	if (shapesToConvert.size === 0) {
		Logger.info(`A2 shape_dist_traveled already in km for plan ${plan._id} (no patterns with p95 > 1000)`);
		return;
	}

	const tripIdToShapeId = buildTripIdToShapeId(tripsContent);
	const shapesToConvertLookup = shapesToConvert;

	const shapesConverted = await convertShapeDistTraveledColumn(
		shapesPath,
		row => shapesToConvertLookup.has(row.shape_id ?? ''),
	);

	const stopTimesPath = join(extractDir, 'stop_times.txt');
	let stopTimesConverted = 0;

	if (existsSync(stopTimesPath)) {
		stopTimesConverted = await convertShapeDistTraveledColumn(
			stopTimesPath,
			(row) => {
				const shapeId = tripIdToShapeId.get(row.trip_id ?? '');

				return shapeId !== undefined && shapesToConvertLookup.has(shapeId);
			},
		);
	}

	Logger.info(
		`A2 shape_dist_traveled converted metres → km for plan ${plan._id}: `
		+ `${shapesConverted} shapes.txt rows (${shapesToConvert.size} shapes), `
		+ `${stopTimesConverted} stop_times.txt rows`,
	);
}

function parseCalendarValidityRange(content: string): null | { end: OperationalDate, start: OperationalDate } {
	const parsed = Papa.parse<Record<string, string>>(content, { header: true, skipEmptyLines: true });
	const datesByService = new Map<string, Set<OperationalDate>>();

	for (const row of parsed.data) {
		if (!row.date) continue;

		const serviceId = String(row.service_id ?? '').trim();

		if (!serviceId) continue;

		const date = row.date.replaceAll('-', '') as OperationalDate;
		const exceptionType = String(row.exception_type ?? '1').trim();
		const serviceDates = datesByService.get(serviceId) ?? new Set<OperationalDate>();

		if (exceptionType === '2') {
			serviceDates.delete(date);
		} else {
			serviceDates.add(date);
		}

		datesByService.set(serviceId, serviceDates);
	}

	const activeDates = new Set<OperationalDate>();

	for (const serviceDates of datesByService.values()) {
		for (const date of serviceDates) {
			activeDates.add(date);
		}
	}

	if (activeDates.size === 0) {
		return null;
	}

	let start: null | OperationalDate = null;
	let end: null | OperationalDate = null;

	for (const date of activeDates) {
		if (start === null || date < start) start = date;
		if (end === null || date > end) end = date;
	}

	if (start === null || end === null) {
		return null;
	}

	return { end, start };
}

async function parseCalendarValidityRangeFromFile(
	filePath: string,
): Promise<null | { end: OperationalDate, start: OperationalDate }> {
	if (!existsSync(filePath)) {
		return null;
	}

	const content = await readFile(filePath, 'utf-8');

	return parseCalendarValidityRange(content);
}

async function resolvePerPlanAnalysisDateRange(
	plan: Plan,
	extractDir: string,
): Promise<{ end: OperationalDate, start: OperationalDate }> {
	const calendarRange = await parseCalendarValidityRangeFromFile(join(extractDir, 'calendar_dates.txt'));

	if (calendarRange) {
		return calendarRange;
	}

	const year = plan.gtfs_feed_info.feed_start_date.slice(0, 4);

	return {
		end: `${year}1231` as OperationalDate,
		start: `${year}0101` as OperationalDate,
	};
}

export function getExtractedGtfsDir(planId: string): string {
	return join('/tmp', planId, 'extracted');
}

async function computePatternExtensionKmFromExtractDir(extractDir: string): Promise<Map<string, number>> {
	const tripsPath = join(extractDir, 'trips.txt');
	const shapesPath = join(extractDir, 'shapes.txt');

	if (!existsSync(tripsPath) || !existsSync(shapesPath)) {
		return new Map();
	}

	const [tripsContent, shapesContent] = await Promise.all([
		readFile(tripsPath, 'utf-8'),
		readFile(shapesPath, 'utf-8'),
	]);

	const shapeDistancesByShapeId = buildShapeDistancesByShapeId(shapesContent);
	const shapeIdsByPattern = buildShapeIdsByPattern(tripsContent);

	return computePatternExtensionKmFromShapeDistances(shapeDistancesByShapeId, shapeIdsByPattern);
}

async function loadRawTripsForVkm(extractDir: string): Promise<VkmTripRow[]> {
	const tripsPath = join(extractDir, 'trips.txt');

	if (!existsSync(tripsPath)) {
		Logger.info('VKM trips: trips.txt not found');
		return [];
	}

	const content = await readFile(tripsPath, 'utf-8');
	const parsed = Papa.parse<Record<string, string>>(content, { header: true, skipEmptyLines: true });
	const trips: VkmTripRow[] = [];

	for (const row of parsed.data) {
		const tripId = row.trip_id ?? '';
		const patternId = row.pattern_id ?? '';
		const serviceId = row.service_id ?? '';

		if (!tripId || !patternId || !serviceId) continue;

		trips.push({ pattern_id: patternId, service_id: serviceId, trip_id: tripId });
	}

	Logger.info(`VKM trips: ${trips.length} rows from trips.txt`);

	return trips;
}

/** Loads every calendar_dates row (no analysis-period filtering). */
async function loadCalendarDatesForVkm(extractDir: string): Promise<CalendarDateForVkm[]> {
	const filePath = join(extractDir, 'calendar_dates.txt');
	const rows: CalendarDateForVkm[] = [];

	if (!existsSync(filePath)) {
		Logger.info('VKM calendar: calendar_dates.txt not found');
		return rows;
	}

	const content = await readFile(filePath, 'utf-8');
	const parsed = Papa.parse<Record<string, string>>(content, { header: true, skipEmptyLines: true });

	for (const row of parsed.data) {
		const serviceId = String(row.service_id ?? '').trim();

		if (!serviceId || !row.date) continue;

		rows.push({
			date: row.date.replaceAll('-', '') as OperationalDate,
			day_type: String(row.dia_tipo ?? row.day_type ?? ''),
			period: String(row.periodo_ano ?? row.period ?? ''),
			service_id: serviceId,
		});
	}

	Logger.info(`VKM calendar: ${rows.length} rows from calendar_dates.txt`);

	return rows;
}

/**
 * gtfs-comparator `compute_trips_per_pattern_day_type_period` + `build_plan_summary`:
 * per (pattern_id, period, day_type): runs = Σ |trip_id| × |date| over service_ids;
 * veic_km_total(pattern) = extension_km(pattern) × Σ runs.
 */
function computeVkmPerPatternStats(
	vkmTrips: VkmTripRow[],
	calendarRows: CalendarDateForVkm[],
	patternExtensionKm: Map<string, number>,
): {
	circulationGroups: CirculationGroupBreakdown[]
	skippedNoExtension: number
	statsByPattern: Map<string, VkmPerPatternStats>
} {
	const calendarByService = new Map<string, CalendarDateForVkm[]>();

	for (const row of calendarRows) {
		const entries = calendarByService.get(row.service_id) ?? [];

		entries.push(row);
		calendarByService.set(row.service_id, entries);
	}

	const periods = new Set<string>();
	const dayTypes = new Set<string>();

	for (const row of calendarRows) {
		if (row.period) periods.add(row.period);
		if (row.day_type) dayTypes.add(row.day_type);
	}

	const expectedPeriodDayTypes = [...periods].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
		.flatMap(period => [...dayTypes].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
			.map(dayType => ({ day_type: dayType, period })));

	const serviceGroupMap = new Map<string, { dates: Set<OperationalDate>, tripIds: Set<string> }>();

	for (const trip of vkmTrips) {
		const serviceCalendar = calendarByService.get(trip.service_id);

		if (!serviceCalendar?.length) continue;

		for (const calendarRow of serviceCalendar) {
			const groupKey = `${trip.pattern_id}\0${trip.service_id}\0${calendarRow.period}\0${calendarRow.day_type}`;
			const group = serviceGroupMap.get(groupKey) ?? {
				dates: new Set<OperationalDate>(),
				tripIds: new Set<string>(),
			};

			group.tripIds.add(trip.trip_id);
			group.dates.add(calendarRow.date);
			serviceGroupMap.set(groupKey, group);
		}
	}

	const circulationGroupMap = new Map<string, { dates: Set<OperationalDate>, runs: number, tripIds: Set<string> }>();

	for (const [groupKey, group] of serviceGroupMap) {
		const [patternId, , period, dayType] = groupKey.split('\0');
		const aggregateKey = `${patternId}\0${period}\0${dayType}`;
		const aggregate = circulationGroupMap.get(aggregateKey) ?? {
			dates: new Set<OperationalDate>(),
			runs: 0,
			tripIds: new Set<string>(),
		};

		aggregate.runs += group.tripIds.size * group.dates.size;

		for (const tripId of group.tripIds) {
			aggregate.tripIds.add(tripId);
		}

		for (const date of group.dates) {
			aggregate.dates.add(date);
		}

		circulationGroupMap.set(aggregateKey, aggregate);
	}

	const patternsWithGroups = new Set<string>();

	for (const aggregateKey of circulationGroupMap.keys()) {
		patternsWithGroups.add(aggregateKey.split('\0')[0]);
	}

	for (const patternId of patternsWithGroups) {
		for (const { day_type: dayType, period } of expectedPeriodDayTypes) {
			const aggregateKey = `${patternId}\0${period}\0${dayType}`;

			if (circulationGroupMap.has(aggregateKey)) continue;

			circulationGroupMap.set(aggregateKey, {
				dates: new Set<OperationalDate>(),
				runs: 0,
				tripIds: new Set<string>(),
			});
		}
	}

	const annualCirculationsByPattern = new Map<string, number>();
	const tripIdsByPattern = new Map<string, Set<string>>();
	const circulationGroups: CirculationGroupBreakdown[] = [];

	for (const [groupKey, group] of serviceGroupMap) {
		const [patternId, serviceId, period, dayType] = groupKey.split('\0');

		circulationGroups.push({
			day_type: dayType,
			num_dates: group.dates.size,
			num_trip_ids: group.tripIds.size,
			pattern_id: patternId,
			period,
			runs: group.tripIds.size * group.dates.size,
			service_id: serviceId,
		});
	}

	const serviceGroupAggregateKeys = new Set<string>();

	for (const groupKey of serviceGroupMap.keys()) {
		const [patternId, , period, dayType] = groupKey.split('\0');

		serviceGroupAggregateKeys.add(`${patternId}\0${period}\0${dayType}`);
	}

	for (const [aggregateKey, group] of circulationGroupMap) {
		if (group.runs > 0 || serviceGroupAggregateKeys.has(aggregateKey)) continue;

		const [patternId, period, dayType] = aggregateKey.split('\0');

		circulationGroups.push({
			day_type: dayType,
			num_dates: group.dates.size,
			num_trip_ids: group.tripIds.size,
			pattern_id: patternId,
			period,
			runs: group.runs,
			service_id: '',
		});
	}

	for (const [aggregateKey, group] of circulationGroupMap) {
		const [patternId] = aggregateKey.split('\0');

		if (group.runs > 0) {
			annualCirculationsByPattern.set(
				patternId,
				(annualCirculationsByPattern.get(patternId) ?? 0) + group.runs,
			);

			const patternTrips = tripIdsByPattern.get(patternId) ?? new Set<string>();

			for (const tripId of group.tripIds) {
				patternTrips.add(tripId);
			}

			tripIdsByPattern.set(patternId, patternTrips);
		}
	}

	const statsByPattern = new Map<string, VkmPerPatternStats>();
	let skippedNoExtension = 0;

	for (const [patternId, annualCirculations] of annualCirculationsByPattern) {
		const extensionKm = patternExtensionKm.get(patternId);

		if (extensionKm === undefined) {
			skippedNoExtension++;
			continue;
		}

		statsByPattern.set(patternId, {
			annual_circulations: annualCirculations,
			extension_km: extensionKm,
			num_trips: tripIdsByPattern.get(patternId)?.size ?? 0,
			vkm_km: annualCirculations * extensionKm,
		});
	}

	return { circulationGroups, skippedNoExtension, statsByPattern };
}

export function logVkmPerPatternSummary(
	planData: Plan,
	analysisRange: { end: OperationalDate, start: OperationalDate },
	statsByPattern: Map<string, VkmPerPatternStats>,
	skippedNoExtension: number,
): void {
	const totalVkmKm = [...statsByPattern.values()].reduce((sum, stats) => sum + stats.vkm_km, 0);

	Logger.info(`Analysis period: ${analysisRange.start} – ${analysisRange.end}`);
	Logger.info(`Feed: ${planData.gtfs_feed_info.feed_start_date} – ${planData.gtfs_feed_info.feed_end_date}`);
	Logger.info(`Patterns with VKM: ${statsByPattern.size}`);
	Logger.info(`Patterns skipped (no shape extension): ${skippedNoExtension}`);
	Logger.info(`Total scheduled VKM: ${formatKm(totalVkmKm)} km`);

	const topPatterns = [...statsByPattern.entries()]
		.sort((a, b) => b[1].vkm_km - a[1].vkm_km)
		.slice(0, 10);

	for (const [patternId, stats] of topPatterns) {
		Logger.info(`${patternId}\t${stats.annual_circulations}\t${formatKm(stats.extension_km)}\t${formatKm(stats.vkm_km)}`);
	}
}

/* * */

export { importGtfsToDatabase };

/**
 * Calcula VKM de um plano. Requer importGtfsToDatabase já executado (importedGtfsSql);
 * os ficheiros usados estão em /tmp/{planId}/extracted, não na SQLite.
 */
export async function computePlanVkm(
	planData: Plan,
	importedGtfsSql: GtfsSQLTables,
): Promise<PlanVkmResult> {
	void importedGtfsSql;

	const extractDir = getExtractedGtfsDir(planData._id);

	await normalizeAgency42ShapeDistTraveledToKm(extractDir, planData);

	const patternExtensionKm = await computePatternExtensionKmFromExtractDir(extractDir);
	const vkmTrips = await loadRawTripsForVkm(extractDir);
	const calendarRows = await loadCalendarDatesForVkm(extractDir);
	const analysisRange = await resolvePerPlanAnalysisDateRange(planData, extractDir);
	const { circulationGroups, skippedNoExtension, statsByPattern } = computeVkmPerPatternStats(
		vkmTrips,
		calendarRows,
		patternExtensionKm,
	);

	const totalVkmKm = [...statsByPattern.values()].reduce((sum, stats) => sum + stats.vkm_km, 0);

	return {
		analysisRange,
		circulationGroups,
		patterns_skipped_no_extension: skippedNoExtension,
		statsByPattern,
		total_vkm_km: totalVkmKm,
	};
}
