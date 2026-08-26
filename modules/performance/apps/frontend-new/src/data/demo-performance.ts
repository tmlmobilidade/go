/* * */

import { type NetworkLine } from '@/types/network-line';
import { type PerformancePeriods, type PerformancePeriodSelection } from '@/utils/performance-periods';
import { createPerformanceNetworkLineId, type PassengerDemandComparison, type PassengerDemandCompositionItem, type PassengerDemandLineDashboard, PassengerDemandLineDashboardSchema, type PassengerDemandOverTimePoint, type PerformanceNetworkLineDetail, type PlannedSupplyLineDashboard, PlannedSupplyLineDashboardSchema, type RidePerformanceByPatternItem, type RidePerformanceComparison, type RidePerformanceHeatmapCell, type RidePerformanceMetrics, type RidePerformanceOverTimePoint } from '@tmlmobilidade/go-types-performance';

/* * */

interface DemoLineProfile {
	advancesPct: number
	agencyId: string
	agencyName: string
	agencyShortName: string
	code: string
	dailyRides: number
	dailyValidations: number
	delaysPct: number
	name: string
	seed: number
	servicePct: number
}

export interface DemoLineDetailData {
	comparison: PassengerDemandComparison
	comparisonPoints: PassengerDemandOverTimePoint[]
	demandByPatternCode: Map<string, number>
	hourlyDemandPoints: PassengerDemandOverTimePoint[]
	line: PerformanceNetworkLineDetail
	operationalByPatternCode: Map<string, RidePerformanceByPatternItem>
	operationalComparison: RidePerformanceComparison
	operationalHeatmap: RidePerformanceHeatmapCell[]
	operationalPoints: RidePerformanceOverTimePoint[]
	points: PassengerDemandOverTimePoint[]
	totalDemand: number
}

export interface DemoLineDemandDashboardData extends DemoLineDetailData {
	dashboard: PassengerDemandLineDashboard
}

export interface DemoLineSupplyData {
	dashboard: PlannedSupplyLineDashboard
	line: PerformanceNetworkLineDetail
}

/* * */

export const DEMO_PERIOD_SELECTION: PerformancePeriodSelection = {
	endDate: '2026-07-31',
	preset: 'custom',
	startDate: '2026-07-01',
};

const DEMO_LINE_PROFILES: DemoLineProfile[] = [
	{
		advancesPct: 1.2,
		agencyId: 'A2L1N',
		agencyName: 'Alsa Todi',
		agencyShortName: 'ALSA',
		code: '4701',
		dailyRides: 192,
		dailyValidations: 5_850,
		delaysPct: 4.8,
		name: 'Oriente — Alcochete',
		seed: 2,
		servicePct: 97.4,
	},
	{
		advancesPct: 2.4,
		agencyId: 'YA15B',
		agencyName: 'Transportes Sul do Tejo',
		agencyShortName: 'TST',
		code: '3710',
		dailyRides: 164,
		dailyValidations: 4_420,
		delaysPct: 8.1,
		name: 'Sete Rios — Sesimbra',
		seed: 5,
		servicePct: 94.6,
	},
	{
		advancesPct: 3.6,
		agencyId: 'LA77N',
		agencyName: 'Viação Alvorada',
		agencyShortName: 'VA',
		code: '1001',
		dailyRides: 148,
		dailyValidations: 3_760,
		delaysPct: 12.7,
		name: 'Alfragide — Reboleira',
		seed: 8,
		servicePct: 90.8,
	},
	{
		advancesPct: 0.8,
		agencyId: 'BNA17',
		agencyName: 'Rodoviária de Lisboa',
		agencyShortName: 'RL',
		code: '2701',
		dailyRides: 116,
		dailyValidations: 3_180,
		delaysPct: 3.5,
		name: 'Campo Grande — Ericeira',
		seed: 11,
		servicePct: 98.2,
	},
	{
		advancesPct: 1.7,
		agencyId: 'MTS',
		agencyName: 'Metro Transportes do Sul',
		agencyShortName: 'MTS',
		code: 'M101',
		dailyRides: 228,
		dailyValidations: 6_240,
		delaysPct: 6.2,
		name: 'Cacilhas — Corroios',
		seed: 14,
		servicePct: 96.1,
	},
];

