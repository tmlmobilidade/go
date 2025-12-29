import { Dates } from '@tmlmobilidade/dates';
import { useTranslations } from 'next-intl';

import { formatDayDetailed, formatDayShort } from './formatDates';

/* * */

/**
 * Format month string from YYYY-MM to readable format
 * @param monthStr Format: "YYYY-MM" (e.g., "2024-10")
 * @returns Formatted month string (e.g., "Out 2024")
 */
function formatMonth(monthStr: string): string {
	const [year, month] = monthStr.split('-');
	const monthNumber = parseInt(month, 10) - 1; // Convert to 0-based index
	const date = new Date(parseInt(year), monthNumber, 1);

	// Use browser's locale or Portuguese as fallback
	const monthName = date.toLocaleDateString('pt-PT', { month: 'short' });
	return `${monthName} ${year}`;
}

/**
 * Format year string - for yearly data it's just the year
 * @param yearStr Format: "YYYY" (e.g., "2024")
 * @returns Formatted year string (same as input)
 */
function formatYear(yearStr: string): string {
	return yearStr;
}

/* * */

// Generic interfaces for any demand metric data
export interface DemandDataPoint {
	day_type?: '1' | '2' | '3'
	holiday?: '0' | '1'
	notes?: null | string
	period?: '1' | '2' | '3'
	// Optional products field for product-specific metrics
	products?: Record<string, number>
	qty: number
}

export interface RawMetricData {
	data: Record<string, DemandDataPoint>
	generated_at: string
	properties?: Record<string, string>
}

// Chart result interfaces - individual data point types
export interface DailyDataPoint {
	day_detailed: string
	day_short: string
	qty: number
}
export interface MonthlyDataPoint {
	month: string
	qty: number
}
export interface YearlyDataPoint {
	qty: number
	year: string
}

export interface TimeSeriesResult {
	chart: DailyDataPoint[] | MonthlyDataPoint[] | YearlyDataPoint[]
	sum: number
}

export interface StackedResult {
	chart: Record<string, number | string | undefined>[]
	series: string[]
	sum: number
}

export interface PieResult {
	chart: { color: string, name: string, value: number }[]
	sum: number
}

/* * */

/**
 * Unified transform function that replaces all individual transform functions
 * Can handle all demand metrics and transform them to different chart types
 */
export function transformDemandMetric(
	data: RawMetricData[],
	options: {
		chartType: 'pie' | 'stacked' | 'timeseries'
		endDate?: Dates
		propertyFilter?: { key: string, values?: string[] } // currently this is being done by the api layer
		startDate?: Dates
		t?: ReturnType<typeof useTranslations>
		timeView: 'annual' | 'daily' | 'monthly'
		topN?: number
	},
) {
	const {
		chartType,
		endDate,
		propertyFilter,
		startDate,
		t,
		timeView,
		topN = 4,
	} = options;

	if (!data?.length) {
		const emptyResult = { chart: [], sum: 0 };
		return chartType === 'stacked'
			? { all: { ...emptyResult, series: [] }, lastUpdated: null }
			: { all: emptyResult, lastUpdated: null };
	}

	// Filter data by properties and date range
	const filteredData = filterData(data, startDate, endDate, propertyFilter, timeView);

	// Get last updated timestamp
	const lastUpdated = filteredData
		.map(item => new Date(item.generated_at))
		.sort((a, b) => b.getTime() - a.getTime())[0] || null;

	// Route to specific transform based on chart type
	switch (chartType) {
		case 'pie':
			return { all: transformToPie(filteredData, topN), lastUpdated };
		case 'stacked':
			return { all: transformToStacked(filteredData, topN, timeView, t), lastUpdated };
		case 'timeseries':
			return { all: transformToTimeSeries(filteredData, timeView, t), lastUpdated };
		default:
			throw new Error(`Unsupported chart type: ${chartType}`);
	}
}

/* * */
// Helper functions

/**
 * Filter data by date range and property values
 */
