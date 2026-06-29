/* * */

import { type PublicFeedback } from '@tmlmobilidade/types';

/* * */

export type FeedbackTimelineRange = 'month' | 'six_months' | 'week';

type FeedbackTimelineInterval = 'day' | 'month';

interface FeedbackTimelineBar {
	id: string
	label: string
	value: number
}

/* * */

const TIMELINE_RANGE_OPTIONS: Record<FeedbackTimelineRange, { interval: FeedbackTimelineInterval, label: string }> = {
	month: { interval: 'day', label: 'Mês' },
	six_months: { interval: 'month', label: '6 meses' },
	week: { interval: 'day', label: 'Semana' },
};

const TIMELINE_RANGE_ORDER: FeedbackTimelineRange[] = ['week', 'month', 'six_months'];

const TIMELINE_LABEL_FORMATTERS: Record<FeedbackTimelineInterval, Intl.DateTimeFormat> = {
	day: new Intl.DateTimeFormat('pt-PT', { day: '2-digit', month: '2-digit' }),
	month: new Intl.DateTimeFormat('pt-PT', { month: 'short', year: '2-digit' }),
};

export const TIMELINE_RANGE_CONTROL_OPTIONS = TIMELINE_RANGE_ORDER.map(range => ({
	label: TIMELINE_RANGE_OPTIONS[range].label,
	value: range,
}));

/* * */

function getLatestFeedbackDate(rows: PublicFeedback[]) {
	let latestCreatedAt: number | undefined;

	// Anchor the chart to the newest payload, not to today's date, so historical datasets still render a full range.
	for (const row of rows) {
		if (latestCreatedAt === undefined || row.created_at > latestCreatedAt) latestCreatedAt = row.created_at;
	}

	if (latestCreatedAt === undefined) return;
	return new Date(latestCreatedAt);
}

function getRangeStartDate(endDate: Date, range: FeedbackTimelineRange) {
	const startDate = new Date(Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate()));

	if (range === 'week') {
		startDate.setUTCDate(startDate.getUTCDate() - 6);
		return startDate;
	}

	if (range === 'month') {
		startDate.setUTCDate(startDate.getUTCDate() - 29);
		return startDate;
	}

	startDate.setUTCMonth(startDate.getUTCMonth() - 5, 1);
	return startDate;
}

function getTimelinePeriodStart(date: Date, interval: FeedbackTimelineInterval) {
	if (interval === 'month') return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
	return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function getNextTimelinePeriod(date: Date, interval: FeedbackTimelineInterval) {
	const nextDate = new Date(date);

	if (interval === 'month') {
		nextDate.setUTCMonth(nextDate.getUTCMonth() + 1);
		return nextDate;
	}

	nextDate.setUTCDate(nextDate.getUTCDate() + 1);
	return nextDate;
}

function getTimelineKey(date: Date, interval: FeedbackTimelineInterval) {
	const year = date.getUTCFullYear();
	const month = `${date.getUTCMonth() + 1}`.padStart(2, '0');
	const day = `${date.getUTCDate()}`.padStart(2, '0');

	if (interval === 'month') return `${year}-${month}`;
	return `${year}-${month}-${day}`;
}

function getTimelineLabel(key: string, interval: FeedbackTimelineInterval) {
	const [year, month, day] = key.split('-').map(Number);
	const date = new Date(Date.UTC(year, month - 1, day ?? 1));

	return TIMELINE_LABEL_FORMATTERS[interval].format(date);
}

function getTimelineKeys(startDate: Date, endDate: Date, interval: FeedbackTimelineInterval) {
	const keys: string[] = [];
	let currentDate = getTimelinePeriodStart(startDate, interval);

	while (currentDate.getTime() <= endDate.getTime()) {
		keys.push(getTimelineKey(currentDate, interval));
		currentDate = getNextTimelinePeriod(currentDate, interval);
	}

	return keys;
}

/* * */

export function buildFeedbackTimeline(rows: PublicFeedback[], range: FeedbackTimelineRange) {
	const endDate = getLatestFeedbackDate(rows);
	if (!endDate) return [];

	const rangeOption = TIMELINE_RANGE_OPTIONS[range];
	const startDate = getRangeStartDate(endDate, range);
	const groupedRows = new Map<string, number>();

	for (const row of rows) {
		const date = new Date(row.created_at);
		if (date.getTime() < startDate.getTime()) continue;

		const key = getTimelineKey(date, rangeOption.interval);
		groupedRows.set(key, (groupedRows.get(key) ?? 0) + 1);
	}

	// Keep empty days/months visible as zero-value bars.
	return getTimelineKeys(startDate, endDate, rangeOption.interval).map((key): FeedbackTimelineBar => ({
		id: key,
		label: getTimelineLabel(key, rangeOption.interval),
		value: groupedRows.get(key) ?? 0,
	}));
}

export function formatTimelineTick(value: string, timelineBars: FeedbackTimelineBar[]) {
	const visibleLabelInterval = Math.max(Math.ceil(timelineBars.length / 12), 1);
	const index = timelineBars.findIndex(bar => bar.label === value);

	if (index === -1) return value;
	if (index % visibleLabelInterval === 0 || index === timelineBars.length - 1) return value;
	return '';
}