const DEMO_HOURS = Array.from({ length: 19 }, (_, index) => index + 5);
const DEMO_REFRESH_VARIATIONS = [0, 0.012, -0.007, 0.008] as const;

/* * */

function round(value: number, decimals = 1) {
	const factor = 10 ** decimals;
	return Math.round(value * factor) / factor;
}

function clamp(value: number, minimum: number, maximum: number) {
	return Math.min(maximum, Math.max(minimum, value));
}

function getRefreshedProfile(profile: DemoLineProfile, refreshIndex: number): DemoLineProfile {
	const step = Math.abs(refreshIndex) % DEMO_REFRESH_VARIATIONS.length;
	const variation = DEMO_REFRESH_VARIATIONS[step];
	return {
		...profile,
		dailyRides: profile.dailyRides * (1 + variation),
		dailyValidations: profile.dailyValidations * (1 + variation),
		seed: profile.seed + step * 0.13,
	};
}

function parseDate(value: string) {
	const [year, month, day] = value.split('-').map(Number);
	return new Date(Date.UTC(year, month - 1, day, 12));
}

function formatDate(date: Date) {
	return [
		date.getUTCFullYear(),
		String(date.getUTCMonth() + 1).padStart(2, '0'),
		String(date.getUTCDate()).padStart(2, '0'),
	].join('-');
}

function getDates(startDate: string, endDate: string) {
	const dates: string[] = [];
	const cursor = parseDate(startDate);
	const end = parseDate(endDate);
	while (cursor <= end) {
		dates.push(formatDate(cursor));
		cursor.setUTCDate(cursor.getUTCDate() + 1);
	}
	return dates;
}

function getDayOfWeek(date: string) {
	const nativeDay = parseDate(date).getUTCDay();
	return nativeDay === 0 ? 7 : nativeDay;
}

function getDayFactor(date: string, seed: number) {
	const parsed = parseDate(date);
	const day = parsed.getUTCDate();
	const weekday = getDayOfWeek(date);
	const calendarFactor = weekday === 6 ? 0.67 : weekday === 7 ? 0.54 : 1;
	const variation = 1 + Math.sin((day + seed) * 1.17) * 0.055 + Math.cos((day + seed) * 0.43) * 0.025;
	return calendarFactor * variation;
}

function getHourFactor(hour: number) {
	if (hour >= 7 && hour <= 9) return 1.7;
	if (hour >= 17 && hour <= 19) return 1.55;
	if (hour <= 6 || hour >= 22) return 0.38;
	return 0.82;
}

function getDailyDemand(profile: DemoLineProfile, date: string) {
	return Math.max(0, Math.round(profile.dailyValidations * getDayFactor(date, profile.seed)));
}

function getHourlyTimestamp(date: string, hour: number) {
	const [year, month, day] = date.split('-').map(Number);
	return Date.UTC(year, month - 1, day, hour - 1);
}

function getOperationalDate(date: string) {
	return Number(date.replaceAll('-', ''));
}

function createDemandPoints(profile: DemoLineProfile, startDate: string, endDate: string, grain: 'day' | 'hour') {
	return getDates(startDate, endDate).flatMap<PassengerDemandOverTimePoint>((date) => {
		const dailyDemand = getDailyDemand(profile, date);
		if (grain === 'day') return [{ passenger_demand: dailyDemand, period: getOperationalDate(date) }];

		const weightTotal = DEMO_HOURS.reduce((total, hour) => total + getHourFactor(hour), 0);
		return DEMO_HOURS.map(hour => ({
			passenger_demand: Math.round(dailyDemand * getHourFactor(hour) / weightTotal),
			period: getHourlyTimestamp(date, hour),
		}));
	});
}

