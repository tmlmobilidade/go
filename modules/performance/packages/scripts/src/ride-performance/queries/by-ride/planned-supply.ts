/* * */

import { enrichOperationalDate } from '@tmlmobilidade/dates';
import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { type PlannedSupplyBreakdown, type PlannedSupplyBreakdownQueryInput, PlannedSupplyBreakdownQueryInputSchema, PlannedSupplyBreakdownSchema, type PlannedSupplyDailyPatternQueryRow, PlannedSupplyDailyPatternQueryRowSchema, type PlannedSupplyDayProfile, type PlannedSupplyDayProfiles, PlannedSupplyDayProfilesSchema, type PlannedSupplyHeatmapCell, type PlannedSupplyLineDashboard, type PlannedSupplyLineDashboardQueryInput, PlannedSupplyLineDashboardQueryInputSchema, PlannedSupplyLineDashboardSchema, type PlannedSupplyMetrics, type PlannedSupplyOverTimePoint, type PlannedSupplyPatternItem, type PlannedSupplyQueryInput, PlannedSupplyQueryInputSchema, type PlannedSupplySeries, PlannedSupplySeriesSchema, type PlannedSupplyTimeProfile, PlannedSupplyTimeProfileSchema } from '@tmlmobilidade/go-types-performance';

import { RIDE_PERFORMANCE_DEFINITION_VERSION, RIDE_PERFORMANCE_TIMEZONE } from '../../definition.js';

/* * */

interface NormalizedDailyPatternRow {
	departure_minutes: number[]
	operational_date: number
	pattern_id: string
	scheduled_rides_qty: number
	scheduled_vehicle_km: number
}

type DayType = PlannedSupplyDayProfile['day_type'];

/* * */

