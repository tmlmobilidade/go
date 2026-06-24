/* * */

import type { FeedbackCategoryRowData } from '../../types';

import { ContainerWrapper } from '@/components/layout/ContainerWrapper';

import styles from '../../styles.module.css';

/* * */

interface FeedbackCategoryListProps {
	categories: FeedbackCategoryRowData[]
}

/* * */

export function FeedbackCategoryList({ categories }: FeedbackCategoryListProps) {
	return (
		<ContainerWrapper className={styles.feedbackCard} height={320} padding="0">
			<div className={styles.feedbackCardHeader}>
				<p className={styles.cardTitle}>Categorias</p>
			</div>

			<div className={styles.feedbackCardContent}>
				<div className={styles.categoryList}>
					{categories.map(category => (
						<div key={category.id} className={styles.listRow}>
							<span>{category.label}</span>

							<div className={styles.categoryMetric}>
								<span className={styles.categoryValue}>{category.value ?? '-'}</span>
								{typeof category.percentage === 'number' && (
									<div className={styles.categoryBarTrack}>
										<div className={styles.categoryBar} style={{ width: `${Math.min(Math.max(category.percentage, 0), 100)}%` }} />
									</div>
								)}
							</div>
						</div>
					))}
				</div>
			</div>
		</ContainerWrapper>
	);
}
