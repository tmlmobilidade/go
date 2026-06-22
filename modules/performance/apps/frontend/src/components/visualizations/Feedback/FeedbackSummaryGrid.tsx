/* * */

import type { FeedbackSummaryCardData } from './types';

import { ContainerWrapper } from '@/components/layout/ContainerWrapper';
import { Skeleton } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

/* * */

interface FeedbackSummaryGridProps {
	cards: FeedbackSummaryCardData[]
	isLoading: boolean
}

/* * */

export function FeedbackSummaryGrid({ cards, isLoading }: FeedbackSummaryGridProps) {
	return (
		<section className={styles.summaryGrid}>
			{cards.map(card => (
				<ContainerWrapper key={card.id} height={150}>
					<p className={styles.cardTitle}>{card.label}</p>

					{isLoading ? (
						<>
							<Skeleton height={36} width={card.skeletonWidth ?? '50%'} />
							<Skeleton height={12} width="72%" />
						</>
					) : (
						<>
							<p className={styles.summaryValue}>{card.value ?? '-'}</p>
							{card.description && <p className={styles.summaryDescription}>{card.description}</p>}
						</>
					)}
				</ContainerWrapper>
			))}
		</section>
	);
}
