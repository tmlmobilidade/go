/* * */

import type { FeedbackEntityType } from '../metrics/feedback-metrics';
import type { StackedResult } from '@/utils/metrics';

import { PUBLIC_FEEDBACK_NO_REASON_ID, type PublicFeedback, type PublicFeedbackReasonCategory } from '@tmlmobilidade/types';

import feedbackTranslations from '../../../../../../hub/apps/frontend-navegante-app/src/i18n/namespaces/default/pt.json';

/* * */

export interface FeedbackReasonChartSlice {
	color: string
	id: string
	name: string
	value: number
}

export interface FeedbackReasonTrendChartData {
	chart: StackedResult['chart']
	series: StackedResult['series']
	sum: StackedResult['sum']
}

interface FeedbackReasonEntry {
	id: string
	name: string
	value: number
}

/* * */

const TOP_REASON_LIMIT = 6;
const PERCENTAGE_DISPLAY_SCALE = 10;

export const FEEDBACK_TOTAL_PERCENTAGE = 100;

const FEEDBACK_REASON_CHART_COLORS = [
	'var(--chart-color-1)',
	'var(--chart-color-2)',
	'var(--chart-color-3)',
	'var(--chart-color-4)',
	'var(--chart-color-5)',
	'var(--color-system-text-300)',
];

const FEEDBACK_REASON_LABELS = feedbackTranslations.feedback.reasons as Record<string, string>;
const FEEDBACK_REASON_CATEGORY_LABELS = feedbackTranslations.feedback.reason_categories as Record<string, string>;

const FEEDBACK_REASON_DAY_DETAILED_FORMATTER = new Intl.DateTimeFormat('pt-PT', {
	day: '2-digit',
	month: 'long',
	timeZone: 'UTC',
	weekday: 'long',
	year: 'numeric',
});

const FEEDBACK_REASON_DAY_SHORT_FORMATTER = new Intl.DateTimeFormat('pt-PT', {
	day: '2-digit',
	month: '2-digit',
	timeZone: 'UTC',
	weekday: 'short',
});

/* * */

function clampPercentage(value: number) {
	return Math.min(Math.max(value, 0), FEEDBACK_TOTAL_PERCENTAGE);
}

export function getFeedbackReasonLabel(reason: string) {
	return FEEDBACK_REASON_LABELS[reason] ?? reason;
}

export function getFeedbackReasonCategoryLabel(category: 'unknown' | PublicFeedbackReasonCategory) {
	return FEEDBACK_REASON_CATEGORY_LABELS[category] ?? category;
}

export function getFeedbackReasonsForRow(row: PublicFeedback) {
	if (row.reasons.length === 0) return [PUBLIC_FEEDBACK_NO_REASON_ID];
	return Array.from(new Set(row.reasons));
}

export function roundFeedbackPercentages(values: number[]) {
	if (values.length === 0) return [];

	const targetTotal = FEEDBACK_TOTAL_PERCENTAGE * PERCENTAGE_DISPLAY_SCALE;
	const scaledValues = values.map(value => clampPercentage(value) * PERCENTAGE_DISPLAY_SCALE);
	const roundedValues = scaledValues.map(Math.floor);
	const remainingValue = targetTotal - roundedValues.reduce((total, value) => total + value, 0);

	const indexesByRemainder = scaledValues
		.map((value, index) => ({ index, remainder: value - Math.floor(value) }))
		.sort((valueA, valueB) => valueB.remainder - valueA.remainder);

	for (let index = 0; index < remainingValue; index++) {
		const targetIndex = indexesByRemainder[index % indexesByRemainder.length]?.index;
		if (targetIndex === undefined) break;
		roundedValues[targetIndex] += 1;
	}

	return roundedValues.map(value => value / PERCENTAGE_DISPLAY_SCALE);
}

function buildChartSlices(reasonEntries: FeedbackReasonEntry[]): FeedbackReasonChartSlice[] {
	return reasonEntries.map((reason, index) => ({
		...reason,
		color: FEEDBACK_REASON_CHART_COLORS[index % FEEDBACK_REASON_CHART_COLORS.length],
	}));
}