function filterData(
	data: RawMetricData[],
	startDate?: Dates,
	endDate?: Dates,
	propertyFilter?: { key: string, values?: string[] },
	timeView?: 'annual' | 'daily' | 'monthly',
): RawMetricData[] {
	let filtered = data;

	// Filter by property values if specified
	if (propertyFilter?.values?.length) {
		filtered = filtered.filter(item =>
			item.properties?.[propertyFilter.key]
			&& propertyFilter.values?.includes(item.properties[propertyFilter.key] || ''),
		);
	}

	// If no date filtering needed, return early
	if (!startDate || !endDate || !timeView) return filtered;

	// Create date comparison strings based on timeView
	let startDateStr: string;
	let endDateStr: string;

	switch (timeView) {
		case 'annual':
			startDateStr = startDate.iso.slice(0, 4); // YYYY
			endDateStr = endDate.iso.slice(0, 4); // YYYY
			break;
		case 'monthly':
			startDateStr = `${startDate.iso.slice(0, 4)}-${startDate.iso.slice(5, 7)}`; // YYYY-MM
			endDateStr = `${endDate.iso.slice(0, 4)}-${endDate.iso.slice(5, 7)}`; // YYYY-MM
			break;
		case 'daily':
		default:
			startDateStr = startDate.iso.split('T')[0]; // YYYY-MM-DD
			endDateStr = endDate.iso.split('T')[0]; // YYYY-MM-DD
			break;
	}

	// Filter each item's data by date range
	return filtered.map(item => ({
		...item,
		data: Object.fromEntries(
			Object.entries(item.data).filter(([date]) => {
				return date >= startDateStr && date <= endDateStr;
			}),
		),
	})).filter(item => Object.keys(item.data).length > 0);
}

/**
 * Transform to simple time series (line/bar chart)
 */
function transformToTimeSeries(data: RawMetricData[], timeView: 'annual' | 'daily' | 'monthly', t?: ReturnType<typeof useTranslations>): TimeSeriesResult {
	const dateMap: Record<string, DailyDataPoint | MonthlyDataPoint | YearlyDataPoint> = {};
	let totalSum = 0;

	for (const item of data) {
		Object.entries(item.data).forEach(([date, dayData]) => {
			const qty = extractTotalQuantity(dayData);

			if (!dateMap[date]) {
				// Create different formats based on timeView
				switch (timeView) {
					case 'annual':
						dateMap[date] = {
							qty: 0,
							year: formatYear(date),
						} as YearlyDataPoint;
						break;
					case 'daily':
						dateMap[date] = {
							day_detailed: formatDayDetailed({
								day_group: date,
								day_type: dayData.day_type,
								holiday: dayData.holiday,
								notes: dayData.notes,
							}, t),
							day_short: formatDayShort({ day_group: date }, t),
							qty: 0,
						} as DailyDataPoint;
						break;
					case 'monthly':
						dateMap[date] = {
							month: formatMonth(date),
							qty: 0,
						} as MonthlyDataPoint;
						break;
				}
			}

			dateMap[date].qty += qty;
			totalSum += qty;
		});
	}

	const chartData = Object.entries(dateMap)
		.sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
		.map(([, data]) => data);

	return { chart: chartData as DailyDataPoint[] | MonthlyDataPoint[] | YearlyDataPoint[], sum: totalSum };
}

/**
 * Transform to stacked time series (product breakdown)
 */
function transformToStacked(data: RawMetricData[], topN: number, timeView: 'annual' | 'daily' | 'monthly', t?: ReturnType<typeof useTranslations>): StackedResult {
	// First pass: calculate product totals for ranking
	const productTotals = calculateProductTotals(data);
	const { otherProducts, topProducts } = getTopNWithOthers(productTotals, topN);

	// Second pass: aggregate by date with product grouping
	const dateMap: Record<string, {
		baseFields: Record<string, number | string | undefined>
		products: Record<string, number>
	}> = {};
	let totalSum = 0;

	for (const item of data) {
		Object.entries(item.data).forEach(([date, dayData]) => {
			if (!dateMap[date]) {
				// Create different base fields based on timeView
				let baseFields: Record<string, number | string | undefined>;
				switch (timeView) {
					case 'annual':
						baseFields = {
							year: formatYear(date),
						};
						break;
					case 'daily':
						baseFields = {
							day_detailed: formatDayDetailed({
								day_group: date,
								day_type: dayData.day_type,
								holiday: dayData.holiday,
								notes: dayData.notes,
							}, t),
							day_short: formatDayShort({ day_group: date }, t),
						};
						break;
					case 'monthly':
						baseFields = {
							month: formatMonth(date),
						};
						break;
				}

				dateMap[date] = { baseFields, products: {} };
			}

			const products = extractProducts(dayData, item);
			Object.entries(products).forEach(([productId, qty]) => {
				const groupedProductId = topProducts.includes(productId) ? productId : 'Outros';
				dateMap[date].products[groupedProductId] = (dateMap[date].products[groupedProductId] || 0) + qty;
				totalSum += qty;
			});
		});
	}

	// Create final series list
	const finalSeries = [...topProducts];
	if (otherProducts.length > 0) {
		finalSeries.push('Outros');
	}

	// Transform to chart format
	const chartData = Object.entries(dateMap)
		.sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
		.map(([, data]) => {
			const dayTotal = Object.values(data.products).reduce((sum, qty) => sum + qty, 0);

			return {
				...data.baseFields,
				total_qty: dayTotal,
				...Object.fromEntries(
					Object.entries(data.products).filter(([, qty]) => qty > 0),
				),
			};
		});

	return { chart: chartData, series: finalSeries, sum: totalSum };
}

