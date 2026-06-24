/* * */

import type { FeedbackLineRowData } from '../../types';

import { ContainerWrapper } from '@/components/layout/ContainerWrapper';

import styles from '../../styles.module.css';

import { getFeedbackSatisfactionStatus } from '../../feedback-metrics';
import { FeedbackMetricTag } from '../../FeedbackMetricTag';

/* * */

interface TopFeedbackLinesProps {
	lines: FeedbackLineRowData[]
	nameColumnLabel?: string
	title?: string
}

/* * */

export function TopFeedbackLines({ lines, nameColumnLabel = 'Nome', title = 'Linhas com mais feedbacks' }: TopFeedbackLinesProps) {
	return (
		<ContainerWrapper>
			<p className={styles.cardTitle}>{title}</p>

			<div className={styles.feedbackList}>
				<div className={styles.feedbackListHeader}>
					<span>{nameColumnLabel}</span>
					<span className={styles.feedbackListHeaderMetric}>Feedbacks</span>
					<span className={styles.feedbackListHeaderMetric}>Satisfação</span>
				</div>

				{lines.map(line => (
					<div key={line.id} className={styles.feedbackRow}>
						<div className={styles.feedbackLineDetails}>
							<span className={styles.feedbackLineName}>{line.name ?? '-'}</span>
							{line.description && <p className={styles.feedbackLineDescription}>{line.description}</p>}
						</div>
						<div className={styles.feedbackTagCell}>
							<FeedbackMetricTag label={line.metric ?? '-'} />
						</div>
						<div className={styles.feedbackTagCell}>
							<FeedbackMetricTag label={line.satisfactionMetric ?? '-'} status={getFeedbackSatisfactionStatus(line.satisfactionIndex)} />
						</div>
					</div>
				))}
			</div>
		</ContainerWrapper>
	);
}
