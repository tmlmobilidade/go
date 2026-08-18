/* * */

import { MetricSparkline, type MetricSparklineTone } from '@/components/common/MetricSparkline';
import { MetricTrend, type MetricTrendDirection, type MetricTrendSentiment } from '@/components/common/MetricTrend';

import styles from './styles.module.css';

/* * */

interface MetricSummaryCardProps {
	comparisonLabel?: string
	progress?: {
		label: string
		sentiment?: MetricTrendSentiment
		value: number
	}
	sparklineData?: number[]
	sparklineTone?: MetricSparklineTone
	title: string
	trend?: {
		direction: MetricTrendDirection
		label: string
		sentiment: MetricTrendSentiment
	}
	value: string
}

/* * */

export function MetricSummaryCard({
	comparisonLabel,
	progress,
	sparklineData,
	sparklineTone,
	title,
	trend,
	value,
}: MetricSummaryCardProps) {
	//

	//
	// A. Transform data

	const safeProgressValue = progress ? Math.min(100, Math.max(0, progress.value)) : 0;
	const hasSparkline = !!sparklineData?.length;

	//
	// B. Render components

	return (
		<article className={styles.root}>
			<div className={styles.header}>
				<h2>{title}</h2>
			</div>

			<div className={styles.summary} data-with-sparkline={hasSparkline}>
				<div className={styles.valueBlock}>
					<div className={styles.valueRow}>
						<strong className={styles.value}>{value}</strong>
						{trend && (
							<MetricTrend
								comparisonLabel={comparisonLabel}
								direction={trend.direction}
								label={trend.label}
								sentiment={trend.sentiment}
							/>
						)}
					</div>
				</div>

				{hasSparkline && (
					<div className={styles.sparkline}>
						<MetricSparkline data={sparklineData} tone={sparklineTone} />
					</div>
				)}
			</div>

			{progress && (
				<div className={styles.progressBlock} data-sentiment={progress.sentiment ?? 'positive'}>
					<span>{progress.label}</span>
					<progress aria-label={progress.label} max={100} value={safeProgressValue} />
				</div>
			)}

		</article>
	);

	//
}
