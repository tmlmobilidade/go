/* * */

import type { FeedbackLineRowData } from './types';

import { ContainerWrapper } from '@/components/layout/ContainerWrapper';
import { Skeleton } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

/* * */

interface TopFeedbackLinesProps {
	isLoading: boolean
	lines: FeedbackLineRowData[]
}

/* * */

export function TopFeedbackLines({ isLoading, lines }: TopFeedbackLinesProps) {
	return (
		<ContainerWrapper>
			<p className={styles.cardTitle}>Linhas com mais feedbacks</p>

			<div className={styles.feedbackList}>
				{lines.map(line => (
					<div key={line.id} className={styles.feedbackRow}>
						{isLoading ? (
							<>
								<Skeleton height={14} width={line.skeletonNameWidth ?? '26%'} />
								<Skeleton height={12} width={line.skeletonDescriptionWidth ?? '88%'} />
								<Skeleton height={12} width={line.skeletonMetricWidth ?? '64%'} />
							</>
						) : (
							<>
								<div className={styles.feedbackRowHeader}>
									<span className={styles.feedbackLineName}>{line.name ?? '-'}</span>
									{line.metric && <span className={styles.feedbackLineMetric}>{line.metric}</span>}
								</div>
								{line.description && <p className={styles.feedbackLineDescription}>{line.description}</p>}
							</>
						)}
					</div>
				))}
			</div>
		</ContainerWrapper>
	);
}
