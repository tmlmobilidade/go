/* * */

import { ContainerWrapper } from '@/components/layout/ContainerWrapper';
import { buildFeedbackTimeline, type FeedbackTimelineRange, formatTimelineTick, TIMELINE_RANGE_CONTROL_OPTIONS } from '@/utils/feedback/feedback-timeline';
import { type PublicFeedback } from '@tmlmobilidade/types';
import { BarChart, MetricsSkeleton, SegmentedControl } from '@tmlmobilidade/ui';
import { useMemo, useState } from 'react';

import styles from './styles.module.css';

interface FeedbackGraphCardProps {
	rows: PublicFeedback[]
}

/* * */

const TIMELINE_CHART_SERIES = [
	{
		color: 'var(--color-primary)',
		label: 'Feedbacks',
		name: 'value',
	},
];

/* * */

export function FeedbackGraphCard({ rows }: FeedbackGraphCardProps) {
	//
	// A. Setup variables

	const [selectedRange, setSelectedRange] = useState<FeedbackTimelineRange>('week');
	const timelineBars = useMemo(() => buildFeedbackTimeline(rows, selectedRange), [rows, selectedRange]);
	const xAxisFormatter = useMemo(() => {
		return (value: string) => formatTimelineTick(value, timelineBars);
	}, [timelineBars]);

	//
	// B. Handle actions

	const handleChangeRange = (value: FeedbackTimelineRange) => {
		setSelectedRange(value);
	};

	//
	// C. Render components

	return (
		<ContainerWrapper className={styles.feedbackCard} height={360} padding="0">
			<div className={`${styles.feedbackCardHeader} ${styles.feedbackCardHeaderWithControls}`}>
				<p className={styles.cardTitle}>Feedback ao longo do tempo</p>

				<div className={styles.feedbackCardControl}>
					<h3 className={styles.feedbackCardControlLabel}>Vista</h3>
					<SegmentedControl data={TIMELINE_RANGE_CONTROL_OPTIONS} onChange={handleChangeRange} value={selectedRange} />
				</div>
			</div>

			<div className={`${styles.feedbackCardContent} ${styles.feedbackCardContentFill}`}>
				{timelineBars.length === 0 ? (
					<div className={styles.timelineChartSkeleton}>
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