function createCompositionItems(
	ids: string[],
	currentShares: number[],
	comparisonShares: number[],
	currentTotal: number,
	comparisonTotal: number,
): PassengerDemandCompositionItem[] {
	return ids.map((id, index) => {
		const currentShare = currentShares[index];
		const comparisonShare = comparisonShares[index];
		return {
			comparison_qty: Math.round(comparisonTotal * comparisonShare / 100),
			comparison_share_pct: comparisonShare,
			current_qty: Math.round(currentTotal * currentShare / 100),
			current_share_pct: currentShare,
			id,
			share_delta_pp: round(currentShare - comparisonShare),
		};
	});
}

function createRideMetrics(profile: DemoLineProfile, date: string, hour?: number): RidePerformanceMetrics {
	const dayFactor = getDayFactor(date, profile.seed);
	const hourFactor = hour === undefined ? 1 : getHourFactor(hour) / 15.7;
	const scheduledRides = Math.max(1, Math.round(profile.dailyRides * dayFactor * hourFactor));
	const day = parseDate(date).getUTCDate();
	const periodVariation = Math.sin((day + profile.seed + (hour ?? 0)) * 0.51);
	const servicePct = clamp(profile.servicePct + periodVariation * 1.4, 82, 99.8);
	const coveragePct = clamp(98.5 + periodVariation * 0.8, 94, 100);
	const delaysPct = clamp(profile.delaysPct + periodVariation * 1.8, 0, 24);
	const advancesPct = clamp(profile.advancesPct - periodVariation * 0.5, 0, 8);
	const observedStartRides = Math.round(scheduledRides * coveragePct / 100);
	const executionFailureRides = Math.round(scheduledRides * (100 - servicePct) / 100);
	const delayEligibleRides = observedStartRides;
	const delayedRides = Math.round(delayEligibleRides * delaysPct / 100);
	const advancedRides = Math.round(observedStartRides * advancesPct / 100);

	return {
		advanced_rides_qty: advancedRides,
		advances_pct: round(observedStartRides ? advancedRides / observedStartRides * 100 : 0),
		coverage_pct: round(scheduledRides ? observedStartRides / scheduledRides * 100 : 0),
		delay_eligible_rides_qty: delayEligibleRides,
		delayed_rides_qty: delayedRides,
		delays_pct: round(delayEligibleRides ? delayedRides / delayEligibleRides * 100 : 0),
		execution_failure_rides_qty: executionFailureRides,
		observed_start_rides_qty: observedStartRides,
		scheduled_rides_qty: scheduledRides,
		service_pct: round(scheduledRides ? (scheduledRides - executionFailureRides) / scheduledRides * 100 : 0),
	};
}

function aggregateRideMetrics(metrics: RidePerformanceMetrics[]): RidePerformanceMetrics {
	const totals = metrics.reduce((result, item) => ({
		advanced_rides_qty: result.advanced_rides_qty + item.advanced_rides_qty,
		delay_eligible_rides_qty: result.delay_eligible_rides_qty + item.delay_eligible_rides_qty,
		delayed_rides_qty: result.delayed_rides_qty + item.delayed_rides_qty,
		execution_failure_rides_qty: result.execution_failure_rides_qty + item.execution_failure_rides_qty,
		observed_start_rides_qty: result.observed_start_rides_qty + item.observed_start_rides_qty,
		scheduled_rides_qty: result.scheduled_rides_qty + item.scheduled_rides_qty,
	}), {
		advanced_rides_qty: 0,
		delay_eligible_rides_qty: 0,
		delayed_rides_qty: 0,
		execution_failure_rides_qty: 0,
		observed_start_rides_qty: 0,
		scheduled_rides_qty: 0,
	});

	return {
		...totals,
		advances_pct: round(totals.observed_start_rides_qty ? totals.advanced_rides_qty / totals.observed_start_rides_qty * 100 : 0),
		coverage_pct: round(totals.scheduled_rides_qty ? totals.observed_start_rides_qty / totals.scheduled_rides_qty * 100 : 0),
		delays_pct: round(totals.delay_eligible_rides_qty ? totals.delayed_rides_qty / totals.delay_eligible_rides_qty * 100 : 0),
		service_pct: round(totals.scheduled_rides_qty ? (totals.scheduled_rides_qty - totals.execution_failure_rides_qty) / totals.scheduled_rides_qty * 100 : 0),
	};
}

