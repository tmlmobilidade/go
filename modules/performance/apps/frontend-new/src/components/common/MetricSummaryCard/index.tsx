/* * */

import { MetricTrend, type MetricTrendDirection, type MetricTrendSentiment } from '@/components/common/MetricTrend';
import { type MetricRollingValue, MetricValue } from '@/components/common/MetricValue';
import { Progress, Section, Sparkline, Surface } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

/* * */

export type MetricSparklineTone = 'accent' | 'primary' | 'success' | 'warning';

export interface MetricSparklineDatum {
	label: string
	value: number
}

interface MetricSummaryCardProps {
	className?: string
	comparisonLabel?: string
	progress?: {
		label: string
		sentiment?: MetricTrendSentiment
		value: number
	}
	sparklineData?: MetricSparklineDatum[] | number[]
	sparklineTone?: MetricSparklineTone
	supportingText?: string
	title: string
	trend?: {
		direction: MetricTrendDirection
		label: string
		sentiment: MetricTrendSentiment
	}
	value: MetricRollingValue | string
}

/* * */

export function MetricSummaryCard({
	className,
	comparisonLabel,
	progress,
	sparklineData,
	sparklineTone,
	supportingText,
	title,
	trend,
	value,
}: MetricSummaryCardProps) {
	//

	//
	// A. Transform data

	const safeProgressValue = progress ? Math.min(100, Math.max(0, progress.value)) : 0;
	const hasSparkline = !!sparklineData?.length;
	const sparklineValues = sparklineData?.map(item => typeof item === 'number' ? item : item.value) ?? [];
	const sparklineColor = {
		accent: '#7c3aed',
		primary: 'var(--color-primary)',
		success: 'var(--color-status-success-primary)',
		warning: 'var(--color-status-warning-primary)',
	}[sparklineTone ?? 'primary'];
	const progressColor = progress?.sentiment === 'warning'
		? 'var(--color-status-warning-primary)'
		: progress?.sentiment === 'negative'
			? 'var(--color-status-danger-primary)'
			: 'var(--color-status-success-primary)';

	//
	// B. Render components

	return (
		<Surface className={className} height="full">
			<Section className={styles.root} gap="sm" height="100%" padding="md">
				<div className={styles.header}>
					<h2>{title}</h2>
				</div>

				<div className={styles.summary} data-with-sparkline={hasSparkline}>
					<div className={styles.valueBlock}>
						<MetricValue className={styles.value} value={value} />
						{trend && (
							<MetricTrend
								className={styles.trend}
								comparisonLabel={comparisonLabel}
								direction={trend.direction}
								label={trend.label}
								sentiment={trend.sentiment}
							/>
						)}
						{supportingText && <small className={styles.supportingText}>{supportingText}</small>}
					</div>

					{hasSparkline && (
						<div className={styles.sparkline}>
							<Sparkline className={styles.sparklineChart} color={sparklineColor} data={sparklineValues} />
						</div>
					)}
				</div>

				{progress && (
					<div className={styles.progressBlock}>
						<span>{progress.label}</span>
						<Progress aria-label={progress.label} color={progressColor} size={4} value={safeProgressValue} />
					</div>
				)}

			</Section>
		</Surface>
	);

	//
}
