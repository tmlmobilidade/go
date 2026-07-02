/* * */

import type { FeedbackReasonChartSlice, FeedbackReasonTrendChartData } from '@/utils/feedback/feedback-reasons';

import { ContainerWrapper } from '@/components/layout/ContainerWrapper';
import { generateColors } from '@/utils/metrics';
import { getShortLabelFromDetailed } from '@/utils/metrics/formatDates';
import { LineChart, PieChart } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

import styles from '../styles.module.css';

/* * */

interface TopFeedbackReasonsChartProps {
	data: FeedbackReasonChartSlice[]
	title: string
	trendData: FeedbackReasonTrendChartData
}

/* * */

export function TopFeedbackReasonsChart({ data, title, trendData }: TopFeedbackReasonsChartProps) {
	const trendSeries = useMemo(() => {
		const colors = generateColors(trendData.series);

		return trendData.series.map(reason => ({
			color: colors[reason],
			label: reason,
			name: reason,
		}));
	}, [trendData.series]);

	if (data.length === 0) return null;

	return (
		<ContainerWrapper className={styles.feedbackCard} padding="0">
			<div className={styles.feedbackCardHeader}>
				<p className={styles.cardTitle}>{title}</p>
			</div>

			<div className={styles.feedbackCardContent}>
				<div className={styles.feedbackReasonVisualizationContainer}>
					<div className={styles.feedbackReasonTrendChart}>
						<LineChart
							curveType="monotone"
							data={trendData.chart}
							dataKey="day_detailed"
							h={220}
							legendProps={{ verticalAlign: 'bottom' }}
							series={trendSeries}
							strokeWidth={5}
							valueFormatter={value => value.toLocaleString('pt-PT')}
							withDots={false}
							withLegend={true}
							withXAxis={true}
							withYAxis={true}
							xAxisProps={{ tickFormatter: getShortLabelFromDetailed }}
						/>
					</div>

					<div className={styles.feedbackReasonPieChart}>
						<PieChart
							data={data}
							labelsPosition="outside"
							labelsType="percent"
							size={200}
							tooltipDataSource="segment"
							valueFormatter={value => value.toLocaleString('pt-PT')}
							withLabels
							withLabelsLine
							withTooltip
						/>
					</div>
				</div>
			</div>
		</ContainerWrapper>
	);
}