function median(values: number[]) {
	if (!values.length) return null;
	const sorted = [...values].sort((a, b) => a - b);
	const middle = Math.floor(sorted.length / 2);
	return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function dayTypeForDate(value: number): DayType | undefined {
	const date = enrichOperationalDate(value);
	if (!date) {
		const raw = String(value);
		const weekday = new Date(`${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}T12:00:00Z`).getUTCDay();
		if (weekday === 0) return 'sunday_holiday';
		if (weekday === 6) return 'saturday';
		return 'weekday';
	}
	if (date.day_type === '1') return 'weekday';
	if (date.day_type === '2') return 'saturday';
	return 'sunday_holiday';
}

function normalizeRows(rows: PlannedSupplyDailyPatternQueryRow[]): NormalizedDailyPatternRow[] {
	return rows.map(row => ({
		departure_minutes: row.departure_minutes.map(Number).sort((a, b) => a - b),
		operational_date: Number(row.operational_date),
		pattern_id: row.pattern_id,
		scheduled_rides_qty: Number(row.scheduled_rides_qty),
		scheduled_vehicle_km: Number(row.scheduled_distance_m) / 1_000,
	}));
}

function toEvolution(rows: NormalizedDailyPatternRow[]): PlannedSupplyOverTimePoint[] {
	const dates = new Map<number, PlannedSupplyOverTimePoint>();
	for (const row of rows) {
		const point = dates.get(row.operational_date) ?? {
			operational_date: row.operational_date as PlannedSupplyOverTimePoint['operational_date'],
			scheduled_rides_qty: 0,
			scheduled_vehicle_km: 0,
		};
		point.scheduled_rides_qty += row.scheduled_rides_qty;
		point.scheduled_vehicle_km += row.scheduled_vehicle_km;
		dates.set(row.operational_date, point);
	}
	return [...dates.values()].sort((a, b) => a.operational_date - b.operational_date);
}

function toMetrics(evolution: PlannedSupplyOverTimePoint[]): PlannedSupplyMetrics {
	const activeDays = evolution.length;
	const rides = evolution.reduce((total, point) => total + point.scheduled_rides_qty, 0);
	const vehicleKm = evolution.reduce((total, point) => total + point.scheduled_vehicle_km, 0);
	return {
		active_days_qty: activeDays,
		rides_per_active_day: activeDays ? rides / activeDays : 0,
		scheduled_rides_qty: rides,
		scheduled_vehicle_km: vehicleKm,
		vehicle_km_per_active_day: activeDays ? vehicleKm / activeDays : 0,
	};
}

function toDayProfiles(rows: NormalizedDailyPatternRow[]): PlannedSupplyDayProfile[] {
	const lineDays = new Map<number, { departure_minutes: number[], headways: number[], rides: number, vehicle_km: number }>();
	for (const row of rows) {
		const headways = row.departure_minutes.slice(1).map((minute, index) => minute - row.departure_minutes[index]).filter(value => value > 0);
		const day = lineDays.get(row.operational_date) ?? { departure_minutes: [], headways: [], rides: 0, vehicle_km: 0 };
		day.departure_minutes.push(...row.departure_minutes);
		day.headways.push(...headways);
		day.rides += row.scheduled_rides_qty;
		day.vehicle_km += row.scheduled_vehicle_km;
		lineDays.set(row.operational_date, day);
	}

	return (['weekday', 'saturday', 'sunday_holiday'] as const).map((dayType) => {
		const days = [...lineDays.entries()].filter(([date]) => dayTypeForDate(date) === dayType).map(([, value]) => value);
		const firstDepartures = days.map(day => Math.min(...day.departure_minutes)).filter(Number.isFinite);
		const lastDepartures = days.map(day => Math.max(...day.departure_minutes)).filter(Number.isFinite);
		return {
			active_days_qty: days.length,
			average_scheduled_rides: days.length ? days.reduce((total, day) => total + day.rides, 0) / days.length : 0,
			average_vehicle_km: days.length ? days.reduce((total, day) => total + day.vehicle_km, 0) / days.length : 0,
			day_type: dayType,
			first_departure_minute: median(firstDepartures),
			last_departure_minute: median(lastDepartures),
			median_headway_minutes: median(days.flatMap(day => day.headways)),
			service_span_minutes: median(days.map(day => Math.max(...day.departure_minutes) - Math.min(...day.departure_minutes)).filter(Number.isFinite)),
		};
	});
}

function toHeatmap(rows: NormalizedDailyPatternRow[]): PlannedSupplyHeatmapCell[] {
	const datesByWeekday = new Map<number, Set<number>>();
	const totals = new Map<string, number>();
	for (const row of rows) {
		const enrichedDate = enrichOperationalDate(row.operational_date);
		const raw = String(row.operational_date);
		const nativeDay = new Date(`${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}T12:00:00Z`).getUTCDay();
		const dayOfWeek = enrichedDate ? Number(enrichedDate.weekday) : nativeDay === 0 ? 7 : nativeDay;
		const dates = datesByWeekday.get(dayOfWeek) ?? new Set<number>();
		dates.add(row.operational_date);
		datesByWeekday.set(dayOfWeek, dates);
		for (const minute of row.departure_minutes) {
			const hour = Math.floor(minute / 60);
			const key = `${dayOfWeek}:${hour}`;
			totals.set(key, (totals.get(key) ?? 0) + 1);
		}
	}
	return [...totals.entries()].map(([key, total]) => {
		const [dayOfWeek, hour] = key.split(':').map(Number);
		return {
			average_scheduled_rides: total / (datesByWeekday.get(dayOfWeek)?.size ?? 1),
			day_of_week: dayOfWeek,
			hour,
		};
	}).sort((a, b) => a.day_of_week - b.day_of_week || a.hour - b.hour);
}

function toPatterns(currentRows: NormalizedDailyPatternRow[], comparisonRows: NormalizedDailyPatternRow[]): PlannedSupplyPatternItem[] {
	const aggregate = (rows: NormalizedDailyPatternRow[]) => {
		const result = new Map<string, { rides: number, vehicleKm: number }>();
		for (const row of rows) {
			const item = result.get(row.pattern_id) ?? { rides: 0, vehicleKm: 0 };
			item.rides += row.scheduled_rides_qty;
			item.vehicleKm += row.scheduled_vehicle_km;
			result.set(row.pattern_id, item);
		}
		return result;
	};
	const current = aggregate(currentRows);
	const comparison = aggregate(comparisonRows);
	const totalRides = [...current.values()].reduce((total, item) => total + item.rides, 0);
	return [...new Set([...current.keys(), ...comparison.keys()])].map((id) => {
		const currentItem = current.get(id) ?? { rides: 0, vehicleKm: 0 };
		const comparisonItem = comparison.get(id) ?? { rides: 0, vehicleKm: 0 };
		return {
			comparison_rides_qty: comparisonItem.rides,
			comparison_vehicle_km: comparisonItem.vehicleKm,
			current_rides_qty: currentItem.rides,
			current_vehicle_km: currentItem.vehicleKm,
			id,
			rides_difference_pct: comparisonItem.rides ? (currentItem.rides - comparisonItem.rides) / comparisonItem.rides * 100 : null,
			rides_share_pct: totalRides ? currentItem.rides / totalRides * 100 : 0,
		};
	}).sort((a, b) => b.current_rides_qty - a.current_rides_qty || a.id.localeCompare(b.id));
}

/* * */

export function buildPlannedSupplyDailyPatternQuery(input: PlannedSupplyLineDashboardQueryInput, period: 'comparison' | 'current') {
	const parsed = PlannedSupplyLineDashboardQueryInputSchema.parse(input);
	const selectedPeriod = parsed[`${period}_period`];
	const localHour = `toHour(fromUnixTimestamp64Milli(interval_start, '${RIDE_PERFORMANCE_TIMEZONE}'))`;
	const localMinute = `(${localHour} * 60 + toMinute(fromUnixTimestamp64Milli(interval_start, '${RIDE_PERFORMANCE_TIMEZONE}')) + if(${localHour} < 4, 1440, 0))`;
	return {
		params: {
			1: RIDE_PERFORMANCE_DEFINITION_VERSION,
			2: parsed.agency_id,
			3: parsed.line_id,
			4: selectedPeriod.start_date,
			5: selectedPeriod.end_date,
		},
		query: `
			SELECT
				operational_date,
				pattern_id,
				sum(scheduled_rides_total_qty) AS scheduled_rides_qty,
				sum(scheduled_distance_m) AS scheduled_distance_m,
				arraySort(groupArrayIf(${localMinute}, scheduled_rides_total_qty > 0)) AS departure_minutes
			FROM performance.ride_service_by_ride
			WHERE definition_version = $1
				AND agency_id = $2
				AND line_id = $3
				AND operational_date BETWEEN $4 AND $5
			GROUP BY operational_date, pattern_id
			ORDER BY operational_date, pattern_id
		`,
	};
}

export function buildPlannedSupplyResourceQuery(input: PlannedSupplyQueryInput) {
	const parsed = PlannedSupplyQueryInputSchema.parse(input);
	const dashboardInput = {
		agency_id: parsed.agency_id,
		comparison_period: { end_date: parsed.end_date, start_date: parsed.start_date },
		current_period: { end_date: parsed.end_date, start_date: parsed.start_date },
		line_id: parsed.line_id,
	};
	return buildPlannedSupplyDailyPatternQuery(dashboardInput, 'current');
}

async function queryPlannedSupplyResourceRows(input: PlannedSupplyQueryInput) {
	const built = buildPlannedSupplyResourceQuery(input);
	const rawRows = await labDb.performance.rideServiceByRide.queryFromString<PlannedSupplyDailyPatternQueryRow>(built.query, built.params);
	return normalizeRows(PlannedSupplyDailyPatternQueryRowSchema.array().parse(rawRows));
}

export async function queryPlannedSupplySeries(input: PlannedSupplyQueryInput): Promise<PlannedSupplySeries> {
	const points = toEvolution(await queryPlannedSupplyResourceRows(input));
	return PlannedSupplySeriesSchema.parse({ points, totals: toMetrics(points) });
}

export async function queryPlannedSupplySummary(input: PlannedSupplyQueryInput): Promise<PlannedSupplyMetrics> {
	const points = toEvolution(await queryPlannedSupplyResourceRows(input));
	return toMetrics(points);
}

export async function queryPlannedSupplyBreakdown(input: PlannedSupplyBreakdownQueryInput): Promise<PlannedSupplyBreakdown> {
	const parsed = PlannedSupplyBreakdownQueryInputSchema.parse(input);
	const rows = await queryPlannedSupplyResourceRows(parsed);
	const byPattern = new Map<string, { rides: number, vehicleKm: number }>();
	for (const row of rows) {
		const item = byPattern.get(row.pattern_id) ?? { rides: 0, vehicleKm: 0 };
		item.rides += row.scheduled_rides_qty;
		item.vehicleKm += row.scheduled_vehicle_km;
		byPattern.set(row.pattern_id, item);
	}
	const totalRides = [...byPattern.values()].reduce((total, item) => total + item.rides, 0);
	return PlannedSupplyBreakdownSchema.parse({
		dimension: parsed.dimension,
		items: [...byPattern.entries()].map(([id, item]) => ({
			id,
			rides_share_pct: totalRides ? item.rides / totalRides * 100 : 0,
			scheduled_rides_qty: item.rides,
			scheduled_vehicle_km: item.vehicleKm,
		})).sort((a, b) => b.scheduled_rides_qty - a.scheduled_rides_qty || a.id.localeCompare(b.id)),
	});
}

export async function queryPlannedSupplyTimeProfile(input: PlannedSupplyQueryInput): Promise<PlannedSupplyTimeProfile> {
	return PlannedSupplyTimeProfileSchema.parse({ cells: toHeatmap(await queryPlannedSupplyResourceRows(input)) });
}

export async function queryPlannedSupplyDayProfiles(input: PlannedSupplyQueryInput): Promise<PlannedSupplyDayProfiles> {
	return PlannedSupplyDayProfilesSchema.parse({ profiles: toDayProfiles(await queryPlannedSupplyResourceRows(input)) });
}

export function normalizePlannedSupplyLineDashboard(currentRaw: PlannedSupplyDailyPatternQueryRow[], comparisonRaw: PlannedSupplyDailyPatternQueryRow[]): PlannedSupplyLineDashboard {
	const currentRows = normalizeRows(PlannedSupplyDailyPatternQueryRowSchema.array().parse(currentRaw));
	const comparisonRows = normalizeRows(PlannedSupplyDailyPatternQueryRowSchema.array().parse(comparisonRaw));
	const currentEvolution = toEvolution(currentRows);
	const comparisonEvolution = toEvolution(comparisonRows);
	return PlannedSupplyLineDashboardSchema.parse({
		comparison: toMetrics(comparisonEvolution),
		current: toMetrics(currentEvolution),
		day_profiles: toDayProfiles(currentRows),
		evolution: { comparison: comparisonEvolution, current: currentEvolution },
		heatmap: toHeatmap(currentRows),
		patterns: toPatterns(currentRows, comparisonRows),
	});
}

export async function queryPlannedSupplyLineDashboard(input: PlannedSupplyLineDashboardQueryInput): Promise<PlannedSupplyLineDashboard> {
	const currentQuery = buildPlannedSupplyDailyPatternQuery(input, 'current');
	const comparisonQuery = buildPlannedSupplyDailyPatternQuery(input, 'comparison');
	const [currentRows, comparisonRows] = await Promise.all([
		labDb.performance.rideServiceByRide.queryFromString<PlannedSupplyDailyPatternQueryRow>(currentQuery.query, currentQuery.params),
		labDb.performance.rideServiceByRide.queryFromString<PlannedSupplyDailyPatternQueryRow>(comparisonQuery.query, comparisonQuery.params),
	]);
	return normalizePlannedSupplyLineDashboard(currentRows, comparisonRows);
}