function getRidePeriod(profile: DemoLineProfile, startDate: string, endDate: string) {
	return aggregateRideMetrics(getDates(startDate, endDate).map(date => createRideMetrics(profile, date)));
}

function createRideComparison(profile: DemoLineProfile, periods: PerformancePeriods): RidePerformanceComparison {
	const current = getRidePeriod(profile, periods.current.startDate, periods.current.endDate);
	const comparison = getRidePeriod(profile, periods.comparison.startDate, periods.comparison.endDate);
	return {
		advances_delta_pp: round((current.advances_pct ?? 0) - (comparison.advances_pct ?? 0)),
		comparison,
		coverage_delta_pp: round((current.coverage_pct ?? 0) - (comparison.coverage_pct ?? 0)),
		current,
		delays_delta_pp: round((current.delays_pct ?? 0) - (comparison.delays_pct ?? 0)),
		service_delta_pp: round((current.service_pct ?? 0) - (comparison.service_pct ?? 0)),
	};
}

function createNetworkLineDetail(profile: DemoLineProfile): PerformanceNetworkLineDetail {
	const patterns = [0, 1].map(index => ({
		_id: `demo-pattern-${profile.agencyId}-${profile.code}-${index}`,
		code: `${profile.code}_${index}_1`,
		destination: index === 0 ? profile.name.split(' — ')[1] ?? profile.name : profile.name.split(' — ')[0] ?? profile.name,
		headsign: index === 0 ? profile.name.split(' — ')[1] ?? profile.name : profile.name.split(' — ')[0] ?? profile.name,
		origin: index === 0 ? profile.name.split(' — ')[0] ?? profile.name : profile.name.split(' — ')[1] ?? profile.name,
	}));

	return {
		_id: createPerformanceNetworkLineId(profile.agencyId, profile.code),
		agency_id: profile.agencyId,
		agency_name: profile.agencyName,
		agency_short_name: profile.agencyShortName,
		code: profile.code,
		name: profile.name,
		pattern_count: patterns.length,
		patterns,
	};
}

function scaleRideMetrics(metrics: RidePerformanceMetrics, factor: number, patternId: string): RidePerformanceByPatternItem {
	return {
		...metrics,
		advanced_rides_qty: Math.round(metrics.advanced_rides_qty * factor),
		delay_eligible_rides_qty: Math.round(metrics.delay_eligible_rides_qty * factor),
		delayed_rides_qty: Math.round(metrics.delayed_rides_qty * factor),
		execution_failure_rides_qty: Math.round(metrics.execution_failure_rides_qty * factor),
		observed_start_rides_qty: Math.round(metrics.observed_start_rides_qty * factor),
		pattern_id: patternId,
		scheduled_rides_qty: Math.round(metrics.scheduled_rides_qty * factor),
	};
}

/* * */

export const DEMO_LINES = DEMO_LINE_PROFILES.map(createNetworkLineDetail);

export function createDemoNetworkLines(periods: PerformancePeriods, refreshIndex = 0): NetworkLine[] {
	return DEMO_LINE_PROFILES.map((baseProfile) => {
		const profile = getRefreshedProfile(baseProfile, refreshIndex);
		const line = createNetworkLineDetail(profile);
		const currentDemand = createDemandPoints(profile, periods.current.startDate, periods.current.endDate, 'day')
			.reduce((total, point) => total + point.passenger_demand, 0);
		const comparisonDemand = createDemandPoints(profile, periods.comparison.startDate, periods.comparison.endDate, 'day')
			.reduce((total, point) => total + point.passenger_demand, 0);
		const rideComparison = createRideComparison(profile, periods);

		return {
			_id: line._id,
			advances: rideComparison.current.advances_pct,
			coverage: rideComparison.current.coverage_pct,
			delayDelta: rideComparison.delays_delta_pp,
			delays: rideComparison.current.delays_pct,
			id: line.code,
			name: line.name,
			needsAttention: (rideComparison.current.service_pct ?? 100) < 95 || (rideComparison.current.delays_pct ?? 0) > 10,
			operator: line.agency_short_name,
			service: rideComparison.current.service_pct,
			serviceDelta: rideComparison.service_delta_pp,
			validations: currentDemand,
			validationsDelta: comparisonDemand ? round((currentDemand - comparisonDemand) / comparisonDemand * 100) : null,
		};
	});
}

