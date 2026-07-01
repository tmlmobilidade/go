/* * */

import type { FeedbackEntitySummary } from '@/utils/feedback/feedback-entities';

import { ContainerWrapper } from '@/components/layout/ContainerWrapper';
import { FeedbackEntityDetailModal, FeedbackMetricTag } from '@/components/visualizations/Feedback';
import { formatSatisfactionIndex, getFeedbackSatisfactionStatus } from '@/utils/feedback/feedback-metrics';
import { useState } from 'react';

import styles from '../styles.module.css';

/* * */

interface TopFeedbackEntitiesProps {
	items: FeedbackEntitySummary[]
	nameColumnLabel: string
	title: string
}

/* * */

export function TopFeedbackEntities({ items, nameColumnLabel, title }: TopFeedbackEntitiesProps) {
	//
	// A. Setup variables

	const [selectedItem, setSelectedItem] = useState<FeedbackEntitySummary>();

	//
	// B. Render components

	return (
		<>
			<ContainerWrapper className={styles.feedbackCard} padding="0">
				<div className={styles.feedbackCardHeader}>
					<p className={styles.cardTitle}>{title}</p>
				</div>

				<div className={styles.feedbackCardContent}>
					<div className={styles.feedbackList}>
						<div className={styles.feedbackListHeader}>
							<span className={styles.feedbackListHeaderTag}>{nameColumnLabel}</span>
							<span className={`${styles.feedbackListHeaderTag} ${styles.feedbackListHeaderMetric}`}>Feedbacks</span>
							<span className={`${styles.feedbackListHeaderTag} ${styles.feedbackListHeaderMetric}`}>Satisfação</span>
						</div>

						{items.map(item => (
							<button key={item.id} className={`${styles.feedbackRow} ${styles.feedbackRowButton}`} onClick={() => setSelectedItem(item)} type="button">
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
							</button>
						))}
					</div>
				</div>
			</ContainerWrapper>

			<FeedbackEntityDetailModal item={selectedItem} onClose={() => setSelectedItem(undefined)} />
		</>
	);
}
