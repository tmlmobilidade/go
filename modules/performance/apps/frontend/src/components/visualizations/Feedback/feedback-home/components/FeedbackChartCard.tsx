/* * */

import type { FeedbackChartBarData } from '../types';

import { ContainerWrapper } from '@/components/layout/ContainerWrapper';

import styles from '../styles.module.css';

/* * */

interface FeedbackChartCardProps {
	bars: FeedbackChartBarData[]
	title?: string
}

/* * */

export function FeedbackChartCard({ bars, title }: FeedbackChartCardProps) {
	const maxValue = Math.max(...bars.map(bar => bar.value ?? 0), 1);

	return (
		<ContainerWrapper height={320}>
			<p className={styles.cardTitle}>{title}</p>

			<div className={styles.chart}>
				{bars.map((bar) => {
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
