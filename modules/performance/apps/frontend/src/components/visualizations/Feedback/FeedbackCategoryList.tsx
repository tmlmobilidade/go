/* * */

import type { FeedbackCategoryRowData } from './types';

import { ContainerWrapper } from '@/components/layout/ContainerWrapper';
import { Skeleton } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

/* * */

interface FeedbackCategoryListProps {
	categories: FeedbackCategoryRowData[]
	isLoading: boolean
}

/* * */

export function FeedbackCategoryList({ categories, isLoading }: FeedbackCategoryListProps) {
	return (
		<ContainerWrapper height={320}>
			<p className={styles.cardTitle}>Categorias</p>

			<div className={styles.listPlaceholder}>
				{categories.map(category => (
					<div key={category.id} className={styles.listRow}>
						<span>{category.label}</span>

						{isLoading ? (
							<Skeleton height={10} width={category.skeletonWidth ?? '54%'} />
						) : (
							<div className={styles.categoryMetric}>
								<span className={styles.categoryValue}>{category.value ?? '-'}</span>
								{typeof category.percentage === 'number' && (
									<div className={styles.categoryBarTrack}>
										<div className={styles.categoryBar} style={{ width: `${Math.min(Math.max(category.percentage, 0), 100)}%` }} />
									</div>
								)}
							</div>
						)}
					</div>
				))}
			</div>
		</ContainerWrapper>
	);
}
