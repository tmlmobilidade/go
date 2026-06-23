/* * */

import type { FeedbackLineRowData } from '../types';

import { ContainerWrapper } from '@/components/layout/ContainerWrapper';

import styles from '../styles.module.css';

/* * */

interface TopFeedbackLinesProps {
	lines: FeedbackLineRowData[]
	title?: string
}

/* * */

export function TopFeedbackLines({ lines, title = 'Linhas com mais feedbacks' }: TopFeedbackLinesProps) {
	return (
		<ContainerWrapper>
			<p className={styles.cardTitle}>{title}</p>

			<div className={styles.feedbackList}>
				{lines.map(line => (
					<div key={line.id} className={styles.feedbackRow}>
						<div className={styles.feedbackRowHeader}>
							<span className={styles.feedbackLineName}>{line.name ?? '-'}</span>
							{line.metric && <span className={styles.feedbackLineMetric}>{line.metric}</span>}
						</div>
						{line.description && <p className={styles.feedbackLineDescription}>{line.description}</p>}
					</div>
				))}
			</div>
		</ContainerWrapper>
	);
}
