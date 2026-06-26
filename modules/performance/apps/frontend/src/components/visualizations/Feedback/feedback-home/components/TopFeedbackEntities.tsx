/* * */

import type { FeedbackEntitySummary } from '../utils/feedback-preview';

import { ContainerWrapper } from '@/components/layout/ContainerWrapper';

import styles from '../../styles.module.css';

import { formatSatisfactionIndex, getFeedbackSatisfactionStatus } from '../../feedback-metrics';
import { FeedbackMetricTag } from '../../FeedbackMetricTag';

/* * */

interface TopFeedbackEntitiesProps {
	items: FeedbackEntitySummary[]
	nameColumnLabel: string
	title: string
}

/* * */

export function TopFeedbackEntities({ items, nameColumnLabel, title }: TopFeedbackEntitiesProps) {
	//
	// A. Render components

	return (
		<ContainerWrapper className={styles.feedbackCard} padding="0">
			<div className={styles.feedbackCardHeader}>
				<p className={styles.cardTitle}>{title}</p>
			</div>

			<div className={styles.feedbackCardContent}>
				<div className={styles.feedbackList}>
					<div className={styles.feedbackListHeader}>
						<span>{nameColumnLabel}</span>
						<span className={styles.feedbackListHeaderMetric}>Feedbacks</span>
						<span className={styles.feedbackListHeaderMetric}>Satisfação</span>
					</div>

					{items.map(item => (
						<div key={item.id} className={styles.feedbackRow}>
							<div className={styles.feedbackLineDetails}>
								<span className={styles.feedbackLineName}>{item.label}</span>
								{item.description && <p className={styles.feedbackLineDescription}>{item.description}</p>}
							</div>
							<div className={styles.feedbackTagCell}>
								<FeedbackMetricTag label={item.count.toLocaleString('pt-PT')} />
							</div>
							<div className={styles.feedbackTagCell}>
								<FeedbackMetricTag label={formatSatisfactionIndex(item.satisfactionIndex)} status={getFeedbackSatisfactionStatus(item.satisfactionIndex)} />
							</div>
						</div>
					))}
				</div>
			</div>
		</ContainerWrapper>
	);
}
