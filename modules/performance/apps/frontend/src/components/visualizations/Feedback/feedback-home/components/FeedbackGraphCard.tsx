/* * */

import { ContainerWrapper } from '@/components/layout/ContainerWrapper';
import { BarChart, MetricsSkeleton, SegmentedControl } from '@tmlmobilidade/ui';
import { useMemo, useState } from 'react';

import styles from '../../styles.module.css';

import { getFeedbackCount } from '../utils/feedback-preview-records';

/* * */

type FeedbackTimelineInterval = 'day' | 'month' | 'year';
type FeedbackTimelineRange = 'month' | 'six_months' | 'week';

interface FeedbackTimelineBar {
	id: string
	label: string
	value: number
}

interface FeedbackGraphCardProps {
	rows?: Record<string, unknown>[]
}

interface DatedFeedbackRow {
	count: number
	date: Date
}

interface FeedbackTimelineRangeOption {
	id: FeedbackTimelineRange
	interval: FeedbackTimelineInterval
	label: string
}

/* * */

const DATE_FIELD_CANDIDATES = [
	'created_at',
	'createdAt',
	'timestamp',
	'date',
	'datetime',
	'submitted_at',
	'submittedAt',
	'received_at',
	'receivedAt',
];

const TIMELINE_RANGE_OPTIONS: FeedbackTimelineRangeOption[] = [
	{ id: 'week', interval: 'day', label: 'Semana' },
	{ id: 'month', interval: 'day', label: 'Mês' },
	{ id: 'six_months', interval: 'month', label: '6 meses' },
];

const TIMELINE_RANGE_CONTROL_OPTIONS = TIMELINE_RANGE_OPTIONS.map(option => ({
	label: option.label,
	value: option.id,
}));

const TIMELINE_CHART_SERIES = [
	{
		color: 'var(--color-primary)',
		label: 'Feedbacks',
		name: 'value',
	},
];

/* * */

function getCandidateValue(row: Record<string, unknown>, candidates: string[]) {
	const field = candidates.find(candidate => row[candidate] !== null && row[candidate] !== undefined && row[candidate] !== '');
	if (!field) return null;

	return row[field];
}

function parseFeedbackDate(value: unknown) {
	if (typeof value === 'number' && Number.isFinite(value)) {
		const timestamp = value < 10_000_000_000 ? value * 1000 : value;
		const date = new Date(timestamp);
		return Number.isNaN(date.getTime()) ? null : date;
	}

	if (typeof value !== 'string') return null;

	const numericValue = Number(value);
	if (value.trim() && Number.isFinite(numericValue)) return parseFeedbackDate(numericValue);

	const parsedTimestamp = Date.parse(value);
	if (Number.isNaN(parsedTimestamp)) return null;

	return new Date(parsedTimestamp);
}

function buildDatedFeedbackRows(rows: Record<string, unknown>[]) {
	return rows
		.map(row => ({
			count: getFeedbackCount(row),
			date: parseFeedbackDate(getCandidateValue(row, DATE_FIELD_CANDIDATES)),
		}))
		.filter((row): row is DatedFeedbackRow => Boolean(row.date))
		.sort((a, b) => a.date.getTime() - b.date.getTime());
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
	if (interval === 'year') return new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
	if (interval === 'month') return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
	return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function getNextTimelinePeriod(date: Date, interval: FeedbackTimelineInterval) {
	const nextDate = new Date(date);

	if (interval === 'year') {
		nextDate.setUTCFullYear(nextDate.getUTCFullYear() + 1);
		return nextDate;
	}

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

	if (interval === 'year') return `${year}`;
	if (interval === 'month') return `${year}-${month}`;
	return `${year}-${month}-${day}`;
}

function getTimelineLabel(key: string, interval: FeedbackTimelineInterval) {
	if (interval === 'year') return key;

	const [year, month, day] = key.split('-').map(Number);
	const date = new Date(Date.UTC(year, month - 1, day ?? 1));

	if (interval === 'month') {
		return new Intl.DateTimeFormat('pt-PT', { month: 'short', year: '2-digit' }).format(date);
	}

	return new Intl.DateTimeFormat('pt-PT', { day: '2-digit', month: '2-digit' }).format(date);
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

function getRangeOption(range: FeedbackTimelineRange) {
	return TIMELINE_RANGE_OPTIONS.find(option => option.id === range) ?? TIMELINE_RANGE_OPTIONS[0];
}

function buildFeedbackTimeline(rows: Record<string, unknown>[], range: FeedbackTimelineRange) {
	const datedRows = buildDatedFeedbackRows(rows);
	const endDate = datedRows.at(-1)?.date;
	if (!endDate) return [];

	const rangeOption = getRangeOption(range);
	const startDate = getRangeStartDate(endDate, range);
	const timelineKeys = getTimelineKeys(startDate, endDate, rangeOption.interval);
	const groupedRows = new Map<string, number>();

	for (const row of datedRows) {
		if (row.date.getTime() < startDate.getTime() || row.date.getTime() > endDate.getTime()) continue;

		const key = getTimelineKey(row.date, rangeOption.interval);
		groupedRows.set(key, (groupedRows.get(key) ?? 0) + row.count);
	}

	return timelineKeys.map((key): FeedbackTimelineBar => ({
		id: key,
		label: getTimelineLabel(key, rangeOption.interval),
		value: groupedRows.get(key) ?? 0,
	}));
}

function formatTimelineTick(value: string, timelineBars: FeedbackTimelineBar[]) {
	const visibleLabelInterval = Math.max(Math.ceil(timelineBars.length / 12), 1);
	const index = timelineBars.findIndex(bar => bar.label === value);

	if (index === -1) return value;
	if (index % visibleLabelInterval === 0 || index === timelineBars.length - 1) return value;
	return '';
}

/* * */

export function FeedbackGraphCard({ rows = [] }: FeedbackGraphCardProps) {
	const [selectedRange, setSelectedRange] = useState<FeedbackTimelineRange>('week');
	const timelineBars = useMemo(() => buildFeedbackTimeline(rows, selectedRange), [rows, selectedRange]);
	const xAxisFormatter = useMemo(() => {
		return (value: string) => formatTimelineTick(value, timelineBars);
	}, [timelineBars]);
	const handleChangeRange = (value: FeedbackTimelineRange) => {
		setSelectedRange(value);
	};

	return (
		<ContainerWrapper className={styles.feedbackCard} height={360} padding="0">
			<div className={`${styles.feedbackCardHeader} ${styles.feedbackCardHeaderWithControls}`}>
				<p className={styles.cardTitle}>Feedback ao longo do tempo</p>

				<div className={styles.timelineFilter}>
					<h3>Vista</h3>
					<SegmentedControl data={TIMELINE_RANGE_CONTROL_OPTIONS} onChange={handleChangeRange} value={selectedRange} />
				</div>
			</div>

			<div className={`${styles.feedbackCardContent} ${styles.feedbackCardContentFill}`}>
				{timelineBars.length === 0 ? (
					<div style={{ height: 220 }}>
						<MetricsSkeleton />
					</div>
				) : (
					<div className={styles.timelineChart}>
						<BarChart
							data={timelineBars}
							dataKey="label"
							h={220}
							series={TIMELINE_CHART_SERIES}
							valueFormatter={value => value.toLocaleString('pt-PT')}
							valueLabelProps={{ fill: 'white', position: 'inside' }}
							withXAxis={true}
							withYAxis={true}
							xAxisProps={{ tickFormatter: xAxisFormatter }}
							withBarValueLabel
						/>
					</div>
				)}
			</div>
		</ContainerWrapper>
	);
}