function getFeedbackDayKey(timestamp: number) {
	const date = new Date(timestamp);
	const year = date.getUTCFullYear();
	const month = `${date.getUTCMonth() + 1}`.padStart(2, '0');
	const day = `${date.getUTCDate()}`.padStart(2, '0');

	return `${year}-${month}-${day}`;
}

function getDateFromDayKey(key: string) {
	const [year, month, day] = key.split('-').map(Number);
	return new Date(Date.UTC(year, month - 1, day));
}

function getFormattedDayDetailed(key: string) {
	const label = FEEDBACK_REASON_DAY_DETAILED_FORMATTER.format(getDateFromDayKey(key));
	return label.charAt(0).toUpperCase() + label.slice(1);
}

function getFormattedDayShort(key: string) {
	const label = FEEDBACK_REASON_DAY_SHORT_FORMATTER.format(getDateFromDayKey(key));
	return label.charAt(0).toUpperCase() + label.slice(1);
}

function getSortedFeedbackReasonEntries(rows: PublicFeedback[], entityType: FeedbackEntityType): FeedbackReasonEntry[] {
	const reasonCounts = new Map<string, number>();

	for (const row of rows) {
		if (row.entity_type !== entityType) continue;

		for (const reason of getFeedbackReasonsForRow(row)) {
			reasonCounts.set(reason, (reasonCounts.get(reason) ?? 0) + 1);
		}
	}

	return Array.from(reasonCounts.entries())
		.map(([id, value]) => ({
			id,
			name: getFeedbackReasonLabel(id),
			value,
		}))
		.sort((reasonA, reasonB) => reasonB.value - reasonA.value || reasonA.name.localeCompare(reasonB.name, 'pt-PT'));
}

function getVisibleFeedbackReasonEntries(reasonEntries: FeedbackReasonEntry[]) {
	return reasonEntries.slice(0, TOP_REASON_LIMIT);
}

function buildTrendPoint(dayKey: string, series: string[]) {
	return {
		day_detailed: getFormattedDayDetailed(dayKey),
		day_short: getFormattedDayShort(dayKey),
		total_qty: 0,
		...Object.fromEntries(series.map(seriesName => [seriesName, 0])),
	};
}

/* * */

export function getTopFeedbackReasonsByEntity(rows: PublicFeedback[], entityType: FeedbackEntityType): FeedbackReasonChartSlice[] {
	return buildChartSlices(getVisibleFeedbackReasonEntries(getSortedFeedbackReasonEntries(rows, entityType)));
}

export function getTopFeedbackReasonsTrendByEntity(rows: PublicFeedback[], entityType: FeedbackEntityType): FeedbackReasonTrendChartData {
	const reasonEntries = getSortedFeedbackReasonEntries(rows, entityType);
	const visibleReasonEntries = getVisibleFeedbackReasonEntries(reasonEntries);
	const topReasonNamesById = new Map(visibleReasonEntries.map(reason => [reason.id, reason.name]));
	const series = visibleReasonEntries.map(reason => reason.name);
	const chartByDay = new Map<string, Record<string, number | string | undefined>>();
	let sum = 0;

	for (const row of rows) {
		if (row.entity_type !== entityType) continue;

		const dayKey = getFeedbackDayKey(row.created_at);
		const trendPoint = chartByDay.get(dayKey) ?? buildTrendPoint(dayKey, series);

		for (const reason of getFeedbackReasonsForRow(row)) {
			const seriesName = topReasonNamesById.get(reason);
			if (!seriesName) continue;

			const currentValue = Number(trendPoint[seriesName] ?? 0);
			const currentTotal = Number(trendPoint.total_qty ?? 0);

			trendPoint[seriesName] = currentValue + 1;
			trendPoint.total_qty = currentTotal + 1;
			sum += 1;
		}

		chartByDay.set(dayKey, trendPoint);
	}

	const chart = Array.from(chartByDay.entries())
		.sort(([dayA], [dayB]) => dayA.localeCompare(dayB))
		.map(([, point]) => point);

	return {
		chart,
		series,
		sum,
	};
}