export function createDemoLineDetailData(lineId: string, periods: PerformancePeriods, refreshIndex = 0): DemoLineDetailData | undefined {
	const decodedLineId = decodeURIComponent(lineId);
	const baseProfile = DEMO_LINE_PROFILES.find(item => createPerformanceNetworkLineId(item.agencyId, item.code) === decodedLineId);
	if (!baseProfile) return undefined;
	const profile = getRefreshedProfile(baseProfile, refreshIndex);

	const line = createNetworkLineDetail(profile);
	const pointGrain = periods.isSingleDay ? 'hour' : 'day';
	const points = createDemandPoints(profile, periods.current.startDate, periods.current.endDate, pointGrain);
	const hourlyDemandPoints = createDemandPoints(profile, periods.current.startDate, periods.current.endDate, 'hour');
	const comparisonPoints = createDemandPoints(profile, periods.comparison.startDate, periods.comparison.endDate, 'day');
	const currentDemand = points.reduce((total, point) => total + point.passenger_demand, 0);
	const comparisonDemand = comparisonPoints.reduce((total, point) => total + point.passenger_demand, 0);
	const operationalComparison = createRideComparison(profile, periods);
	const operationalPoints = getDates(periods.current.startDate, periods.current.endDate).flatMap<RidePerformanceOverTimePoint>(date => (
		periods.isSingleDay
			? DEMO_HOURS.map(hour => ({ ...createRideMetrics(profile, date, hour), period: getHourlyTimestamp(date, hour) }))
			: [{ ...createRideMetrics(profile, date), period: getOperationalDate(date) }]
	));
	const operationalHeatmap = Array.from({ length: 7 }, (_, dayIndex) => DEMO_HOURS.map(hour => ({
		...createRideMetrics(profile, `2026-07-${String(dayIndex + 6).padStart(2, '0')}`, hour),
		day_of_week: dayIndex + 1,
		hour,
	}))).flat();
	const demandByPatternCode = new Map(line.patterns.map((pattern, index) => [
		pattern.code,
		Math.round(currentDemand * (index === 0 ? 0.54 : 0.46)),
	]));
	const operationalByPatternCode = new Map(line.patterns.map((pattern, index) => [
		pattern.code,
		scaleRideMetrics(operationalComparison.current, index === 0 ? 0.54 : 0.46, pattern.code),
	]));

	return {
		comparison: {
			comparison_qty: comparisonDemand,
			current_qty: currentDemand,
			difference_pct: comparisonDemand ? round((currentDemand - comparisonDemand) / comparisonDemand * 100) : null,
			difference_qty: currentDemand - comparisonDemand,
		},
		comparisonPoints,
		demandByPatternCode,
		hourlyDemandPoints,
		line,
		operationalByPatternCode,
		operationalComparison,
		operationalHeatmap,
		operationalPoints,
		points,
		totalDemand: currentDemand,
	};
}

