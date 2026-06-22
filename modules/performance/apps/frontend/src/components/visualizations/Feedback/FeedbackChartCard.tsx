/* * */

import type { FeedbackChartBarData } from './types';

import { ContainerWrapper } from '@/components/layout/ContainerWrapper';
import { Skeleton } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

/* * */

interface FeedbackChartCardProps {
	bars: FeedbackChartBarData[]
	isLoading: boolean
	title?: string
}

/* * */

export function FeedbackChartCard({ bars, isLoading, title }: FeedbackChartCardProps) {
	const maxValue = Math.max(...bars.map(bar => bar.value ?? 0), 1);

	return (
		<ContainerWrapper height={320}>
			<p className={styles.cardTitle}>{title}</p>

			<div className={styles.chartPlaceholder}>
				{bars.map((bar) => {
					if (isLoading) {
						return <Skeleton key={bar.id} height={bar.skeletonHeight ?? '50%'} width="12%" />;
					}

					const value = bar.value ?? 0;
					const height = Math.max((value / maxValue) * 100, 4);

					return (
						<div
							key={bar.id}
							aria-label={`${bar.label ?? bar.id}: ${value}`}
							className={styles.chartBar}
							style={{ height: `${height}%` }}
							title={bar.label}
						/>
					);
				})}
			</div>
		</ContainerWrapper>
	);
}