/**
 * Transform to pie chart (product totals)
 */
function transformToPie(data: RawMetricData[], topN: number): PieResult {
	const productTotals = calculateProductTotals(data);
	const { otherProducts, topProducts } = getTopNWithOthers(productTotals, topN);

	// Generate colors
	const finalProducts = [...topProducts];
	if (otherProducts.length > 0) {
		finalProducts.push('Outros');
	}
	const colors = generateColors(finalProducts);

	// Calculate "Outros" total
	const otherTotal = otherProducts.reduce((sum, productId) => sum + productTotals[productId], 0);

	// Create pie chart data
	const chartData: { color: string, name: string, value: number }[] = [];
	let totalSum = 0;

	topProducts.forEach((productId) => {
		const value = productTotals[productId];
		if (value > 0) {
			chartData.push({
				color: colors[productId],
				name: productId,
				value,
			});
			totalSum += value;
		}
	});

	if (otherTotal > 0) {
		chartData.push({
			color: colors['Outros'],
			name: 'Outros',
			value: otherTotal,
		});
		totalSum += otherTotal;
	}

	return { chart: chartData, sum: totalSum };
}

/* * */
// Utility functions

/**
 * Extract total quantity from a data point (handles both simple qty and product sums)
 */
function extractTotalQuantity(dayData: DemandDataPoint): number {
	if (dayData.products) {
		return Object.values(dayData.products).reduce((sum, qty) => sum + qty, 0);
	}
	return dayData.qty || 0;
}

/**
 * Extract products from data point and item (handles different data structures)
 */
function extractProducts(dayData: DemandDataPoint, item: RawMetricData): Record<string, number> {
	if (dayData.products) {
		// DemandByAgencyByDayByProduct structure
		return dayData.products;
	}

	// DemandByProductByAgencyByDay structure - product_id is in properties
	const productId = item.properties?.product_id;
	if (productId) {
		return { [productId]: dayData.qty || 0 };
	}

	return {};
}

/**
 * Calculate product totals across all data
 */
function calculateProductTotals(data: RawMetricData[]): Record<string, number> {
	const totals: Record<string, number> = {};

	for (const item of data) {
		Object.values(item.data).forEach((dayData) => {
			const products = extractProducts(dayData, item);
			Object.entries(products).forEach(([productId, qty]) => {
				totals[productId] = (totals[productId] || 0) + qty;
			});
		});
	}

	return totals;
}

/**
 * Get top N items plus others
 */
function getTopNWithOthers(totals: Record<string, number>, topN: number) {
	const sorted = Object.entries(totals).sort(([, a], [, b]) => b - a);
	const topProducts = sorted.slice(0, topN).map(([key]) => key);
	const otherProducts = sorted.slice(topN).map(([key]) => key);
	return { otherProducts, topProducts };
}

/**
 * Generate colors for chart series
 */
function generateColors(items: string[]): Record<string, string> {
	const colors: Record<string, string> = {};
	const chartColors = [
		'var(--chart-color-1)',
		'var(--chart-color-2)',
		'var(--chart-color-3)',
		'var(--chart-color-4)',
		'var(--chart-color-5)',
	];

	items.forEach((item, index) => {
		colors[item] = chartColors[index % chartColors.length];
	});

	return colors;
}
