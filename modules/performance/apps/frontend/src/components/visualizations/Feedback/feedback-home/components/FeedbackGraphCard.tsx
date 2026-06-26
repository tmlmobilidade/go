/* * */

import { ContainerWrapper } from '@/components/layout/ContainerWrapper';
import { type PublicFeedback } from '@tmlmobilidade/types';
import { BarChart, MetricsSkeleton, SegmentedControl } from '@tmlmobilidade/ui';
import { useMemo, useState } from 'react';

import styles from '../../styles.module.css';

/* * */

type FeedbackTimelineInterval = 'day' | 'month';
type FeedbackTimelineRange = 'month' | 'six_months' | 'week';

interface FeedbackTimelineBar {
	id: string
	label: string
	value: number
}

interface FeedbackGraphCardProps {
	rows: PublicFeedback[]
}

/* * */

const TIMELINE_RANGE_OPTIONS: Record<FeedbackTimelineRange, { interval: FeedbackTimelineInterval, label: string }> = {
	month: { interval: 'day', label: 'Mês' },
	six_months: { interval: 'month', label: '6 meses' },
	week: { interval: 'day', label: 'Semana' },
};

const TIMELINE_RANGE_CONTROL_OPTIONS = ['week', 'month', 'six_months'].map((range: FeedbackTimelineRange) => ({
	label: TIMELINE_RANGE_OPTIONS[range].label,
	value: range,
}));

const TIMELINE_CHART_SERIES = [
	{
		color: 'var(--color-primary)',
		label: 'Feedbacks',
		name: 'value',
	},
];

/* * */

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

function buildFeedbackTimeline(rows: PublicFeedback[], range: FeedbackTimelineRange) {
	const sortedRows = [...rows].sort((rowA, rowB) => rowA.created_at - rowB.created_at);
	const endDate = sortedRows.at(-1)?.created_at;
	if (!endDate) return [];

	const rangeOption = TIMELINE_RANGE_OPTIONS[range];
	const endTimelineDate = new Date(endDate);
	const startDate = getRangeStartDate(endTimelineDate, range);
	const timelineKeys = getTimelineKeys(startDate, endTimelineDate, rangeOption.interval);
	const groupedRows = new Map<string, number>();

	for (const row of sortedRows) {
		const date = new Date(row.created_at);
		if (date.getTime() < startDate.getTime() || date.getTime() > endTimelineDate.getTime()) continue;

		const key = getTimelineKey(date, rangeOption.interval);
		groupedRows.set(key, (groupedRows.get(key) ?? 0) + 1);
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

export function FeedbackGraphCard({ rows }: FeedbackGraphCardProps) {
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