export function createDemoLineDemandDashboardData(lineId: string, periods: PerformancePeriods, refreshIndex = 0): DemoLineDemandDashboardData | undefined {
	const detail = createDemoLineDetailData(lineId, periods, refreshIndex);
	const decodedLineId = decodeURIComponent(lineId);
	const baseProfile = DEMO_LINE_PROFILES.find(item => createPerformanceNetworkLineId(item.agencyId, item.code) === decodedLineId);
	if (!detail || !baseProfile) return undefined;
	const profile = getRefreshedProfile(baseProfile, refreshIndex);

	const currentTotal = detail.comparison.current_qty;
	const comparisonTotal = detail.comparison.comparison_qty;
	const recordEnd = parseDate(periods.current.endDate);
	const recordStart = new Date(recordEnd);
	recordStart.setUTCFullYear(recordStart.getUTCFullYear() - 1);
	const recordByDayType = new Map<'saturday' | 'sunday_holiday' | 'weekday', { operational_date: number, passenger_demand: number }>();

	for (const date of getDates(formatDate(recordStart), periods.current.endDate)) {
		const day = getDayOfWeek(date);
		const dayType = day === 6 ? 'saturday' : day === 7 ? 'sunday_holiday' : 'weekday';
		const passengerDemand = getDailyDemand(profile, date);
		const current = recordByDayType.get(dayType);
		if (!current || passengerDemand > current.passenger_demand) {
			recordByDayType.set(dayType, { operational_date: getOperationalDate(date), passenger_demand: passengerDemand });
		}
	}

	const patternShares = [0.54, 0.46];
	const stopNames = [
		detail.line.patterns[0]?.origin ?? 'Origem',
		'Zona central',
		'Interface principal',
		detail.line.patterns[0]?.destination ?? 'Destino',
	];
	const stopShares = [0.31, 0.27, 0.23, 0.19];
	const currentRideMetrics = detail.operationalComparison.current;
	const comparisonRideMetrics = detail.operationalComparison.comparison;
	const getProductivity = (validations: number, metrics: RidePerformanceMetrics) => {
		const operatedRides = Math.max(0, metrics.scheduled_rides_qty - metrics.execution_failure_rides_qty);
		const deliveredVehicleKm = operatedRides * 22;
		return {
			delivered_vehicle_km: deliveredVehicleKm,
			operated_rides_qty: operatedRides,
			validations_per_delivered_vehicle_km: deliveredVehicleKm ? validations / deliveredVehicleKm : null,
			validations_per_operated_ride: operatedRides ? validations / operatedRides : null,
		};
	};

	return {
		...detail,
		dashboard: PassengerDemandLineDashboardSchema.parse({
			composition: {
				categories: createCompositionItems(['Passe', 'Pré-pago', 'Bancário'], [68, 24, 8], [70, 23, 7], currentTotal, comparisonTotal),
				products: createCompositionItems(['Navegante Metropolitano', 'Navegante Municipal', 'Zapping', 'Cartão bancário'], [44, 27, 21, 8], [46, 28, 19, 7], currentTotal, comparisonTotal),
			},
			contributions: {
				patterns: detail.line.patterns.map((pattern, index) => ({
					comparison_qty: Math.round(comparisonTotal * patternShares[index]),
					current_qty: Math.round(currentTotal * patternShares[index]),
					difference_qty: Math.round((currentTotal - comparisonTotal) * patternShares[index]),
					id: pattern._id,
				})),
				stops: stopNames.map((label, index) => ({
					comparison_qty: Math.round(comparisonTotal * stopShares[index]),
					current_qty: Math.round(currentTotal * stopShares[index]),
					difference_qty: Math.round((currentTotal - comparisonTotal) * stopShares[index]),
					id: `demo-stop-${index + 1}`,
					label,
				})),
			},
			productivity: {
				comparison: getProductivity(comparisonTotal, comparisonRideMetrics),
				current: getProductivity(currentTotal, currentRideMetrics),
			},
			records: [...recordByDayType.entries()].map(([dayType, record]) => ({ day_type: dayType, ...record })),
		}),
	};
}

