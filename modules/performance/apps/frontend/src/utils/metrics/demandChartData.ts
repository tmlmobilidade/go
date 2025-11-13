import { Dates } from '@tmlmobilidade/dates';
import { DemandByAgencyByDay, type DemandByLineByDay, type DemandByPatternByDay } from '@tmlmobilidade/types';
import { type LineChartProps } from '@tmlmobilidade/ui';

import { formatDayDetailed, formatDayShort } from './formatDates';

// TODO: Abstract this functions

export interface DemandTransformResult {
	all: { chart: LineChartProps['data'], sum: number }
	lastUpdated: Date | null
}

export interface TransformDemandOptions {
	data: DemandByLineByDay[] | undefined
	end: Dates | null
	lineIds?: string[]
	start: Dates | null
}

export function transformDemandByLineByDay(
	data: DemandByLineByDay[] | undefined,
	startDate: Dates | null,
	endDate: Dates | null,
	lineIds?: string[],
	t?,
): DemandTransformResult {
	if (!data?.length) {
		return { all: { chart: [], sum: 0 }, lastUpdated: null };
	}

	const startDateStr = startDate?.iso.split('T')[0];
	const endDateStr = endDate?.iso.split('T')[0];

	const filteredData = lineIds?.length
		? data.filter(d => lineIds.includes(d.properties?.line_id))
		: data;

	const allMap: Record<string, { formatted_day_detailed: string, formatted_day_short: string, qty: number }> = {};
	let totalSum = 0;

	for (const item of filteredData) {
		Object.entries(item.data)
			.filter(([date]) => date >= startDateStr && date <= endDateStr)
			.forEach(([date, d]) => {
				const formattedDetailed = formatDayDetailed({
					day_group: date,
					day_type: d.day_type,
					holiday: d.holiday,
					notes: d.notes,
				}, t);

				const formattedShort = formatDayShort({ day_group: date }, t);

				if (!allMap[date]) {
					allMap[date] = {
						formatted_day_detailed: formattedDetailed,
						formatted_day_short: formattedShort,
						qty: 0,
					};
				}

				allMap[date].qty += d.qty;
				totalSum += d.qty;
			});
	}

	const allChart: LineChartProps['data'] = Object.values(allMap)
		.sort((a, b) => new Date(a.formatted_day_detailed).getTime() - new Date(b.formatted_day_detailed).getTime())
		.map(entry => ({
			formatted_day_detailed: entry.formatted_day_detailed,
			formatted_day_short: entry.formatted_day_short,
			qty: entry.qty,
		}));

	const lastUpdated = filteredData
		.map(r => new Date(r.generated_at))
		.sort((a, b) => b.getTime() - a.getTime())[0] || null;

	return { all: { chart: allChart, sum: totalSum }, lastUpdated };
}

export function transformDemandByPatternByDay(
	data: DemandByPatternByDay[] | undefined,
	startDate: Dates | null,
	endDate: Dates | null,
	patternIds?: string[],
	t?,
): DemandTransformResult {
	if (!data?.length) {
		return { all: { chart: [], sum: 0 }, lastUpdated: null };
	}

	const startDateStr = startDate?.iso.split('T')[0];
	const endDateStr = endDate?.iso.split('T')[0];

	const filteredData = patternIds?.length
		? data.filter(d => patternIds.includes(d.properties?.pattern_id))
		: data;

	const allMap: Record<string, { formatted_day_detailed: string, formatted_day_short: string, qty: number }> = {};
	let totalSum = 0;

	for (const item of filteredData) {
		Object.entries(item.data)
			.filter(([date]) => date >= startDateStr && date <= endDateStr)
			.forEach(([date, d]) => {
				const formattedDetailed = formatDayDetailed({
					day_group: date,
					day_type: d.day_type,
					holiday: d.holiday,
					notes: d.notes,
				}, t);

				const formattedShort = formatDayShort({ day_group: date }, t);

				if (!allMap[date]) {
					allMap[date] = {
						formatted_day_detailed: formattedDetailed,
						formatted_day_short: formattedShort,
						qty: 0,
					};
				}

				allMap[date].qty += d.qty;
				totalSum += d.qty;
			});
	}

	const allChart: LineChartProps['data'] = Object.values(allMap)
		.sort((a, b) => new Date(a.formatted_day_detailed).getTime() - new Date(b.formatted_day_detailed).getTime())
		.map(entry => ({
			formatted_day_detailed: entry.formatted_day_detailed,
			formatted_day_short: entry.formatted_day_short,
			qty: entry.qty,
		}));

	const lastUpdated = filteredData
		.map(r => new Date(r.generated_at))
		.sort((a, b) => b.getTime() - a.getTime())[0] || null;

	return { all: { chart: allChart, sum: totalSum }, lastUpdated };
}

export interface DemandByAgencyTransformResult {
	agencies: Record<string, { chart: LineChartProps['data'], sum: number }>
	all: { chart: LineChartProps['data'], sum: number }
	lastUpdated: Date | null
}

/**
 * Transform raw demand-by-agency-by-day data into chart-ready format.
 * Optional filtering by date range and agencyId.
 */
export function transformDemandByAgencyByDay(
	data: DemandByAgencyByDay[],
	startDate?: Dates,
	endDate?: Dates,
	agencyId?: string,
	t?,
): DemandByAgencyTransformResult {
	if (!data?.length) {
		return { agencies: {}, all: { chart: [], sum: 0 }, lastUpdated: null };
	}

	const startDateStr = startDate?.iso.split('T')[0];
	const endDateStr = endDate?.iso.split('T')[0];

	const agencies: Record<string, { chart: LineChartProps['data'], sum: number }> = {};
	let totalSum = 0;

	const filteredData = agencyId && agencyId !== 'all' ? data.filter(d => d.properties?.agency_id === agencyId) : data;

	for (const item of filteredData) {
		const id = item.properties?.agency_id || 'unknown';
		let agencySum = 0;
		const chart: LineChartProps['data'] = [];

		Object.entries(item.data)
			.filter(([date]) => date >= startDateStr && date <= endDateStr)
			.forEach(([date, d]) => {
				const detailed = formatDayDetailed({ day_group: date, day_type: d.day_type, holiday: d.holiday, notes: d.notes }, t);
				const short = formatDayShort({ day_group: date }, t);

				chart.push({
					formatted_day_detailed: detailed,
					formatted_day_short: short,
					qty: d.qty,
				});

				agencySum += d.qty;
			});

		totalSum += agencySum;
		agencies[id] = { chart, sum: agencySum };
	}

	// Aggregate all agencies
	const allMap: Record<string, { formatted_day_detailed: string, formatted_day_short: string, qty: number }> = {};
	for (const agency of Object.values(agencies)) {
		for (const entry of agency.chart) {
			if (!allMap[entry.formatted_day_detailed]) {
				allMap[entry.formatted_day_detailed] = {
					formatted_day_detailed: entry.formatted_day_detailed,
					formatted_day_short: entry.formatted_day_short,
					qty: 0,
				};
			}
			allMap[entry.formatted_day_detailed].qty += entry.qty;
		}
	}

	const allChart: LineChartProps['data'] = Object.values(allMap)
		.sort((a, b) => new Date(a.formatted_day_detailed).getTime() - new Date(b.formatted_day_detailed).getTime());

	const lastUpdated
		= data
			.map(r => new Date(r.generated_at))
			.sort((a, b) => b.getTime() - a.getTime())[0] || null;

	return {
		agencies,
		all: { chart: allChart, sum: totalSum },
		lastUpdated,
	};
}
