import type { Agency, CalculateVkmDto, Event, Holiday, LegacyVkmDayType, OperationalDate, Pattern, VkmCalculationResult, VkmPeriodResult, YearPeriod } from '@tmlmobilidade/types';

import { buildOperationalDateRange } from '@/calendar/rules/utils/date.js';
import { calendarWeekday } from '@/calendar/utils/index.js';
import { Dates } from '@/dates.js';

import { type ActiveRulesDateContext, buildActiveRulesDateContext, buildActiveRulesEventIndex, computeActiveRuleCountFromSplit, splitScheduleRules } from './calendar/rules/calculation/index.js';
import { resolvePatternRules } from './calendar/rules/merging/index.js';

export interface CalculateAgencyVkmArgs {
	agency: Agency
	events: Event[]
	holidays: Holiday[]
	patterns: Pattern[]
	periods: YearPeriod[]
	request: CalculateVkmDto
}

interface CalculationContext {
	activeRulesContextByDate: Map<OperationalDate, ActiveRulesDateContext>
	endDate: Dates
	metadataByDate: Map<OperationalDate, DayMetadata>
	operationalDates: OperationalDate[]
	relevantPeriods: YearPeriod[]
}

interface DayMetadata {
	dayType: LegacyVkmDayType
	periodId: null | string
}

interface PeriodAccumulator {
	code: null | string
	day_type_one: number
	day_type_three: number
	day_type_two: number
	id: null | string
	name: string
	total: number
}

interface VkmAccumulator {
	day_type_one: number
	day_type_three: number
	day_type_two: number
	periods: Map<string, PeriodAccumulator>
	total_from_distance: number
}

const UNASSIGNED_PERIOD_KEY = '__unassigned__';
const UNASSIGNED_PERIOD_NAME = 'Sem período definido';

function resolveDayTypeBucket(date: OperationalDate, holidays: Holiday[]): LegacyVkmDayType {
	const weekday = calendarWeekday(Dates.fromOperationalDate(date, 'Europe/Lisbon'), holidays);
	if (weekday === 6) return '2';
	if (weekday === 7) return '3';
	return '1';
}

function sortPeriodsByStartDate(periods: YearPeriod[]) {
	return [...periods].sort((left, right) => {
		const leftStart = left.dates?.slice().sort()[0] ?? '99999999';
		const rightStart = right.dates?.slice().sort()[0] ?? '99999999';
		return leftStart.localeCompare(rightStart);
	});
}

function createPeriodAccumulator(period: null | YearPeriod, fallbackName = UNASSIGNED_PERIOD_NAME): PeriodAccumulator {
	return {
		code: period?.code ?? null,
		day_type_one: 0,
		day_type_three: 0,
		day_type_two: 0,
		id: period?._id ?? null,
		name: period?.name ?? fallbackName,
		total: 0,
	};
}

function createAccumulator(periods: YearPeriod[]): VkmAccumulator {
	const periodAccumulators = new Map<string, PeriodAccumulator>();
	for (const period of periods) {
		periodAccumulators.set(period._id, createPeriodAccumulator(period));
	}
	return { day_type_one: 0, day_type_three: 0, day_type_two: 0, periods: periodAccumulators, total_from_distance: 0 };
}

function buildPeriodMetadata(operationalDates: OperationalDate[], periods: YearPeriod[]) {
	const operationalDateSet = new Set(operationalDates);
	const periodIdByDate = new Map<OperationalDate, string>();
	const relevantPeriods: YearPeriod[] = [];

	for (const period of sortPeriodsByStartDate(periods)) {
		const relevantDates = (period.dates ?? []).filter(date => operationalDateSet.has(date));
		if (!relevantDates.length) continue;
		relevantPeriods.push(period);
		for (const date of relevantDates) {
			if (!periodIdByDate.has(date)) periodIdByDate.set(date, period._id);
		}
	}

	return { periodIdByDate, relevantPeriods };
}

function addDistanceToDayType(acc: PeriodAccumulator, distanceMeters: number, dayType: LegacyVkmDayType) {
	acc.total += distanceMeters;
	if (dayType === '1') acc.day_type_one += distanceMeters;
	if (dayType === '2') acc.day_type_two += distanceMeters;
	if (dayType === '3') acc.day_type_three += distanceMeters;
}

function addToAccumulator(accumulator: VkmAccumulator, distanceMeters: number, dayType: LegacyVkmDayType, periodId: null | string) {
	accumulator.total_from_distance += distanceMeters;
	if (dayType === '1') accumulator.day_type_one += distanceMeters;
	if (dayType === '2') accumulator.day_type_two += distanceMeters;
	if (dayType === '3') accumulator.day_type_three += distanceMeters;

	const key = periodId ?? UNASSIGNED_PERIOD_KEY;
	const existing = accumulator.periods.get(key);

	if (existing) {
		addDistanceToDayType(existing, distanceMeters, dayType);
		return;
	}

	const unassigned = createPeriodAccumulator(null);
	addDistanceToDayType(unassigned, distanceMeters, dayType);
	accumulator.periods.set(UNASSIGNED_PERIOD_KEY, unassigned);
}

function metersToKilometers(value: number) {
	return value / 1000;
}