export function createDemoLineSupplyData(lineId: string, periods: PerformancePeriods, refreshIndex = 0): DemoLineSupplyData | undefined {
	const detail = createDemoLineDetailData(lineId, periods, refreshIndex);
	const decodedLineId = decodeURIComponent(lineId);
	const baseProfile = DEMO_LINE_PROFILES.find(item => createPerformanceNetworkLineId(item.agencyId, item.code) === decodedLineId);
	if (!detail || !baseProfile) return undefined;
	const profile = getRefreshedProfile(baseProfile, refreshIndex);

	const createEvolution = (startDate: string, endDate: string) => getDates(startDate, endDate).map((date) => {
		const rides = Math.max(1, Math.round(profile.dailyRides * getDayFactor(date, profile.seed)));
		return {
			operational_date: getOperationalDate(date),
			scheduled_rides_qty: rides,
			scheduled_vehicle_km: rides * 22,
		};
	});
	const currentEvolution = createEvolution(periods.current.startDate, periods.current.endDate);
	const comparisonEvolution = createEvolution(periods.comparison.startDate, periods.comparison.endDate);
	const metrics = (points: typeof currentEvolution) => {
		const rides = points.reduce((total, point) => total + point.scheduled_rides_qty, 0);
		const vehicleKm = points.reduce((total, point) => total + point.scheduled_vehicle_km, 0);
		return {
			active_days_qty: points.length,
			rides_per_active_day: points.length ? rides / points.length : 0,
			scheduled_rides_qty: rides,
			scheduled_vehicle_km: vehicleKm,
			vehicle_km_per_active_day: points.length ? vehicleKm / points.length : 0,
		};
	};
	const current = metrics(currentEvolution);
	const comparison = metrics(comparisonEvolution);
	const plannedHours = Array.from({ length: 21 }, (_, index) => index + 5);
	const heatmap = Array.from({ length: 7 }, (_, dayIndex) => {
		const dayFactor = dayIndex === 5 ? 0.67 : dayIndex === 6 ? 0.54 : 1;
		const weightTotal = plannedHours.reduce((total, hour) => total + getHourFactor(hour % 24), 0);
		return plannedHours.map(hour => ({
			average_scheduled_rides: profile.dailyRides * dayFactor * getHourFactor(hour % 24) / weightTotal,
			day_of_week: dayIndex + 1,
			hour,
		}));
	}).flat();
	const dayProfiles = (['weekday', 'saturday', 'sunday_holiday'] as const).map((dayType, index) => {
		const factor = [1, 0.67, 0.54][index];
		return {
			active_days_qty: currentEvolution.filter((point) => {
				const day = getDayOfWeek(String(point.operational_date).replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'));
				return index === 0 ? day <= 5 : index === 1 ? day === 6 : day === 7;
			}).length,
			average_scheduled_rides: profile.dailyRides * factor,
			average_vehicle_km: profile.dailyRides * factor * 22,
			day_type: dayType,
			first_departure_minute: 5 * 60,
			last_departure_minute: dayType === 'weekday' ? 25 * 60 : 24 * 60 + 30,
			median_headway_minutes: dayType === 'weekday' ? 12 : dayType === 'saturday' ? 18 : 22,
			service_span_minutes: dayType === 'weekday' ? 20 * 60 : 19 * 60 + 30,
		};
	});
	const shares = [0.54, 0.46];
	const dashboard = PlannedSupplyLineDashboardSchema.parse({
		comparison,
		current,
		day_profiles: dayProfiles,
		evolution: { comparison: comparisonEvolution, current: currentEvolution },
		heatmap,
		patterns: detail.line.patterns.map((pattern, index) => {
			const currentRides = Math.round(current.scheduled_rides_qty * shares[index]);
			const comparisonRides = Math.round(comparison.scheduled_rides_qty * shares[index]);
			return {
				comparison_rides_qty: comparisonRides,
				comparison_vehicle_km: comparisonRides * 22,
				current_rides_qty: currentRides,
				current_vehicle_km: currentRides * 22,
				id: pattern._id,
				rides_difference_pct: comparisonRides ? (currentRides - comparisonRides) / comparisonRides * 100 : null,
				rides_share_pct: shares[index] * 100,
			};
		}),
	});

	return { dashboard, line: detail.line };
}
