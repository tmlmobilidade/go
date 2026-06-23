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
				<ContainerWrapper key={card.id} height={150}>
					<p className={styles.cardTitle}>{card.label}</p>

					<p className={styles.summaryValue}>{card.value ?? '-'}</p>
					{card.description && <p className={styles.summaryDescription}>{card.description}</p>}
				</ContainerWrapper>
			))}
		</section>
	);
}
