/* * */

import type { FeedbackReasonChartSlice } from '@/utils/feedback/feedback-reasons';

import { ContainerWrapper } from '@/components/layout/ContainerWrapper';
import { PieChart } from '@tmlmobilidade/ui';

import styles from '../styles.module.css';

/* * */

interface TopFeedbackReasonsChartProps {
	data: FeedbackReasonChartSlice[]
	title: string
}

/* * */

export function TopFeedbackReasonsChart({ data, title }: TopFeedbackReasonsChartProps) {
	if (data.length === 0) return null;

	return (
		<ContainerWrapper className={styles.feedbackCard} padding="0">
			<div className={styles.feedbackCardHeader}>
				<p className={styles.cardTitle}>{title}</p>
			</div>

			<div className={`${styles.feedbackCardContent} ${styles.feedbackReasonCardContent}`}>
				<div className={styles.feedbackReasonChart}>
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
		</ContainerWrapper>
	);
}
