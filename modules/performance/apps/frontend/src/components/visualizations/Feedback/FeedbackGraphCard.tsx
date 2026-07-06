/* * */

'use client';

/* * */

import { ContainerWrapper } from '@/components/layout/ContainerWrapper';
import { buildFeedbackTimeline, type FeedbackTimelineRange, formatTimelineTick, TIMELINE_RANGE_CONTROL_OPTIONS } from '@/utils/feedback/feedback-timeline';
import { type PublicFeedback } from '@tmlmobilidade/types';
import { BarChart, MetricsSkeleton, SegmentedControl } from '@tmlmobilidade/ui';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import styles from './styles.module.css';

interface FeedbackGraphCardProps {
	isLoading?: boolean
	rows: PublicFeedback[]
}

/* * */

export function FeedbackGraphCard({ isLoading, rows }: FeedbackGraphCardProps) {
	//
	// A. Setup variables

	const t = useTranslations();
	const [selectedRange, setSelectedRange] = useState<FeedbackTimelineRange>('week');
	const timelineBars = useMemo(() => buildFeedbackTimeline(rows, selectedRange), [rows, selectedRange]);
	const timelineChartSeries = useMemo(() => [
		{
			color: 'var(--color-primary)',
			label: t('feedback.labels.feedbacks'),
			name: 'value',
		},
	], [t]);
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
				<p className={styles.cardTitle}>{t('feedback.timeline.title')}</p>

				<div className={styles.feedbackCardControl}>
					<h3 className={styles.feedbackCardControlLabel}>{t('feedback.labels.view')}</h3>
					<SegmentedControl data={TIMELINE_RANGE_CONTROL_OPTIONS} onChange={handleChangeRange} value={selectedRange} />
				</div>
			</div>

			<div className={`${styles.feedbackCardContent} ${styles.feedbackCardContentFill}`}>
				{timelineBars.length === 0 ? (
					<div className={styles.timelineChartSkeleton}>
						{isLoading ? <MetricsSkeleton /> : <p className={styles.emptyText}>Sem dados de feedback para mostrar.</p>}
					</div>
				) : (
					<div className={styles.timelineChart}>
						<BarChart
							data={timelineBars}
							dataKey="label"
							h={220}
							series={timelineChartSeries}
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
