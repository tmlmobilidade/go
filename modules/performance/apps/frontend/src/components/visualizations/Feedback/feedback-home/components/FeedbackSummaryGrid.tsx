/* * */

import type { FeedbackSummaryCardData } from '../../types';

import { ContainerWrapper } from '@/components/layout/ContainerWrapper';

import styles from '../../styles.module.css';

/* * */

interface FeedbackSummaryGridProps {
	cards: FeedbackSummaryCardData[]
}

/* * */

export function FeedbackSummaryGrid({ cards }: FeedbackSummaryGridProps) {
	return (
		<section className={styles.summaryGrid}>
			{cards.map(card => (
				<ContainerWrapper key={card.id} className={styles.feedbackCard} height={150} padding="0">
					<div className={styles.feedbackCardHeader}>
						<p className={styles.cardTitle}>{card.label}</p>
					</div>

					<div className={styles.feedbackCardContent}>
						<p className={styles.summaryValue}>{card.value ?? '-'}</p>
						{card.description && <p className={styles.summaryDescription}>{card.description}</p>}
					</div>
				</ContainerWrapper>
			))}
		</section>
	);
}