function buildPeriodResults(periods: Map<string, PeriodAccumulator>): VkmPeriodResult[] {
	return [...periods.entries()]
		.filter(([key, period]) => key !== UNASSIGNED_PERIOD_KEY || period.total > 0)
		.map(([, period]) => ({
			code: period.code,
			day_type_one: metersToKilometers(period.day_type_one),
			day_type_three: metersToKilometers(period.day_type_three),
			day_type_two: metersToKilometers(period.day_type_two),
			id: period.id,
			name: period.name,
			total: metersToKilometers(period.total),
		}));
}

function buildDayMetadata(operationalDates: OperationalDate[], holidays: Holiday[], periods: YearPeriod[]) {
	const { periodIdByDate, relevantPeriods } = buildPeriodMetadata(operationalDates, periods);
	const metadataByDate = new Map<OperationalDate, DayMetadata>();
	for (const date of operationalDates) {
		metadataByDate.set(date, {
			dayType: resolveDayTypeBucket(date, holidays),
			periodId: periodIdByDate.get(date) ?? null,
		});
	}
	return { metadataByDate, relevantPeriods };
}

function resolveCalculationEndDate(request: Pick<CalculateVkmDto, 'calculation_method' | 'end_date' | 'start_date'>) {
	const startDate = Dates.fromOperationalDate(request.start_date, 'Europe/Lisbon');
	const endDate = request.calculation_method === 'rolling_year'
		? startDate.plus({ years: 1 })
		: Dates.fromOperationalDate(request.end_date ?? request.start_date, 'Europe/Lisbon');
	return { endDate, startDate };
}

function buildCalculationContext(
	request: Pick<CalculateVkmDto, 'calculation_method' | 'end_date' | 'start_date'>,
	holidays: Holiday[],
	periods: YearPeriod[],
): CalculationContext {
	const { endDate, startDate } = resolveCalculationEndDate(request);
	const operationalDates = buildOperationalDateRange(startDate.js_date, endDate.js_date);
	const { metadataByDate, relevantPeriods } = buildDayMetadata(operationalDates, holidays, periods);
	const activeRulesContextByDate = new Map<OperationalDate, ActiveRulesDateContext>();
	for (const date of operationalDates) {
		activeRulesContextByDate.set(date, buildActiveRulesDateContext(date, periods, holidays));
	}
	return { activeRulesContextByDate, endDate, metadataByDate, operationalDates, relevantPeriods };
}

function buildCalculationInputs(
	agency: Agency,
	request: Pick<CalculateVkmDto, 'calculation_method' | 'start_date'>,
	endDate: Dates,
) {
	const totalVkmPerYear = agency.financials.vkm_per_month.reduce((sum, value) => sum + Number(value ?? 0), 0);
	const pricePerKm = Number(agency.financials.price_per_km ?? 0);
	return {
		agency_id: agency._id,
		agency_name: agency.name,
		calculation_method: request.calculation_method,
		end_date: endDate.operational_date,
		price_per_km: pricePerKm,
		start_date: request.start_date,
		total_vkm_per_year: totalVkmPerYear,
	};
}

export function getPatternExtensionMeters(pattern: Pattern, source: CalculateVkmDto['extension_source']): number {
	if (source === 'stop_times') {
		return (pattern.path ?? []).reduce((total, item) => total + Number(item.distance_delta ?? 0), 0);
	}
	return Number(pattern.shape?.extension ?? 0);
}

export function calculateAgencyVkm({ agency, events, holidays, patterns, periods, request }: CalculateAgencyVkmArgs): VkmCalculationResult {
	const { activeRulesContextByDate, endDate, metadataByDate, operationalDates, relevantPeriods } = buildCalculationContext(request, holidays, periods);
	const accumulator = createAccumulator(relevantPeriods);
	const eventById = buildActiveRulesEventIndex(events);

	for (const pattern of patterns) {
		const extensionMeters = getPatternExtensionMeters(pattern, request.extension_source);
		if (!extensionMeters) continue;

		const mergedRules = resolvePatternRules(pattern, events);
		if (!mergedRules.length) continue;
		const splitRules = splitScheduleRules(mergedRules);

		for (const date of operationalDates) {
			const dateContext = activeRulesContextByDate.get(date);
			if (!dateContext) continue;

			const activeTripCount = computeActiveRuleCountFromSplit(date, splitRules, periods, holidays, {
				dateContext,
				eventById,
				events,
			});

			if (!activeTripCount) continue;

			const dayMetadata = metadataByDate.get(date);
			if (!dayMetadata) continue;

			addToAccumulator(accumulator, extensionMeters * activeTripCount, dayMetadata.dayType, dayMetadata.periodId);
		}
	}

	const totalDistanceKm = metersToKilometers(accumulator.total_from_distance);
	const inputs = buildCalculationInputs(agency, request, endDate);

	return {
		day_type_one: metersToKilometers(accumulator.day_type_one),
		day_type_three: metersToKilometers(accumulator.day_type_three),
		day_type_two: metersToKilometers(accumulator.day_type_two),
		inputs,
		periods: buildPeriodResults(accumulator.periods),
		total_from_distance: totalDistanceKm,
		total_from_shape: 0,
		total_in_euros: totalDistanceKm * inputs.price_per_km,
		total_relative_to_contract: inputs.total_vkm_per_year ? totalDistanceKm / inputs.total_vkm_per_year : 0,
	};
}
